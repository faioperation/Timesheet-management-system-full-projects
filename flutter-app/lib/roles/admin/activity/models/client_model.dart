class ClientModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String address;
  final String zipCode;
  final String remark;

  ClientModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.address,
    required this.zipCode,
    required this.remark,
});

  factory ClientModel.fromJson(Map <String,dynamic>json){
    return ClientModel(
        id: json['id'],
        name: json['name'] ?? "",
        email: json['email'] ?? "",
        phone: json['phone'] ?? "",
        address: json['address'] ?? "",
        zipCode: json['zip_code'] ?? "",
        remark: json['remarks'] ?? "",
    );
  }
}