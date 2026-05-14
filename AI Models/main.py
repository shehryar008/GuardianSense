import os
import time
import logging
import warnings
import json
from typing import Dict, List, Tuple

import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import numpy as np
import pandas as pd
import seaborn as sns
from scipy.signal import butter, filtfilt
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    roc_curve, auc, precision_recall_curve, average_precision_score,
)
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.layers import (
    LSTM, Bidirectional, Dense, Dropout, BatchNormalization,
    Input, Attention, GlobalAveragePooling1D, Conv1D, Activation,
    SpatialDropout1D, GaussianNoise,
)
from tensorflow.keras.regularizers import l1_l2
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import tensorflow as tf
import tf2onnx
import onnx
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

warnings.filterwarnings("ignore")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("GuardianSense-AI")

SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)

# ── Paths ─────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(PROJECT_ROOT, "gps_dataset", "road_accident_imu_dataset_8000.csv")
SAVE_DIR = os.path.join(PROJECT_ROOT, "Evaluation_Results")
os.makedirs(SAVE_DIR, exist_ok=True)

# ── Column mapping ───────────────────────────────────────────
RAW_SENSOR_COLS = ["Acc_X", "Acc_Y", "Acc_Z", "Gyro_X", "Gyro_Y", "Gyro_Z", "Speed_kmh"]
LABEL_COL = "Crash_Label"

# ── Hyperparameters ───────────────────────────────────────────
SEQ_LEN = 10
EPOCHS = 100
BATCH_SIZE = 32
LEARNING_RATE = 0.0005
TEST_SIZE = 0.15
VAL_SIZE = 0.15
CHUNK_SIZE = 150
sns.set_theme(style="whitegrid", font_scale=1.1)
COLORS = {"normal": "#2ecc71", "crash": "#e74c3c", "threshold": "#f39c12"}

FEATURES = [
    "acc_mag", "gyro_mag", "jerk_mag", "acc_energy",
    "Speed_kmh", "speed_change", "deceleration",
    "acc_mag_std", "gyro_mag_std", "Motion_Intensity",
]

start_time = time.time()

def load_dataset() -> pd.DataFrame:
    log.info("Loading dataset: %s", os.path.basename(DATASET_PATH))
    df = pd.read_csv(DATASET_PATH)
    log.info("  Shape: %s", df.shape)

    required = RAW_SENSOR_COLS + [LABEL_COL]
    if missing := [c for c in required if c not in df.columns]:
        raise ValueError(f"Missing columns: {missing}")
    return df

def butterworth_lowpass(series: pd.Series, cutoff: float = 0.4, fs: float = 1.0, order: int = 2) -> np.ndarray:
    nyq = 0.5 * fs
    normalized_cutoff = min(cutoff / nyq, 0.99)
    b, a = butter(order, normalized_cutoff, btype="low")
    values = series.ffill().fillna(0).values
    if len(values) < 3 * max(len(a), len(b)):
        return values
    return filtfilt(b, a, values)

def remove_gravity_adaptive(acc_z: pd.Series, alpha: float = 0.1) -> pd.Series:
    gravity_est = acc_z.ewm(alpha=alpha, adjust=False).mean()
    return acc_z - gravity_est

def preprocess_sensors(df: pd.DataFrame) -> pd.DataFrame:
    """Minimal preprocessing: type coercion, NaN fill, and gravity removal.
    NO Butterworth filter — phone sends unfiltered data.
    Gravity IS removed from Acc_Z because the phone's userAccelerometerEventStream
    delivers linear acceleration (gravity already subtracted by OS)."""
    df = df.copy()
    for col in RAW_SENSOR_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce").ffill().fillna(0)

    # Remove gravity from Acc_Z to match phone's linear acceleration output
    df["Acc_Z_linear"] = remove_gravity_adaptive(df["Acc_Z"])
    return df

