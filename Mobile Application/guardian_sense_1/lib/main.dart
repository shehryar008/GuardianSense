import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'constants/app_constants.dart';
import 'screens/login_screen.dart'; // Ensure this is imported
import 'screens/main_wrapper.dart'; // Ensure this is imported

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: AppConstants.supabaseUrl,
    anonKey: AppConstants.supabaseAnonKey,
  );

  runApp(const GuardianSenseApp());
}

class GuardianSenseApp extends StatelessWidget {
  const GuardianSenseApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Supabase automatically persists the session locally
    final session = Supabase.instance.client.auth.currentSession;

    return MaterialApp(
      title: 'GuardianSense',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1F2D7D)),
        useMaterial3: true,
      ),
      // Gatekeeper logic: If session exists, go to app. If not, go to Login.
      home: session != null ? const MainWrapper() : const LoginScreen(),
    );
  }
}