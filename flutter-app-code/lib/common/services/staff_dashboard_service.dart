import 'dart:convert';

import 'package:timesheet_naresh/app/utils/urls.dart';
import 'package:timesheet_naresh/common/models/staff_dashboard_model.dart';
import 'package:timesheet_naresh/common/services/auth_interceptor.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';

class StaffDashboardService {
  static Future<StaffDashboardResponse> getStaffDashboard() async {
    try {
      final token = await TokenService.getToken();
      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.staffDashboardUrl);
      final response = await AuthInterceptor.get(uri, context: null);

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return StaffDashboardResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load staff dashboard: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching staff dashboard: $e');
    }
  }
}