def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    acc_z = "Acc_Z_linear" if "Acc_Z_linear" in df.columns else "Acc_Z"
    df["acc_mag"] = np.sqrt(df["Acc_X"]**2 + df["Acc_Y"]**2 + df[acc_z]**2)
    df["gyro_mag"] = np.sqrt(df["Gyro_X"]**2 + df["Gyro_Y"]**2 + df["Gyro_Z"]**2)
    df["jerk_mag"] = df["acc_mag"].diff().fillna(0).abs()
    df["acc_energy"] = df["acc_mag"].rolling(window=5, min_periods=1).apply(lambda x: np.sum(x**2), raw=True).fillna(0)
    df["speed_change"] = df["Speed_kmh"].diff().fillna(0).abs()
    df["deceleration"] = (-df["Speed_kmh"].diff().fillna(0)).clip(lower=0)
    df["acc_mag_std"] = df["acc_mag"].rolling(window=5, min_periods=1).std().fillna(0)
    df["gyro_mag_std"] = df["gyro_mag"].rolling(window=5, min_periods=1).std().fillna(0)
    df["Motion_Intensity"] = df["acc_mag"] * df["gyro_mag"]

    return df.fillna(0)

def clip_outliers(df: pd.DataFrame, columns: List[str], lower_pct: float = 1, upper_pct: float = 99) -> pd.DataFrame:
    df = df.copy()
    for col in columns:
        if col in df.columns:
            df[col] = df[col].clip(lower=np.nanpercentile(df[col], lower_pct), upper=np.nanpercentile(df[col], upper_pct))
    return df

def create_sequences(data: np.ndarray, labels: np.ndarray, seq_len: int) -> Tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    for i in range(len(data) - seq_len):
        X.append(data[i : i + seq_len])
        y.append(1 if labels[i : i + seq_len].mean() >= 0.5 else 0)
    return np.array(X), np.array(y)

def generate_sequences_from_chunks(chunks: List[pd.DataFrame], scaler: MinMaxScaler, seq_len: int) -> Tuple[np.ndarray, np.ndarray]:
    X_list, y_list = [], []
    for chunk in chunks:
        if len(chunk) <= seq_len:
            continue
        scaled_chunk = scaler.transform(chunk[FEATURES])
        labels = chunk[LABEL_COL].values
        X, y = create_sequences(scaled_chunk, labels, seq_len)
        X_list.append(X)
        y_list.append(y)

    if not X_list:
        return np.array([]), np.array([])
    return np.concatenate(X_list, axis=0), np.concatenate(y_list, axis=0)

def prepare_data(df: pd.DataFrame):
    log.info("Preprocessing sensors and engineering features...")
    df = clip_outliers(add_engineered_features(preprocess_sensors(df)), FEATURES)

    num_chunks = int(np.ceil(len(df) / CHUNK_SIZE))
    chunks = [df.iloc[i * CHUNK_SIZE : (i + 1) * CHUNK_SIZE] for i in range(num_chunks)]
    chunk_labels = [1 if c[LABEL_COL].sum() > 0 else 0 for c in chunks]

    log.info(f"Split data into {num_chunks} temporal chunks (Crash chunks: {sum(chunk_labels)} | Normal: {len(chunk_labels) - sum(chunk_labels)})")

    try:
        ch_trainval, ch_test, y_tv, y_t = train_test_split(chunks, chunk_labels, test_size=TEST_SIZE, stratify=chunk_labels, random_state=SEED)
        rel_val = VAL_SIZE / (1 - TEST_SIZE)
        ch_train, ch_val, _, _ = train_test_split(ch_trainval, y_tv, test_size=rel_val, stratify=y_tv, random_state=SEED)
    except ValueError:
        log.warning("Not enough crash chunks for stratification. Falling back to random split.")
        ch_trainval, ch_test = train_test_split(chunks, test_size=TEST_SIZE, random_state=SEED)
        rel_val = VAL_SIZE / (1 - TEST_SIZE)
        ch_train, ch_val = train_test_split(ch_trainval, test_size=rel_val, random_state=SEED)

    train_df = pd.concat(ch_train)
    scaler = MinMaxScaler().fit(train_df[FEATURES])

    log.info("Generating non-leaking sequences...")
    X_train, y_train = generate_sequences_from_chunks(ch_train, scaler, SEQ_LEN)
    X_val, y_val = generate_sequences_from_chunks(ch_val, scaler, SEQ_LEN)
    X_test, y_test = generate_sequences_from_chunks(ch_test, scaler, SEQ_LEN)

    shuffle_idx = np.random.permutation(len(X_train))
    X_train, y_train = X_train[shuffle_idx], y_train[shuffle_idx]

    log.info(f"  Final Sequences -> Train: {len(y_train)} | Val: {len(y_val)} | Test: {len(y_test)}")

    n_neg = int((y_train == 0).sum())
    n_pos = int((y_train == 1).sum())
    class_weights = {0: 1.0, 1: n_neg / max(n_pos, 1)}

    return X_train, X_val, X_test, y_train, y_val, y_test, scaler, class_weights



