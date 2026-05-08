import 'package:google_generative_ai/google_generative_ai.dart';
import '../constants/app_constants.dart';

class GeminiService {
  late final GenerativeModel _model;
  late final ChatSession _chatSession;

  static const String _systemInstruction = '''
You are the GuardianSense First Aid Assistant. Provide confident, direct, and actionable medical and first aid advice.

CRITICAL RULES:
1. Be extremely concise. Use minimal text and bullet points (use standard dashes, NOT asterisks). Do not use filler words.
2. DO NOT use any markdown formatting. No bolding (**), no italics (*), and no asterisks at all anywhere in your response. Only use plain text.
3. Answer confidently and provide the remedy or steps immediately without hesitating.
4. ONLY answer questions related to first aid, medical emergencies, health conditions, anatomy, medicine, or general wellness. If unrelated, politely decline.
5. DO NOT start your response with a disclaimer. Instead, ALWAYS put the following disclaimer at the very end of your response: "Disclaimer: I am an AI assistant. Please consult a doctor or emergency services for severe conditions."
''';

  GeminiService() {
    _model = GenerativeModel(
      model: 'gemini-2.5-flash',
      apiKey: AppConstants.geminiApiKey,
      systemInstruction: Content.system(_systemInstruction),
    );
    _chatSession = _model.startChat();
  }

  Future<String> sendMessage(String message) async {
    try {
      final response = await _chatSession.sendMessage(Content.text(message));
      return response.text ?? 'I am sorry, I could not generate a response. Please try again.';
    } catch (e, stackTrace) {
      print('Gemini API Error: $e');
      print('Stack trace: $stackTrace');
      return 'Error: $e\n\nPlease ensure you have an active internet connection.';
    }
  }
}
