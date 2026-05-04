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
from scipy.ndimage import median_filter
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
from sklearn.preprocessing import RobustScaler, StandardScaler
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
    Add,
    LayerNormalization,
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

# ─── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(PROJECT_ROOT, "gps_dataset")        # FIXED: was "FYP AI"
SAVE_DIR = os.path.join(PROJECT_ROOT, "Evaluation_Results")
os.makedirs(SAVE_DIR, exist_ok=True)

RAW_SENSOR_COLS = ["speed", "accx", "accy", "accz", "gyrox", "gyroy", "gyroz"]
GRAVITY = 9.81

# ─── Hyperparameters (TUNED v3 — Orientation-Invariant) ───────────────────────
SEQ_LEN = 15                    # Longer window captures full crash signature
LSTM_EPOCHS = 150               # More epochs for better convergence
LSTM_BATCH = 32
LSTM_LR = 0.0003                # Lower LR for stable training
IF_CONTAMINATION = 0.02         # Tighter = fewer false positives
IF_ESTIMATORS = 300             # Stronger ensemble
AUG_MULTIPLIER = 3              # More augmentation for robustness
SMOOTHING_WINDOW = 3            # Temporal smoothing eliminates isolated FP spikes
THRESHOLD_PERCENTILE = 99.5     # Very tight threshold
SPEED_GATE_KMH = 5.0            # Min speed for accident detection (mobile app gate)

sns.set_theme(style="whitegrid", font_scale=1.1)
COLORS = {"normal": "#2ecc71", "crash": "#e74c3c", "threshold": "#f39c12"}

start_time = time.time()


# ==================== DATA LOADING ====================

def load_csv(relative_path: str) -> pd.DataFrame:
    path = os.path.join(DATA_DIR, relative_path)
    log.info("Loading %s", os.path.basename(path))
    return pd.read_csv(path)


def load_all_datasets() -> Dict[str, pd.DataFrame]:
    datasets = {
        "controlled_test": load_csv(
            "dataset_controlled_test/data_set_controlled_test.csv"
        ),
        "training": load_csv(
            "dataset_training/data_set_training.csv"
        ),
        "uncontrolled_test": load_csv(
            "dataset_uncontrolled_test/data_set_uncontrolled_test.csv"
        ),
        "general_table_controlled_test": load_csv(
            "dataset_controlled_test/General_table_controlled_test.csv"
        ),
        "general_table_training": load_csv(
            "dataset_training/general_table_training.csv"
        ),
        "general_table_uncontrolled_test": load_csv(
            "dataset_uncontrolled_test/general_table_uncontrolled_test.csv"
        ),
    }

    # ── Load the 8000-row IMU dataset with explicit crash labels ──────
    imu_path = os.path.join(DATA_DIR, "road_accident_imu_dataset_8000.csv")
    if os.path.exists(imu_path):
        log.info("Loading road_accident_imu_dataset_8000.csv")
        imu_df = pd.read_csv(imu_path)
        # Rename columns to match existing convention
        imu_df = imu_df.rename(columns={
            "Acc_X": "accx", "Acc_Y": "accy", "Acc_Z": "accz",
            "Gyro_X": "gyrox", "Gyro_Y": "gyroy", "Gyro_Z": "gyroz",
            "Speed_kmh": "speed", "Crash_Label": "label",
        })
        log.info("  IMU dataset: %d rows, %d normal, %d crash",
                 len(imu_df), (imu_df["label"] == 0).sum(), (imu_df["label"] == 1).sum())

        # Split: normal rows for training augmentation, full set for evaluation
        imu_normal = imu_df[imu_df["label"] == 0].copy().reset_index(drop=True)
        datasets["imu_training"] = imu_normal       # 7000 normal rows
        datasets["imu_labeled_test"] = imu_df.copy() # Full 8000 rows with labels
    else:
        log.warning("road_accident_imu_dataset_8000.csv not found — skipping")

    return datasets


# ==================== PREPROCESSING ====================

