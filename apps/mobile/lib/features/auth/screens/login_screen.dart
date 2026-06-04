import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../dashboard/screens/member_dashboard.dart';
import '../../../core/routes.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedLanguage = 'English';
  final List<String> _languages = ['English', 'हिंदी (Hindi)', 'मराठी (Marathi)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF9F2),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              // Logo Placeholder
              Center(
                child: Container(
                  height: 80,
                  width: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFF306E46).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(LucideIcons.leaf, size: 40, color: Color(0xFF306E46)),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Welcome to Setu',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF1A1A1A),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Empowering Self-Help Groups',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 40),
              
              // Language Selector
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedLanguage,
                    isExpanded: true,
                    icon: const Icon(LucideIcons.chevronDown, size: 20),
                    items: _languages.map((String lang) {
                      return DropdownMenuItem<String>(
                        value: lang,
                        child: Text(lang, style: GoogleFonts.inter(fontSize: 14)),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      if (newValue != null) {
                        setState(() {
                          _selectedLanguage = newValue;
                        });
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Email Input
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  hintText: 'Email or Phone Number',
                  hintStyle: GoogleFonts.inter(color: Colors.grey[400]),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF306E46), width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // Password Input
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Password',
                  hintStyle: GoogleFonts.inter(color: Colors.grey[400]),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF306E46), width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              
              // Login Button
              ElevatedButton(
                onPressed: () {
                  // TODO: Integrate Supabase Auth
                  Navigator.pushReplacementNamed(context, AppRoutes.memberDashboard);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF306E46),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  'Login to Dashboard',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
