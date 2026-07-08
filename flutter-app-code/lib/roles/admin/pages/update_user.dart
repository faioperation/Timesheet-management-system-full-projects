import 'package:flutter/material.dart';
import '../../../common/widgets/custom_profile_text_field.dart';
import '../models/user_model.dart';
import '../services/admin_service.dart';

class UpdateUserPage extends StatefulWidget {
  final UserModel user;

  const UpdateUserPage({super.key, required this.user});

  @override
  State<UpdateUserPage> createState() => _UpdateUserPageState();
}

class _UpdateUserPageState extends State<UpdateUserPage> {
  late TextEditingController nameController;
  late TextEditingController usernameController;
  late TextEditingController emailController;
  late TextEditingController phoneController;
  late TextEditingController genderController;
  late TextEditingController maritalController;
  late TextEditingController statusController;

  int? selectedRoleId;
  List<RoleModel> roles = [];

  @override
  void initState() {
    super.initState();

    nameController = TextEditingController(text: widget.user.name);
    usernameController = TextEditingController(text: widget.user.username ?? "");
    emailController = TextEditingController(text: widget.user.email);
    phoneController = TextEditingController(text: widget.user.phone ?? "");
    genderController = TextEditingController(text: widget.user.gender ?? "");
    maritalController = TextEditingController(text: widget.user.maritalStatus ?? "");
    statusController = TextEditingController(text: widget.user.status ?? "");

    // Initially selected role
    selectedRoleId = int.tryParse(widget.user.roleId.toString());

    fetchRoles();
  }

  Future<void> fetchRoles() async {
    try {
      final data = await AdminService.fetchRoles(); // List<dynamic>
      if (mounted) {
        setState(() {
          roles = data.map((e) => RoleModel.fromJson(e)).toList(); // List<RoleModel>
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Failed to load roles: $e")),
        );
      }
    }
  }

// Delete function
  Future<void> deleteUser() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Confirm Delete"),
        content: const Text("Are you sure you want to delete this user?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Delete"),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    if (!mounted) return;

    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await AdminService.deleteUser(userId: widget.user.id);
      if (!mounted) return;
      Navigator.pop(context); // close loading

      if (response["success"] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("User deleted successfully")),
          );
          Navigator.pop(context, true); // go back after delete
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response["message"] ?? "Delete failed")),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // close loading
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: $e")),
        );
      }
    }
  }


  Future<void> updateUserInfo() async {
    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final body = {
        "name": nameController.text,
        "username": usernameController.text,
        "email": emailController.text,
        "phone": phoneController.text,
        "gender": genderController.text,
        "marital_status": maritalController.text,
        "status": statusController.text,
        "role_id": selectedRoleId.toString(),
      };

      final response = await AdminService.updateUser(widget.user.id, body);
      
      if (!mounted) return;
      Navigator.pop(context);

      if (response["success"] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("User updated successfully")),
          );
          Navigator.pop(context, true);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response["message"] ?? "Update failed")),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Update User")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            children: [
              CustomProfileTextField(
                label: "Name",
                controller: nameController,
                hintText: "Enter Your Name",
              ),
              CustomProfileTextField(
                label: "Username",
                controller: usernameController,
                hintText: "Enter Username",
              ),
              CustomProfileTextField(
                readOnly: true,
                label: "Email",
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                hintText: "Show Email Here",
              ),
              CustomProfileTextField(
                label: "Phone",
                controller: phoneController,
                keyboardType: TextInputType.phone,
                hintText: "Enter Your Phone",
              ),
              CustomProfileTextField(
                label: "Gender",
                controller: genderController,
                hintText: "Male / Female",
              ),
              CustomProfileTextField(
                label: "Marital Status",
                controller: maritalController,
                hintText: "single / married",
              ),
              CustomProfileTextField(
                label: "Status",
                controller: statusController,
                hintText: "approved / pending / rejected",
              ),

              const SizedBox(height: 16),

              // Role Dropdown
              DropdownButtonFormField<int>(
                value: selectedRoleId,
                decoration: const InputDecoration(
                  labelText: "Role",
                  border: OutlineInputBorder(),
                ),
                items: roles.map((role) {
                  return DropdownMenuItem(
                    value: role.id,
                    child: Text(role.name),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedRoleId = value;
                  });
                },
              ),


              const SizedBox(height: 20),

              Row(
                children: [

                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
                      onPressed:deleteUser ,
                      child: const Text("Delete User"),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: updateUserInfo,
                      child: const Text("Update User"),
                    ),
                  ),


                ],
              ),


            ],
          ),
        ),
      ),
    );
  }
}
