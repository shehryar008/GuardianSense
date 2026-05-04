import 'dart:async';
import 'dart:math' as math;
import 'dart:typed_data';
import 'package:flutter/services.dart';
import 'package:onnxruntime/onnxruntime.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:geolocator/geolocator.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SensorService {
  static final SensorService _instance = SensorService._internal();
  factory SensorService() => _instance;
  SensorService._internal();

  // --- ONNX Sessions ---
  OrtSession? _scalerSession;
  OrtSession? _ifSession;
  OrtSession? _lstmSession;

  // --- Model Constants (must match mobile_config.json / main.py v3) ---
  final int _seqLen = 15;       // SEQ_LEN from main.py
  final int _numFeatures = 28;  // 28 orientation-invariant features
  final double _speedGateKmh = 5.0;
  final double _lstmThreshold = 0.8079; // Calibrated from training (99.5th percentile)

  // --- Sequence Buffer for LSTM ---
  final List<List<double>> _sequenceBuffer = [];

  // --- Rolling History Buffers (for windowed features) ---
  final List<double> _accMagHistory = [];
  final List<double> _gyroMagHistory = [];
  final List<double> _jerkMagHistory = [];
  final List<double> _speedHistory = [];

  // --- Previous-timestep values (for diff-based features) ---
  double _lastAccMag = 0;
  double _lastGyroMag = 0;
  double _lastSpeed = 0;

  // --- Subscriptions ---
  StreamSubscription<UserAccelerometerEvent>? _accelSub;
  StreamSubscription<GyroscopeEvent>? _gyroSub;
  StreamSubscription<Position>? _gpsSub;
  Timer? _inferenceTimer;

  // --- Stream Controllers ---
  final StreamController<bool> _statusController = StreamController<bool>.broadcast();
  Stream<bool> get statusStream => _statusController.stream;

  final StreamController<Map<String, double>> _dataController = StreamController<Map<String, double>>.broadcast();
  Stream<Map<String, double>> get dataStream => _dataController.stream;

  final StreamController<void> _accidentController = StreamController<void>.broadcast();
  Stream<void> get accidentStream => _accidentController.stream;

  bool _isMonitoring = false;
  bool get isMonitoring => _isMonitoring;

  DateTime? _lastAccidentTime;

  final Map<String, double> _latestData = {
    'ax': 0.0, 'ay': 0.0, 'az': 0.0,
    'gx': 0.0, 'gy': 0.0, 'gz': 0.0,
    'speed': 0.0,
  };

  // ===================== 1. Initialize Models =====================

  Future<void> initModels() async {
    try {
      OrtEnv.instance.init();
      _scalerSession = await _createSession("lib/assets/models/scaler.onnx");
      _ifSession = await _createSession("lib/assets/models/isolation_forest.onnx");
      _lstmSession = await _createSession("lib/assets/models/lstm_autoencoder.onnx");
      print("✅ AI Models Loaded Successfully (v3 — 28 features, seq_len=$_seqLen)");
    } catch (e) {
      print("❌ Error loading models: $e");
    }
  }

  Future<OrtSession> _createSession(String path) async {
    final rawData = await rootBundle.load(path);
    final bytes = rawData.buffer.asUint8List();
    return OrtSession.fromBuffer(bytes, OrtSessionOptions());
  }

  // ===================== 2. Feature Engineering =====================
  // Must produce exactly 28 features in the EXACT order the model expects.
  // Feature order from mobile_config.json:
  //  0: acc_mag              1: gyro_mag             2: jerk_mag
  //  3: acc_energy           4: speed                5: speed_change
  //  6: deceleration         7: acc_mag_std          8: gyro_mag_std
  //  9: speed_acc_interaction 10: gyro_jerk          11: acc_peak_ratio
  // 12: resultant_force      13: acc_skewness        14: angular_velocity_change
  // 15: acc_gyro_corr        16: acc_mag_max_3       17: acc_mag_max_7
  // 18: acc_mag_max_10       19: gyro_mag_max_3      20: gyro_mag_max_7
  // 21: gyro_mag_max_10      22: cumulative_jerk     23: braking_intensity
  // 24: impact_intensity     25: gyro_acc_product    26: speed_weighted_jerk
  // 27: rotational_energy

  List<double> _engineerFeatures() {
    // Raw sensor data (already gravity-removed via userAccelerometerEventStream)
    final double ax = _latestData['ax']!;
    final double ay = _latestData['ay']!;
    final double az = _latestData['az']!;
    final double gx = _latestData['gx']!;
    final double gy = _latestData['gy']!;
    final double gz = _latestData['gz']!;
    final double speed = _latestData['speed']!;

    // --- Core magnitudes ---
    final double accMag = math.sqrt(ax * ax + ay * ay + az * az);
    final double gyroMag = math.sqrt(gx * gx + gy * gy + gz * gz);
    final double jerkMag = (accMag - _lastAccMag).abs();
    final double speedChange = (speed - _lastSpeed).abs();
    final double deceleration = (speed < _lastSpeed) ? (_lastSpeed - speed) : 0.0;
    final double gyroJerk = (gyroMag - _lastGyroMag).abs();

    // --- Update rolling histories ---
    _accMagHistory.add(accMag);
    _gyroMagHistory.add(gyroMag);
    _jerkMagHistory.add(jerkMag);
    _speedHistory.add(speed);
    // Keep at most 10 entries (longest window we need)
    if (_accMagHistory.length > 10) _accMagHistory.removeAt(0);
    if (_gyroMagHistory.length > 10) _gyroMagHistory.removeAt(0);
    if (_jerkMagHistory.length > 10) _jerkMagHistory.removeAt(0);
    if (_speedHistory.length > 10) _speedHistory.removeAt(0);

    // --- acc_energy: sum of squares over window=5 ---
    final accEnergyWindow = _accMagHistory.length >= 5
        ? _accMagHistory.sublist(_accMagHistory.length - 5)
        : List<double>.from(_accMagHistory);
    final double accEnergy = accEnergyWindow.fold(0.0, (s, v) => s + v * v);

    // --- acc_mag_std: std of acc_mag over window=5 ---
    final double accMagStd = _rollingStd(_accMagHistory, 5);

    // --- gyro_mag_std: std of gyro_mag over window=5 ---
    final double gyroMagStd = _rollingStd(_gyroMagHistory, 5);

    // --- speed_acc_interaction ---
    final double speedAccInteraction = speed.abs() * accMag;

    // --- acc_peak_ratio ---
    final double meanAcc = _rollingMean(_accMagHistory, 7);
    final double accPeakRatio = (accMag / (meanAcc + 1e-6)).clamp(0.0, 10.0);

    // --- resultant_force ---
    final double resultantForce = speed.abs() * accMag;

    // --- acc_skewness (rolling window=10) ---
    final double accSkewness = _rollingSkewness(_accMagHistory, 10);

    // --- angular_velocity_change ---
    final double angularVelocityChange = gyroJerk; // same as gyro_jerk, diff name

    // --- acc_gyro_corr (rolling correlation of acc_mag and gyro_mag, window=10) ---
    final double accGyroCorr = _rollingCorrelation(_accMagHistory, _gyroMagHistory, 10).abs();

    // --- Multi-resolution window max features ---
    final double accMagMax3 = _rollingMax(_accMagHistory, 3);
    final double accMagMax7 = _rollingMax(_accMagHistory, 7);
    final double accMagMax10 = _rollingMax(_accMagHistory, 10);
    final double gyroMagMax3 = _rollingMax(_gyroMagHistory, 3);
    final double gyroMagMax7 = _rollingMax(_gyroMagHistory, 7);
    final double gyroMagMax10 = _rollingMax(_gyroMagHistory, 10);

    // --- cumulative_jerk: sum of jerk over window=5 ---
    final jerkWindow = _jerkMagHistory.length >= 5
        ? _jerkMagHistory.sublist(_jerkMagHistory.length - 5)
        : List<double>.from(_jerkMagHistory);
    final double cumulativeJerk = jerkWindow.fold(0.0, (s, v) => s + v);

    // --- braking_intensity ---
    final double brakingIntensity = speed.abs() * deceleration;

    // --- impact_intensity: peak-to-trough in window=5 ---
    final double impactIntensity = _rollingMax(_accMagHistory, 5) - _rollingMin(_accMagHistory, 5);

    // --- gyro_acc_product ---
    final double gyroAccProduct = accMag * gyroMag;

    // --- speed_weighted_jerk ---
    final double speedWeightedJerk = speed.abs() * jerkMag;

    // --- rotational_energy: sum of squares of gyro over window=5 ---
    final gyroEnergyWindow = _gyroMagHistory.length >= 5
        ? _gyroMagHistory.sublist(_gyroMagHistory.length - 5)
        : List<double>.from(_gyroMagHistory);
    final double rotationalEnergy = gyroEnergyWindow.fold(0.0, (s, v) => s + v * v);

    // --- Save previous values for next timestep ---
    _lastAccMag = accMag;
    _lastGyroMag = gyroMag;
    _lastSpeed = speed;

    // --- Return all 28 features in exact order ---
    return [
      accMag,                // 0: acc_mag
      gyroMag,               // 1: gyro_mag
      jerkMag,               // 2: jerk_mag
      accEnergy,             // 3: acc_energy
      speed,                 // 4: speed
      speedChange,           // 5: speed_change
      deceleration,          // 6: deceleration
      accMagStd,             // 7: acc_mag_std
      gyroMagStd,            // 8: gyro_mag_std
      speedAccInteraction,   // 9: speed_acc_interaction
      gyroJerk,              // 10: gyro_jerk
      accPeakRatio,          // 11: acc_peak_ratio
      resultantForce,        // 12: resultant_force
      accSkewness,           // 13: acc_skewness
      angularVelocityChange, // 14: angular_velocity_change
      accGyroCorr,           // 15: acc_gyro_corr
      accMagMax3,            // 16: acc_mag_max_3
      accMagMax7,            // 17: acc_mag_max_7
      accMagMax10,           // 18: acc_mag_max_10
      gyroMagMax3,           // 19: gyro_mag_max_3
      gyroMagMax7,           // 20: gyro_mag_max_7
      gyroMagMax10,          // 21: gyro_mag_max_10
      cumulativeJerk,        // 22: cumulative_jerk
      brakingIntensity,      // 23: braking_intensity
      impactIntensity,       // 24: impact_intensity
      gyroAccProduct,        // 25: gyro_acc_product
      speedWeightedJerk,     // 26: speed_weighted_jerk
      rotationalEnergy,      // 27: rotational_energy
    ];
  }

  // ===================== Rolling Statistics Helpers =====================

  double _rollingMean(List<double> history, int window) {
    if (history.isEmpty) return 0.0;
    final w = history.length >= window ? history.sublist(history.length - window) : history;
    return w.reduce((a, b) => a + b) / w.length;
  }

  double _rollingStd(List<double> history, int window) {
    if (history.length < 2) return 0.0;
    final w = history.length >= window ? history.sublist(history.length - window) : history;
    final mean = w.reduce((a, b) => a + b) / w.length;
    final variance = w.fold(0.0, (s, v) => s + (v - mean) * (v - mean)) / w.length;
    return math.sqrt(variance);
  }

  double _rollingMax(List<double> history, int window) {
    if (history.isEmpty) return 0.0;
    final w = history.length >= window ? history.sublist(history.length - window) : history;
    return w.reduce(math.max);
  }

  double _rollingMin(List<double> history, int window) {
    if (history.isEmpty) return 0.0;
    final w = history.length >= window ? history.sublist(history.length - window) : history;
    return w.reduce(math.min);
  }

  double _rollingSkewness(List<double> history, int window) {
    if (history.length < 3) return 0.0;
    final w = history.length >= window ? history.sublist(history.length - window) : history;
    final n = w.length;
    final mean = w.reduce((a, b) => a + b) / n;
    final std = math.sqrt(w.fold(0.0, (s, v) => s + (v - mean) * (v - mean)) / n);
    if (std < 1e-10) return 0.0;
    final m3 = w.fold(0.0, (s, v) => s + math.pow((v - mean) / std, 3)) / n;
    return m3;
  }

  double _rollingCorrelation(List<double> histA, List<double> histB, int window) {
    final minLen = math.min(histA.length, histB.length);
    if (minLen < 3) return 0.0;
    final len = math.min(minLen, window);
    final a = histA.sublist(histA.length - len);
    final b = histB.sublist(histB.length - len);
    final meanA = a.reduce((x, y) => x + y) / len;
    final meanB = b.reduce((x, y) => x + y) / len;
    double cov = 0, varA = 0, varB = 0;
    for (int i = 0; i < len; i++) {
      cov += (a[i] - meanA) * (b[i] - meanB);
      varA += (a[i] - meanA) * (a[i] - meanA);
      varB += (b[i] - meanB) * (b[i] - meanB);
    }
    final denom = math.sqrt(varA * varB);
    if (denom < 1e-10) return 0.0;
    return cov / denom;
  }

  // ===================== 3. Inference Logic =====================

  int _inferenceCount = 0;

  Future<void> _performInference() async {
    if (_scalerSession == null) return;

    // --- SPEED GATE: Skip inference when nearly stationary ---
    final double currentSpeed = _latestData['speed'] ?? 0.0;
    if (currentSpeed < _speedGateKmh) {
      // Still compute features to keep rolling buffers warm
      _engineerFeatures();
      if (_inferenceCount % 5 == 0) {
        print('   ⏸️  Speed gate: ${currentSpeed.toStringAsFixed(1)} km/h < $_speedGateKmh — skipping inference');
      }
      _inferenceCount++;
      return;
    }

    // --- Compute all 28 features ---
    final rawFeatures = _engineerFeatures();

    // --- Scale features using the ONNX scaler ---
    final scaled = await _runOnnx(rawFeatures, _scalerSession!, [1, _numFeatures]);
    final scaledList = scaled.map((e) => e.toDouble()).toList();

    // --- Add to sequence buffer ---
    _sequenceBuffer.add(scaledList);
    if (_sequenceBuffer.length > _seqLen) _sequenceBuffer.removeAt(0);

    // --- Wait for buffer to fill before making predictions ---
    if (_sequenceBuffer.length < _seqLen) {
      print('   🧠 AI Priming: Buffer ${_sequenceBuffer.length}/$_seqLen');
      return;
    }

    _inferenceCount++;

    // --- Isolation Forest ---
    int ifLabel = 1; // default: normal
    if (_ifSession != null) {
      final ifOut = await _runOnnx(scaledList, _ifSession!, [1, _numFeatures]);
      ifLabel = ifOut[0].toInt();
    }

    // --- LSTM Autoencoder ---
    double lstmMSE = 0.0;
    bool lstmAnomaly = false;
    if (_lstmSession != null) {
      final flatData = _sequenceBuffer.expand((e) => e).toList();
      final recon = await _runOnnx(flatData, _lstmSession!, [1, _seqLen, _numFeatures]);

      double sumSqErr = 0;
      for (int i = 0; i < flatData.length; i++) {
        final diff = flatData[i] - recon[i];
        sumSqErr += diff * diff;
      }
      lstmMSE = sumSqErr / flatData.length;
      lstmAnomaly = lstmMSE > _lstmThreshold;
    }

    // --- FINAL VERDICT ---
    // Both models must agree: IF says anomaly (-1) AND LSTM MSE exceeds threshold.
    // Using AND prevents false positives from a single noisy model.
    final isAccident = (ifLabel == -1) && lstmAnomaly;

    final now = DateTime.now();
    final inCooldown = _lastAccidentTime != null && now.difference(_lastAccidentTime!).inSeconds < 30;

    if (isAccident && !inCooldown) {
      _lastAccidentTime = now;
      _printTriggerValues(ifLabel, lstmMSE);
      _accidentController.add(null);
      _insertIncident();
    } else if (_inferenceCount % 5 == 0) {
      // Print status every 5 seconds to avoid log spam
      print('   ✅ Normal — IF:$ifLabel | MSE:${lstmMSE.toStringAsFixed(4)} (thresh:$_lstmThreshold) | Speed:${currentSpeed.toStringAsFixed(1)}');
    }
  }

  void _printTriggerValues(int ifLabel, double mse) {
    print('🚨 >>> ACCIDENT DETECTED! <<<');
    print('📊 Trigger State:');
    print('   - Speed: ${_latestData['speed']?.toStringAsFixed(1)} km/h');
    print('   - IF Label: $ifLabel (-1 is Anomaly)');
    print('   - LSTM MSE: ${mse.toStringAsFixed(4)} (threshold: $_lstmThreshold)');
    print('   - Accel (X,Y,Z): ${_latestData['ax']?.toStringAsFixed(3)}, ${_latestData['ay']?.toStringAsFixed(3)}, ${_latestData['az']?.toStringAsFixed(3)}');
    print('   - Gyro (X,Y,Z): ${_latestData['gx']?.toStringAsFixed(3)}, ${_latestData['gy']?.toStringAsFixed(3)}, ${_latestData['gz']?.toStringAsFixed(3)}');
  }

  // ===================== 4. Database Push =====================

  Future<void> _insertIncident() async {
    try {
      final client = Supabase.instance.client;
      final user = client.auth.currentUser;
      if (user == null) return;

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );

      final payload = {
        'user_id': user.id, // UUID type
        'latitude': pos.latitude,
        'longitude': pos.longitude,
        'is_active': true,
        'detected_at': DateTime.now().toUtc().toIso8601String(),
      };

      await client.from('incidents').insert(payload).select();
      print('   ✅ DB: Incident logged successfully');
    } catch (e) {
      print('   ❌ DB Error: $e');
    }
  }

  // ===================== 5. ONNX Helper =====================

  Future<List<double>> _runOnnx(List<double> input, OrtSession session, List<int> shape) async {
    final inputTensor = OrtValueTensor.createTensorWithDataList(
      Float32List.fromList(input.map((e) => e.toDouble()).toList()),
      shape,
    );
    final runOptions = OrtRunOptions();
    final inputs = {session.inputNames.first: inputTensor};
    final outputs = await session.runAsync(runOptions, inputs);

    List<double> result = _flattenToDoubles(outputs?[0]?.value ?? []);

    inputTensor.release();
    runOptions.release();
    for (final o in outputs ?? []) { o?.release(); }
    return result;
  }

  List<double> _flattenToDoubles(dynamic list) {
    if (list is Float32List) return list.toList().map((e) => e.toDouble()).toList();
    if (list is! List) return [];
    final result = <double>[];
    for (final item in list) {
      if (item is List) result.addAll(_flattenToDoubles(item));
      else if (item is num) result.add(item.toDouble());
    }
    return result;
  }

  // ===================== 6. Start / Stop Monitoring =====================

  Future<void> startMonitoring() async {
    if (_isMonitoring) return;
    await initModels();

    // Use userAccelerometerEventStream — this gives LINEAR acceleration
    // (gravity already removed by the OS), matching model training
    _accelSub = userAccelerometerEventStream().listen((e) {
      _latestData['ax'] = e.x; _latestData['ay'] = e.y; _latestData['az'] = e.z;
      _dataController.add(Map.from(_latestData));
    });
    _gyroSub = gyroscopeEventStream().listen((e) {
      _latestData['gx'] = e.x; _latestData['gy'] = e.y; _latestData['gz'] = e.z;
      _dataController.add(Map.from(_latestData));
    });
    _gpsSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
    ).listen((p) {
      _latestData['speed'] = p.speed * 3.6; // m/s -> km/h
      _dataController.add(Map.from(_latestData));
    });

    _inferenceTimer = Timer.periodic(const Duration(seconds: 1), (_) => _performInference());
    _isMonitoring = true;
    _statusController.add(true);
  }

  void stopMonitoring() {
    _accelSub?.cancel(); _gyroSub?.cancel(); _gpsSub?.cancel(); _inferenceTimer?.cancel();
    _sequenceBuffer.clear();
    _accMagHistory.clear();
    _gyroMagHistory.clear();
    _jerkMagHistory.clear();
    _speedHistory.clear();
    _lastAccMag = 0; _lastGyroMag = 0; _lastSpeed = 0;
    _isMonitoring = false; _statusController.add(false);
  }
}