import 'dart:async';
import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'chatbot_screen.dart';
import 'profile_screen.dart';
import '../services/sensor_service.dart';
import '../widgets/emergency_alert_overlay.dart';

class MainWrapper extends StatefulWidget {
  const MainWrapper({super.key});

  @override
  State<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends State<MainWrapper> {
  int _selectedIndex = 0;
  final PageController _pageController = PageController();
  final SensorService _sensorService = SensorService(); // Singleton instance

  bool _showEmergencyOverlay = false;
  StreamSubscription<void>? _accidentSub;

  final List<Widget> _screens = [
    const HomeScreen(),
    const ChatbotScreen(),
    const ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    // Start sensors once when the app shell loads
    _sensorService.startMonitoring();

    // Listen for accident events from sensor inference
    _accidentSub = _sensorService.accidentStream.listen((_) {
      if (!_showEmergencyOverlay && mounted) {
        setState(() => _showEmergencyOverlay = true);
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    _accidentSub?.cancel();
    // Sensors stop ONLY when the app is actually closed/destroyed
    _sensorService.stopMonitoring();
    super.dispose();
  }

  void _dismissEmergencyOverlay() {
    if (mounted) {
      setState(() => _showEmergencyOverlay = false);
    }
  }

  void _onItemTapped(int index) {
    setState(() => _selectedIndex = index);
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _onPageChanged(int index) {
    setState(() => _selectedIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Main app content
          PageView(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            physics: const ClampingScrollPhysics(),
            children: _screens,
          ),

          // Emergency overlay (covers entire screen when active)
          if (_showEmergencyOverlay)
            Positioned.fill(
              child: EmergencyAlertOverlay(
                onDismiss: _dismissEmergencyOverlay,
              ),
            ),
        ],
      ),
      bottomNavigationBar: _showEmergencyOverlay
          ? null // Hide navigation bar during emergency
          : BottomNavigationBar(
              currentIndex: _selectedIndex,
              onTap: _onItemTapped,
              backgroundColor: Colors.white,
              selectedItemColor: const Color(0xFFFF5722),
              unselectedItemColor: Colors.grey,
              showUnselectedLabels: true,
              type: BottomNavigationBarType.fixed,
              elevation: 15,
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.shield_outlined),
                  activeIcon: Icon(Icons.shield),
                  label: 'Home',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.chat_bubble_outline),
                  activeIcon: Icon(Icons.chat_bubble),
                  label: 'Chatbot',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person_outline),
                  activeIcon: Icon(Icons.person),
                  label: 'Profile',
                ),
              ],
            ),
    );
  }
}