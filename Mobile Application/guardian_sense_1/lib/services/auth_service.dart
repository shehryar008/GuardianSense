import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Sign Up - Updated to include phone number in metadata
  Future<AuthResponse> signUp(String email, String password, String name, String phone) async {
    return await _supabase.auth.signUp(
      email: email,
      password: password,
      data: {
        'full_name': name,
        'phone': phone, // This is what our SQL trigger will "grab"
      },
    );
  }

  // Login
  Future<AuthResponse> login(String email, String password) async {
    return await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  // Sign Out
  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }
}