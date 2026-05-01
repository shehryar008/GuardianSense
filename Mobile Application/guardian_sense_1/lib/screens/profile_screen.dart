import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/custom_text_field.dart';
import 'login_screen.dart'; // Added for navigation on logout

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _supabase = Supabase.instance.client;
  bool _isLoading = false;

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _addressController = TextEditingController();
  final _bloodController = TextEditingController();
  final _allergiesController = TextEditingController();
  final _emergencyController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    setState(() => _isLoading = true);
    try {
      final userId = _supabase.auth.currentUser!.id;
      final data = await _supabase.from('profiles').select().eq('id', userId).maybeSingle();

      if (data != null) {
        _nameController.text = data['full_name'] ?? '';
        _phoneController.text = data['phone_number'] ?? '';
        _emailController.text = data['email'] ?? '';
        _addressController.text = data['address'] ?? '';
        _bloodController.text = data['blood_type'] ?? '';
        _allergiesController.text = data['allergies'] ?? '';
        _emergencyController.text = data['emergency_contact'] ?? '';
      }
    } catch (e) {
      debugPrint('Error loading profile: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _isLoading = true);
    try {
      final userId = _supabase.auth.currentUser!.id;
      await _supabase.from('profiles').upsert({
        'id': userId,
        'full_name': _nameController.text.trim(),
        'phone_number': _phoneController.text.trim(),
        'email': _emailController.text.trim(),
        'address': _addressController.text.trim(),
        'blood_type': _bloodController.text.trim(),
        'allergies': _allergiesController.text.trim(),
        'emergency_contact': _emergencyController.text.trim(),
        'updated_at': DateTime.now().toIso8601String(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile Saved Successfully!'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // LOGOUT LOGIC
  Future<void> _handleSignOut() async {
    await _supabase.auth.signOut();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
            (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1F2D7D),
        elevation: 0,
        automaticallyImplyLeading: false, // Removes back button
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader('Personal Details'),
            CustomTextField(label: 'Full Name', hint: 'John Doe', controller: _nameController, prefixIcon: Icons.person),
            const SizedBox(height: 16),
            CustomTextField(
              label: 'Phone Number',
              hint: '+92...',
              controller: _phoneController,
              prefixIcon: Icons.phone,
              enabled: false, // Locked: Synced from Auth
            ),
            const SizedBox(height: 16),
            CustomTextField(
              label: 'Email',
              hint: 'email@example.com',
              controller: _emailController,
              prefixIcon: Icons.email,
              enabled: false, // Locked: Synced from Auth
            ),
            const SizedBox(height: 16),
            CustomTextField(label: 'Address', hint: 'Home Address', controller: _addressController, prefixIcon: Icons.home),

            const SizedBox(height: 32),
            _buildHeader('Medical Info'),
            CustomTextField(label: 'Blood Type', hint: 'e.g. O+', controller: _bloodController, prefixIcon: Icons.bloodtype),
            const SizedBox(height: 16),
            CustomTextField(label: 'Allergies', hint: 'None or Specify', controller: _allergiesController, prefixIcon: Icons.warning),

            const SizedBox(height: 32),
            _buildHeader('Emergency Contact'),
            CustomTextField(label: 'Contact Number', hint: '+92...', controller: _emergencyController, prefixIcon: Icons.emergency),

            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF5722),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Save Profile', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 20),
            // Sign Out Button
            Center(
              child: TextButton(
                onPressed: _handleSignOut,
                child: const Text(
                  'Sign Out',
                  style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1F2D7D))),
    );
  }
}