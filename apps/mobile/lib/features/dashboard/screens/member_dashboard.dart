import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MemberDashboard extends StatefulWidget {
  const MemberDashboard({super.key});

  @override
  State<MemberDashboard> createState() => _MemberDashboardState();
}

class _MemberDashboardState extends State<MemberDashboard> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const _HomeTab(),
    const Center(child: Text('Skills Hub (Coming Soon)')),
    const Center(child: Text('Grants (Coming Soon)')),
    const Center(child: Text('Profile (Coming Soon)')),
  ];

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
          NavigationDestination(icon: Icon(Icons.menu_book), label: 'Skills'),
          NavigationDestination(icon: Icon(Icons.volunteer_activism), label: 'Grants'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context) {
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
                    'Namaste, Member',
                    style: GoogleFonts.inter(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF1A1A1A),
                    ),
                  ),
                  Text(
                    'Shakti Mahila SHG',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: const Color(0xFF306E46),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const CircleAvatar(
                backgroundColor: Color(0xFFE9F2EB),
                child: Icon(Icons.person, color: Color(0xFF306E46)),
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
                      'Total Savings',
                      style: GoogleFonts.inter(color: Colors.white70, fontSize: 14),
                    ),
                    const Icon(Icons.account_balance_wallet, color: Colors.white70, size: 20),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '₹ 12,500',
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Next Meeting', style: GoogleFonts.inter(color: Colors.white70, fontSize: 12)),
                        Text('15 Jun 2026', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Active Loan', style: GoogleFonts.inter(color: Colors.white70, fontSize: 12)),
                        Text('₹ 5,000', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