def build_model(n_features: int, seq_len: int) -> Model:
    reg = l1_l2(l1=1e-5, l2=1e-4) 
    inputs = Input(shape=(seq_len, n_features), name="input_layer")

    x = GaussianNoise(0.05)(inputs)

    x = Activation("relu")(BatchNormalization()(Conv1D(64, kernel_size=3, padding="same", kernel_regularizer=reg)(x)))
    x = SpatialDropout1D(0.2)(x)
    x = Activation("relu")(BatchNormalization()(Conv1D(128, kernel_size=3, padding="same", kernel_regularizer=reg)(x)))
    x = SpatialDropout1D(0.3)(x)

    x = Bidirectional(LSTM(64, return_sequences=True,
                           kernel_regularizer=reg, recurrent_regularizer=l1_l2(l1=0, l2=1e-4)))(x)
    x = BatchNormalization()(x)
    x = Dropout(0.4)(x)

    attention_out = Attention()([Dense(128, kernel_regularizer=reg)(x),
                                 Dense(128, kernel_regularizer=reg)(x)])

    x = GlobalAveragePooling1D()(attention_out)
    x = Dense(64, activation="relu", kernel_regularizer=reg)(x)
    x = Dropout(0.5)(x)
    x = Dense(32, activation="relu", kernel_regularizer=reg)(x)
    x = Dropout(0.3)(x)
    outputs = Dense(1, activation="sigmoid", name="output_layer")(x)

    model = Model(inputs=inputs, outputs=outputs, name="CrashDetector")
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE, clipnorm=1.0), 
        loss=tf.keras.losses.BinaryCrossentropy(label_smoothing=0.05),  
        metrics=["accuracy"],
    )
    return model

def augment_crash_sequences(X: np.ndarray, y: np.ndarray, multiplier: int = 3) -> Tuple[np.ndarray, np.ndarray]:
    crash_mask = y == 1
    if not crash_mask.any():
        return X, y

    X_crash, y_crash = X[crash_mask], y[crash_mask]
    aug_X, aug_y = [X], [y]

    for _ in range(multiplier - 1):
        jittered = X_crash + np.random.normal(0, 0.02, X_crash.shape)
        scaled = jittered * np.random.uniform(0.9, 1.1, (1, 1, X_crash.shape[2]))
        aug_X.append(np.clip(scaled, 0, 1))
        aug_y.append(y_crash.copy())

    X_out = np.concatenate(aug_X, axis=0)
    y_out = np.concatenate(aug_y, axis=0)
    idx = np.random.permutation(len(X_out))
    return X_out[idx], y_out[idx]

