import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/shg_provider.dart';
import '../../../core/routes.dart';
import '../../meetings/screens/meeting_attendance.dart';
import '../../loans/screens/loan_approvals.dart';

class LeaderDashboard extends StatefulWidget {
  const LeaderDashboard({super.key});

  @override
  State<LeaderDashboard> createState() => _LeaderDashboardState();
}

class _LeaderDashboardState extends State<LeaderDashboard> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const _LeaderHomeTab(),
    const MeetingAttendanceScreen(),
    const LoanApprovalsScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.memberProfile != null) {
        context.read<ShgProvider>().loadShgData(auth.memberProfile!['shg_id']);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF9F2),
      body: _pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        backgroundColor: Colors.white,
        indicatorColor: const Color(0xFFE9F2EB),
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.group), label: 'Meetings'),
          NavigationDestination(icon: Icon(Icons.check_circle), label: 'Approvals'),
        ],
      ),
    );
  }
}

class _LeaderHomeTab extends StatelessWidget {
  const _LeaderHomeTab();

  @override
  Widget build(BuildContext context) {
    return Consumer2<AuthProvider, ShgProvider>(
      builder: (context, auth, shg, child) {
        if (auth.isLoading || shg.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final profile = auth.memberProfile;
        final fullName = profile?['profiles']?['full_name'] ?? 'Leader';
        final shgDetails = shg.shgDetails;
        final shgName = shgDetails?['name'] ?? 'My SHG';
        final balance = shg.groupSavingsBalance;

        return SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(24.0),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Namaste, $fullName',
                        style: GoogleFonts.inter(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1A1A1A),
                        ),
                      ),
                      Text(
                        '$shgName (Leader)',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: const Color(0xFF306E46),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  InkWell(
                    onTap: () {
                      auth.signOut();
                      Navigator.pushReplacementNamed(context, AppRoutes.login);
                    },
                    child: const CircleAvatar(
                      backgroundColor: Color(0xFFE9F2EB),
                      child: Icon(Icons.logout, color: Color(0xFF306E46)),
                    ),
                  )
                ],
              ),
              const SizedBox(height: 32),
              // Savings Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF306E46), Color(0xFF255737)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF306E46).withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Total Group Savings',
                          style: GoogleFonts.inter(color: Colors.white70, fontSize: 14),
                        ),
                        const Icon(Icons.account_balance, color: Colors.white70, size: 20),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '₹ ${balance.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
