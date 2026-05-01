import 'package:url_launcher/url_launcher.dart';

class EmergencyService {
  /// Launches the phone's native dialer with the provided number
  static Future<void> makeCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );

    try {
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri);
      } else {
        // This usually happens on emulators that don't have a "Phone" app
        print('Could not launch dialer for $phoneNumber');
      }
    } catch (e) {
      print('Error launching emergency call: $e');
    }
  }
}