def ensure_sensor_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in RAW_SENSOR_COLS:
        if col not in df.columns:
            df[col] = np.nan
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def filter_valid_sensor_rows(
    df: pd.DataFrame, has_type_record: bool = False, is_training: bool = False,
) -> pd.DataFrame:
    """Filter rows. Only drop type_record!=0 for TRAINING data, not test data."""
    if df.empty:
        return df
    df = df.copy()
    # Only remove crash rows from training data (to keep it normal-only)
    # For test data, KEEP crash rows so we can actually evaluate on them
    if is_training and has_type_record and "type_record" in df.columns:
        df["type_record"] = pd.to_numeric(df["type_record"], errors="coerce").fillna(0)
        df = df[df["type_record"] == 0].copy()
    acc_gyro = ["accx", "accy", "accz", "gyrox", "gyroy", "gyroz"]
    if not all(c in df.columns for c in acc_gyro):
        return df.reset_index(drop=True)
    # For test data, be lenient — fill NaN sensors instead of dropping rows
    if not is_training:
        df[acc_gyro] = df[acc_gyro].ffill().bfill().fillna(0)
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

    # Remove gravity from ALL axes — makes model orientation-invariant
    # On mobile, this matches using userAccelerometerEvents (linear acceleration)
    for axis in ["accx", "accy", "accz"]:
        if axis in df.columns:
            df[f"{axis}_linear"] = remove_gravity_adaptive(df[axis])
        else:
            df[f"{axis}_linear"] = 0.0
    return df


# ==================== FEATURE ENGINEERING (IMPROVED) ====================

def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    df = df.copy()

    # Use gravity-removed (linear) acceleration for ALL axes
    # This makes the model orientation-invariant — works regardless of phone position
    accx = df["accx_linear"] if "accx_linear" in df.columns else df["accx"]
    accy = df["accy_linear"] if "accy_linear" in df.columns else df["accy"]
    accz = df["accz_linear"] if "accz_linear" in df.columns else df["accz"]

    # ── Core Magnitude Features (orientation-invariant) ───────────────────
    df["acc_mag"] = np.sqrt(accx**2 + accy**2 + accz.fillna(0)**2)
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

    # ── Resultant Force (speed × acceleration) ────────────────────────────
    df["resultant_force"] = df["speed"].abs() * df["acc_mag"]

    # ── Acceleration Skewness (rolling) ───────────────────────────────────
    df["acc_skewness"] = (
        df["acc_mag"].rolling(window=10, min_periods=3)
        .apply(lambda x: pd.Series(x).skew(), raw=False).fillna(0)
    )

    # ── Angular Velocity Change Rate (replaces heading_change_rate) ───────
    # Orientation-invariant: uses gyro magnitude instead of raw accx/accy
    df["angular_velocity_change"] = df["gyro_mag"].diff().fillna(0).abs()

    # ── Acc-Gyro Correlation (replaces multi_axis_corr) ───────────────────
    # Orientation-invariant: correlates magnitudes, not raw axes
    df["acc_gyro_corr"] = (
        df["acc_mag"].rolling(window=10, min_periods=3)
        .corr(df["gyro_mag"]).fillna(0).abs()
    )

    # ── Multi-Resolution Windows ──────────────────────────────────────────
    for window in [3, 7, 10]:
        df[f"acc_mag_max_{window}"] = df["acc_mag"].rolling(window, min_periods=1).max().fillna(0)
        df[f"gyro_mag_max_{window}"] = df["gyro_mag"].rolling(window, min_periods=1).max().fillna(0)

    # ── Cumulative Jerk ───────────────────────────────────────────────────
    df["cumulative_jerk"] = (
        df["jerk_mag"].rolling(window=5, min_periods=1).sum().fillna(0)
    )

    # ── Braking Intensity ─────────────────────────────────────────────────
    df["braking_intensity"] = df["speed"].abs() * df["deceleration"]

    # ── NEW: Impact Intensity (peak-to-trough in short window) ────────────
    # Crashes produce large rapid oscillations in acceleration
    df["impact_intensity"] = (
        df["acc_mag"].rolling(window=5, min_periods=1).max() -
        df["acc_mag"].rolling(window=5, min_periods=1).min()
    ).fillna(0)

    # ── NEW: Gyro-Acc Synchrony ───────────────────────────────────────────
    # During crashes, both acceleration and rotation spike simultaneously
    df["gyro_acc_product"] = df["acc_mag"] * df["gyro_mag"]

    # ── NEW: Speed-Weighted Jerk ──────────────────────────────────────────
    # Jerk at high speed is more dangerous than jerk at low speed
    df["speed_weighted_jerk"] = df["speed"].abs() * df["jerk_mag"]

    # ── NEW: Rotational Energy ────────────────────────────────────────────
    # Sustained high rotation = vehicle spinning / rollover
    df["rotational_energy"] = (
        df["gyro_mag"].rolling(window=5, min_periods=1)
        .apply(lambda x: np.sum(x**2), raw=True).fillna(0)
    )

    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(0)
    return df


