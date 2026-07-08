import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/common/services/auth_interceptor.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/models/timesheet_model.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/models/default_timesheet_model.dart';
import '../../../../app/utils/urls.dart';

class TimesheetService {
  /// Fetch all timesheets (for admin/staff)
  static Future<TimesheetResponse> getTimesheets() async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.timesheetUrl);

      final response = await AuthInterceptor.get(
        uri,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return TimesheetResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load timesheets: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching timesheets: $e');
    }
  }

  /// Fetch timesheets for a specific user (for user role)
  static Future<TimesheetResponse> getUserTimesheets(int userId) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse('${Urls.timesheetUrl}?user_id=$userId');

      final response = await AuthInterceptor.get(
        uri,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return TimesheetResponse.fromJson(jsonData);
      } else {
        throw Exception(
            'Failed to load user timesheets: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching user timesheets: $e');
    }
  }

  /// Fetch timesheets with optional user_id and month filters
  static Future<TimesheetResponse> getTimesheetsWithFilters({
    int? userId,
    String? month, // Format: YYYY-MM (e.g., "2026-01")
  }) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final queryParams = <String, String>{};
      if (userId != null) {
        queryParams['user_id'] = userId.toString();
      }
      if (month != null && month.isNotEmpty) {
        queryParams['month'] = month;
      }

      final uri = Uri.parse(Urls.timesheetUrl).replace(
          queryParameters: queryParams);

      final response = await AuthInterceptor.get(
        uri,
        context: null,
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return TimesheetResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load timesheets: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching timesheets: $e');
    }
  }

  /// Update timesheet status (approve/reject/pending/submitted)
  static Future<Map<String, dynamic>> updateTimesheetStatus({
    required int timesheetId,
    required String status,
  }) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.updateTimesheetStatusUrl(timesheetId));

      final response = await AuthInterceptor.patch(
        uri,
        body: jsonEncode({'status': status}),
        context: null,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return {
          'success': true,
          'message': jsonData['message'] ??
              'Timesheet status updated successfully',
          'data': jsonData['data'],
        };
      } else {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return {
          'success': false,
          'message': jsonData['message'] ?? 'Failed to update timesheet status',
          'errors': jsonData['errors'],
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error updating timesheet status: $e',
      };
    }
  }

  /// Fetch a single timesheet by ID (for preview from dashboard tables)
  static Future<TimesheetModel> getTimesheetById(int timesheetId) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.updateTimesheetStatusUrl(
          timesheetId)); // same endpoint: /timesheet/{id}
      final response = await AuthInterceptor.get(uri, context: null);

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        final data = jsonData['data'] as Map<String, dynamic>?;
        if (data == null) {
          throw Exception('Timesheet data not found');
        }
        return TimesheetModel.fromJson(data);
      } else {
        throw Exception('Failed to load timesheet: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching timesheet: $e');
    }
  }

  /// Create a new timesheet with form-data
  static Future<Map<String, dynamic>> createTimesheet({
    required int userId,
    int? clientId,
    required String startDate,
    required String endDate,
    required String status,
    String? remarks,
    int? mailTemplateId,
    String? sendTo,
    File? file,
    required List<Map<String,
        dynamic>> entries, // [{entry_date, daily_hours, extra_hours, vacation_hours, note}]
  }) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.timesheetUrl);
      final request = http.MultipartRequest('POST', uri);

      // Headers
      request.headers.addAll({
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      });

      // Form fields
      request.fields['user_id'] = userId.toString();
      if (clientId != null) {
        request.fields['client_id'] = clientId.toString();
      }
      request.fields['start_date'] = startDate;
      request.fields['end_date'] = endDate;
      request.fields['status'] = status;

      if (remarks != null && remarks.isNotEmpty) {
        request.fields['remarks'] = remarks;
      }
      if (mailTemplateId != null) {
        request.fields['mail_template_id'] = mailTemplateId.toString();
      }
      if (sendTo != null && sendTo.isNotEmpty) {
        request.fields['send_to'] = sendTo;
      }

      // Add entries
      for (int i = 0; i < entries.length; i++) {
        final entry = entries[i];
        request.fields['entries[$i][entry_date]'] =
        entry['entry_date'] as String;
        request.fields['entries[$i][daily_hours]'] =
            entry['daily_hours'].toString();
        request.fields['entries[$i][extra_hours]'] =
            entry['extra_hours'].toString();
        request.fields['entries[$i][vacation_hours]'] =
            entry['vacation_hours'].toString();
        if (entry['note'] != null && entry['note']
            .toString()
            .isNotEmpty) {
          request.fields['entries[$i][note]'] = entry['note'].toString();
        }
      }

      // Add file if provided
      if (file != null && await file.exists()) {
        final fileSize = await file.length();
        print('📎 Adding file to request:');
        print('   File path: ${file.path}');
        print('   File size: ${(fileSize / (1024 * 1024)).toStringAsFixed(2)} MB');
        
        // Double-check file size before adding (safety check - backend accepts up to 5MB)
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (fileSize > maxFileSize) {
          print('⚠️ WARNING: File size (${(fileSize / (1024 * 1024)).toStringAsFixed(2)} MB) exceeds limit. Skipping file upload.');
          // Don't add the file if it's too large
        } else {
          request.files.add(
            await http.MultipartFile.fromPath('file', file.path),
          );
          print('✅ File added to request successfully.');
        }
      } else {
        print('ℹ️ No file provided or file does not exist.');
      }

      print('📤 Creating Timesheet:');
      print('   URL: $uri');
      print('   Fields: ${request.fields}');
      print('   Files: ${request.files.length}');

      final streamedResponse = await request.send();
      final responseBody = await streamedResponse.stream.bytesToString();

      print('📥 STATUS: ${streamedResponse.statusCode}');
      print('📥 BODY: $responseBody');

      // Handle 413 Request Entity Too Large error (server returns HTML)
      if (streamedResponse.statusCode == 413) {
        return {
          'success': false,
          'message': 'File size is too large. Maximum allowed size is 2MB. Please select a smaller file or create timesheet without file.',
          'statusCode': 413,
        };
      }

      // Check if response is JSON before parsing
      Map<String, dynamic> jsonData;
      try {
        jsonData = jsonDecode(responseBody) as Map<String, dynamic>;
      } catch (parseError) {
        // If response is not JSON (e.g., HTML error page), return error
        return {
          'success': false,
          'message': 'Server error (${streamedResponse.statusCode}). Please try again with a smaller file or without file.',
          'statusCode': streamedResponse.statusCode,
        };
      }

      if (streamedResponse.statusCode == 200 ||
          streamedResponse.statusCode == 201) {
        return {
          'success': true,
          'message': jsonData['message'] ?? 'Timesheet created successfully',
          'data': jsonData['data'],
        };
      } else {
        return {
          'success': false,
          'message': jsonData['message'] ?? 'Failed to create timesheet',
          'errors': jsonData['errors'],
          'statusCode': streamedResponse.statusCode,
        };
      }
    } catch (e) {
      print('❌ Exception: $e');
      // Check if it's a FormatException (likely from parsing HTML response)
      if (e.toString().contains('FormatException') || 
          e.toString().contains('Unexpected character')) {
        return {
          'success': false,
          'message': 'File size is too large or server error. Please try with a smaller file (max 2MB) or create timesheet without file.',
        };
      }
      return {
        'success': false,
        'message': 'Error creating timesheet: $e',
      };
    }
  }

  /// Update an existing timesheet (same body format as createTimesheet)
  Future<Map<String, dynamic>> updateTimesheet({
    required int timesheetId,
    required int userId,
    int? clientId,
    required String startDate,
    required String endDate,
    required String status,
    String? remarks,
    int? mailTemplateId,
    String? sendTo,
    File? file,
    required List<Map<String,
        dynamic>> entries, // [{entry_date, daily_hours, extra_hours, vacation_hours, note}]
  }) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.updateTimesheetStatusUrl(timesheetId));
      final request = http.MultipartRequest('POST', uri);

      // Headers
      request.headers.addAll({
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      });

      // Required fields - user_id & client_id should NOT be changed from UI
      request.fields['user_id'] = userId.toString();
      if (clientId != null) {
        request.fields['client_id'] = clientId.toString();
      }
      request.fields['start_date'] = startDate;
      request.fields['end_date'] = endDate;
      request.fields['status'] = status;

      if (remarks != null && remarks.isNotEmpty) {
        request.fields['remarks'] = remarks;
      }
      if (mailTemplateId != null) {
        request.fields['mail_template_id'] = mailTemplateId.toString();
      }
      if (sendTo != null && sendTo.isNotEmpty) {
        request.fields['send_to'] = sendTo;
      }

      // Add entries
      for (int i = 0; i < entries.length; i++) {
        final entry = entries[i];
        request.fields['entries[$i][entry_date]'] =
        entry['entry_date'] as String;
        request.fields['entries[$i][daily_hours]'] =
            entry['daily_hours'].toString();
        request.fields['entries[$i][extra_hours]'] =
            entry['extra_hours'].toString();
        request.fields['entries[$i][vacation_hours]'] =
            entry['vacation_hours'].toString();
        if (entry['note'] != null && entry['note']
            .toString()
            .isNotEmpty) {
          request.fields['entries[$i][note]'] = entry['note'].toString();
        }
      }

      // Add file if provided
      if (file != null && await file.exists()) {
        request.files.add(
          await http.MultipartFile.fromPath('file', file.path),
        );
      }

      print('📤 Updating Timesheet:');
      print('   URL: $uri');
      print('   Fields: ${request.fields}');
      print('   Files: ${request.files.length}');

      final streamedResponse = await request.send();
      final responseBody = await streamedResponse.stream.bytesToString();

      print('📥 STATUS: ${streamedResponse.statusCode}');
      print('📥 BODY: $responseBody');

      final jsonData = jsonDecode(responseBody) as Map<String, dynamic>;

      if (streamedResponse.statusCode == 200 ||
          streamedResponse.statusCode == 201) {
        return {
          'success': true,
          'message': jsonData['message'] ?? 'Timesheet updated successfully',
          'data': jsonData['data'],
        };
      } else {
        return {
          'success': false,
          'message': jsonData['message'] ?? 'Failed to update timesheet',
          'errors': jsonData['errors'],
        };
      }
    } catch (e) {
      print('❌ Exception updating timesheet: $e');
      return {
        'success': false,
        'message': 'Error updating timesheet: $e',
      };
    }
  }

  /// Fetch default timesheets for a user
  static Future<DefaultTimesheetResponse> getUserDefaultTimesheets(int userId) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.userTimesheetDefaultsUrl(userId));

      final response = await AuthInterceptor.get(
        uri,
        context: null,
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return DefaultTimesheetResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load default timesheets: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching default timesheets: $e');
    }
  }
}
