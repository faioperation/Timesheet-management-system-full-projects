import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/common/services/auth_interceptor.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/profile/models/permission_model.dart';
import '../../../../app/utils/urls.dart';

class PermissionService {
  /// Fetch supervisor permissions (Staff permissions)
  static Future<PermissionResponse> getSupervisorPermissions() async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.supervisorPermissionsUrl);

      final response = await AuthInterceptor.get(
        uri,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return PermissionResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load supervisor permissions: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching supervisor permissions: $e');
    }
  }

  /// Fetch supervisor available permissions (currently assigned to Staff role)
  static Future<PermissionResponse> getSupervisorAvailablePermissions() async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.supervisorAvailablePermissionsUrl);

      final response = await AuthInterceptor.get(
        uri,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return PermissionResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load supervisor available permissions: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching supervisor available permissions: $e');
    }
  }

  /// Fetch user permissions
  static Future<PermissionResponse> getUserPermissions() async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.userPermissionsUrl);

      final response = await AuthInterceptor.get(
        uri,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return PermissionResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load user permissions: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching user permissions: $e');
    }
  }

  /// Fetch user available permissions (currently assigned to User role)
  static Future<PermissionResponse> getUserAvailablePermissions() async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.userAvailablePermissionsUrl);

      final response = await AuthInterceptor.get(
        uri,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return PermissionResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load user available permissions: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching user available permissions: $e');
    }
  }

  /// Save role permissions
  static Future<Map<String, dynamic>> saveRolePermissions({
    required int roleId,
    required List<int> permissionIds,
  }) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.roleHasPermissionUrl);

      final body = jsonEncode({
        'role_id': roleId,
        'permissions': permissionIds,
      });

      final response = await AuthInterceptor.post(
        uri,
        body: body,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return jsonData;
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Failed to save permissions: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error saving role permissions: $e');
    }
  }
}
