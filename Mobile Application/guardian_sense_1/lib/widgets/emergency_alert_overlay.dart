import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:audioplayers/audioplayers.dart';

class EmergencyAlertOverlay extends StatefulWidget {
  final VoidCallback onDismiss;

  const EmergencyAlertOverlay({super.key, required this.onDismiss});

  @override
  State<EmergencyAlertOverlay> createState() => _EmergencyAlertOverlayState();
}

class _EmergencyAlertOverlayState extends State<EmergencyAlertOverlay>
    with SingleTickerProviderStateMixin {
  final AudioPlayer _audioPlayer = AudioPlayer();
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  Timer? _countdownTimer;
  int _secondsRemaining = 10;
  bool _dismissed = false;

  @override
  void initState() {
    super.initState();

    // Pulse animation for the warning icon
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.85, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Start alarm sound
    _playAlarm();

    // Start 10-second countdown
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted || _dismissed) {
        timer.cancel();
        return;
      }
      setState(() {
        _secondsRemaining--;
      });
      if (_secondsRemaining <= 0) {
        timer.cancel();
        _dismiss();
      }
    });
  }

  Future<void> _playAlarm() async {
    try {
      // Load the alarm audio from Flutter's asset bundle as bytes,
      // which is the most reliable cross-platform approach.
      final byteData = await rootBundle.load('lib/assets/audio/alarm.wav');
      final bytes = byteData.buffer.asUint8List();
      await _audioPlayer.setReleaseMode(ReleaseMode.loop);
      await _audioPlayer.setVolume(1.0);
      await _audioPlayer.play(BytesSource(bytes));
    } catch (e) {
      print('⚠️ Could not play alarm sound: $e');
    }
  }

  void _dismiss() {
    if (_dismissed) return;
    _dismissed = true;
    _countdownTimer?.cancel();
    _audioPlayer.stop();
    _audioPlayer.dispose();
    widget.onDismiss();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _pulseController.dispose();
    if (!_dismissed) {
      _audioPlayer.stop();
      _audioPlayer.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: AnimatedBuilder(
        animation: _pulseController,
        builder: (context, child) {
          // Background flashes between dark red and brighter red
          final flashValue = _pulseController.value;
          final bgColor = Color.lerp(
            const Color(0xFFB71C1C),
            const Color(0xFFD32F2F),
            flashValue,
          )!;

          return Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  bgColor,
                  bgColor.withValues(alpha: 0.95),
                  const Color(0xFF1A0000),
                ],
              ),
            ),
            child: SafeArea(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(flex: 2),

                  // Pulsing warning icon
                  ScaleTransition(
                    scale: _pulseAnimation,
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.15),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.4),
                          width: 3,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.red.shade900.withValues(alpha: 0.6),
                            blurRadius: 40,
                            spreadRadius: 10,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.warning_amber_rounded,
                        size: 64,
                        color: Colors.white,
                      ),
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Title
                  const Text(
                    '🚨 EMERGENCY',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4,
                      shadows: [
                        Shadow(
                          color: Colors.black54,
                          blurRadius: 10,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Subtitle badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: const Text(
                      'ACCIDENT DETECTED',
                      style: TextStyle(
                        color: Colors.orangeAccent,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 2,
                      ),
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Description
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      'A potential accident has been detected.\nEmergency services will be alerted.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.85),
                        fontSize: 16,
                        height: 1.5,
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),

                  // Countdown circle
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.5),
                        width: 3,
                      ),
                      color: Colors.black.withValues(alpha: 0.3),
                    ),
                    child: Center(
                      child: Text(
                        '$_secondsRemaining',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 42,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    'Auto-dismiss in $_secondsRemaining seconds',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 13,
                    ),
                  ),

                  const Spacer(flex: 2),

                  // Dismiss button
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: _dismiss,
                        icon: const Icon(Icons.close, size: 22),
                        label: const Text(
                          "I'M OKAY — DISMISS",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          foregroundColor: Colors.white,
                          backgroundColor: Colors.white.withValues(alpha: 0.15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(
                              color: Colors.white.withValues(alpha: 0.4),
                              width: 1.5,
                            ),
                          ),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 30),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
