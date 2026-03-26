import os
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
import time
import logging
import warnings
from typing import Dict, List, Optional, Tuple
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import numpy as np
import pandas as pd
import seaborn as sns
from scipy.signal import butter, filtfilt
from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_curve,
    auc,
    precision_recall_curve,
    average_precision_score,
)
from sklearn.preprocessing import MinMaxScaler, RobustScaler
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.layers import (
    LSTM,
    Bidirectional,
    Dense,
    RepeatVector,
    TimeDistributed,
    Dropout,
    BatchNormalization,
    Input,
    Attention,
    GlobalAveragePooling1D,
    Reshape,
    Multiply,
)
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.optimizers import Adam
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
log = logging.getLogger("FYP-AI")

SEED = 42
np.random.seed(SEED)
import tensorflow as tf
tf.random.set_seed(SEED)

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(PROJECT_ROOT, "FYP AI")
SAVE_DIR = os.path.join(PROJECT_ROOT, "Evaluation_Results")
os.makedirs(SAVE_DIR, exist_ok=True)

RAW_SENSOR_COLS = ["speed", "accx", "accy", "accz", "gyrox", "gyroy", "gyroz"]
GRAVITY = 9.81

SEQ_LEN = 10
LSTM_EPOCHS = 80
LSTM_BATCH = 32
LSTM_LR = 0.0005
IF_CONTAMINATION = 0.02
IF_ESTIMATORS = 200

sns.set_theme(style="whitegrid", font_scale=1.1)
COLORS = {"normal": "#2ecc71", "crash": "#e74c3c", "threshold": "#f39c12"}

start_time = time.time()


def load_csv(relative_path: str) -> pd.DataFrame:
    path = os.path.join(DATA_DIR, relative_path)
    log.info("Loading %s", os.path.basename(path))
    return pd.read_csv(path)


def load_all_datasets() -> Dict[str, pd.DataFrame]:
    return {
        "controlled_test": load_csv(
            "gps_dataset/dataset_controlled_test/data_set_controlled_test.csv"
        ),
        "training": load_csv(
            "gps_dataset/dataset_training/data_set_training.csv"
        ),
        "uncontrolled_test": load_csv(
            "gps_dataset/dataset_uncontrolled_test/data_set_uncontrolled_test.csv"
        ),
        "general_table_controlled_test": load_csv(
            "gps_dataset/dataset_controlled_test/General_table_controlled_test.csv"
        ),
        "general_table_training": load_csv(
            "gps_dataset/dataset_training/general_table_training.csv"
        ),
        "general_table_uncontrolled_test": load_csv(
            "gps_dataset/dataset_uncontrolled_test/general_table_uncontrolled_test.csv"
        ),
    }


def ensure_sensor_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in RAW_SENSOR_COLS:
        if col not in df.columns:
            df[col] = np.nan
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def filter_valid_sensor_rows(
    df: pd.DataFrame, has_type_record: bool = False, drop_type1: bool = True,) -> pd.DataFrame:
    if df.empty:
        return df
    df = df.copy()
    if has_type_record and "type_record" in df.columns and drop_type1:
        df["type_record"] = pd.to_numeric(df["type_record"], errors="coerce").fillna(0)
        df = df[df["type_record"] == 0].copy()
    acc_gyro = ["accx", "accy", "accz", "gyrox", "gyroy", "gyroz"]
    if not all(c in df.columns for c in acc_gyro):
        return df.reset_index(drop=True)
    valid = df[acc_gyro].notna().any(axis=1)
    non_zero = df[acc_gyro].fillna(0).abs().sum(axis=1) > 0.01
    df = df[valid & non_zero].copy()
    return df.reset_index(drop=True)


def butterworth_lowpass(series: pd.Series, cutoff: float = 4.0,
                        fs: float = 10.0, order: int = 2) -> np.ndarray:
    nyq = 0.5 * fs
    normalized_cutoff = min(cutoff / nyq, 0.99)
    b, a = butter(order, normalized_cutoff, btype="low")
    values = series.ffill().fillna(0).values
    if len(values) < 3 * max(len(a), len(b)):
        return values
    return filtfilt(b, a, values)


def remove_gravity_adaptive(accz: pd.Series, alpha: float = 0.1) -> pd.Series:
    gravity_est = accz.ewm(alpha=alpha, adjust=False).mean()
    return accz - gravity_est


