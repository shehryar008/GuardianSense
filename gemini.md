# GuardianSense — Migration to Supervised Crash Detection Model

**Scope:** Replace old unsupervised (LSTM Autoencoder + Isolation Forest) with new supervised binary classifier
**Files affected:** `main.py` (Python/Colab), `sensor_service.dart` (Flutter)
**Date:** 2026-05-07

---

## Overview — Why Migrate

The old model was **unsupervised** — it detected anomalies by measuring how poorly the LSTM could reconstruct sensor data (MSE). It never directly learned what a crash looks like. The new model is **supervised** — it trains directly on `Crash_Label` and outputs a crash probability between 0.0 and 1.0.

| | Old Model | New Model |
|--|-----------|-----------|
| Type | Unsupervised anomaly detection | Supervised binary classifier |
| Models | LSTM Autoencoder + Isolation Forest (two separate) | Single end-to-end model |
| Output | MSE reconstruction error (indirect) | Crash probability 0.0–1.0 (direct) |
| Uses crash labels | ❌ No | ✅ Yes |
| Features | 28 | 10 |
| Threshold | Arbitrary 99.5th percentile | Optimized for best F1 on test set |
| Architecture | Autoencoder + IF must both agree | Conv1D → BiLSTM → Attention → Dense |
| False positive control | Poor | Better |

---

## Part 1 — Python: Generate the ONNX File

### Step 1 — Set the Recommended SEQ_LEN

The current `main.py` uses `SEQ_LEN = 20` which means 20 seconds of priming before any detection. Change it to `10` for a better balance between context and startup time:

```python
# In main.py, find this line near the top:
SEQ_LEN = 20   # change to:
SEQ_LEN = 10
```

> **Rule:** Whatever value you set here, `_seqLen` in `sensor_service.dart` must be the exact same number. The ONNX model's input shape is baked in at export time — changing only one side breaks the model.

### Step 2 — Add Scaler Export to `export_to_onnx()`

The current `export_to_onnx()` function in `main.py` exports `crash_detector.onnx` and `scaler.onnx`. After training, you need the scaler's `min_` and `scale_` values to hardcode in Dart. Add this print statement at the end of `export_to_onnx()`:

```python
def export_to_onnx(model, scaler, n_features: int, seq_len: int):
    # ... existing export code unchanged ...

    # ADD THIS at the end of the function:
    log.info("MinMaxScaler parameters for Dart:")
    log.info("  _scalerMin  = %s", scaler.data_min_.tolist())
    log.info("  _scalerScale = %s", scaler.data_range_.tolist())
    
    # Also save them to a JSON file for easy copy-paste
    scaler_params = {
        "data_min": scaler.data_min_.tolist(),
        "data_range": scaler.data_range_.tolist(),
        "feature_names": FEATURES,
    }
    with open(os.path.join(SAVE_DIR, "scaler_params.json"), "w") as f:
        json.dump(scaler_params, f, indent=2)
    log.info("Scaler params saved to scaler_params.json")
```

### Step 3 — Run Training in Google Colab

Upload your dataset to `/content/road_accident_imu_dataset_8000.csv` and run the script. After completion, download these files from `/content/Evaluation_Results/`:

```
crash_detector.onnx     ← the new single model
scaler_params.json      ← min and range values for Dart
model_config.json       ← contains optimal_threshold value
```

> You do NOT need `isolation_forest.onnx` or `lstm_autoencoder.onnx` anymore. The new model replaces both.

### Step 4 — Copy ONNX File to Flutter Assets

Place `crash_detector.onnx` in your Flutter project:

```
lib/
  assets/
    models/
      crash_detector.onnx    ← new file (add this)
      isolation_forest.onnx  ← old file (keep for now, remove later)
      lstm_autoencoder.onnx  ← old file (keep for now, remove later)
    audio/
      alarm.wav
```

Make sure `pubspec.yaml` includes the assets folder:

```yaml
flutter:
  assets:
    - lib/assets/models/
    - lib/assets/audio/
```

---

## Part 2 — Dart: Full Rewrite of `sensor_service.dart`

