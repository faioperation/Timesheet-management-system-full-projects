import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../app/utils/urls.dart';
import '../../../common/services/auth_interceptor.dart';

class UserRoleService {
  static Future<Map<String, dynamic>> updateUserRole({
    required int userId,
    required int roleId, // 2 = Business Admin, 3 = Staff, 4 = User
  }) async {
    try {
      final uri = Uri.parse(Urls.userHasRoleUrl);
      
      final response = await AuthInterceptor.post(
        uri,
        body: jsonEncode({
          'user_id': userId,
          'role_id': roleId,
        }),
        context: null,
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': responseData['success'] ?? true,
          'message': responseData['message'] ?? 'Role updated successfully',
        };
      } else {
        return {
          'success': false,
          'message': responseData['message'] ?? 'Failed to update role',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error updating role: $e',
      };
    }
  }
}