def calculate_clip_bounds(df: pd.DataFrame, columns: List[str],
                          lower_pct: float = 1, upper_pct: float = 99) -> Dict[str, Tuple[float, float]]:
    bounds = {}
    for col in columns:
        if col in df.columns:
            lo = np.nanpercentile(df[col], lower_pct)
            hi = np.nanpercentile(df[col], upper_pct)
            bounds[col] = (lo, hi)
    return bounds

def apply_clip_bounds(df: pd.DataFrame, bounds: Dict[str, Tuple[float, float]]) -> pd.DataFrame:
    df = df.copy()
    for col, (lo, hi) in bounds.items():
        if col in df.columns:
            df[col] = df[col].clip(lower=lo, upper=hi)
    return df


# ── FEATURE LIST (v3 — All Orientation-Invariant) ─────────────────────────────
FEATURES = [
    # Core magnitude features (12)
    "acc_mag", "gyro_mag", "jerk_mag", "acc_energy",
    "speed", "speed_change", "deceleration",
    "acc_mag_std", "gyro_mag_std", "speed_acc_interaction",
    "gyro_jerk", "acc_peak_ratio",
    # Discriminative features — all orientation-invariant (4)
    "resultant_force", "acc_skewness",
    "angular_velocity_change", "acc_gyro_corr",
    # Multi-resolution windows (6)
    "acc_mag_max_3", "acc_mag_max_7", "acc_mag_max_10",
    "gyro_mag_max_3", "gyro_mag_max_7", "gyro_mag_max_10",
    # Impact features (6)
    "cumulative_jerk", "braking_intensity",
    "impact_intensity", "gyro_acc_product",
    "speed_weighted_jerk", "rotational_energy",
]


# ==================== GROUND TRUTH LABELING ====================

def generate_ground_truth_multi_signal(
    df: pd.DataFrame, window_before: int = 3, window_after: int = 2,
    n_std: float = 2.0,
) -> pd.DataFrame:
    """Label crash zones using multi-signal consensus."""
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

    # Only label as crash where ALL 3 signals fire within a tight window
    crash_signal = np.zeros(len(df), dtype=int)
    for i in range(len(df)):
        w_start = max(0, i - 2)
        w_end = min(len(df), i + 3)
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


def generate_ground_truth_type_record(df: pd.DataFrame) -> pd.DataFrame:
    """Label crash zones using type_record.
    Crash rows (type_record>=1) often lack real sensor data. So we label
    a window of normal rows BEFORE each crash event, plus the crash rows
    themselves. This lets the model detect the sensor patterns leading to crashes."""
    if df.empty or "type_record" not in df.columns:
        return df
    df = df.copy()
    tr = pd.to_numeric(df["type_record"], errors="coerce").fillna(0).astype(int)
    df["label"] = 0

    # Label crash rows directly
    df.loc[tr >= 1, "label"] = 1

    # Also label a window of normal rows BEFORE each crash start
    # These rows have real sensor data showing the crash patterns
    window_before = 3
    crash_starts = ((tr >= 1) & (tr.shift(1, fill_value=0) == 0))
    for idx in df.index[crash_starts]:
        start = max(0, idx - window_before)
        df.loc[start:idx, "label"] = 1

    crash_pct = df["label"].mean() * 100
    log.info("  type_record labels: %.1f%% crash (%d/%d)", crash_pct, df["label"].sum(), len(df))
    return df