The changes touch every major section of the file. Each section is shown with the old code and the exact replacement.

---

### Change 1 — Replace ONNX Sessions (Fields Section)

**Remove** the two old session fields and scaler constants (the entire block of 28-value arrays):

```dart
// REMOVE ALL OF THIS:
OrtSession? _ifSession;
OrtSession? _lstmSession;

static const List<double> _scalerOffset = [ ... 28 values ... ];
static const List<double> _scalerScale  = [ ... 28 values ... ];

final int _seqLen = 15;
final int _numFeatures = 28;
final double _lstmThreshold = 0.80173;
```

**Replace with:**

```dart
// NEW: Single model session
OrtSession? _crashSession;

// NEW: MinMaxScaler — copy data_min and data_range from scaler_params.json
// Formula: scaled = (x - data_min) / data_range  → clamped to [0, 1]
// Feature order: acc_mag, gyro_mag, jerk_mag, acc_energy, Speed_kmh,
//                speed_change, deceleration, acc_mag_std, gyro_mag_std, Motion_Intensity
static const List<double> _scalerMin = [
  // PASTE data_min values from scaler_params.json here (10 values)
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
];
static const List<double> _scalerRange = [
  // PASTE data_range values from scaler_params.json here (10 values)
  1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
];

final int _seqLen = 10;       // must match SEQ_LEN in main.py
final int _numFeatures = 10;  // 10 features (down from 28)
final double _crashThreshold = 0.5; // replace with optimal_threshold from model_config.json
```

---

### Change 2 — Update `initModels()`

**Remove** the old dual-model loading:

```dart
// REMOVE:
_ifSession = await _createSession("lib/assets/models/isolation_forest.onnx");
_lstmSession = await _createSession("lib/assets/models/lstm_autoencoder.onnx");
print("✅ AI Models Loaded Successfully (v3 — 28 features ...)");
```

**Replace with:**

```dart
// NEW:
_crashSession = await _createSession("lib/assets/models/crash_detector.onnx");
print("✅ CrashDetector Loaded (supervised, 10 features, seq_len=$_seqLen)");
```

---

### Change 3 — Replace `_engineerFeatures()` Entirely

The old method computed 28 features. The new model uses only 10, in this exact order:

```
0: acc_mag          1: gyro_mag         2: jerk_mag
3: acc_energy       4: Speed_kmh        5: speed_change
6: deceleration     7: acc_mag_std      8: gyro_mag_std
9: Motion_Intensity (= acc_mag * gyro_mag)
```

**Remove** the entire old `_engineerFeatures()` method and the rolling history lists for `_jerkMagHistory` and `_speedHistory` (you only need `_accMagHistory` and `_gyroMagHistory` now).

**Replace `_engineerFeatures()` with:**

```dart
List<double> _engineerFeatures() {
  final double ax = _latestData['ax']!;
  final double ay = _latestData['ay']!;
  final double az = _latestData['az']!;
  final double gx = _latestData['gx']!;
  final double gy = _latestData['gy']!;
  final double gz = _latestData['gz']!;
  final double speed = _latestData['speed']!;

  // Core magnitudes
  final double accMag  = math.sqrt(ax*ax + ay*ay + az*az);
  final double gyroMag = math.sqrt(gx*gx + gy*gy + gz*gz);
  final double jerkMag = (accMag - _lastAccMag).abs();
  final double speedChange  = (speed - _lastSpeed).abs();
  final double deceleration = (speed < _lastSpeed) ? (_lastSpeed - speed) : 0.0;

  // Update rolling histories (window = 5)
  _accMagHistory.add(accMag);
  _gyroMagHistory.add(gyroMag);
  if (_accMagHistory.length  > 5) _accMagHistory.removeAt(0);
  if (_gyroMagHistory.length > 5) _gyroMagHistory.removeAt(0);

  // acc_energy: sum of squares over window=5
  final double accEnergy = _accMagHistory.fold(0.0, (s, v) => s + v * v);

  // Rolling std (window=5)
  final double accMagStd  = _rollingStd(_accMagHistory,  5);
  final double gyroMagStd = _rollingStd(_gyroMagHistory, 5);

  // Motion_Intensity = acc_mag * gyro_mag  (same as old gyro_acc_product)
  final double motionIntensity = accMag * gyroMag;

  // Save for next tick
  _lastAccMag  = accMag;
  _lastSpeed   = speed;

  // Return exactly 10 features in the order the model expects
  return [
    accMag,           // 0: acc_mag
    gyroMag,          // 1: gyro_mag
    jerkMag,          // 2: jerk_mag
    accEnergy,        // 3: acc_energy
    speed,            // 4: Speed_kmh
    speedChange,      // 5: speed_change
    deceleration,     // 6: deceleration
    accMagStd,        // 7: acc_mag_std
    gyroMagStd,       // 8: gyro_mag_std
    motionIntensity,  // 9: Motion_Intensity
  ];
}
```

