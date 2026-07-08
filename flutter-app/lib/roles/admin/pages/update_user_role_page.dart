import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_profile_text_field.dart';
import 'package:timesheet_naresh/roles/admin/services/user_role_service.dart';
import '../models/user_model.dart';

class UpdateUserRolePage extends StatefulWidget {
  final UserModel user;

  const UpdateUserRolePage({
    super.key,
    required this.user,
  });

  @override
  State<UpdateUserRolePage> createState() => _UpdateUserRolePageState();
}

class _UpdateUserRolePageState extends State<UpdateUserRolePage> {
  int? selectedRoleId;
  bool isUpdating = false;

  // Role options: 2 = Business Admin, 3 = Staff, 4 = User
  final List<Map<String, dynamic>> roleOptions = [
    {'id': 2, 'name': 'Business Admin'},
    {'id': 3, 'name': 'Staff'},
    {'id': 4, 'name': 'User'},
  ];

  @override
  void initState() {
    super.initState();
    // Get current role ID from user's roles
    if (widget.user.roles.isNotEmpty) {
      selectedRoleId = widget.user.roles[0].id;
    } else {
      // Default to first role if no role assigned
      selectedRoleId = roleOptions[0]['id'] as int;
    }
  }

  Future<void> updateRole() async {
    if (selectedRoleId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a role'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => isUpdating = true);

    final result = await UserRoleService.updateUserRole(
      userId: widget.user.id,
      roleId: selectedRoleId!,
    );

    setState(() => isUpdating = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Role updated successfully'),
          backgroundColor: result['success'] == true ? Colors.green : Colors.red,
        ),
      );

      if (result['success'] == true) {
        Navigator.pop(context, true); // Return true to indicate success
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: CustomAppBar(title: "Update User Role"),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),

            // User Info Section (Read-only)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'User Information',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  CustomProfileTextField(
                    label: "Name",
                    controller: TextEditingController(text: widget.user.name),
                    readOnly: true,
                    hintText: "User Name",
                  ),
                  const SizedBox(height: 16),
                  CustomProfileTextField(
                    label: "Email",
                    controller: TextEditingController(text: widget.user.email),
                    readOnly: true,
                    keyboardType: TextInputType.emailAddress,
                    hintText: "User Email",
                  ),
                  const SizedBox(height: 16),
                  CustomProfileTextField(
                    label: "Phone",
                    controller: TextEditingController(text: widget.user.phone ?? ''),
                    readOnly: true,
                    keyboardType: TextInputType.phone,
                    hintText: "User Phone",
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Role Selection
            const Text(
              "Select Role",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: DropdownButtonFormField<int>(
                value: selectedRoleId,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
                items: roleOptions.map((role) {
                  return DropdownMenuItem<int>(
                    value: role['id'] as int,
                    child: Text(role['name'] as String),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedRoleId = value;
                  });
                },
                hint: const Text('Select Role'),
              ),
            ),

            const SizedBox(height: 32),

            // Update Button
            CustomButton(
              title: isUpdating ? "Updating..." : "Update Role",
              onPressed: updateRole,
            ),
          ],
        ),
      ),
    );
  }
}