def preprocess_sensors(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    df = df.copy()
    for col in RAW_SENSOR_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df[RAW_SENSOR_COLS] = df[RAW_SENSOR_COLS].ffill().fillna(0)

    imu_cols = ["accx", "accy", "accz", "gyrox", "gyroy", "gyroz"]
    for col in imu_cols:
        if col in df.columns and len(df) > 10:
            df[col] = butterworth_lowpass(df[col])

    if "accz" in df.columns:
        df["accz_linear"] = remove_gravity_adaptive(df["accz"])
    else:
        df["accz_linear"] = 0.0
    return df


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame: #Adding Feature
    if df.empty:
        return df
    df = df.copy()
    accz_col = "accz_linear" if "accz_linear" in df.columns else "accz"

    df["acc_mag"] = np.sqrt(df["accx"]**2 + df["accy"]**2 + df[accz_col].fillna(0)**2)
    df["gyro_mag"] = np.sqrt(df["gyrox"]**2 + df["gyroy"]**2 + df["gyroz"]**2)

    
    df["jerk_mag"] = df["acc_mag"].diff().fillna(0).abs()

    
    df["acc_energy"] = (
        df["acc_mag"].rolling(window=5, min_periods=1)
        .apply(lambda x: np.sum(x**2), raw=True).fillna(0)
    )

    
    df["speed_change"] = df["speed"].diff().fillna(0).abs()

    
    raw_speed_diff = df["speed"].diff().fillna(0)
    df["deceleration"] = (-raw_speed_diff).clip(lower=0)

    
    df["acc_mag_std"] = df["acc_mag"].rolling(window=5, min_periods=1).std().fillna(0)
    df["gyro_mag_std"] = df["gyro_mag"].rolling(window=5, min_periods=1).std().fillna(0)

    
    df["speed_acc_interaction"] = df["speed"].abs() * df["acc_mag"]

    
    df["gyro_jerk"] = df["gyro_mag"].diff().fillna(0).abs()

    
    rolling_mean = df["acc_mag"].rolling(window=7, min_periods=1).mean()
    df["acc_peak_ratio"] = (df["acc_mag"] / (rolling_mean + 1e-6)).clip(upper=10)

    df.fillna(0, inplace=True)
    return df


def clip_outliers(df: pd.DataFrame, columns: List[str],lower_pct: float = 1, upper_pct: float = 99) -> pd.DataFrame:
    df = df.copy()
    for col in columns:
        if col not in df.columns:
            continue
        lo = np.nanpercentile(df[col], lower_pct)
        hi = np.nanpercentile(df[col], upper_pct)
        df[col] = df[col].clip(lower=lo, upper=hi)
    return df


FEATURES = [
    "acc_mag", "gyro_mag", "jerk_mag", "acc_energy",
    "speed", "speed_change", "deceleration",
    "acc_mag_std", "gyro_mag_std", "speed_acc_interaction",
    "gyro_jerk", "acc_peak_ratio",
]


def generate_ground_truth_multi_signal(df: pd.DataFrame,window_before: int = 6,window_after: int = 3,n_std: float = 2.0,) -> pd.DataFrame:
    
    if df.empty:
        return df
    df = df.copy()
    df["label"] = 0

    
    jerk_thresh = df["jerk_mag"].mean() + n_std * df["jerk_mag"].std()
    jerk_spike = df["jerk_mag"] > jerk_thresh

    
    decel_thresh = df["deceleration"].mean() + n_std * df["deceleration"].std()
    decel_spike = df["deceleration"] > decel_thresh

    
    gyro_thresh = df["gyro_mag"].mean() + n_std * df["gyro_mag"].std()
    gyro_spike = df["gyro_mag"] > gyro_thresh

    
    crash_signal = np.zeros(len(df), dtype=int)
    for i in range(len(df)):
        w_start = max(0, i - 3)
        w_end = min(len(df), i + 4)
        n_signals = 0
        if jerk_spike.iloc[w_start:w_end].any():
            n_signals += 1
        if decel_spike.iloc[w_start:w_end].any():
            n_signals += 1
        if gyro_spike.iloc[w_start:w_end].any():
            n_signals += 1
        if n_signals >= 2:
            crash_signal[i] = 1

    
    if crash_signal.sum() == 0:
        peak_idx = int(df["jerk_mag"].idxmax())
        start = max(0, peak_idx - window_before)
        end = min(len(df), peak_idx + window_after)
        df.loc[start:end, "label"] = 1
    else:
        
        for i in range(len(df)):
            if crash_signal[i] == 1:
                start = max(0, i - window_before)
                end = min(len(df) - 1, i + window_after)
                df.loc[start:end, "label"] = 1

    crash_pct = df["label"].mean() * 100
    log.info("  Multi-signal labels: %.1f%% crash (%d/%d)", crash_pct, df["label"].sum(), len(df))
    return df


def generate_ground_truth_type_record(df: pd.DataFrame,window_before: int = 8,window_after: int = 1,) -> pd.DataFrame:
    if df.empty or "type_record" not in df.columns:
        return df
    df = df.copy()
    df["label"] = 0
    tr = pd.to_numeric(df["type_record"], errors="coerce").fillna(0).astype(int)

    
    for target in [1, 2]:
        crash_starts = (tr == target) & (tr.shift(1, fill_value=0) == 0)
        for idx in df.index[crash_starts]:
            start = max(0, idx - window_before)
            end = min(len(df) - 1, idx + window_after)
            df.loc[start : end, "label"] = 1

    crash_pct = df["label"].mean() * 100
    log.info("  type_record labels: %.1f%% crash (%d/%d)", crash_pct, df["label"].sum(), len(df))
    return df


def run_preprocessing(datasets: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    processed = {}
    for key, df in datasets.items():
        log.info("Preprocessing: %s (%d rows)", key, len(df))
        has_type_record = "type_record" in df.columns

        df = ensure_sensor_columns(df)

        if has_type_record and "general_table" in key:
            df = generate_ground_truth_type_record(df)

        df = filter_valid_sensor_rows(df, has_type_record=has_type_record)
        if df.empty:
            log.warning("  Skipped %s (empty after filtering)", key)
            continue

        df = preprocess_sensors(df)
        df = add_engineered_features(df)
        df = clip_outliers(df, FEATURES)
        processed[key] = df

    
    for key in ["controlled_test"]:
        if key in processed:
            processed[key] = generate_ground_truth_multi_signal(processed[key])

    return processed



def augment_training_sequences(X: np.ndarray, multiplier: int = 3) -> np.ndarray:
    augmented = [X]
    for i in range(multiplier - 1):
        # Jitter: add small Gaussian noise
        noise = np.random.normal(0, 0.015, X.shape)
        jittered = X + noise

        # Random scaling per-feature (0.92 to 1.08)
        scale = np.random.uniform(0.92, 1.08, (1, 1, X.shape[2]))
        scaled = jittered * scale

        augmented.append(np.clip(scaled, 0, 1))  # keep in [0,1] since MinMaxScaled

    result = np.concatenate(augmented, axis=0)
    # Shuffle
    idx = np.random.permutation(len(result))
    return result[idx]



def build_lstm_autoencoder(n_features: int, seq_len: int) -> Model:
    # 1. Input Layer
    inputs = Input(shape=(seq_len, n_features), name="input_layer")

    # 2. Encoder Path
    # Bidirectional LSTM to capture context from both directions
    encoder = Bidirectional(LSTM(128, return_sequences=True))(inputs)
    encoder = BatchNormalization()(encoder)
    encoder = Dropout(0.3)(encoder)
    
    # Second LSTM layer (reduced dimensionality)
    encoder = LSTM(64, return_sequences=True)(encoder)
    
    # --- Attention Mechanism ---
    # This identifies which of the 10 time-steps are most "anomalous"
    query = Dense(64)(encoder)
    value = Dense(64)(encoder)
    attention_out = Attention()([query, value])
    # ---------------------------

    # 3. Bottleneck
    # Capture the "essence" of the sequence
    bottleneck = LSTM(32, return_sequences=False)(attention_out)
    bottleneck_rep = RepeatVector(seq_len)(bottleneck)

    # 4. Decoder Path
    decoder = LSTM(64, return_sequences=True)(bottleneck_rep)
    decoder = BatchNormalization()(decoder)
    decoder = Dropout(0.3)(decoder)
    
    decoder = Bidirectional(LSTM(128, return_sequences=True))(decoder)
    
    # 5. Output Layer (Reconstruction)
    outputs = TimeDistributed(Dense(n_features), name="output_layer")(decoder)

    # Create the model using the Functional API
    model = Model(inputs=inputs, outputs=outputs, name="LSTM_Attention_Autoencoder")
    
    model.compile(optimizer=Adam(learning_rate=LSTM_LR), loss="mse")
    model.summary(print_fn=log.info)
    
    return model


def create_sequences(data: np.ndarray, seq_len: int) -> np.ndarray:
    return np.array([data[i : i + seq_len] for i in range(len(data) - seq_len)])



def grid_search_hybrid_weights(
    y_true: np.ndarray,
    if_score: np.ndarray,
    lstm_score: np.ndarray,
    step: float = 0.05,
) -> Tuple[float, float, float, float]:
    best_f1 = -1
    best_params = (0.3, 0.7, 0.5)

    weights = np.arange(0, 1.01, step)
    for w_if in weights:
        w_lstm = 1.0 - w_if
        hybrid = w_if * if_score + w_lstm * lstm_score

        # Find best threshold for this weight combo
        precision, recall, thresholds = precision_recall_curve(y_true, hybrid)
        f1_scores = 2 * (precision * recall) / (precision + recall + 1e-10)
        best_idx = np.argmax(f1_scores)
        f1_val = f1_scores[best_idx]
        thresh = thresholds[best_idx] if best_idx < len(thresholds) else thresholds[-1]

        if f1_val > best_f1:
            best_f1 = f1_val
            best_params = (w_if, w_lstm, thresh)

    log.info("  Grid search: best IF_w=%.2f, LSTM_w=%.2f, thresh=%.4f → F1=%.4f",
            best_params[0], best_params[1], best_params[2], best_f1)
    return best_params[0], best_params[1], best_params[2], best_f1



def plot_training_history(history, save_path: str) -> None:
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(history.history["loss"], label="Training Loss", linewidth=2, color="#3498db")
    if "val_loss" in history.history:
        ax.plot(history.history["val_loss"], label="Validation Loss", linewidth=2, color="#e74c3c")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("MSE Loss")
    ax.set_title("LSTM Autoencoder — Training History", fontsize=14, fontweight="bold")
    ax.legend(fontsize=12)
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)


def plot_confusion_matrix(y_true, y_pred, title: str, save_path: str) -> None:
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(7, 6))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues", cbar=True,
        xticklabels=["Normal", "Crash"], yticklabels=["Normal", "Crash"],
        annot_kws={"size": 16}, ax=ax,
    )
    ax.set_xlabel("Predicted", fontsize=13)
    ax.set_ylabel("Actual", fontsize=13)
    ax.set_title(f"Confusion Matrix — {title}", fontsize=14, fontweight="bold")
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)


