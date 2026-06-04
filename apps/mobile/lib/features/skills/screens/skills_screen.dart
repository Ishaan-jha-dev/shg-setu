import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SkillsScreen extends StatelessWidget {
  const SkillsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Skills Hub', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF306E46),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Text('Vocational & Digital Skills Programs', style: GoogleFonts.inter()),
      ),
    );
  }
}
