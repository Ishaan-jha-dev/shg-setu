import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MeetingAttendanceScreen extends StatelessWidget {
  const MeetingAttendanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Meeting Attendance', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF306E46),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Text('Mark Attendance & Savings Collection', style: GoogleFonts.inter()),
      ),
    );
  }
}