def train_model(model: Model, X_train: np.ndarray, y_train: np.ndarray, X_val: np.ndarray, y_val: np.ndarray, class_weights: dict):
    log.info("Augmenting minority class...")
    X_aug, y_aug = augment_crash_sequences(X_train, y_train, multiplier=3)

    callbacks = [
        EarlyStopping(monitor="val_loss", patience=15, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=5, min_lr=1e-7, verbose=1),
    ]

    log.info("Training...")
    return model.fit(X_aug, y_aug, epochs=EPOCHS, batch_size=BATCH_SIZE, validation_data=(X_val, y_val), class_weight=class_weights, callbacks=callbacks, verbose=1)



def evaluate_and_plot(model, X_test, y_test):
    y_scores = model.predict(X_test, verbose=0).flatten()

    if len(np.unique(y_test)) < 2:
        log.warning("Test set contains only one class. Evaluation metrics will be limited.")
        best_thresh = 0.5
    else:
        prec_curve, rec_curve, thresholds = precision_recall_curve(y_test, y_scores)
        f1_scores = 2 * (prec_curve * rec_curve) / (prec_curve + rec_curve + 1e-10)
        best_idx = np.argmax(f1_scores)
        best_thresh = float(thresholds[best_idx]) if best_idx < len(thresholds) else float(thresholds[-1])

    y_pred = (y_scores >= best_thresh).astype(int)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    log.info(f"Test Results -> Acc: {acc:.4f} | Prec: {prec:.4f} | Rec: {rec:.4f} | F1: {f1:.4f} | Thresh: {best_thresh:.4f}")
    return acc, prec, rec, f1, best_thresh

def export_to_onnx(model, scaler, n_features: int, seq_len: int):
    spec = (tf.TensorSpec((None, seq_len, n_features), tf.float32, name="input_layer"),)
    tf2onnx.convert.from_keras(model, input_signature=spec, opset=13, output_path=os.path.join(SAVE_DIR, "crash_detector.onnx"))

    initial_type = [('float_input', FloatTensorType([None, n_features]))]
    with open(os.path.join(SAVE_DIR, "scaler.onnx"), "wb") as f:
        f.write(convert_sklearn(scaler, initial_types=initial_type, target_opset={'': 13, 'ai.onnx.ml': 3}).SerializeToString())

    log.info("MinMaxScaler parameters for Dart:")
    log.info("  _scalerMin   = %s", scaler.data_min_.tolist())
    log.info("  _scalerRange = %s", scaler.data_range_.tolist())
    scaler_params = {
        "data_min": scaler.data_min_.tolist(),
        "data_range": scaler.data_range_.tolist(),
        "feature_names": FEATURES,
    }
    with open(os.path.join(SAVE_DIR, "scaler_params.json"), "w") as f:
        json.dump(scaler_params, f, indent=2)
    log.info("Scaler params saved to scaler_params.json")
    log.info("ONNX Export Complete.")



def main() -> Tuple[Model, MinMaxScaler]:
    log.info("=" * 60)
    log.info("  GuardianSense AI — Crash Detection (Leakage Patched)")
    log.info("=" * 60)

    df = load_dataset()
    X_train, X_val, X_test, y_train, y_val, y_test, scaler, class_weights = prepare_data(df)

    if len(X_train) == 0 or len(X_val) == 0 or len(X_test) == 0:
        log.error("A dataset split resulted in 0 sequences. Decrease CHUNK_SIZE or provide more data.")
        return None, None

    model = build_model(len(FEATURES), SEQ_LEN)
    history = train_model(model, X_train, y_train, X_val, y_val, class_weights)

    acc, prec, rec, f1, best_thresh = evaluate_and_plot(model, X_test, y_test)
    export_to_onnx(model, scaler, len(FEATURES), SEQ_LEN)

    config = {
        "model_name": "CrashDetector",
        "seq_len": SEQ_LEN,
        "n_features": len(FEATURES),
        "feature_names": FEATURES,
        "optimal_threshold": best_thresh,
        "metrics": {"accuracy": round(acc, 4), "precision": round(prec, 4), "recall": round(rec, 4), "f1_score": round(f1, 4)},
    }
    with open(os.path.join(SAVE_DIR, "model_config.json"), "w") as f:
        json.dump(config, f, indent=2)

    log.info(f"COMPLETE — Total time: {time.time() - start_time:.1f} seconds")

    return model, scaler

