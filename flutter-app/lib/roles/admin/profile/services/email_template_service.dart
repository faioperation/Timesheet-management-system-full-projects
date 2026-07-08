import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/common/services/auth_interceptor.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/profile/models/email_template_model.dart';
import '../../../../app/utils/urls.dart';

class EmailTemplateService {
  /// Fetch all email templates
  static Future<EmailTemplateResponse> getEmailTemplates() async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.emailTemplateUrl);

      final response = await AuthInterceptor.get(
        uri,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return EmailTemplateResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load email templates: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching email templates: $e');
    }
  }

  /// Create a new email template
  static Future<CreateEmailTemplateResponse> createEmailTemplate({
    required String templateName,
    required String templateType,
    required String subject,
    required String body,
    required List<int> usedBy,
  }) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.emailTemplateUrl);

      final requestBody = jsonEncode({
        'template_name': templateName,
        'template_type': templateType,
        'subject': subject,
        'body': body,
        'used_by': usedBy,
      });

      final response = await AuthInterceptor.post(
        uri,
        body: requestBody,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return CreateEmailTemplateResponse.fromJson(jsonData);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Failed to create email template: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error creating email template: $e');
    }
  }

  /// Update an existing email template
  static Future<CreateEmailTemplateResponse> updateEmailTemplate({
    required int templateId,
    required String templateName,
    required String templateType,
    required String subject,
    required String body,
    required List<int> usedBy,
  }) async {
    try {
      final token = await TokenService.getToken();

      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.updateEmailTemplateUrl(templateId));

      final requestBody = jsonEncode({
        'template_name': templateName,
        'template_type': templateType,
        'subject': subject,
        'body': body,
        'used_by': usedBy,
      });

      final response = await AuthInterceptor.put(
        uri,
        body: requestBody,
        context: null, // Will use global navigator key
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        return CreateEmailTemplateResponse.fromJson(jsonData);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Failed to update email template: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating email template: $e');
    }
  }
}
