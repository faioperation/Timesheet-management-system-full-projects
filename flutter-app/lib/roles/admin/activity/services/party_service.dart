import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/app/utils/urls.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';

class PartyService {

  static Future<bool> createParty({
    required String name,
    required String phone,
    required String email,
    required String zipCode,
    required String address,
    required String remarks,
    required String partyType,
  }) async {
    try {
      final uri = Uri.parse(Urls.createPartyListUrl);

      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        print("TOKEN IS NULL");
        return false;
      }

      final request = http.MultipartRequest('POST', uri);

      request.headers['Authorization'] = 'Bearer $token';
      request.headers['Accept'] = 'application/json';

      request.fields['name'] = name;
      request.fields['phone'] = phone;
      request.fields['email'] = email;
      request.fields['zip_code'] = zipCode;
      request.fields['address'] = address;
      request.fields['remarks'] = remarks;
      request.fields['party_type'] = partyType;

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      print("STATUS: ${response.statusCode}");
      print("BODY: $responseBody");

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print("EXCEPTION: $e");
      return false;
    }
  }

  static Future<Map<String, dynamic>> updateParty({
    required int partyId,
    required String name,
    required String phone,
    required String email,
    required String zipCode,
    required String address,
    required String remarks,
    required String partyType,
  }) async {
    try {
      final uri = Uri.parse(Urls.updatePartyUrl(partyId));

      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        return {
          'success': false,
          'message': 'Authentication token not found',
        };
      }

      // Laravel requires POST method with _method=PUT for PUT requests
      final request = http.MultipartRequest('POST', uri);

      request.headers['Authorization'] = 'Bearer $token';
      request.headers['Accept'] = 'application/json';

      // Add _method field for Laravel to recognize this as PUT request
      request.fields['_method'] = 'PUT';

      // Ensure fields are not empty before sending
      request.fields['name'] = name.trim();
      request.fields['phone'] = phone.trim();
      request.fields['email'] = email.trim();
      request.fields['zip_code'] = zipCode.trim();
      request.fields['address'] = address.trim();
      request.fields['remarks'] = remarks.trim();
      request.fields['party_type'] = partyType.trim();

      // Debug: Print fields being sent
      print("📤 UPDATE PARTY REQUEST:");
      print("   URL: $uri");
      print("   Fields: ${request.fields}");

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      print("📥 UPDATE PARTY STATUS: ${response.statusCode}");
      print("📥 UPDATE PARTY BODY: $responseBody");

      // Parse response
      Map<String, dynamic>? decoded;
      try {
        decoded = jsonDecode(responseBody);
      } catch (e) {
        print("❌ Failed to parse JSON: $e");
        // If status is success but can't parse, assume success
        if (response.statusCode == 200 || response.statusCode == 201) {
          return {
            'success': true,
            'message': 'Party updated successfully',
          };
        }
        return {
          'success': false,
          'message': 'Failed to update party. Invalid response from server.',
        };
      }

      // Check if decoded is null
      if (decoded == null) {
        if (response.statusCode == 200 || response.statusCode == 201) {
          return {
            'success': true,
            'message': 'Party updated successfully',
          };
        }
        return {
          'success': false,
          'message': 'Failed to update party. Invalid response from server.',
        };
      }

      // Check if response indicates success
      bool isSuccess = false;
      if (response.statusCode == 200 || response.statusCode == 201) {
        // Check if response has success field
        if (decoded.containsKey('success')) {
          isSuccess = decoded['success'] == true;
        } else {
          // If no success field but status is 200/201, assume success
          isSuccess = true;
        }
      }

      if (isSuccess) {
        return {
          'success': true,
          'message': decoded['message']?.toString() ?? 'Party updated successfully',
          'data': decoded['data'],
        };
      } else {
        // Extract error message
        String errorMessage = 'Failed to update party';
        
        if (decoded.containsKey('message')) {
          errorMessage = decoded['message']?.toString() ?? 'Failed to update party';
        } else if (decoded.containsKey('error')) {
          errorMessage = decoded['error']?.toString() ?? 'Failed to update party';
        } else if (decoded.containsKey('errors')) {
          final errors = decoded['errors'];
          if (errors is Map && errors.isNotEmpty) {
            // Extract first error message
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
      print("❌ EXCEPTION: $e");
      return {
        'success': false,
        'message': 'Error: $e',
      };
    }
  }
}