if __name__ == "__main__":
    global_model, global_scaler = main()

    if global_model is not None and global_scaler is not None:
        print("\n" + "="*60)
        print("  Running Synthetic Tests")
        print("="*60)

        normal_data = {
            "Acc_X": np.random.normal(0, 0.1, 20),
            "Acc_Y": np.random.normal(0, 0.1, 20),
            "Acc_Z": np.random.normal(9.8, 0.1, 20),
            "Gyro_X": np.random.normal(0, 0.05, 20),
            "Gyro_Y": np.random.normal(0, 0.05, 20),
            "Gyro_Z": np.random.normal(0, 0.05, 20),
            "Speed_kmh": np.linspace(60, 60.5, 20),
            "Crash_Label": [0] * 20
        }
        df_normal = pd.DataFrame(normal_data)

        crash_data = {
            "Acc_X": np.concatenate([np.random.normal(0, 0.1, 10),
                                     [-25.0, -35.5, -15.0, -5.0, 0.0],
                                     np.random.normal(0, 0.05, 5)]),
            "Acc_Y": np.concatenate([np.random.normal(0, 0.1, 10),
                                     [10.0, -5.0, 15.0, -2.0, 0.0],
                                     np.random.normal(0, 0.05, 5)]),
            "Acc_Z": np.concatenate([np.random.normal(9.8, 0.1, 10),
                                     [2.0, 18.0, 5.0, 9.8, 9.8],
                                     np.random.normal(9.8, 0.05, 5)]),
            "Gyro_X": np.concatenate([np.random.normal(0, 0.05, 10),
                                      [5.0, -4.5, 2.0, 0.5, 0.0],
                                      np.random.normal(0, 0.01, 5)]),
            "Gyro_Y": np.concatenate([np.random.normal(0, 0.05, 10),
                                      [8.0, -6.0, 3.0, -1.0, 0.0],
                                      np.random.normal(0, 0.01, 5)]),
            "Gyro_Z": np.concatenate([np.random.normal(0, 0.05, 10),
                                      [-12.0, 8.0, -4.0, 1.0, 0.0],
                                      np.random.normal(0, 0.01, 5)]),
            "Speed_kmh": np.concatenate([np.linspace(60, 58, 10),
                                         [30, 10, 0, 0, 0],
                                         [0, 0, 0, 0, 0]]),
            "Crash_Label": [1] * 20
        }
        df_crash = pd.DataFrame(crash_data)

        # --- Process and Test Normal Data ---
        print("Testing Normal Sequence...")
        df_normal_features = add_engineered_features(preprocess_sensors(df_normal))
        scaled_normal = global_scaler.transform(df_normal_features[FEATURES])
        X_test_normal = np.expand_dims(scaled_normal[-SEQ_LEN:], axis=0)  # last SEQ_LEN rows

        normal_score = global_model.predict(X_test_normal, verbose=0)[0][0]
        print(f"Normal Driving Crash Probability: {normal_score:.4f} ({(normal_score * 100):.2f}%)\n")

        # --- Process and Test Crash Data ---
        print("Testing Crash Sequence...")
        df_crash_features = add_engineered_features(preprocess_sensors(df_crash))
        scaled_crash = global_scaler.transform(df_crash_features[FEATURES])
        X_test_crash = np.expand_dims(scaled_crash[-SEQ_LEN:], axis=0)  # last SEQ_LEN rows

        crash_score = global_model.predict(X_test_crash, verbose=0)[0][0]
        print(f"Severe Crash Probability: {crash_score:.4f} ({(crash_score * 100):.2f}%)")
        print("="*60)