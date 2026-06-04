import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'core/routes.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Try loading dotenv, if it fails, continue without it (for testing UI)
  try {
    await dotenv.load(fileName: ".env");
    await Supabase.initialize(
      url: dotenv.env['SUPABASE_URL'] ?? 'http://localhost:54321',
      anonKey: dotenv.env['SUPABASE_ANON_KEY'] ?? '',
    );
  } catch (e) {
    debugPrint("Failed to initialize Supabase/dotenv: $e");
  }

  runApp(const SetuApp());
}

class SetuApp extends StatelessWidget {
  const SetuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Setu SHG',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF306E46)),
        textTheme: GoogleFonts.interTextTheme(),
        useMaterial3: true,
      ),
      initialRoute: AppRoutes.login,
      routes: AppRoutes.routes,
    );
  }
}
