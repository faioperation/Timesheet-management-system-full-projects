import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../../../../app/utils/urls.dart';
import '../models/company_model.dart';
import '../../../../common/services/token_service.dart';

class CompanyService {
  // Get company information
  static Future<CompanyModel?> getCompany() async {
    try {
      final token = await TokenService.getToken();
      if (token == null) {
        return null;
      }

      final url = Uri.parse(Urls.adminProfileUrl);
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['data'] != null && data['data']['business'] != null) {
          return CompanyModel.fromJson(data['data']['business']);
        }
      }
      return null;
    } catch (e) {
      print('Error fetching company: $e');
      return null;
    }
  }

  // Update company information
  static Future<Map<String, dynamic>> updateCompany({
    required String name,
    required String email,
    required String phone,
    String? address,
    File? logoFile,
  }) async {
    try {
      final token = await TokenService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'Authentication token not found',
        };
      }

      var request = http.MultipartRequest(
        'POST',
        Uri.parse(Urls.companyUpdateUrl),
      );

      request.headers['Authorization'] = 'Bearer $token';
      request.headers['Accept'] = 'application/json';

      // Add form fields
      request.fields['name'] = name;
      request.fields['email'] = email;
      request.fields['phone'] = phone;
      if (address != null && address.isNotEmpty) {
        request.fields['address'] = address;
      }

      // Add logo file if provided
      if (logoFile != null && logoFile.existsSync()) {
        final extension = logoFile.path.split('.').last.toLowerCase();
        String mimeType = 'image/jpeg';
        
        if (extension == 'png') {
          mimeType = 'image/png';
        } else if (extension == 'gif') {
          mimeType = 'image/gif';
        } else if (extension == 'jpg' || extension == 'jpeg') {
          mimeType = 'image/jpeg';
        }

        final fileName = logoFile.path.split(Platform.pathSeparator).last;
        request.files.add(
          await http.MultipartFile(
            'logo',
            logoFile.readAsBytes().asStream(),
            logoFile.lengthSync(),
            filename: fileName,
            contentType: http.MediaType.parse(mimeType),
          ),
        );
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'message': data['message'] ?? 'Company information updated successfully',
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to update company information',
        };
      }
    } catch (e) {
      print('Error updating company: $e');
      return {
        'success': false,
        'message': 'Error: $e',
      };
    }
  }
}