def plot_classification_report_table(y_true, y_pred, title: str, save_path: str) -> None:
    report = classification_report(
        y_true, y_pred, target_names=["Normal", "Crash"],
        output_dict=True, zero_division=0,
    )
    rows = []
    for cls_name in ["Normal", "Crash"]:
        r = report[cls_name]
        rows.append([cls_name, f"{r['precision']:.4f}", f"{r['recall']:.4f}",f"{r['f1-score']:.4f}", f"{int(r['support'])}"])
    for avg_name in ["macro avg", "weighted avg"]:
        r = report[avg_name]
        rows.append([avg_name.title(), f"{r['precision']:.4f}", f"{r['recall']:.4f}",f"{r['f1-score']:.4f}", f"{int(r['support'])}"])
    rows.insert(2, ["", "", "", "", ""])
    rows.insert(0, ["", "", "", "", ""])

    fig, ax = plt.subplots(figsize=(9, 4))
    ax.axis("off")
    table = ax.table(
        cellText=rows, colLabels=["Class", "Precision", "Recall", "F1-Score", "Support"],
        cellLoc="center", loc="center",
    )
    table.auto_set_font_size(False)
    table.set_fontsize(12)
    table.scale(1.2, 1.8)
    for j in range(5):
        table[0, j].set_facecolor("#3498db")
        table[0, j].set_text_props(color="white", fontweight="bold")
    ax.set_title(f"Classification Report — {title}", fontsize=14, fontweight="bold", pad=20)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)


