import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/common/services/token_service.dart';
import '../../../app/utils/urls.dart';

class AdminService {
  static Future<Map<String, dynamic>> createUser({
    required String name,
    required String email,
    required String phone,
    required String gender,
    required String role_id,
    required String password,
  }) async {
    try {
      final url = Uri.parse(Urls.adminAddUserUrl);
      final token = await TokenService.getToken();

      final request = http.MultipartRequest('POST', url);

      /// ✅ REQUIRED HEADERS
      request.headers.addAll({
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      });

      /// ✅ FORM DATA (exact backend match)
      request.fields.addAll({
        'name': name.trim(),
        'email': email.trim(),
        'phone': phone.trim(),
        'gender': gender.trim().toLowerCase(),
        'role_id': role_id, // id string ok
        'password': password,
      });

      print('📤 FIELDS: ${request.fields}');

      final response = await request.send();
      final body = await response.stream.bytesToString();

      print('📥 STATUS: ${response.statusCode}');
      print('📥 BODY: $body');

      final decoded = jsonDecode(body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true, 'data': decoded};
      }

      return {
        'success': false,
        'message': decoded['message'] ?? 'Server error',
        'errors': decoded['errors'],
      };
    } catch (e) {
      print('❌ Exception: $e');
      return {'success': false, 'message': e.toString()};
    }
  }


  static Future<Map<String, dynamic>> getSingleUser(int id) async {
    final token = await TokenService.getToken();
    final url = Uri.parse(Urls.singleUserUrl(id));


    print("GET Single User URL = $url");

    try {
      final response = await http.get(url, headers: {
        "Accept": "application/json",
        "Authorization": "Bearer $token",
      });

      final data = jsonDecode(response.body);

      return data;
    } catch (e) {
      return {
        "success": false,
        "message": "Error: $e",
      };
    }
  }



  static Future<List<dynamic>> fetchRoles() async {
    final token = await TokenService.getToken();
    final url = Uri.parse(Urls.rolesUrl); // <-- change URL

    final res = await http.get(url, headers: {
      "Accept": "application/json",
      "Authorization": "Bearer $token",   // লাগলে দেবে
    });

    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      return body['data'];  // <-- API response data list
    } else {
      throw Exception("Failed to load roles");
    }
  }


  static Future<Map<String, dynamic>> getUsers() async {
    final token = await TokenService.getToken(); // এখানে তোমার saved token নাও
    final url = Uri.parse(Urls.userListUrl);

    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer $token', // 🔑 Token pass করা হচ্ছে
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load users: ${response.statusCode}');
    }
  }

  /// Get users with role='user' only (for filtering)
  static Future<List<Map<String, dynamic>>> getUsersWithRoleUser() async {
    try {
      final response = await getUsers();
      if (response['success'] == true) {
        final List<dynamic> data = response['data'] ?? [];
        // Filter users where role name is 'user'
        return data.where((user) {
          final roles = user['roles'] as List?;
          if (roles != null && roles.isNotEmpty) {
            final roleName = roles[0]['name'] as String?;
            return roleName?.toLowerCase() == 'user';
          }
          return false;
        }).map((user) => user as Map<String, dynamic>).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching users with role user: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>> updateUser(int id, Map<String, dynamic> body) async {
    final token = await TokenService.getToken();
    final url = Uri.parse(Urls.updateUserProfileUrl(id));

    try {
      final response = await http.post(
        url,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          'Authorization':'Bearer $token',
        },
        body: jsonEncode(body),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        "success": false,
        "message": "Something went wrong: $e",
      };
    }
  }


  static Future<Map<String, dynamic>> assignClient({
    required int userDetailsId,
    required int partyId,
    required double clientRate,
    required double otherRate,
    required double w2,
    required double c2cOrOther,
    required double ptax,
    required String timeSheetPeriod,
    required String startDate,
    required String endDate,
    int? accountManagerId,
    double? accountManagerCommission,
    int? businessDevelopmentManagerId,
    double? businessDevelopmentManagerCommission,
    int? recruiterId,
    double? recruiterCommission,
    required String invoiceTo,
    required bool recursive,
    String? recursiveMonth,
    String? employeeName,
    String? employeeZipCode,
  }) async {
    try {
      final token = await TokenService.getToken();
      final url = Uri.parse(Urls.assignClientUrl(userDetailsId));

      final body = {
        'party_id': partyId,
        'client_rate': clientRate,
        'other_rate': otherRate,
        'w2': w2,
        'c2c_or_other': c2cOrOther,
        'ptax': ptax,
        'time_sheet_period': timeSheetPeriod,
        'start_date': startDate,
        'end_date': endDate,
        'invoice_to': invoiceTo,
        'recursive': recursive,
      };

      // Add optional fields only if they are provided
      if (accountManagerId != null) {
        body['account_manager_id'] = accountManagerId;
      }
      if (accountManagerCommission != null) {
        body['account_manager_commission'] = accountManagerCommission;
      }
      if (businessDevelopmentManagerId != null) {
        body['business_development_manager_id'] = businessDevelopmentManagerId;
      }
      if (businessDevelopmentManagerCommission != null) {
        body['business_development_manager_commission'] = businessDevelopmentManagerCommission;
      }
      if (recruiterId != null) {
        body['recruiter_id'] = recruiterId;
      }
      if (recruiterCommission != null) {
        body['recruiter_commission'] = recruiterCommission;
      }
      if (recursiveMonth != null && !recursive) {
        body['recursive_month'] = recursiveMonth;
      }
      if (employeeName != null && employeeName.isNotEmpty) {
        body['employee_name'] = employeeName;
      }
      if (employeeZipCode != null && employeeZipCode.isNotEmpty) {
        body['employee_zip_code'] = employeeZipCode;
      }

      print('📤 Assign Client Request:');
      print('   URL: $url');
      print('   Body: $body');

      final response = await http.post(
        url,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );

      final responseBody = response.body;
      print('📥 STATUS: ${response.statusCode}');
      print('📥 BODY: $responseBody');

      final decoded = jsonDecode(responseBody);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'message': decoded['message'] ?? 'Client assigned successfully',
          'data': decoded['data'],
        };
      } else {
        return {
          'success': false,
          'message': decoded['message'] ?? 'Failed to assign client',
          'errors': decoded['errors'],
        };
      }
    } catch (e) {
      print('❌ Exception: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  static Future<Map<String, dynamic>> updateUserStatus({
    required int userId,
    required String status,
  }) async {
    try {
      final token = await TokenService.getToken();
      final url = Uri.parse(Urls.updateUserStatusUrl(userId));

      final response = await http.patch(
        url,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'status': status,
        }),
      );

      final responseBody = response.body;
      print('📥 STATUS: ${response.statusCode}');
      print('📥 BODY: $responseBody');

      final decoded = jsonDecode(responseBody);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'message': decoded['message'] ?? 'User status updated successfully',
          'data': decoded['data'],
        };
      } else {
        return {
          'success': false,
          'message': decoded['message'] ?? 'Failed to update user status',
          'errors': decoded['errors'],
        };
      }
    } catch (e) {
      print('❌ Exception: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Delete User
  static Future<Map<String, dynamic>> deleteUser({
    required int userId,
  }) async {
    try {
      final token = await TokenService.getToken();
      final url = Uri.parse(Urls.deleteUserUrl(userId));

      final response = await http.delete(
        url,
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseBody = response.body;
      print('📥 DELETE USER STATUS: ${response.statusCode}');
      print('📥 DELETE USER BODY: $responseBody');

      final decoded = jsonDecode(responseBody);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'message': decoded['message'] ?? 'User deleted successfully',
        };
      } else {
        return {
          'success': false,
          'message': decoded['message'] ?? 'Failed to delete user',
        };
      }
    } catch (e) {
      print('❌ Exception: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Delete Party (Vendor, Client, Employee)
  static Future<Map<String, dynamic>> deleteParty({
    required int partyId,
  }) async {
    try {
      final token = await TokenService.getToken();
      final url = Uri.parse(Urls.deletePartyUrl(partyId));

      final response = await http.delete(
        url,
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseBody = response.body;
      print('📥 DELETE PARTY STATUS: ${response.statusCode}');
      print('📥 DELETE PARTY BODY: $responseBody');

      final decoded = jsonDecode(responseBody);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'message': decoded['message'] ?? 'Party deleted successfully',
        };
      } else {
        return {
          'success': false,
          'message': decoded['message'] ?? 'Failed to delete party',
        };
      }
    } catch (e) {
      print('❌ Exception: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Delete Internal User
  static Future<Map<String, dynamic>> deleteInternalUser({
    required int internalUserId,
  }) async {
    try {
      final token = await TokenService.getToken();
      final url = Uri.parse(Urls.deleteInternalUserUrl(internalUserId));

      final response = await http.delete(
        url,
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseBody = response.body;
      print('📥 DELETE INTERNAL USER STATUS: ${response.statusCode}');
      print('📥 DELETE INTERNAL USER BODY: $responseBody');

      final decoded = jsonDecode(responseBody);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'message': decoded['message'] ?? 'Internal user deleted successfully',
        };
      } else {
        return {
          'success': false,
          'message': decoded['message'] ?? 'Failed to delete internal user',
        };
      }
    } catch (e) {
      print('❌ Exception: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

}
