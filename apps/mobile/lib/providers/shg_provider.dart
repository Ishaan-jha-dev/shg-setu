import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ShgProvider extends ChangeNotifier {
  final _supabase = Supabase.instance.client;
  
  Map<String, dynamic>? _shgDetails;
  double _groupSavingsBalance = 0;
  bool _isLoading = false;

  Map<String, dynamic>? get shgDetails => _shgDetails;
  double get groupSavingsBalance => _groupSavingsBalance;
  bool get isLoading => _isLoading;

  Future<void> loadShgData(String shgId) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      // Fetch SHG details
      final shgResponse = await _supabase
          .from('shgs')
          .select()
          .eq('id', shgId)
          .maybeSingle();
          
      _shgDetails = shgResponse;

      // Fetch group savings pool balance
      final poolResponse = await _supabase
          .from('savings_accounts')
          .select('balance')
          .eq('shg_id', shgId)
          .isFilter('member_id', null)
          .maybeSingle();
          
      if (poolResponse != null) {
        _groupSavingsBalance = (poolResponse['balance'] ?? 0).toDouble();
      }
    } catch (e) {
      debugPrint('Error fetching SHG data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
