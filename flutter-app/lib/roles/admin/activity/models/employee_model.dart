class EmployeeModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String address;
  final String zipCode;
  final String remark;

  EmployeeModel({
    required this.id,
    required this.name,
    required this.phone,
    required this.address,
    required this.zipCode,
    required this.remark,
    required this.email,
  });

  factory EmployeeModel.fromJson(Map<String, dynamic> json) {
    return EmployeeModel(
      id: json['id'],
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      zipCode: json['zip_code'] ?? '',
      remark: json['remarks'] ?? '',
      email: json['email']??'',
    );
  }
}