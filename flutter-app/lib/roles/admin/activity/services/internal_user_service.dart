import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/app/utils/urls.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import '../models/internal_user_model.dart';

class InternalUserService {
  static Future<List<InternalUserModel>> getInternalUsers(String token) async {
    final response = await http.get(
      Uri.parse(Urls.internalUserList), // use your internal user API URL
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final List list = body['data'] ?? [];
      return list.map((e) => InternalUserModel.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load internal users');
    }
  }

  static Future<Map<String, dynamic>> createInternalUser({
    required String name,
    required String email,
    required String phone,
    required String gender,
    required String role,
    required String rate,
    required String commissionOn,
    required String rateType,
    required String recuesive,
    required String month,
    File? imageFile,
  }) async {
    try {
      final uri = Uri.parse(Urls.createInternalUserUrl);
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        return {
          'success': false,
          'message': 'Authentication token not found',
        };
      }

      final request = http.MultipartRequest('POST', uri);

      request.headers['Authorization'] = 'Bearer $token';
      request.headers['Accept'] = 'application/json';

      // Add all required fields
      request.fields['name'] = name.trim();
      request.fields['email'] = email.trim();
      request.fields['phone'] = phone.trim();
      request.fields['gender'] = gender.trim().toLowerCase();
      request.fields['role'] = role.trim();
      request.fields['rate'] = rate.trim();
      request.fields['commission_on'] = commissionOn.trim();
      request.fields['rate_type'] = rateType.trim();
      request.fields['recuesive'] = recuesive.trim();
      request.fields['month'] = month.trim();

      // Add image file if provided (nullable)
      if (imageFile != null && imageFile.existsSync()) {
        request.files.add(
          await http.MultipartFile.fromPath('image', imageFile.path),
        );
      }

      print('📤 Creating Internal User:');
      print('   Name: $name');
      print('   Email: $email');
      print('   Phone: $phone');
      print('   Gender: $gender');
      print('   Role: $role');
      print('   Rate: $rate');
      print('   Commission On: $commissionOn');
      print('   Rate Type: $rateType');
      print('   Recursive: $recuesive');
      print('   Month: $month');
      print('   Image: ${imageFile != null ? imageFile.path : "null"}');

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      print('📥 STATUS: ${response.statusCode}');
      print('📥 BODY: $responseBody');

      final decoded = jsonDecode(responseBody);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'message': decoded['message'] ?? 'Internal user created successfully',
          'data': decoded['data'],
        };
      } else {
        return {
          'success': false,
          'message': decoded['message'] ?? 'Failed to create internal user',
          'errors': decoded['errors'],
        };
      }
    } catch (e) {
      print('❌ Exception: $e');
      return {
        'success': false,
        'message': 'Error: ${e.toString()}',
      };
    }
  }

  // Update internal user (POST with form-data)
  static Future<Map<String, dynamic>> updateInternalUser({
    required int internalUserId,
    required String name,
    required String email,
    String? password,
    required String phone,
    required String gender,
    required String role,
    required String rate,
    required String commissionOn,
    required String rateType,
    required String recuesive,
    required String month,
    File? imageFile,
  }) async {
    try {
      final uri = Uri.parse(Urls.updateInternalUserUrl(internalUserId));
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        return {
          'success': false,
          'message': 'Authentication token not found',
        };
      }

      // Laravel requires POST method with form-data for updates
      final request = http.MultipartRequest('POST', uri);

      request.headers['Authorization'] = 'Bearer $token';
      request.headers['Accept'] = 'application/json';

      // Add all required fields
      request.fields['name'] = name.trim();
      request.fields['email'] = email.trim();
      if (password != null && password.isNotEmpty) {
        request.fields['password'] = password.trim();
      }
      request.fields['phone'] = phone.trim();
      request.fields['gender'] = gender.trim().toLowerCase();
      request.fields['role'] = role.trim();
      request.fields['rate'] = rate.trim();
      request.fields['commission_on'] = commissionOn.trim();
      request.fields['rate_type'] = rateType.trim();
      request.fields['recuesive'] = recuesive.trim();
      request.fields['month'] = month.trim();

      // Add image file if provided
      if (imageFile != null && imageFile.existsSync()) {
        request.files.add(
          await http.MultipartFile.fromPath('image', imageFile.path),
        );
      }

      print('📤 Updating Internal User:');
      print('   ID: $internalUserId');
      print('   Name: $name');
      print('   Email: $email');
      print('   Phone: $phone');
      print('   Gender: $gender');
      print('   Role: $role');
      print('   Rate: $rate');
      print('   Commission On: $commissionOn');
      print('   Rate Type: $rateType');
      print('   Recursive: $recuesive');
      print('   Month: $month');
      print('   Image: ${imageFile != null ? imageFile.path : "null"}');

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      print('📥 STATUS: ${response.statusCode}');
      print('📥 BODY: $responseBody');

      final decoded = jsonDecode(responseBody);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'message': decoded['message'] ?? 'Internal user updated successfully',
          'data': decoded['data'],
        };
      } else {
        return {
          'success': false,
          'message': decoded['message'] ?? 'Failed to update internal user',
          'errors': decoded['errors'],
        };
      }
    } catch (e) {
      print('❌ Exception: $e');
      return {
        'success': false,
        'message': 'Error: ${e.toString()}',
      };
    }
  }

  // Update internal user role (PATCH with JSON)
  static Future<Map<String, dynamic>> updateInternalUserRole({
    required int internalUserId,
    required String role,
  }) async {
    try {
      final uri = Uri.parse(Urls.updateInternalUserRoleUrl(internalUserId));
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        return {
          'success': false,
          'message': 'Authentication token not found',
        };
      }

      final response = await http.patch(
        uri,
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'role': role.trim(),
        }),
      );

      print('📤 Updating Internal User Role:');
      print('   ID: $internalUserId');
      print('   Role: $role');
      print('   URL: $uri');
      print('📥 STATUS: ${response.statusCode}');
      print('📥 BODY: ${response.body}');

      Map<String, dynamic> decoded;
      try {
        decoded = jsonDecode(response.body) as Map<String, dynamic>;
      } catch (e) {
        print('❌ Failed to parse JSON response: $e');
        return {
          'success': false,
          'message': 'Invalid response from server',
        };
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'message': decoded['message']?.toString() ?? 'Internal user role updated successfully',
          'data': decoded['data'],
        };
      } else {
        String errorMessage = 'Failed to update internal user role';
        if (decoded.containsKey('message')) {
          errorMessage = decoded['message'].toString();
        } else if (decoded.containsKey('error')) {
          errorMessage = decoded['error'].toString();
        } else if (decoded.containsKey('errors')) {
          final errors = decoded['errors'];
          if (errors is Map && errors.isNotEmpty) {
            final firstError = errors.values.first;
            if (firstError is List && firstError.isNotEmpty) {
              errorMessage = firstError.first.toString();
            } else if (firstError is String) {
              errorMessage = firstError;
            }
          }
        }
        
        return {
          'success': false,
          'message': errorMessage,
          'errors': decoded['errors'],
        };
      }
    } catch (e) {
      print('❌ Exception: $e');
      return {
        'success': false,
        'message': 'Error: ${e.toString()}',
      };
    }
  }
}
