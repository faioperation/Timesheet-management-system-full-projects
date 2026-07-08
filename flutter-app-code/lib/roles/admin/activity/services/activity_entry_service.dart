import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/common/services/auth_interceptor.dart';
import '../../../../app/utils/urls.dart';
import '../models/activity_entry_model.dart';

class ActivityEntryService {
  static Future<ActivityEntryResponse> getActivityEntries(String month) async {
    try {
      final uri = Uri.parse(Urls.schedulerUrl(month));
      final response = await AuthInterceptor.get(uri, context: null);

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body);
        return ActivityEntryResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load activity entries: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching activity entries: $e');
    }
  }
}