Also **remove** `_lastGyroMag` field and its reset in `stopMonitoring()` — it is no longer needed.

---

### Change 4 — Replace `_scaleFeatures()`

Old formula was StandardScaler: `(x - mean) * (1/std)`.
New formula is MinMaxScaler: `(x - min) / range` clamped to `[0, 1]`.

**Replace the entire `_scaleFeatures()` method:**

```dart
// MinMaxScaler: scaled = (x - data_min) / data_range, clamped to [0, 1]
List<double> _scaleFeatures(List<double> raw) {
  final scaled = List<double>.filled(raw.length, 0.0);
  for (int i = 0; i < raw.length; i++) {
    final range = _scalerRange[i];
    scaled[i] = range > 0
        ? ((raw[i] - _scalerMin[i]) / range).clamp(0.0, 1.0)
        : 0.0;
  }
  return scaled;
}
```

---

### Change 5 — Replace `_performInference()` Entirely

The old method ran two separate models (IF + LSTM) and required both to agree. The new method runs one model and compares its output probability to a threshold.

**Replace the entire `_performInference()` method:**

```dart
Future<void> _performInference() async {
  if (_crashSession == null) return;

  // Speed gate: skip inference below 5 km/h
  final double currentSpeed = _latestData['speed'] ?? 0.0;
  if (currentSpeed < 5.0) {
    _lowSpeedCount++;
    if (_lowSpeedCount >= 3) {
      _sequenceBuffer.clear();
      _probHistory.clear();
    }
    return;
  } else {
    _lowSpeedCount = 0;
  }

  // Engineer and scale features
  final rawFeatures    = _engineerFeatures();
  final scaledFeatures = _scaleFeatures(rawFeatures);

  // Fill sequence buffer
  _sequenceBuffer.add(scaledFeatures);
  if (_sequenceBuffer.length > _seqLen) _sequenceBuffer.removeAt(0);

  if (_sequenceBuffer.length < _seqLen) {
    print('   🧠 AI Priming: Buffer ${_sequenceBuffer.length}/$_seqLen');
    return;
  }

  _inferenceCount++;

  // Run CrashDetector — input shape: [1, seq_len, n_features]
  final flatData = _sequenceBuffer.expand((e) => e).toList();
  final output   = await _runOnnx(flatData, _crashSession!, [1, _seqLen, _numFeatures]);

  if (output.isEmpty) return;

  final double crashProb = output[0];

  // Smooth probability over last 3 values (reduces single-tick false positives)
  _probHistory.add(crashProb);
  if (_probHistory.length > 3) _probHistory.removeAt(0);
  final List<double> sorted = List.from(_probHistory)..sort();
  final double smoothedProb = sorted[sorted.length ~/ 2];

  final bool isAccident = smoothedProb >= _crashThreshold;

  final now = DateTime.now();
  final inCooldown = _lastAccidentTime != null &&
      now.difference(_lastAccidentTime!).inSeconds < 30;

  if (isAccident && !inCooldown) {
    _lastAccidentTime = now;
    print('🚨 >>> ACCIDENT DETECTED! <<<');
    print('   - Speed: ${currentSpeed.toStringAsFixed(1)} km/h');
    print('   - Crash Probability: ${(smoothedProb * 100).toStringAsFixed(1)}% (threshold: ${(_crashThreshold * 100).toStringAsFixed(0)}%)');
    _accidentController.add(null);
    _insertIncident();
  } else if (_inferenceCount % 5 == 0) {
    print('   ✅ Normal — Prob:${(smoothedProb * 100).toStringAsFixed(1)}% | Speed:${currentSpeed.toStringAsFixed(1)}');
  }
}
```

