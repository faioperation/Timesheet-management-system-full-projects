import 'dart:ui';

class UserModelUser {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String status;
  final VoidCallback onView;
  final int? userDetailsId;
  final num? clientRate;

  UserModelUser({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    required this.status,
    required this.onView,
    this.userDetailsId,
    this.clientRate,
  });
}
