import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthProvider extends ChangeNotifier {
  final _supabase = Supabase.instance.client;
  
  User? _user;
  Map<String, dynamic>? _memberProfile;
  bool _isLoading = true;

  User? get user => _user;
  Map<String, dynamic>? get memberProfile => _memberProfile;
  bool get isLoading => _isLoading;
  bool get isLeader => _memberProfile?['is_leader'] == true;

  AuthProvider() {
    _initAuth();
  }

  void _initAuth() {
    _supabase.auth.onAuthStateChange.listen((data) {
      _user = data.session?.user;
      if (_user != null) {
        _fetchMemberProfile();
      } else {
        _memberProfile = null;
        _isLoading = false;
        notifyListeners();
      }
    });
  }

  Future<void> _fetchMemberProfile() async {
    try {
      final response = await _supabase
          .from('members')
          .select('id, shg_id, status, is_leader, profiles(full_name, phone)')
          .eq('profile_id', _user!.id)
          .maybeSingle();
      
      _memberProfile = response;
    } catch (e) {
      debugPrint('Error fetching profile: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }
}