---

### Change 6 — Update Fields for New Inference

**Add** these new fields alongside the existing history lists:

```dart
// Probability smoothing history (replaces _mseHistory)
final List<double> _probHistory = [];

// Low-speed consecutive counter (Bug 5 fix)
int _lowSpeedCount = 0;
```

**Remove** `_mseHistory` — it is replaced by `_probHistory`.

---

### Change 7 — Update `stopMonitoring()`

**Replace** the current `stopMonitoring()` body:

```dart
void stopMonitoring() {
  _accelSub?.cancel();
  _gyroSub?.cancel();
  _gpsSub?.cancel();
  _inferenceTimer?.cancel();

  _sequenceBuffer.clear();
  _accMagHistory.clear();
  _gyroMagHistory.clear();
  _probHistory.clear();

  _lastAccMag = 0;
  _lastSpeed  = 0;
  _lowSpeedCount = 0;
  _lastKnownPosition = null;

  _isMonitoring = false;
  _statusController.add(false);
}
```

---

### Change 8 — Update `_printTriggerValues()` (optional cleanup)

The old method printed IF label and MSE which no longer exist. Either delete it (since the new `_performInference()` prints inline) or update it:

```dart
// DELETE the old _printTriggerValues() method entirely —
// the new _performInference() already prints inline.
```

---

## Part 3 — Values to Copy from Training Output

After running `main.py` in Colab, open `scaler_params.json` and `model_config.json` and copy these values into `sensor_service.dart`:

### From `scaler_params.json`

```json
{
  "data_min":   [val0, val1, val2, val3, val4, val5, val6, val7, val8, val9],
  "data_range": [val0, val1, val2, val3, val4, val5, val6, val7, val8, val9]
}
```

Paste into Dart:
```dart
static const List<double> _scalerMin   = [ /* data_min values   */ ];
static const List<double> _scalerRange = [ /* data_range values */ ];
```

### From `model_config.json`

```json
{
  "optimal_threshold": 0.XXXX
}
```

Paste into Dart:
```dart
final double _crashThreshold = 0.XXXX;
```

---

## Summary of All Changes

| # | File | What Changes | Why |
|---|------|-------------|-----|
| 1 | `main.py` | Set `SEQ_LEN = 10` | Reduce priming from 20s to 10s |
| 2 | `main.py` | Add scaler param export to `export_to_onnx()` | Get min/range values for Dart |
| 3 | Assets | Add `crash_detector.onnx` to `lib/assets/models/` | New model file |
| 4 | `sensor_service.dart` | Remove `_ifSession`, `_lstmSession`, 28-value scaler arrays | Old models gone |
| 5 | `sensor_service.dart` | Add `_crashSession`, 10-value MinMax scaler arrays | New model fields |
| 6 | `sensor_service.dart` | Replace `initModels()` | Load single model |
| 7 | `sensor_service.dart` | Replace `_engineerFeatures()` — 28 features → 10 | Match new model input |
| 8 | `sensor_service.dart` | Replace `_scaleFeatures()` — StandardScaler → MinMaxScaler | Match training pipeline |
| 9 | `sensor_service.dart` | Replace `_performInference()` — dual model → single probability | New inference logic |
| 10 | `sensor_service.dart` | Replace `_mseHistory` with `_probHistory` | Smooth probability not MSE |
| 11 | `sensor_service.dart` | Replace `stopMonitoring()` | Clean up removed fields |
| 12 | `sensor_service.dart` | Paste `_scalerMin`, `_scalerRange`, `_crashThreshold` from training output | Calibrate to your data |

**Do not change `_seqLen` in Dart without retraining `main.py` with the same value.**
The ONNX model's input shape `[1, seq_len, 10]` is fixed at export time.