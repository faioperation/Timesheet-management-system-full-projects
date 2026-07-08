class PermissionModel {
  final int id;
  final String name;
  final String guardName;
  final String createdAt;
  final String updatedAt;

  PermissionModel({
    required this.id,
    required this.name,
    required this.guardName,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PermissionModel.fromJson(Map<String, dynamic> json) {
    return PermissionModel(
      id: json['id'] as int,
      name: json['name'] as String,
      guardName: json['guard_name'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'guard_name': guardName,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

class PermissionResponse {
  final bool success;
  final List<PermissionModel> permissions;

  PermissionResponse({
    required this.success,
    required this.permissions,
  });

  factory PermissionResponse.fromJson(Map<String, dynamic> json) {
    return PermissionResponse(
      success: json['success'] as bool,
      permissions: (json['data'] as List)
          .map((item) => PermissionModel.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}