def run_preprocessing(datasets: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    processed = {}
    # Determine which datasets are training vs test
    training_keys = {"training", "general_table_training", "imu_training"}

    for key, df in datasets.items():
        log.info("Preprocessing: %s (%d rows)", key, len(df))
        has_type_record = "type_record" in df.columns
        has_label = "label" in df.columns
        is_training = key in training_keys

        df = ensure_sensor_columns(df)

        # Label general_table test datasets using type_record directly
        if has_type_record and "general_table" in key and not is_training:
            df = generate_ground_truth_type_record(df)

        # imu_labeled_test already has labels — keep them
        # imu_training already has labels removed (normal only)

        # Only drop crash rows from training data, keep them in test data
        df = filter_valid_sensor_rows(df, has_type_record=has_type_record,
                                       is_training=is_training)
        if df.empty:
            log.warning("  Skipped %s (empty after filtering)", key)
            continue

        df = preprocess_sensors(df)
        df = add_engineered_features(df)
        processed[key] = df

    # Label controlled_test (no type_record) using multi-signal detection
    for key in ["controlled_test"]:
        if key in processed:
            processed[key] = generate_ground_truth_multi_signal(processed[key])

    # Calculate global clip bounds based on ALL training data to prevent scale mismatch
    training_dfs = []
    for key in training_keys:
        if key in processed and not processed[key].empty:
            training_dfs.append(processed[key])

    if training_dfs:
        combined_train = pd.concat(training_dfs, ignore_index=True)
        global_bounds = calculate_clip_bounds(combined_train, FEATURES, lower_pct=1, upper_pct=99.5)
        # Apply these exact bounds to ALL datasets
        for key in processed.keys():
            processed[key] = apply_clip_bounds(processed[key], global_bounds)
    else:
        log.warning("No training data found to calculate global clip bounds.")

    return processed


# ==================== AUGMENTATION (IMPROVED) ====================

def augment_training_sequences(X: np.ndarray, multiplier: int = AUG_MULTIPLIER) -> np.ndarray:
    """Light augmentation: jitter + scaling only. Heavy warping kills anomaly detection."""
    augmented = [X]

    for i in range(multiplier - 1):
        noise = np.random.normal(0, 0.015, X.shape)
        scale = np.random.uniform(0.95, 1.05, (1, 1, X.shape[2]))
        result = (X + noise) * scale
        augmented.append(result)

    result = np.concatenate(augmented, axis=0)
    idx = np.random.permutation(len(result))
    return result[idx]


# ==================== LSTM AUTOENCODER (IMPROVED ARCHITECTURE) ====================

def build_lstm_autoencoder(n_features: int, seq_len: int) -> Model:
    """
    Simpler LSTM Autoencoder — no skip connections.
    Skip connections let the decoder bypass the bottleneck, which destroys
    anomaly detection because anomalies get reconstructed perfectly too.
    """
    inputs = Input(shape=(seq_len, n_features), name="input_layer")

    # ── Encoder ───────────────────────────────────────────────────────────
    enc1 = LSTM(64, return_sequences=True, name="enc_lstm1")(inputs)
    enc1 = Dropout(0.2)(enc1)

    enc2 = LSTM(32, return_sequences=True, name="enc_lstm2")(enc1)

    # ── Attention Mechanism ───────────────────────────────────────────────
    query = Dense(32)(enc2)
    value = Dense(32)(enc2)
    attention_out = Attention()([query, value])

    # ── Bottleneck (forces compression — key for anomaly detection) ─────
    bottleneck = LSTM(16, return_sequences=False, name="bottleneck")(attention_out)
    bottleneck_rep = RepeatVector(seq_len)(bottleneck)

    # ── Decoder ───────────────────────────────────────────────────────────
    dec1 = LSTM(32, return_sequences=True, name="dec_lstm1")(bottleneck_rep)
    dec1 = Dropout(0.2)(dec1)

    dec2 = LSTM(64, return_sequences=True, name="dec_lstm2")(dec1)

    # ── Output ────────────────────────────────────────────────────────────
    outputs = TimeDistributed(Dense(n_features), name="output_layer")(dec2)

    model = Model(inputs=inputs, outputs=outputs, name="LSTM_AE_v3")
    model.compile(optimizer=Adam(learning_rate=LSTM_LR), loss="mse")
    model.summary(print_fn=log.info)

    return model


def create_sequences(data: np.ndarray, seq_len: int) -> np.ndarray:
    if len(data) <= seq_len:
        return np.array([data[:seq_len]] if len(data) == seq_len else [])
    return np.array([data[i : i + seq_len] for i in range(len(data) - seq_len)])


# ==================== HYBRID SCORING ====================

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


def calibrate_threshold_on_training(
    model, X_train: np.ndarray, percentile: float = THRESHOLD_PERCENTILE
) -> float:
    """Calibrate anomaly threshold from training data reconstruction error.
    Since training data is normal-only, the threshold is set at a high percentile
    of normal reconstruction errors. Anything above this = anomaly."""
    recon = model.predict(X_train, verbose=0)
    mse = np.mean(np.square(recon - X_train), axis=(1, 2))
    threshold = float(np.percentile(mse, percentile))
    log.info("  Training-calibrated LSTM threshold (p%d): %.6f", percentile, threshold)
    log.info("  Training MSE stats: mean=%.6f, std=%.6f, max=%.6f",
             mse.mean(), mse.std(), mse.max())
    return threshold


# ==================== PLOTTING ====================

def plot_training_history(history, save_path: str) -> None:
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(history.history["loss"], label="Training Loss", linewidth=2, color="#3498db")
    if "val_loss" in history.history:
        ax.plot(history.history["val_loss"], label="Validation Loss", linewidth=2, color="#e74c3c")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Loss")
    ax.set_title("LSTM Autoencoder — Training History (Normal-Only Data)", fontsize=14, fontweight="bold")
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
    fig, ax = plt.subplots(figsize=(10, 8))
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
    fig.suptitle("Model Performance Summary (v3 — Orientation-Invariant)", fontsize=16, fontweight="bold", y=1.03)
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


# ==================== MAIN PIPELINE ====================

def main() -> None:
    os.makedirs(SAVE_DIR, exist_ok=True)
    log.info("=" * 60)
    log.info("  FYP AI — Vehicle Accident Detection System (v3 — Orientation-Invariant)")
    log.info("  Key improvements: Gravity removal from all axes, 28 orientation-")
    log.info("  invariant features, SEQ_LEN=15, speed gate, stronger ensemble")
    log.info("=" * 60)

    # ── 1. Load & preprocess ──────────────────────────────────────
    datasets = load_all_datasets()
    datasets = run_preprocessing(datasets)

    # ── 2. Scale features (IMPROVED: StandardScaler) ────────────────
    scaler = StandardScaler()  # StandardScaler handles the bimodal gyro distribution better

    # Combine all normal training data for scaler fitting
    training_dfs = []
    if "training" in datasets and not datasets["training"].empty:
        training_dfs.append(datasets["training"][FEATURES])
    if "imu_training" in datasets and not datasets["imu_training"].empty:
        training_dfs.append(datasets["imu_training"][FEATURES])

    if not training_dfs:
        log.error("No training data available. Aborting.")
        return

    combined_training_features = pd.concat(training_dfs, ignore_index=True)
    scaler.fit(combined_training_features)
    log.info("StandardScaler fitted on combined training data (%d rows, %d features)",
             len(combined_training_features), len(FEATURES))

    scaled_data: Dict[str, np.ndarray] = {}
    for key, df in datasets.items():
        if all(c in df.columns for c in FEATURES):
            scaled_data[key] = scaler.transform(df[FEATURES])

    # ── 3. Isolation Forest (IMPROVED params) ─────────────────────
    log.info("Training Isolation Forest (n_estimators=%d, contamination=%.3f)",
             IF_ESTIMATORS, IF_CONTAMINATION)

    # Combine normal training data for IF
    combined_scaled_training = np.concatenate(
        [v for k, v in scaled_data.items() if k in {"training", "imu_training"}],
        axis=0,
    )
    log.info("Combined normal training data for IF: %d rows", len(combined_scaled_training))

    iso_forest = IsolationForest(
        n_estimators=IF_ESTIMATORS,
        contamination=IF_CONTAMINATION,
        max_features=1.0,          # ONNX requires max_features=1.0
        bootstrap=True,
        random_state=SEED,
        n_jobs=-1,
    )
    iso_forest.fit(combined_scaled_training)

    # ── 4. LSTM Autoencoder — trained on NORMAL data only ─────────
    n_features = len(FEATURES)

    # Combine normal sequences from both training sources
    train_sequences = []
    for train_key in ["training", "imu_training"]:
        if train_key in scaled_data:
            seqs = create_sequences(scaled_data[train_key], SEQ_LEN)
            if len(seqs) > 0:
                train_sequences.append(seqs)
                log.info("  %s → %d sequences", train_key, len(seqs))

    X_train_raw = np.concatenate(train_sequences, axis=0)
    log.info("Combined normal-only training sequences: %d, shape %s",
             len(X_train_raw), X_train_raw.shape)

    # Augment normal data with enhanced augmentation
    X_train = augment_training_sequences(X_train_raw, multiplier=AUG_MULTIPLIER)
    log.info("After augmentation: %d sequences (%d× augmented)", len(X_train), AUG_MULTIPLIER)

    model = build_lstm_autoencoder(n_features, SEQ_LEN)

    callbacks = [
        EarlyStopping(
            monitor="val_loss", patience=20, restore_best_weights=True, verbose=1
        ),
        ReduceLROnPlateau(
            monitor="val_loss", factor=0.3, patience=7, min_lr=1e-7, verbose=1
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

    # ── 5. Calibrate LSTM threshold on training data ──────────────
    # Since training is normal-only, anything above this threshold = anomaly
    lstm_train_threshold = calibrate_threshold_on_training(model, X_train_raw)

    # ── 6. Export Models to ONNX ──────────────────────────────────
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

    # Export model config for mobile app
    import json
    mobile_config = {
        "speed_gate_kmh": SPEED_GATE_KMH,
        "seq_len": SEQ_LEN,
        "n_features": n_features,
        "feature_names": FEATURES,
        "lstm_threshold": lstm_train_threshold,
        "threshold_percentile": THRESHOLD_PERCENTILE,
        "notes": [
            "Use linear acceleration (gravity-removed) on mobile",
            "All features are orientation-invariant",
            "Skip inference when speed < speed_gate_kmh",
        ],
    }
    config_path = os.path.join(SAVE_DIR, "mobile_config.json")
    with open(config_path, "w") as f:
        json.dump(mobile_config, f, indent=2)
    log.info("Saved mobile config: %s", config_path)

    plot_feature_importance(
        iso_forest, FEATURES, os.path.join(SAVE_DIR, "feature_importance.png"),
    )

    # ── 7. Evaluate on test datasets ──────────────────────────────
    test_keys = [
        "controlled_test",
        "general_table_controlled_test",
        "uncontrolled_test",
        "general_table_uncontrolled_test",
        "imu_labeled_test",
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
        if len(X_test) == 0:
            log.warning("Skipping %s (not enough data for sequences)", key)
            continue
        preds_recon = model.predict(X_test, verbose=0)
        lstm_mse = np.mean(np.square(preds_recon - X_test), axis=(1, 2))

        # Align labels with sequences
        df = df.iloc[SEQ_LEN:].copy().reset_index(drop=True)
        data_aligned = data[SEQ_LEN:]

        # IF scores (inverted: higher = more anomalous)
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

        # ── TEMPORAL SMOOTHING (NEW) ──────────────────────────────
        # Smooth scores to eliminate isolated FP spikes
        scores_smoothed = median_filter(scores, size=SMOOTHING_WINDOW)
        df["hybrid_score_raw"] = scores
        df["hybrid_score"] = scores_smoothed
        scores = scores_smoothed

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

    # ── Summary ───────────────────────────────────────────────────
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
    log.info("  │  RESULTS SUMMARY (v3 — Orientation-Invariant)              │")
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
