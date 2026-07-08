import 'dart:io';
import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_cancel_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_file_upload_field.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/internal_user_service.dart';
import 'package:timesheet_naresh/roles/admin/widgets/custom_text_field_for_assign_client.dart';
import '../models/internal_user_model.dart';

class AddInternalUserScreen extends StatefulWidget {
  final InternalUserModel? existingUser; // For edit mode

  const AddInternalUserScreen({super.key, this.existingUser});

  @override
  State<AddInternalUserScreen> createState() => _AddInternalUserScreenState();
}

class _AddInternalUserScreenState extends State<AddInternalUserScreen> {
  late TextEditingController nameController;
  late TextEditingController emailController;
  late TextEditingController phoneController;
  late TextEditingController rateController;
  late TextEditingController passwordController;

  String selectedGender = '';
  String selectedRole = '';
  String selectedCommissionOn = '';
  String selectedRateType = '';
  String selectedRecursive = '';
  String selectedMonth = 'february'; // Default month
  String? imageFilePath;
  File? imageFile;

  bool get isEditMode => widget.existingUser != null;

  @override
  void initState() {
    super.initState();
    // Initialize controllers
    nameController = TextEditingController();
    emailController = TextEditingController();
    phoneController = TextEditingController();
    rateController = TextEditingController();
    passwordController = TextEditingController();

    // Pre-fill data if in edit mode
    if (isEditMode) {
      final user = widget.existingUser!;
      nameController.text = user.name;
      emailController.text = user.email;
      phoneController.text = user.phone;
      rateController.text = user.rate ?? '';
      selectedGender = user.gender ?? '';
      selectedRole = user.role;
      selectedCommissionOn = user.commissionOn ?? '';
      selectedRateType = user.rateType ?? '';
      selectedRecursive = '0'; // Default, will be updated if needed
      selectedMonth = 'february';
    }
  }

  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    rateController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  final List<String> genderList = ['male', 'female'];
  final List<String> roleList = ['bd_manager', 'ac_manager', 'recruiter'];
  final List<String> commissionList = ['gross-margin', 'net-margin'];
  final List<String> rateTypeList = ['percentage', 'fixed'];
  final List<String> recursiveList = ['0', '1'];
  final List<String> monthList = ['all_months', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  bool isLoading = false;

  void clearAllFields() {
    nameController.clear();
    emailController.clear();
    phoneController.clear();
    rateController.clear();
    setState(() {
      selectedGender = '';
      selectedRole = '';
      selectedCommissionOn = '';
      selectedRateType = '';
      selectedRecursive = '';
      selectedMonth = 'february';
      imageFilePath = null;
      imageFile = null;
    });
  }

  Future<void> handleAddInternalUser() async {
    // Validation
    if (nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter name')),
      );
      return;
    }

    if (emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter email')),
      );
      return;
    }

