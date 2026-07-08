class CompanyModel {
  final int id;
  final String name;
  final String slug;
  final int ownerId;
  final String email;
  final String? logo;
  final String phone;
  final String? address;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  CompanyModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.ownerId,
    required this.email,
    this.logo,
    required this.phone,
    this.address,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CompanyModel.fromJson(Map<String, dynamic> json) {
    return CompanyModel(
      id: json['id'],
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      ownerId: json['owner_id'] ?? 0,
      email: json['email'] ?? '',
      logo: json['logo'],
      phone: json['phone'] ?? '',
      address: json['address'],
      status: json['status'] ?? 'active',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'owner_id': ownerId,
      'email': email,
      'logo': logo,
      'phone': phone,
      'address': address,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
