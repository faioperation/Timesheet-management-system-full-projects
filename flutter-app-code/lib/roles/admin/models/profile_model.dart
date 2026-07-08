class ProfileModel {
  final int id;
  final String name;
  final String? username;
  final String email;
  final String? phone;
  final String? gender;
  final String? image;
  final String? signature;
  final String? maritalStatus;
  final String status;

  ProfileModel({
    required this.id,
    required this.name,
    this.username,
    required this.email,
    this.phone,
    this.gender,
    this.image,
    this.signature,
    this.maritalStatus,
    required this.status,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'],
      name: json['name'] ?? "",
      username: json['username'],
      email: json['email'],
      phone: json['phone'],
      gender: json['gender'],
      image: json['image'],
      signature: json['signature'],
      maritalStatus: json['marital_status'],
      status: json['status'] ?? "",
    );
  }
}