    if (phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter phone')),
      );
      return;
    }

    if (selectedGender.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select gender')),
      );
      return;
    }

    if (selectedRole.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select role')),
      );
      return;
    }

    if (rateController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter rate')),
      );
      return;
    }

    if (selectedCommissionOn.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select commission on')),
      );
      return;
    }

    if (selectedRateType.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select rate type')),
      );
      return;
    }

    if (selectedRecursive.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select recursive')),
      );
      return;
    }

    // If recursive is "1", month should be selected, otherwise use "all_months"
    final monthValue = selectedRecursive == '1' ? selectedMonth : 'all_months';

    if (!mounted) return;
    setState(() => isLoading = true);

    try {
      Map<String, dynamic> result;
      
      if (isEditMode) {
        // Update existing internal user
        result = await InternalUserService.updateInternalUser(
          internalUserId: widget.existingUser!.id,
          name: nameController.text.trim(),
          email: emailController.text.trim(),
          password: passwordController.text.trim().isNotEmpty ? passwordController.text.trim() : null,
          phone: phoneController.text.trim(),
          gender: selectedGender,
          role: selectedRole,
          rate: rateController.text.trim(),
          commissionOn: selectedCommissionOn,
          rateType: selectedRateType,
          recuesive: selectedRecursive,
          month: monthValue,
          imageFile: imageFile,
        );
      } else {
        // Create new internal user
        result = await InternalUserService.createInternalUser(
          name: nameController.text.trim(),
          email: emailController.text.trim(),
          phone: phoneController.text.trim(),
          gender: selectedGender,
          role: selectedRole,
          rate: rateController.text.trim(),
          commissionOn: selectedCommissionOn,
          rateType: selectedRateType,
          recuesive: selectedRecursive,
          month: monthValue,
          imageFile: imageFile,
        );
      }

      if (!mounted) return;
      setState(() => isLoading = false);

      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? (isEditMode ? 'Internal user updated successfully' : 'Internal user created successfully')),
            backgroundColor: Colors.green,
          ),
        );
        if (!isEditMode) clearAllFields();
        Navigator.pop(context, true); // Return true to indicate success
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? (isEditMode ? 'Failed to update internal user' : 'Failed to create internal user')),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth < 600 ? 8.0 : 24.0;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      body: SafeArea(
        child: Column(
          children: [
            CustomAppBar(title: isEditMode ? "Update Internal User" : "Add Internal User"),

            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                child: Column(
                  children: [
                    CustomTextFieldForAssignClient(
                      label: "Name",
                      hintText: "Enter your name",
                      controller: nameController,
                      isRequired: true,
                    ),

                    CustomTextFieldForAssignClient(
                      label: "Email",
                      hintText: "Enter your email",
                      controller: emailController,
                      isRequired: true,
                    ),

                    // Password field (optional for edit mode)
                    if (isEditMode)
                      CustomTextFieldForAssignClient(
                        label: "Password",
                        hintText: "Enter new password (leave empty to keep current)",
                        controller: passwordController,
                        isRequired: false,
                        isPassword: true,
                      ),

                    Row(
                      children: [
                        Expanded(
                          child: CustomTextFieldForAssignClient(
                            label: 'Phone',
                            controller: phoneController,
                            hintText: 'Enter phone number',
                            isRequired: true,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: CustomTextFieldForAssignClient(
                            label: 'Gender',
                            hintText: 'Select gender',
                            isDropdown: true,
                            isRequired: true,
                            dropdownItems: genderList,
                            onChanged: (value) {
                              setState(() {
                                selectedGender = value ?? '';
                              });
                            },
                          ),
                        ),
                      ],
                    ),

                    CustomTextFieldForAssignClient(
                      label: "Role",
                      hintText: "Select role",
                      isDropdown: true,
                      isRequired: true,
                      dropdownItems: roleList,
                      onChanged: (value) {
                        setState(() {
                          selectedRole = value ?? '';
                        });
                      },
                    ),

                    // Image Upload Field (nullable)
                    CustomFileUploadField(
                      label: "Image (Optional)",
                      icon: Icons.image,
                      onFileSelected: (filePath) {
                        if (filePath != null) {
                          setState(() {
                            imageFilePath = filePath;
                            imageFile = File(filePath);
                          });
                        }
                      },
                    ),
                    if (imageFilePath != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          'Selected: ${imageFilePath!.split('/').last}',
                          style: const TextStyle(fontSize: 12, color: Colors.green),
                        ),
                      ),

                    const SizedBox(height: 16),

                    CustomTextFieldForAssignClient(
                      label: 'Rate',
                      controller: rateController,
                      hintText: 'Enter rate',
                      isRequired: true,
                    ),

                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                          child: CustomTextFieldForAssignClient(
                            label: 'Commission On',
                            hintText: 'Select commission on',
                            isDropdown: true,
                            isRequired: true,
                            dropdownItems: commissionList,
                            onChanged: (value) {
                              setState(() {
                                selectedCommissionOn = value ?? '';
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: CustomTextFieldForAssignClient(
                            label: 'Rate Type',
                            hintText: 'Select rate type',
                            isDropdown: true,
                            isRequired: true,
                            dropdownItems: rateTypeList,
                            onChanged: (value) {
                              setState(() {
                                selectedRateType = value ?? '';
                              });
                            },
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                          child: CustomTextFieldForAssignClient(
                            label: 'Recursive',
                            hintText: 'Select recursive (0 or 1)',
                            isDropdown: true,
                            isRequired: true,
                            dropdownItems: recursiveList,
                            onChanged: (value) {
                              setState(() {
                                selectedRecursive = value ?? '';
                                // Reset month to default when recursive changes
                                if (selectedRecursive == '0') {
                                  selectedMonth = 'all_months';
                                } else if (selectedRecursive == '1' && selectedMonth == 'all_months') {
                                  selectedMonth = 'february';
                                }
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: CustomTextFieldForAssignClient(
                            label: 'Month',
                            hintText: 'Select month',
                            isDropdown: true,
                            isRequired: selectedRecursive == '1',
                            dropdownItems: monthList,
                            onChanged: (value) {
                              setState(() {
                                selectedMonth = value ?? 'february';
                              });
                            },
                          ),
                        ),
                      ],
                    ),

                    SizedBox(height: 16,),

                    Row(
                      children: [
                        Expanded(
                          child: CancelCustomButton(
                            title: "Cancel",
                            onPressed: clearAllFields,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: isLoading
                              ? const Center(child: CircularProgressIndicator())
                              : CustomButton(
                                  title: isLoading ? "Please wait..." : (isEditMode ? "Update Internal User" : "Add Internal User"),
                                  onPressed: handleAddInternalUser,
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
    );
  }
}
