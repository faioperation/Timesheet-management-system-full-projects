import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_cancel_button.dart';
import 'package:timesheet_naresh/roles/admin/pages/pop_up_page.dart';
import 'package:timesheet_naresh/roles/admin/widgets/custom_text_field_for_assign_client.dart';
import '../services/admin_service.dart';

class AddUserScreen extends StatefulWidget {
  const AddUserScreen({super.key});

  @override
  State<AddUserScreen> createState() => _AddUserScreenState();
}

class _AddUserScreenState extends State<AddUserScreen> {

  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();

  String selectedGender = '';
  String selectedRole = '';

  List<dynamic> roles = [];
  bool isLoadingRoles = true;

  @override
  void initState() {
    super.initState();
    loadRoles();
  }

  Future<void> loadRoles() async {
    try {
      final result = await AdminService.fetchRoles();

      setState(() {
        roles = result;
        isLoadingRoles = false;
      });
    } catch (e) {
      setState(() => isLoadingRoles = false);
      print("Role load failed: $e");
    }
  }

  void clearAllFields() {
    nameController.clear();
    emailController.clear();
    phoneController.clear();
    passwordController.clear();
    confirmPasswordController.clear();
    setState(() {
      selectedGender = '';
      selectedRole = '';
    });
  }

  Future<void> handleAddUser(BuildContext context) async {
    if (passwordController.text != confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Password does not match")),
      );
      return;
    }

    if (selectedRole.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select a role")),
      );
      return;
    }

    if (nameController.text.isEmpty ||
        emailController.text.isEmpty ||
        phoneController.text.isEmpty ||
        selectedGender.isEmpty ||
        passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill all required fields")),
      );
      return;
    }

    try {
      final response = await AdminService.createUser(
        name: nameController.text,
        email: emailController.text,
        phone: phoneController.text,
        gender: selectedGender,
        role_id: selectedRole,
        password: passwordController.text,
      );

      if (response['success']) {
        final userDetailsId = response['data']?['user_details']?['id'];
        clearAllFields();
        showSuccessDialog(context, userDetailsId);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response['message'] ?? "Something went wrong")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth < 600 ? 8.0 : 24.0;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              const CustomAppBar(title: "Add User"),

              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(horizontalPadding),
                  child: Column(
                    children: [
                      CustomTextFieldForAssignClient(
                        label: "Name",
                        hintText: "Enter Your Name",
                        controller: nameController,
                        isRequired: true,
                      ),
                      CustomTextFieldForAssignClient(
                        label: "Email",
                        controller: emailController,
                        hintText: "Enter Your Email",
                        isRequired: true,
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: CustomTextFieldForAssignClient(
                              label: 'Phone',
                              isRequired: true,
                              controller: phoneController,
                              hintText: 'Enter Your Phone',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: CustomTextFieldForAssignClient(
                              label: 'Gender',
                              isDropdown: true,
                              isRequired: true,
                              hintText: 'Select Gender',
                              dropdownItems: ['Male', 'Female', 'Other'],
                              onChanged: (value) {
                                setState(() {
                                  selectedGender = value!.toLowerCase();
                                });
                              },
                            ),
                          ),
                        ],
                      ),

                      isLoadingRoles
                          ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: Center(child: CircularProgressIndicator()),
                      )
                          : CustomTextFieldForAssignClient(
                        label: "Role",
                        hintText: "Select Role",
                        isRequired: true,
                        isDropdown: true,

                        dropdownItems: roles.map<String>((r) => r['name'].toString()).toList(),
                        onChanged: (value) {
                          setState(() {
                            selectedRole = roles.firstWhere((r) => r['name'] == value)['id'].toString();
                          });
                        },

                      ),

                      CustomTextFieldForAssignClient(
                        label: 'Password',
                        controller: passwordController,
                        isPassword: true,
                        hintText: 'Enter Your Pass',
                      ),
                      const SizedBox(width: 12),
                      CustomTextFieldForAssignClient(
                        label: 'Confirm Password',
                        controller: confirmPasswordController,
                        isPassword: true,
                        hintText: 'Enter Your Confirm Pass',
                        isRequired: true,
                      ),
                      const SizedBox(height: 20),

                      Row(
                        children: [
                          Expanded(
                            child: CancelCustomButton(
                              title: "Cancel",
                              onPressed: clearAllFields,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: CustomButton(
                              title: "Add User",
                              onPressed: () => handleAddUser(context),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
