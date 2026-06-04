import 'package:flutter/material.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/dashboard/screens/member_dashboard.dart';

class AppRoutes {
  static const login = '/login';
  static const memberDashboard = '/member-dashboard';

  static Map<String, WidgetBuilder> get routes => {
        login: (context) => const LoginScreen(),
        memberDashboard: (context) => const MemberDashboard(),
      };
}
