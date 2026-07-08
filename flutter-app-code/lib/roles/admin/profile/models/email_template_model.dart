class EmailTemplateModel {
  final int id;
  final String templateName;
  final String templateType;
  final String subject;
  final String body;
  final String status;
  final int isLocked;
  final int businessId;
  final String createdAt;
  final String updatedAt;
  final List<int>? usedBy; // Role IDs that can use this template

  EmailTemplateModel({
    required this.id,
    required this.templateName,
    required this.templateType,
    required this.subject,
    required this.body,
    required this.status,
    required this.isLocked,
    required this.businessId,
    required this.createdAt,
    required this.updatedAt,
    this.usedBy,
  });

  factory EmailTemplateModel.fromJson(Map<String, dynamic> json) {
    List<int>? usedByList;
    try {
      if (json['used_by'] != null && json['used_by'] is List) {
        final usedByArray = json['used_by'] as List;
        // Check if it's an array of objects (with role_id) or array of integers
        if (usedByArray.isNotEmpty) {
          final firstItem = usedByArray[0];
          if (firstItem is Map<String, dynamic>) {
            // Array of objects: extract role_id from each object
            usedByList = usedByArray
                .map((e) {
                  if (e is Map<String, dynamic>) {
                    return e['role_id'] as int?;
                  }
                  return null;
                })
                .where((id) => id != null)
                .cast<int>()
                .toList();
          } else if (firstItem is int) {
            // Array of integers: use directly
            usedByList = usedByArray
                .map((e) => e as int)
                .toList();
          }
        }
      }
    } catch (e) {
      // If parsing used_by fails, just set it to null
      // Don't let this break the entire template parsing
      usedByList = null;
    }
    
    return EmailTemplateModel(
      id: json['id'] as int,
      templateName: json['template_name'] as String,
      templateType: json['template_type'] as String,
      subject: json['subject'] as String,
      body: json['body'] as String,
      status: json['status'] as String? ?? 'active',
      isLocked: json['is_locked'] as int? ?? 0,
      businessId: json['business_id'] as int,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      usedBy: usedByList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'template_name': templateName,
      'template_type': templateType,
      'subject': subject,
      'body': body,
      'status': status,
      'is_locked': isLocked,
      'business_id': businessId,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

class EmailTemplateResponse {
  final bool success;
  final List<EmailTemplateModel> templates;

  EmailTemplateResponse({
    required this.success,
    required this.templates,
  });

  factory EmailTemplateResponse.fromJson(Map<String, dynamic> json) {
    return EmailTemplateResponse(
      success: json['success'] as bool,
      templates: (json['data'] as List)
          .map((item) => EmailTemplateModel.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class CreateEmailTemplateResponse {
  final bool success;
  final String message;
  final EmailTemplateModel data;

  CreateEmailTemplateResponse({
    required this.success,
    required this.message,
    required this.data,
  });

  factory CreateEmailTemplateResponse.fromJson(Map<String, dynamic> json) {
    return CreateEmailTemplateResponse(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: EmailTemplateModel.fromJson(json['data'] as Map<String, dynamic>),
    );
  }
}
