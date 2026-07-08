import 'package:flutter/material.dart';
import 'package:timesheet_naresh/roles/admin/pages/edit_profile.dart';
import 'package:timesheet_naresh/roles/admin/pages/profile_page.dart';
import '../../app/constants.dart';

class AdminProfileCard extends StatelessWidget {
  final String avatarUrl;
  final String userName;
  final String email;
  final String button;
  final String role;
  final VoidCallback onViewPressed; // ✅ add this


  const AdminProfileCard({
    super.key,
    required this.avatarUrl,
    required this.userName,
    required this.role,
    required this.email,
    required this.button,
    required this.onViewPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Color(0xFFEEEEEE), width: 1.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar
          ClipOval(
            child: Image.network(
              avatarUrl,
              width: 40,
              height: 40,
              fit: BoxFit.cover,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return const CircleAvatar(
                  radius: 20,
                  backgroundColor: Colors.grey,
                  child: Center(
                    child: SizedBox(
                      width: 15,
                      height: 15,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    ),
                  ),
                );
              },
              errorBuilder: (context, error, stackTrace) => const CircleAvatar(
                radius: 20,
                backgroundColor: Colors.red,
                child: Icon(Icons.person, color: Colors.white, size: 20),
              ),
            ),
          ),
          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Flexible(
                      child: Text(
                        userName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      role,
                      style: role == 'Supervisor'
                          ? AppTextStyles.roleSupervisor
                          : AppTextStyles.roleUser,
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                // Email + Button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Flexible(
                      child: Text(
                        email,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    InkWell(
                      onTap: onViewPressed,
                      child: Text(
                        button,
                        style: const TextStyle(color: Color.fromRGBO(13, 32, 128, 1)),
                      ),
                    ),


                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


class CustomDropdownFilter extends StatelessWidget {
  final String value;
  final void Function()? onTap;

  const CustomDropdownFilter({
    super.key,
    required this.value,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(
              Icons.arrow_drop_down,
              size: 24,
            ),
          ],
        ),
      ),
    );
  }
}