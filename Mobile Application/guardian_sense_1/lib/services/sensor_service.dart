import 'dart:async';
import 'dart:math' as math;
import 'dart:typed_data';
import 'dart:io' show Platform;
import 'package:flutter/services.dart';
import 'package:onnxruntime/onnxruntime.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SensorService {
  static final SensorService _instance = SensorService._internal();
  factory SensorService() => _instance;
  SensorService._internal();

  // ─── ONNX Session (single supervised model) ───────────────────
  OrtSession? _crashSession;

  // ─── MinMaxScaler — from scaler_params.json ───────────────────
  // Formula: scaled = (x - data_min) / data_range → clamped to [0, 1]
  // Feature order: acc_mag, gyro_mag, jerk_mag, acc_energy, Speed_kmh,
  //                speed_change, deceleration, acc_mag_std, gyro_mag_std, Motion_Intensity
  static const List<double> _scalerMin = [
    0.14835754706056567,   // acc_mag
    0.017931796334009743,  // gyro_mag
    0.005633107714523244,  // jerk_mag
    0.9412008465161509,    // acc_energy
    1.9136054378485712,    // Speed_kmh
    0.22973139365249728,   // speed_change
    -0.0,                  // deceleration
    0.08941984729235401,   // acc_mag_std
    0.009736873886131847,  // gyro_mag_std
    0.007417261075661512,  // Motion_Intensity
  ];
  static const List<double> _scalerRange = [
    5.55419977490954,      // acc_mag
    0.16282762491935973,   // gyro_mag
    1.9760407802568276,    // jerk_mag
    129.63823929181044,    // acc_energy
    77.44424449029398,     // Speed_kmh
    53.14406842615486,     // speed_change
    50.68997890927525,     // deceleration
    1.0495263472236498,    // acc_mag_std
    0.055449453885758594,  // gyro_mag_std
    0.6617055419684479,    // Motion_Intensity
  ];

  // ─── Model Constants (from model_config.json / main.py) ───────
  final int _seqLen = 10;        // must match SEQ_LEN in main.py
  final int _numFeatures = 10;   // 10 features (down from 28)
  final double _crashThreshold = 0.85; // F1-optimal: 0.9735; kept at 0.85 for sensitivity, impact gate guards FPs
  final double _impactThresholdMs2 = 20.0; // require >2g instantaneous acceleration
  final double _minCrashSpeedKmh = 5.0;    // ignore phone-handling events at near-standstill

  // ─── Sequence Buffer ──────────────────────────────────────────
  final List<List<double>> _sequenceBuffer = [];

  // ─── Rolling History Buffers (window = 5) ─────────────────────
  final List<double> _accMagHistory = [];
  final List<double> _gyroMagHistory = [];

  // ─── Previous-timestep values ─────────────────────────────────
  double _lastAccMag = 0;
  double _lastSpeed = 0;

  // ─── Probability smoothing (median of last 3, reduces FP spikes) ──
  final List<double> _probHistory = [];

  // ─── Cached GPS position for instant incident logging ─────────
  Position? _lastKnownPosition;

  // ─── Subscriptions ────────────────────────────────────────────
  StreamSubscription<UserAccelerometerEvent>? _accelSub;
  StreamSubscription<GyroscopeEvent>? _gyroSub;
  StreamSubscription<Position>? _gpsSub;
  Timer? _inferenceTimer;

  // ─── Stream Controllers ───────────────────────────────────────
  final StreamController<bool> _statusController = StreamController<bool>.broadcast();
  Stream<bool> get statusStream => _statusController.stream;

  final StreamController<Map<String, double>> _dataController = StreamController<Map<String, double>>.broadcast();
  Stream<Map<String, double>> get dataStream => _dataController.stream;

  final StreamController<void> _accidentController = StreamController<void>.broadcast();
  Stream<void> get accidentStream => _accidentController.stream;

  bool _isMonitoring = false;
  bool get isMonitoring => _isMonitoring;

  DateTime? _lastAccidentTime;
  int _inferenceCount = 0;

  final Map<String, double> _latestData = {
    'ax': 0.0, 'ay': 0.0, 'az': 0.0,
    'gx': 0.0, 'gy': 0.0, 'gz': 0.0,
    'speed': 0.0,
  };

  // ===================== 1. Initialize Models =====================

  Future<void> initModels() async {
    try {
      OrtEnv.instance.init();
      _crashSession = await _createSession("lib/assets/models/crash_detector.onnx");
      print("✅ CrashDetector Loaded (supervised, $_numFeatures features, seq_len=$_seqLen)");
    } catch (e) {
      print("❌ Error loading model: $e");
    }
  }

  Future<OrtSession> _createSession(String path) async {
    final rawData = await rootBundle.load(path);
    final bytes = rawData.buffer.asUint8List();
    return OrtSession.fromBuffer(bytes, OrtSessionOptions());
  }

  // ===================== 2. Feature Engineering =====================
  // Produces exactly 10 features in the order the model expects:
  //  0: acc_mag          1: gyro_mag         2: jerk_mag
  //  3: acc_energy       4: Speed_kmh        5: speed_change
  //  6: deceleration     7: acc_mag_std      8: gyro_mag_std
  //  9: Motion_Intensity (= acc_mag * gyro_mag)

  List<double> _engineerFeatures(Map<String, double> snapshot) {
    final double ax = snapshot['ax']!;
    final double ay = snapshot['ay']!;
    final double az = snapshot['az']!;
    final double gx = snapshot['gx']!;
    final double gy = snapshot['gy']!;
    final double gz = snapshot['gz']!;
    final double speed = snapshot['speed']!;

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

    // Motion_Intensity = acc_mag * gyro_mag
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

  // ===================== Rolling Statistics Helpers =====================

  double _rollingStd(List<double> history, int window) {
    if (history.length < 2) return 0.0;
    final w = history.length >= window ? history.sublist(history.length - window) : history;
    final int n = w.length;
    if (n < 2) return 0.0;
    final mean = w.reduce((a, b) => a + b) / n;
    final variance = w.fold(0.0, (s, v) => s + (v - mean) * (v - mean)) / (n - 1);
    return math.sqrt(variance);
  }

  // ===================== 3. Scaling & Inference =====================

  /// MinMaxScaler: scaled = (x - data_min) / data_range, clamped to [0, 1]
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

  Future<void> _performInference() async {
    if (_crashSession == null) return;

    // ── Snapshot sensor data atomically ──────────────────────────
    // Prevents race condition: sensor callbacks can overwrite _latestData
    // between feature engineering and impact gate, causing mismatched values
    final snapshot = Map<String, double>.from(_latestData);

    // Snapshot raw components for logging
    final double ax = snapshot['ax'] ?? 0.0;
    final double ay = snapshot['ay'] ?? 0.0;
    final double az = snapshot['az'] ?? 0.0;
    final double currentSpeed = snapshot['speed'] ?? 0.0;

    // Engineer and scale features (uses same snapshot)
    final rawFeatures    = _engineerFeatures(snapshot);
    final scaledFeatures = _scaleFeatures(rawFeatures);

    // Use engineered acc_mag directly to avoid duplicate magnitude calculation
    final double instantAccMag = rawFeatures[0];

    // Log raw sensor values every 5 seconds (throttled to reduce noise)
    if (_inferenceCount % 5 == 0) {
      print('📡 Sensors — Acc[${ax.toStringAsFixed(2)}, ${ay.toStringAsFixed(2)}, ${az.toStringAsFixed(2)}] Gyro[${(snapshot['gx'] ?? 0.0).toStringAsFixed(2)}, ${(snapshot['gy'] ?? 0.0).toStringAsFixed(2)}, ${(snapshot['gz'] ?? 0.0).toStringAsFixed(2)}] Speed:${currentSpeed.toStringAsFixed(1)}km/h accMag:${instantAccMag.toStringAsFixed(1)}');
    }

    // Fill sequence buffer
    _sequenceBuffer.add(scaledFeatures);
    if (_sequenceBuffer.length > _seqLen) _sequenceBuffer.removeAt(0);

    if (_sequenceBuffer.length < _seqLen) {
      print('   🧠 AI Priming: Buffer ${_sequenceBuffer.length}/$_seqLen');
      return;
    }

    _inferenceCount++;
    final int inferCount = _inferenceCount;

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

    // Warmup guard: need at least 3 inference ticks so median smoothing is meaningful.
    // Without this, the very first inference after priming triggers on noisy startup data.
    if (_probHistory.length < 3) {
      print('   🔄 Warmup: ${_probHistory.length}/3 ticks — Prob:${(crashProb * 100).toStringAsFixed(1)}%');
      return;
    }

    // Impact + speed gates: require real impact while vehicle is moving
    final bool hasImpact = instantAccMag > _impactThresholdMs2;
    final bool hasMinSpeed = currentSpeed >= _minCrashSpeedKmh;
    final bool isAccident = smoothedProb >= _crashThreshold && hasImpact && hasMinSpeed;

    final now = DateTime.now();
    final inCooldown = _lastAccidentTime != null &&
        now.difference(_lastAccidentTime!).inSeconds < 30;

    if (isAccident && !inCooldown) {
      _lastAccidentTime = now;
      _sequenceBuffer.clear(); // prevent re-trigger from stale crash data
      _probHistory.clear();
      print('🚨 >>> ACCIDENT DETECTED! <<<');
      print('   - Speed: ${currentSpeed.toStringAsFixed(1)} km/h');
      print('   - Crash Probability: ${(smoothedProb * 100).toStringAsFixed(1)}% (threshold: ${(_crashThreshold * 100).toStringAsFixed(0)}%)');
      print('   - Impact: acc_mag=${instantAccMag.toStringAsFixed(1)} m/s² (gate: ${_impactThresholdMs2.toStringAsFixed(1)})');
      print('   - Speed Gate: min ${_minCrashSpeedKmh.toStringAsFixed(1)} km/h');
      print('   📊 Raw Sensors (snapshot):');
      print('      Accel  → X:${ax.toStringAsFixed(3)} Y:${ay.toStringAsFixed(3)} Z:${az.toStringAsFixed(3)}');
      print('      Gyro   → X:${(snapshot['gx'] ?? 0.0).toStringAsFixed(3)} Y:${(snapshot['gy'] ?? 0.0).toStringAsFixed(3)} Z:${(snapshot['gz'] ?? 0.0).toStringAsFixed(3)}');
      print('   🧮 Features: acc_mag=${rawFeatures[0].toStringAsFixed(3)} gyro_mag=${rawFeatures[1].toStringAsFixed(3)} jerk=${rawFeatures[2].toStringAsFixed(3)} energy=${rawFeatures[3].toStringAsFixed(1)} decel=${rawFeatures[6].toStringAsFixed(1)} intensity=${rawFeatures[9].toStringAsFixed(3)}');
      _accidentController.add(null);
      _insertIncident();
    } else if (inferCount % 5 == 0) {
      print('   ✅ Normal — Prob:${(smoothedProb * 100).toStringAsFixed(1)}% | Impact:${instantAccMag.toStringAsFixed(1)} | Speed:${currentSpeed.toStringAsFixed(1)}');
    }
  }

  // ===================== 4. Database Push =====================

  Future<void> _insertIncident() async {
    try {
      final client = Supabase.instance.client;
      final user = client.auth.currentUser;
      if (user == null) return;

      // Use cached GPS position instead of blocking on a fresh fix
      final pos = _lastKnownPosition;
      if (pos == null) {
        print('   ⚠️ DB: No GPS position cached, incident not logged');
        return;
      }

      final payload = {
        'user_id': user.id,
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

    if (outputs == null || outputs.isEmpty) {
      print('   ❌ ONNX Error: Session run returned no outputs');
      return [];
    }

    List<double> result = _flattenToDoubles(outputs[0]?.value ?? []);

    inputTensor.release();
    runOptions.release();
    for (final o in outputs) { o?.release(); }
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

  /// Request location permissions at runtime using Geolocator.
  /// Returns true if location access was granted.
  Future<bool> _requestLocationPermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Check if location services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print('❌ Location services are disabled. Please enable GPS.');
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        print('❌ Location permissions are denied');
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      print('❌ Location permissions are permanently denied. Please enable in Settings.');
      await Geolocator.openAppSettings();
      return false;
    }

    print('✅ Location permission granted.');
    return true;
  }

  Future<void> startMonitoring() async {
    if (_isMonitoring) return;
    await initModels();

    // --- Request location permission BEFORE starting GPS stream ---
    final hasLocationPermission = await _requestLocationPermission();

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

    // Only start GPS stream if permission was granted
    if (hasLocationPermission) {
      LocationSettings locationSettings;
      if (Platform.isAndroid) {
        locationSettings = AndroidSettings(
          accuracy: LocationAccuracy.bestForNavigation,
          distanceFilter: 0,
          intervalDuration: const Duration(milliseconds: 500),
        );
      } else if (Platform.isIOS) {
        locationSettings = AppleSettings(
          accuracy: LocationAccuracy.bestForNavigation,
          activityType: ActivityType.automotiveNavigation,
          distanceFilter: 0,
          pauseLocationUpdatesAutomatically: false,
        );
      } else {
        locationSettings = const LocationSettings(
          accuracy: LocationAccuracy.bestForNavigation,
          distanceFilter: 0,
        );
      }

      _gpsSub = Geolocator.getPositionStream(
        locationSettings: locationSettings,
      ).listen(
            (p) {
          _lastKnownPosition = p;
          final rawSpeed = p.speed < 0 ? 0.0 : p.speed;
          _latestData['speed'] = rawSpeed * 3.6; // m/s -> km/h
          print('📍 GPS Update — Speed: ${_latestData['speed']!.toStringAsFixed(1)} km/h | Lat: ${p.latitude.toStringAsFixed(5)} | Lng: ${p.longitude.toStringAsFixed(5)}');
          _dataController.add(Map.from(_latestData));
        },
        onError: (error) {
          print('⚠️ GPS Stream Error: $error');
        },
      );
    } else {
      print('⚠️ GPS speed tracking disabled — no location permission.');
    }

    _inferenceTimer = Timer.periodic(const Duration(seconds: 1), (_) => _performInference());
    _isMonitoring = true;
    _statusController.add(true);
  }

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
    _lastKnownPosition = null;

    _isMonitoring = false;
    _statusController.add(false);
  }
}