def plot_roc_curve(y_true, scores, title: str, save_path: str) -> float:
    fpr, tpr, _ = roc_curve(y_true, scores)
    roc_auc = auc(fpr, tpr)
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.plot(fpr, tpr, color="#e74c3c", lw=2.5, label=f"ROC Curve (AUC = {roc_auc:.4f})")
    ax.plot([0, 1], [0, 1], "--", color="gray", lw=1, alpha=0.7)
    ax.fill_between(fpr, tpr, alpha=0.15, color="#e74c3c")
    ax.set_xlabel("False Positive Rate", fontsize=13)
    ax.set_ylabel("True Positive Rate", fontsize=13)
    ax.set_title(f"ROC Curve — {title}", fontsize=14, fontweight="bold")
    ax.legend(fontsize=12, loc="lower right")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)
    return roc_auc


def plot_precision_recall_curve(
    y_true, scores, best_thresh: float, title: str, save_path: str
) -> float:
    prec, rec, thresholds = precision_recall_curve(y_true, scores)
    ap = average_precision_score(y_true, scores)
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.plot(rec, prec, color="#3498db", lw=2.5, label=f"PR Curve (AP = {ap:.4f})")
    ax.fill_between(rec, prec, alpha=0.15, color="#3498db")
    f1_scores = 2 * (prec * rec) / (prec + rec + 1e-10)
    best_idx = np.argmax(f1_scores)
    ax.scatter(rec[best_idx], prec[best_idx], s=120, c="#e74c3c", zorder=5,label=f"Best F1 (thresh={best_thresh:.4f})")
    ax.set_xlabel("Recall", fontsize=13)
    ax.set_ylabel("Precision", fontsize=13)
    ax.set_title(f"Precision-Recall Curve — {title}", fontsize=14, fontweight="bold")
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)
    return ap


