class InternalUserModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String? rateType; // nullable
  final String? rate;     // nullable
  final String? commissionOn; // nullable
  final String? gender;   // nullable

  InternalUserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.rateType,
    this.rate,
    this.commissionOn,
    this.gender,
  });

  factory InternalUserModel.fromJson(Map<String, dynamic> json) {
    return InternalUserModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? '',
      rateType: json['rate_type'], // can be null
      rate: json['rate'],          // can be null
      commissionOn: json['commission_on'], // can be null
      gender: json['gender'],      // can be null
    );
  }

  static List<InternalUserModel> fromJsonList(List<dynamic> list) {
    return list.map((e) => InternalUserModel.fromJson(e)).toList();
  }
}
