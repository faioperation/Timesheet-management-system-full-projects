import 'dart:convert';
import 'dart:io';
import 'package:flutter/cupertino.dart';
import 'package:http/http.dart' as http;
import '../../../app/utils/urls.dart';
import '../models/profile_model.dart';

class ProfileService {
  // Example getProfile already exists (you used earlier)
  static Future<ProfileModel?> getProfile(String token) async {
    final url = Uri.parse(Urls.adminProfileUrl);
    final res = await http.get(url, headers: {'Authorization': 'Bearer $token'});
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      return ProfileModel.fromJson(body['data']);
    }
    return null;
  }

  static Future<Map<String, dynamic>> changePassword({
    required String oldPassword,
    required String newPassword,
    required String confirmPassword,
    required String token,
  }) async {
    try {
      final url = Uri.parse(Urls.adminChangePassUrl);

      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Bearer $token'
        },
        body: jsonEncode({
          "old_password": oldPassword,
          "new_password": newPassword,
          "new_password_confirmation": confirmPassword,
        }),
      );



      print("Status Code: ${response.statusCode}");
      print("Response body: ${response.body}");

      final data = jsonDecode(response.body);

      // Server onek somoy 400, 401, 422 status code e message pathay
      final message = data["message"] ?? "Something went wrong";
      final success = data["success"] ?? (response.statusCode == 200);

      return {"success": success, "message": message};
    } catch (e) {
      print("Error in changePassword: $e");
      return {"success": false, "message": "Error: $e"};
    }
  }


  // Helper function to get MIME type from file extension
  static String _getMimeType(String filePath) {
    final extension = filePath.split('.').last.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg'; // Default to jpeg
    }
  }

  static Future<bool> updateProfile({
    required String token,
    required String name,
    required String email,
    String? phone,
    String? gender,
    String? maritalStatus,
    File? imageFile,
    File? signatureFile,
  }) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse(Urls.adminEditProfileUrl), // API URL
      );

      request.headers['Authorization'] = 'Bearer $token';
      request.headers['Accept'] = 'application/json';
      request.fields['name'] = name;
      request.fields['email'] = email;
      if (phone != null && phone.isNotEmpty) {
        request.fields['phone'] = phone;
      }
      if (gender != null && gender.isNotEmpty) {
        request.fields['gender'] = gender.toLowerCase();
      }
      if (maritalStatus != null && maritalStatus.isNotEmpty) {
        request.fields['marital_status'] = maritalStatus.toLowerCase();
      }

      // Add image file with proper MIME type
      if (imageFile != null && imageFile.existsSync()) {
        final mimeType = _getMimeType(imageFile.path);
        final fileName = imageFile.path.split('/').last;
        
        request.files.add(
          await http.MultipartFile(
            'image',
            imageFile.readAsBytes().asStream(),
            imageFile.lengthSync(),
            filename: fileName,
            contentType: http.MediaType.parse(mimeType),
          ),
        );
        print("📤 Image file: $fileName, MIME: $mimeType");
      }

      // Add signature file with proper MIME type
      if (signatureFile != null && signatureFile.existsSync()) {
        final mimeType = _getMimeType(signatureFile.path);
        final fileName = signatureFile.path.split('/').last;
        
        request.files.add(
          await http.MultipartFile(
            'signature',
            signatureFile.readAsBytes().asStream(),
            signatureFile.lengthSync(),
            filename: fileName,
            contentType: http.MediaType.parse(mimeType),
          ),
        );
        print("📤 Signature file: $fileName, MIME: $mimeType");
      }

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      debugPrint("📥 Profile Update Response Status: ${response.statusCode}");
      debugPrint("📥 Profile Update Response Body: $responseBody");

      if (response.statusCode == 200) {
        try {
          final jsonData = jsonDecode(responseBody) as Map<String, dynamic>;
          // Log the response structure for debugging
          debugPrint("📥 Response Data: ${jsonData['data']}");
          if (jsonData['data'] != null && jsonData['data']['image'] != null) {
            final updatedImageUrl = jsonData['data']['image'] as String;
            debugPrint("✅ Updated Image URL: $updatedImageUrl");
          }
          return true;
        } catch (e) {
          debugPrint("⚠️ Error parsing response: $e");
          return true; // Still return true if status is 200
        }
      } else {
        debugPrint("❌ Update failed. Status: ${response.statusCode}");
        debugPrint("❌ Response: $responseBody");
        return false;
      }
    } catch (e) {
      print("❌ Error updating profile: $e");
      return false;
    }
  }

}
