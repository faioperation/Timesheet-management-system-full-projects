import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/common/services/auth_interceptor.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/activity_model.dart';
import '../../../../app/utils/urls.dart';

class ActivityService {
  static Future<ActivityResponse> getActivities({
    String? role,
    String? action,
    int page = 1,
  }) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      // Build query parameters
      final Map<String, String> queryParams = {
        'page': page.toString(),
      };

      // Only add filters if they are provided and not "All" or "Activities"
      if (role != null && role.isNotEmpty) {
        queryParams['role'] = role;
      }

      if (action != null && action.isNotEmpty) {
        // Map frontend action names to backend action names
        final actionMap = {
          'Timesheet Create': 'timesheet_create',
          'Timesheet Approved': 'timesheet_approved',
          'Timesheet Reject': 'timesheet_rejected',
          'Add User': 'add_user',
          'login': 'login',
          'logout': 'logout',
          'create_employee': 'create_employee',
          'create_vendor': 'create_vendor',
          'change_password': 'change_password',
        };
        queryParams['action'] = actionMap[action] ?? action.toLowerCase().replaceAll(' ', '_');
      }

      final uri = Uri.parse(Urls.manageActivityUrl).replace(queryParameters: queryParams);

      final response = await AuthInterceptor.get(
        uri,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200) {
        final decodedResponse = jsonDecode(response.body);
        return ActivityResponse.fromJson(decodedResponse);
      } else {
        final decodedResponse = jsonDecode(response.body);
        throw Exception(decodedResponse['message'] ?? 'Failed to fetch activities');
      }
    } catch (e) {
      throw Exception("Error fetching activities: $e");
    }
  }
}
