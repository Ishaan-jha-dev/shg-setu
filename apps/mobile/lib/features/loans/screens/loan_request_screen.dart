import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LoanRequestScreen extends StatelessWidget {
  const LoanRequestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Request Loan', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF306E46),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Text('Loan Request Form', style: GoogleFonts.inter()),
      ),
    );
  }
}
