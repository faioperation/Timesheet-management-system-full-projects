import 'package:flutter/material.dart';

import '../../app/constants.dart';
class ActivityItemCard extends StatelessWidget {
  final String avatarUrl;
  final String activityType;
  final String userName;
  final String date;
  final String role;

  const ActivityItemCard({
    super.key,
    required this.avatarUrl,
    required this.activityType,
    required this.userName,
    required this.date,
    required this.role,
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
        children: <Widget>[
          // Profile Avatar (Image.network ব্যবহার করে)
          ClipOval(
            child: Image.network(
              avatarUrl,
              width: 40,
              height: 40,
              fit: BoxFit.cover,
              // লোডিং এবং এররের জন্য ডিফল্ট উইজেট
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return const CircleAvatar(
                  radius: 20,
                  backgroundColor: Colors.grey,
                  child: Center(child: SizedBox(
                      width: 15, height: 15,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)
                  )),
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

          // Activity Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  activityType,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  userName,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),

          // Date and Role
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              Text(
                date,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                role,
                style: role == 'Supervisor'
                    ? AppTextStyles.roleSupervisor
                    : AppTextStyles.roleUser,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ===============================================
// REUSABLE COMPONENT: Custom Dropdown Filter (All/Activities)
// ===============================================

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