import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import '../../app/utils/urls.dart';

class AuthService {

  static Future<Map<String, dynamic>> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String company,
    required String confirmPassword,
  }) async {
    final url = Uri.parse(Urls.signUpUrl);

    final body = {
      "name": name,
      "email": email,
      "phone": phone,
      "password": password,
      "company_name": company,
      "confirm_password": confirmPassword,
    };

    final response = await http.post(
      url,
      body: json.encode(body),
      headers: {"Content-Type": "application/json"},
    );

    print("STATUS: ${response.statusCode}");
    print("BODY: ${response.body}");

    final data = json.decode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      // API success
      return {
        "success": data["success"] == true,   // backend success value read
        "message": data["message"] ?? "",
        "data": data
      };
    } else {
      // API failed status
      return {
        "success": false,
        "message": data["message"] ?? "Signup failed"
      };
    }

  }

  // static Future<Map<String, dynamic>> SignIn({
  //   required String email,
  //   required String password,
  // }) async {
  //   try {
  //     final url = Uri.parse(Urls.signInUrl); // YOUR LOGIN API
  //
  //     final response = await http.post(
  //       url,
  //       headers: {"Content-Type": "application/json"},
  //       body: jsonEncode({
  //         "email": email,
  //         "password": password,
  //       }),
  //     );
  //
  //     final data = jsonDecode(response.body);
  //
  //     if (response.statusCode == 200) {
  //       await TokenService.saveToken(data['token']);
  //       final token = data['token'];
  //       final roleFromApi = data['role'];
  //       SharedPreferences prefs = await SharedPreferences.getInstance();
  //       prefs.setString("username", data["user"]["name"] ?? "User");
  //       return {"success": true, "data": data};
  //     } else {
  //       return {
  //         "success": false,
  //         "message": data["message"] ?? "Login failed"
  //       };
  //     }
  //   } catch (e) {
  //     return {"success": false, "message": "Something went wrong"};
  //   }
  // }

  static String normalizeRole(String role) {
    switch (role) {
      case 'Business Admin':
        return 'admin';
      case 'Staff':
        return 'staff';
      default:
        return 'user';
    }
  }
  // static String? normalizeRole(String role) {
  //   switch (role) {
  //     case 'Business Admin':
  //       return 'admin';
  //     case 'Staff':
  //       return 'staff';
  //     case 'user':
  //       return 'user';
  //     default:
  //       return null; // যদি unknown role আসে, তাহলে null
  //   }
  // }

  static Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final url = Uri.parse(Urls.signInUrl);
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": email, "password": password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final token = data['token'];
        final roleFromApi = data['role']; // Business Admin / Staff / User
        final normalizedRole = normalizeRole(roleFromApi);

        // Save token + normalized role
        await TokenService.saveAuth(token: token, role: normalizedRole);

        final prefs = await SharedPreferences.getInstance();
        prefs.setString("username", data["user"]["name"] ?? "User");
        prefs.setString("email", data["user"]["email"] ?? "");

        return {"success": true, "data": data};
      } else {
        return {"success": false, "message": data["message"] ?? "Login failed"};
      }
    } catch (e) {
      return {"success": false, "message": "Something went wrong"};
    }
  }



  static Future<void> signOut() async {
    await TokenService.clearAuth();

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('username');
    await prefs.remove('email');
  }


  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    final url = Uri.parse(Urls.forgotPassUrl);
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to send reset code');
    }
  }

  static Future<Map<String, dynamic>> verifyForgotPasswordOtp(
      String email, String otp) async {
    final url = Uri.parse(Urls.verifyOtpUrl);
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "otp": otp}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Failed to verify OTP");
    }
  }

  static Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String newPassword,
  }) async {
    final url = Uri.parse(Urls.resetPassUrl);

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          'email': email,
          'password': newPassword,
          'password_confirmation': newPassword,
        },
      );

      print("Status code: ${response.statusCode}");
      print("Response body: ${response.body}");

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'message': data['message'] ?? 'Password reset successful'};
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to reset password. Status: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: ${e.toString()}'};
    }
  }
}
