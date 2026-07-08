class UserModel {
  final int id;
  final String name;
  final String username;
  final String email;
  final String? emailVerifiedAt;
  final String? phone;
  final String? gender;
  final int businessId;
  final String? image;
  final String? signature;
  final String? maritalStatus;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<RoleModel> roles;
  final int roleId;


  UserModel({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    this.emailVerifiedAt,
    this.phone,
    this.gender,
    required this.businessId,
    this.image,
    this.signature,
    this.maritalStatus,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    required this.roles,
    required this.roleId,


  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      name: json['name'],
      username: json['username'],
      email: json['email'],
      emailVerifiedAt: json['email_verified_at'],
      phone: json['phone'],
      gender: json['gender'],
      businessId: json['business_id'],
      roleId: json["role_id"] ?? 1,
      image: json['image'],
      signature: json['signature'],
      maritalStatus: json['marital_status'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      roles: json['roles'] != null
          ? List<RoleModel>.from(json['roles'].map((r) => RoleModel.fromJson(r)))
          : [],
    );
  }
}

class RoleModel {
  final int id;
  final String name;
  final String guardName;

  RoleModel({
    required this.id,
    required this.name,
    required this.guardName,
  });

  factory RoleModel.fromJson(Map<String, dynamic> json) {
    return RoleModel(
      id: json['id'],
      name: json['name'],
      guardName: json['guard_name'],
    );
  }
}