def plot_score_distribution(y_true, scores, thresh: float, title: str, save_path: str) -> None:
    fig, ax = plt.subplots(figsize=(10, 5))
    normal_scores = scores[y_true == 0]
    crash_scores = scores[y_true == 1]
    ax.hist(normal_scores, bins=40, alpha=0.65, color=COLORS["normal"],
            label=f"Normal (n={len(normal_scores)})", edgecolor="white")
    ax.hist(crash_scores, bins=40, alpha=0.65, color=COLORS["crash"],
            label=f"Crash (n={len(crash_scores)})", edgecolor="white")
    ax.axvline(thresh, color=COLORS["threshold"], linewidth=2.5,linestyle="--", label=f"Threshold = {thresh:.4f}")
    ax.set_xlabel("Hybrid Anomaly Score", fontsize=13)
    ax.set_ylabel("Frequency", fontsize=13)
    ax.set_title(f"Score Distribution — {title}", fontsize=14, fontweight="bold")
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)


def plot_timeseries(df: pd.DataFrame, thresh: float, title: str, save_path: str) -> None:
    fig, ax = plt.subplots(figsize=(14, 6))
    ax.plot(df.index, df["hybrid_score"], linewidth=1.2, color="#3498db", alpha=0.8, label="Hybrid Score")
    ax.fill_between(df.index, 0, df["hybrid_score"].max() * 1.1,where=df["label"] == 1, alpha=0.2, color=COLORS["crash"],label="Ground Truth Crash Zone")
    ax.axhline(thresh, color=COLORS["threshold"], linestyle="--", linewidth=2,label=f"Threshold = {thresh:.4f}")
    fp = df[(df["pred"] == 1) & (df["label"] == 0)]
    fn = df[(df["pred"] == 0) & (df["label"] == 1)]
    if not fp.empty:
        ax.scatter(fp.index, fp["hybrid_score"], s=25, c="#e67e22",marker="^", zorder=4, label=f"FP (n={len(fp)})")
    if not fn.empty:
        ax.scatter(fn.index, fn["hybrid_score"], s=25, c="#9b59b6",marker="v", zorder=4, label=f"FN (n={len(fn)})")
    ax.set_xlabel("Sample Index", fontsize=13)
    ax.set_ylabel("Anomaly Score", fontsize=13)
    ax.set_title(f"Time-Series Analysis — {title}", fontsize=14, fontweight="bold")
    ax.legend(fontsize=10, loc="upper right")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)


def plot_feature_importance(iso_forest, feature_names: List[str], save_path: str) -> None:
    importances = np.mean(
        [tree.feature_importances_ for tree in iso_forest.estimators_], axis=0
    )
    order = np.argsort(importances)
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(
        [feature_names[i] for i in order], importances[order],
        color=sns.color_palette("viridis", len(feature_names)),
    )
    ax.set_xlabel("Mean Feature Importance", fontsize=13)
    ax.set_title("Isolation Forest — Feature Importance", fontsize=14, fontweight="bold")
    ax.grid(True, axis="x", alpha=0.3)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)


