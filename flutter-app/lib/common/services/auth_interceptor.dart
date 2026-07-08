import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/auth/services/auth_service.dart';
import 'package:timesheet_naresh/auth/pages/sign_in_page.dart';
import 'package:timesheet_naresh/app/global_navigator.dart';
import 'token_service.dart';

class AuthInterceptor {
  /// Check if response indicates token expiration
  static bool isTokenExpired(http.Response response) {
    return response.statusCode == 401 || response.statusCode == 403;
  }

  /// Handle token expiration - clear auth and redirect to login
  static Future<void> handleTokenExpiration(BuildContext? context) async {
    // Clear authentication data
    await AuthService.signOut();

    // Navigate to login screen using global navigator key
    final navigatorContext = context ?? navigatorKey.currentContext;
    if (navigatorContext != null) {
      Navigator.of(navigatorContext, rootNavigator: true).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const SignInScreen()),
        (route) => false,
      );
    }
  }

  /// Wrapper for GET requests with token expiration handling
  static Future<http.Response> get(
    Uri url, {
    Map<String, String>? headers,
    BuildContext? context,
  }) async {
    final token = await TokenService.getToken();
    
    final requestHeaders = <String, String>{
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      ...?headers,
    };

    final response = await http.get(url, headers: requestHeaders);

    if (isTokenExpired(response)) {
      await handleTokenExpiration(context);
      throw Exception('Token expired. Please login again.');
    }

    return response;
  }

  /// Wrapper for POST requests with token expiration handling
  static Future<http.Response> post(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    BuildContext? context,
  }) async {
    final token = await TokenService.getToken();
    
    final requestHeaders = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      ...?headers,
    };

    final response = await http.post(
      url,
      headers: requestHeaders,
      body: body,
    );

    if (isTokenExpired(response)) {
      await handleTokenExpiration(context);
      throw Exception('Token expired. Please login again.');
    }

    return response;
  }

  /// Wrapper for PUT requests with token expiration handling
  static Future<http.Response> put(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    BuildContext? context,
  }) async {
    final token = await TokenService.getToken();
    
    final requestHeaders = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      ...?headers,
    };

    final response = await http.put(
      url,
      headers: requestHeaders,
      body: body,
    );

    if (isTokenExpired(response)) {
      await handleTokenExpiration(context);
      throw Exception('Token expired. Please login again.');
    }

    return response;
  }

  /// Wrapper for PATCH requests with token expiration handling
  static Future<http.Response> patch(
    Uri url, {
      Map<String, String>? headers,
      Object? body,
      BuildContext? context,
    }) async {
    final token = await TokenService.getToken();

    final requestHeaders = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      ...?headers,
    };

    final response = await http.patch(
      url,
      headers: requestHeaders,
      body: body,
    );

    if (isTokenExpired(response)) {
      await handleTokenExpiration(context);
      throw Exception('Token expired. Please login again.');
    }

    return response;
  }

  /// Wrapper for DELETE requests with token expiration handling
  static Future<http.Response> delete(
    Uri url, {
    Map<String, String>? headers,
    BuildContext? context,
  }) async {
    final token = await TokenService.getToken();
    
    final requestHeaders = <String, String>{
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      ...?headers,
    };

    final response = await http.delete(url, headers: requestHeaders);

    if (isTokenExpired(response)) {
      await handleTokenExpiration(context);
      throw Exception('Token expired. Please login again.');
    }

    return response;
  }

  /// Validate token by making a test API call
  static Future<bool> validateToken() async {
    try {
      final token = await TokenService.getToken();
      if (token == null || token.isEmpty) {
        return false;
      }

      // You can make a lightweight API call here to validate token
      // For now, we'll just check if token exists
      // If you have a /profile or /validate-token endpoint, use that
      return true;
    } catch (e) {
      return false;
    }
  }
}
