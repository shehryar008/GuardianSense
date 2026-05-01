import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/quick_assistance_button.dart';
import '../services/emergency_service.dart';
import '../services/sensor_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _supabase = Supabase.instance.client;
  final SensorService _sensorService = SensorService();

  bool _sosPressed = false;
  late bool _isSystemActive;

  @override
  void initState() {
    super.initState();
    _isSystemActive = _sensorService.isMonitoring;

    _sensorService.statusStream.listen((active) {
      if (mounted) setState(() => _isSystemActive = active);
    });
  }

  Future<void> _callEmergencyContact() async {
    try {
      final userId = _supabase.auth.currentUser!.id;
      final data = await _supabase.from('profiles').select('emergency_contact').eq('id', userId).maybeSingle();

      if (data != null && data['emergency_contact']?.toString().trim().isNotEmpty == true) {
        EmergencyService.makeCall(data['emergency_contact']);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No Emergency Contact set. Dialing 1122...'), backgroundColor: Colors.orange),
          );
        }
        EmergencyService.makeCall('1122');
      }
    } catch (e) {
      EmergencyService.makeCall('1122');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // --- Header & Diagnostics ---
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
                decoration: const BoxDecoration(color: Color(0xFF1F2D7D)),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 8, height: 8,
                          decoration: BoxDecoration(
                            color: _isSystemActive ? const Color(0xFF4CAF50) : Colors.red,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                            _isSystemActive ? 'SYSTEM ACTIVE' : 'SYSTEM OFFLINE',
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.5)
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text('GuardianSense', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                    const Text('Monitoring & Ready', style: TextStyle(color: Colors.white70, fontSize: 14)),

                    const SizedBox(height: 20),
                    StreamBuilder<Map<String, double>>(
                      stream: _sensorService.dataStream,
                      builder: (context, snapshot) {
                        if (!snapshot.hasData) return const Text("Syncing...", style: TextStyle(color: Colors.white54, fontSize: 10));
                        final vals = snapshot.data!;
                        return Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.08), borderRadius: BorderRadius.circular(12)),
                          child: Column(
                            children: [
                              _buildSensorRow("ACCEL (m/s²)", vals['ax'], vals['ay'], vals['az']),
                              const Divider(color: Colors.white10, height: 16),
                              _buildSensorRow("GYRO (rad/s)", vals['gx'], vals['gy'], vals['gz']),
                              const Divider(color: Colors.white10, height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Text("SPEED: ", style: TextStyle(color: Colors.white54, fontSize: 10)),
                                  Text("${vals['speed']?.toStringAsFixed(1)} KM/H",
                                      style: const TextStyle(color: Color(0xFFFF5722), fontWeight: FontWeight.bold, fontSize: 16)),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 40),
              // SOS Button
              Center(
                child: GestureDetector(
                  onTapDown: (_) => setState(() => _sosPressed = true),
                  onTapUp: (_) => setState(() => _sosPressed = false),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      _buildRing(240, 0.1),
                      _buildRing(190, 0.2),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 100),
                        width: _sosPressed ? 130 : 140, height: _sosPressed ? 130 : 140,
                        decoration: BoxDecoration(color: const Color(0xFFFF5722), shape: BoxShape.circle),
                        child: const Center(child: Text('SOS', style: TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.w900))),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 50),
              // Quick Assistance
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    QuickAssistanceButton(icon: Icons.local_police, label: 'Police', onTap: () => EmergencyService.makeCall('15')),
                    QuickAssistanceButton(icon: Icons.local_hospital, label: 'Hospital', onTap: () => EmergencyService.makeCall('1122')),
                    QuickAssistanceButton(icon: Icons.emergency, label: 'Emergency', onTap: _callEmergencyContact),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSensorRow(String title, double? x, double? y, double? z) {
    return Column(
      children: [
        Text(title, style: const TextStyle(color: Colors.white54, fontSize: 9, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildTelemetryItem("X", x),
            _buildTelemetryItem("Y", y),
            _buildTelemetryItem("Z", z),
          ],
        ),
      ],
    );
  }

  Widget _buildTelemetryItem(String label, double? value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9)),
        Text(value?.toStringAsFixed(2) ?? "0.00",
            style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }

  Widget _buildRing(double size, double opacity) {
    return Container(
      width: size, height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFFFF5722).withOpacity(opacity), width: 2)),
    );
  }
}