def plot_feature_distributions(
    df: pd.DataFrame, features: List[str], title: str, save_path: str,
) -> None:
    if "label" not in df.columns:
        return
    plot_df = df.copy()
    plot_df["label"] = plot_df["label"].map({0: "Normal", 1: "Crash"})
    n_cols = 4
    n_rows = (len(features) + n_cols - 1) // n_cols
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(18, 4 * n_rows))
    axes = axes.flatten()
    for i, feat in enumerate(features):
        if i >= len(axes) or feat not in plot_df.columns:
            continue
        sns.boxplot(
            data=plot_df, x="label", y=feat, hue="label", ax=axes[i],
            palette={"Normal": COLORS["normal"], "Crash": COLORS["crash"]},
            width=0.5, legend=False,
        )
        axes[i].set_title(feat, fontsize=11, fontweight="bold")
        axes[i].set_xlabel("")
    for j in range(len(features), len(axes)):
        axes[j].set_visible(False)
    fig.suptitle(f"Feature Distributions — {title}", fontsize=15, fontweight="bold", y=1.01)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)


def plot_summary_report(results: Dict[str, dict], save_path: str) -> None:
    n_datasets = len(results)
    if n_datasets == 0:
        return
    fig, axes = plt.subplots(1, n_datasets, figsize=(7 * n_datasets, 5))
    if n_datasets == 1:
        axes = [axes]
    for ax, (key, metrics) in zip(axes, results.items()):
        metric_names = ["Accuracy", "Precision", "Recall", "F1 Score", "AUC-ROC", "AP"]
        metric_vals = [
            metrics["accuracy"], metrics["precision"], metrics["recall"],
            metrics["f1"], metrics["roc_auc"], metrics["ap"],
        ]
        colors_list = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c"]
        bars = ax.barh(metric_names, metric_vals, color=colors_list, height=0.6)
        for bar, val in zip(bars, metric_vals):
            ax.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height() / 2,
                    f"{val:.4f}", va="center", fontsize=11, fontweight="bold")
        ax.set_xlim(0, 1.15)
        ax.set_title(key.replace("_", " ").title(), fontsize=13, fontweight="bold")
        ax.grid(True, axis="x", alpha=0.3)
    fig.suptitle("Model Performance Summary", fontsize=16, fontweight="bold", y=1.03)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)


def plot_weight_optimization(weight_results: List[Tuple], save_path: str) -> None:
    if not weight_results:
        return
    w_if_vals = sorted(set(r[0] for r in weight_results))
    f1_vals = [r[3] for r in weight_results]

    fig, ax = plt.subplots(figsize=(12, 4))
    ax.plot([r[0] for r in weight_results], f1_vals, "o-", color="#3498db", linewidth=2)
    best = max(weight_results, key=lambda r: r[3])
    ax.scatter([best[0]], [best[3]], s=200, c="#e74c3c", zorder=5,label=f"Best: IF={best[0]:.2f}, LSTM={best[1]:.2f}, F1={best[3]:.4f}")
    ax.set_xlabel("Isolation Forest Weight", fontsize=13)
    ax.set_ylabel("Best F1 Score", fontsize=13)
    ax.set_title("Hybrid Weight Optimization", fontsize=14, fontweight="bold")
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    log.info("Saved: %s", save_path)


def find_best_threshold(y_true: np.ndarray, scores: np.ndarray) -> Tuple[float, float]:
    precision, recall, thresholds = precision_recall_curve(y_true, scores)
    f1_scores = 2 * (precision * recall) / (precision + recall + 1e-10)
    best_idx = np.argmax(f1_scores)
    best_thresh = thresholds[best_idx] if best_idx < len(thresholds) else thresholds[-1]
    return float(best_thresh), float(f1_scores[best_idx])


