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

  // --- Buffers & Constants ---
  final List<List<double>> _sequenceBuffer = [];
  final int _seqLen = 10; // Matches SEQ_LEN from main.py
  final int _numFeatures = 24;

  double _lastAccMag = 0;
  double _lastSpeed = 0;
  double _lastGyroMag = 0;
  final List<double> _accMagHistory = [];
  final List<double> _gyroMagHistory = [];

  StreamSubscription<UserAccelerometerEvent>? _accelSub;
  StreamSubscription<GyroscopeEvent>? _gyroSub;
  StreamSubscription<Position>? _gpsSub;
  Timer? _inferenceTimer;

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

  // --- 1. Initialize Models ---
  Future<void> initModels() async {
    try {
      OrtEnv.instance.init();
      _scalerSession = await _createSession("lib/assets/models/scaler.onnx");
      _ifSession = await _createSession("lib/assets/models/isolation_forest.onnx");
      _lstmSession = await _createSession("lib/assets/models/lstm_autoencoder.onnx");
      print("AI Models Loaded Successfully");
    } catch (e) {
      print("Error loading models: $e");
    }
  }

  Future<OrtSession> _createSession(String path) async {
    final rawData = await rootBundle.load(path);
    final bytes = rawData.buffer.asUint8List();
    return OrtSession.fromBuffer(bytes, OrtSessionOptions());
  }

  // --- 2. Feature Engineering ---
  List<double> _engineerFeatures() {
    double ax = _latestData['ax']!, ay = _latestData['ay']!, az = _latestData['az']!;
    double gx = _latestData['gx']!, gy = _latestData['gy']!, gz = _latestData['gz']!;
    double speed = _latestData['speed']!;

    double accMag = math.sqrt(ax * ax + ay * ay + az * az);
    double gyroMag = math.sqrt(gx * gx + gy * gy + gz * gz);
    double jerkMag = (accMag - _lastAccMag).abs();
    double speedChange = (speed - _lastSpeed).abs();
    double deceleration = (speed < _lastSpeed) ? (_lastSpeed - speed) : 0.0;

    _accMagHistory.add(accMag);
    _gyroMagHistory.add(gyroMag);
    if (_accMagHistory.length > 10) _accMagHistory.removeAt(0);
    if (_gyroMagHistory.length > 10) _gyroMagHistory.removeAt(0);

    double meanAcc = _accMagHistory.isEmpty
        ? accMag
        : _accMagHistory.reduce((a, b) => a + b) / _accMagHistory.length;

    List<double> features = [
      accMag, gyroMag, jerkMag, (accMag * accMag), speed, speedChange, deceleration,
      0.1, 0.1, (speed * accMag), (gyroMag - _lastGyroMag).abs(), (accMag / (meanAcc + 1e-6)),
      (speed * accMag), 0.0, 0.0, 0.0,
      _accMagHistory.last, _accMagHistory.last, _accMagHistory.last,
      _gyroMagHistory.last, _gyroMagHistory.last, _gyroMagHistory.last,
      jerkMag, (speed * deceleration)
    ];

    _lastAccMag = accMag;
    _lastSpeed = speed;
    _lastGyroMag = gyroMag;
    return features;
  }

  // --- 3. Inference Logic ---
  final double _lstmThreshold = 0.5; // From Python AP results
  int _inferenceCount = 0;

  Future<void> _performInference() async {
    if (_scalerSession == null) return;

    final rawFeatures = _engineerFeatures();
    final scaled = await _runOnnx(rawFeatures, _scalerSession!, [1, _numFeatures]);
    final scaledList = scaled.map((e) => e.toDouble()).toList();

    _sequenceBuffer.add(scaledList);
    if (_sequenceBuffer.length > _seqLen) _sequenceBuffer.removeAt(0);

    // --- PRIMING CHECK ---
    // Wait until the buffer is full before making predictions
    if (_sequenceBuffer.length < _seqLen) {
      print('   🧠 AI Priming: Buffer status (${_sequenceBuffer.length}/$_seqLen)');
      return;
    }

    _inferenceCount++;

    // Step 2: Isolation Forest
    int ifLabel = 1;
    if (_ifSession != null) {
      final ifOut = await _runOnnx(scaledList, _ifSession!, [1, _numFeatures]);
      ifLabel = ifOut[0].toInt();
    }

    // Step 3: LSTM Autoencoder
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
    final isAccident = ifLabel == -1 || lstmAnomaly;
    final now = DateTime.now();
    final inCooldown = _lastAccidentTime != null && now.difference(_lastAccidentTime!).inSeconds < 30;

    if (isAccident && !inCooldown) {
      _lastAccidentTime = now;
      _printTriggerValues(ifLabel, lstmMSE); // Debugging trigger values
      _accidentController.add(null);
      _insertIncident();
    } else if (!isAccident) {
      print('   ✅ Status: Normal (MSE: ${lstmMSE.toStringAsFixed(4)})');
    }
  }

  void _printTriggerValues(int ifLabel, double mse) {
    print('🚨 >>> ACCIDENT DETECTED! <<<');
    print('📊 Trigger State:');
    print('   - Speed: ${_latestData['speed']?.toStringAsFixed(1)} km/h');
    print('   - IF Label: $ifLabel (-1 is Anomaly)');
    print('   - LSTM MSE: ${mse.toStringAsFixed(4)}');
    print('   - Accel (X,Y,Z): ${_latestData['ax']}, ${_latestData['ay']}, ${_latestData['az']}');
    print('   - Gyro (X,Y,Z): ${_latestData['gx']}, ${_latestData['gy']}, ${_latestData['gz']}');
  }

  // --- 4. Database Push ---
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

  Future<void> startMonitoring() async {
    if (_isMonitoring) return;
    await initModels();

    _accelSub = userAccelerometerEventStream().listen((e) {
      _latestData['ax'] = e.x; _latestData['ay'] = e.y; _latestData['az'] = e.z;
      _dataController.add(Map.from(_latestData)); // Update UI Stream
    });
    _gyroSub = gyroscopeEventStream().listen((e) {
      _latestData['gx'] = e.x; _latestData['gy'] = e.y; _latestData['gz'] = e.z;
      _dataController.add(Map.from(_latestData)); // Update UI Stream
    });
    _gpsSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
    ).listen((p) {
      _latestData['speed'] = p.speed * 3.6;
      _dataController.add(Map.from(_latestData)); // Update UI Stream
    });

    _inferenceTimer = Timer.periodic(const Duration(seconds: 1), (_) => _performInference());
    _isMonitoring = true;
    _statusController.add(true);
  }

  void stopMonitoring() {
    _accelSub?.cancel(); _gyroSub?.cancel(); _gpsSub?.cancel(); _inferenceTimer?.cancel();
    _isMonitoring = false; _statusController.add(false);
  }
}