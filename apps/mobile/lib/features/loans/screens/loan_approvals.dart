import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LoanApprovalsScreen extends StatelessWidget {
  const LoanApprovalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Loan Approvals', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF306E46),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Text('Approve or Reject Member Loans', style: GoogleFonts.inter()),
      ),
    );
  }
}