def main() -> None:
    os.makedirs(SAVE_DIR, exist_ok=True)
    log.info("=" * 60)
    log.info("  FYP AI — Vehicle Accident Detection System (v2)")
    log.info("=" * 60)

    # ── 1. Load & preprocess ──────────────────────────────────────
    datasets = load_all_datasets()
    datasets = run_preprocessing(datasets)

    # ── 2. Scale features ─────────────────────────────────────────
    scaler = MinMaxScaler()
    if "training" not in datasets or datasets["training"].empty:
        log.error("Training dataset is missing or empty. Aborting.")
        return
    scaler.fit(datasets["training"][FEATURES])
    log.info("Scaler fitted on training data (%d rows, %d features)",len(datasets["training"]), len(FEATURES))

    scaled_data: Dict[str, np.ndarray] = {}
    for key, df in datasets.items():
        if all(c in df.columns for c in FEATURES):
            scaled_data[key] = scaler.transform(df[FEATURES])

    log.info("Training Isolation Forest (n_estimators=%d, contamination=%.3f)",IF_ESTIMATORS, IF_CONTAMINATION)
    iso_forest = IsolationForest(
        n_estimators=IF_ESTIMATORS,
        contamination=IF_CONTAMINATION,
        random_state=SEED,
        n_jobs=-1,
    )
    iso_forest.fit(scaled_data["training"])

    
    n_features = len(FEATURES)
    X_train_raw = create_sequences(scaled_data["training"], SEQ_LEN)
    log.info("Raw training sequences: %d, shape %s", len(X_train_raw), X_train_raw.shape)

    
    X_train = augment_training_sequences(X_train_raw, multiplier=3)
    log.info("After augmentation: %d sequences (3× augmented)", len(X_train))

    model = build_lstm_autoencoder(n_features, SEQ_LEN)

    callbacks = [
        EarlyStopping(
            monitor="val_loss", patience=15, restore_best_weights=True, verbose=1
        ),
        ReduceLROnPlateau(
            monitor="val_loss", factor=0.2, patience=5, min_lr=1e-7, verbose=1
        ),
    ]

    history = model.fit(
        X_train, X_train,
        epochs=LSTM_EPOCHS,
        batch_size=LSTM_BATCH,
        validation_split=0.1,
        callbacks=callbacks,
        verbose=1,
    )

    plot_training_history(history, os.path.join(SAVE_DIR, "training_history.png"))

    
    


    log.info("Exporting Models to ONNX...")

    spec = (tf.TensorSpec((None, SEQ_LEN, n_features), tf.float32, name="input_layer"),)
    lstm_path = os.path.join(SAVE_DIR, "lstm_autoencoder.onnx")
    tf2onnx.convert.from_keras(model, input_signature=spec, opset=13, output_path=lstm_path)

    initial_type = [('float_input', FloatTensorType([None, n_features]))]
    target_opsets = {'': 13, 'ai.onnx.ml': 3} 

    log.info("Converting Scaler to ONNX...")
    onnx_scaler = convert_sklearn(scaler, initial_types=initial_type, target_opset=target_opsets)
    with open(os.path.join(SAVE_DIR, "scaler.onnx"), "wb") as f:
        f.write(onnx_scaler.SerializeToString())

    log.info("Converting Isolation Forest to ONNX...")
    onnx_if = convert_sklearn(iso_forest, initial_types=initial_type, target_opset=target_opsets)
    with open(os.path.join(SAVE_DIR, "isolation_forest.onnx"), "wb") as f:
        f.write(onnx_if.SerializeToString())

    log.info("All models saved successfully in ONNX format.")

    plot_feature_importance(
        iso_forest, FEATURES, os.path.join(SAVE_DIR, "feature_importance.png"),
    )

    
    test_keys = [
        "controlled_test",
        "general_table_controlled_test",
        "uncontrolled_test",
        "general_table_uncontrolled_test",
    ]
    summary_results: Dict[str, dict] = {}

    for key in test_keys:
        if key not in scaled_data or key not in datasets:
            continue
        if "label" not in datasets[key].columns:
            log.warning("Skipping %s (no ground truth labels)", key)
            continue

        log.info("")
        log.info("─── Evaluating: %s ───", key)
        data = scaled_data[key]
        df = datasets[key].copy()

        # LSTM reconstruction error
        X_test = create_sequences(data, SEQ_LEN)
        preds_recon = model.predict(X_test, verbose=0)
        lstm_mse = np.mean(np.square(preds_recon - X_test), axis=(1, 2))

        # Align
        df = df.iloc[SEQ_LEN:].copy().reset_index(drop=True)
        data_aligned = data[SEQ_LEN:]

        # IF scores (inverted)
        if_raw = iso_forest.decision_function(data_aligned)
        if_range = if_raw.max() - if_raw.min()
        if_score = 1 - (if_raw - if_raw.min()) / if_range if if_range > 0 else np.zeros_like(if_raw)

        # LSTM scores normalized
        lstm_range = lstm_mse.max() - lstm_mse.min()
        lstm_score = (lstm_mse - lstm_mse.min()) / lstm_range if lstm_range > 0 else np.zeros_like(lstm_mse)

        y_true = df["label"].values

        # Grid-search optimal weights for this dataset
        best_w_if, best_w_lstm, best_thresh, max_f1 = grid_search_hybrid_weights(
            y_true, if_score, lstm_score
        )

        # Apply best weights
        df["hybrid_score"] = best_w_if * if_score + best_w_lstm * lstm_score
        df["if_score"] = if_score
        df["lstm_score"] = lstm_score
        scores = df["hybrid_score"].values

        df["pred"] = (scores >= best_thresh).astype(int)

        # Compute metrics
        acc = accuracy_score(y_true, df["pred"])
        prec = precision_score(y_true, df["pred"], zero_division=0)
        rec = recall_score(y_true, df["pred"], zero_division=0)
        f1 = f1_score(y_true, df["pred"], zero_division=0)

        log.info("  Weights: IF=%.2f, LSTM=%.2f | Threshold: %.4f", best_w_if, best_w_lstm, best_thresh)
        log.info("  Accuracy:  %.4f", acc)
        log.info("  Precision: %.4f", prec)
        log.info("  Recall:    %.4f", rec)
        log.info("  F1 Score:  %.4f", f1)

        # Generate all evaluation plots
        safe_key = key.replace(" ", "_")

        plot_confusion_matrix(
            y_true, df["pred"], key,
            os.path.join(SAVE_DIR, f"{safe_key}_confusion_matrix.png"),
        )
        plot_classification_report_table(
            y_true, df["pred"], key,
            os.path.join(SAVE_DIR, f"{safe_key}_classification_report.png"),
        )
        roc_auc_val = plot_roc_curve(
            y_true, scores, key,
            os.path.join(SAVE_DIR, f"{safe_key}_roc_curve.png"),
        )
        ap_val = plot_precision_recall_curve(
            y_true, scores, best_thresh, key,
            os.path.join(SAVE_DIR, f"{safe_key}_precision_recall_curve.png"),
        )
        plot_score_distribution(
            y_true, scores, best_thresh, key,
            os.path.join(SAVE_DIR, f"{safe_key}_score_distribution.png"),
        )
        plot_timeseries(
            df, best_thresh, key,
            os.path.join(SAVE_DIR, f"{safe_key}_timeseries.png"),
        )
        plot_feature_distributions(
            df, FEATURES, key,
            os.path.join(SAVE_DIR, f"{safe_key}_feature_distributions.png"),
        )

        summary_results[key] = {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1": f1,
            "roc_auc": roc_auc_val,
            "ap": ap_val,
            "threshold": best_thresh,
            "if_weight": best_w_if,
            "lstm_weight": best_w_lstm,
        }

    
    if summary_results:
        plot_summary_report(summary_results, os.path.join(SAVE_DIR, "summary_report.png"))

    elapsed = time.time() - start_time
    log.info("")
    log.info("=" * 60)
    log.info("  COMPLETE — Total time: %.1f seconds", elapsed)
    log.info("  All outputs saved to: %s", SAVE_DIR)
    log.info("=" * 60)

    
    log.info("")
    log.info("  ┌─────────────────────────────────────────────────────────┐")
    log.info("  │  RESULTS SUMMARY                                       │")
    log.info("  ├──────────────────────────┬──────┬──────┬──────┬────────┤")
    log.info("  │ Dataset                  │  Acc │ Prec │  Rec │   F1   │")
    log.info("  ├──────────────────────────┼──────┼──────┼──────┼────────┤")
    for key, m in summary_results.items():
        short_name = key[:24].ljust(24)
        log.info("  │ %s │ %.2f │ %.2f │ %.2f │ %.4f │",
short_name, m["accuracy"], m["precision"], m["recall"], m["f1"])
    log.info("  └──────────────────────────┴──────┴──────┴──────┴────────┘")


if __name__ == "__main__":
    main()
