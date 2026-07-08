import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_cancel_button.dart';
import 'package:timesheet_naresh/roles/admin/widgets/custom_text_field_for_assign_client.dart';
import '../services/party_service.dart';
import '../models/employee_model.dart';

class AddEmployeeScreen extends StatefulWidget {
  final EmployeeModel? existingEmployee; // For edit mode

  const AddEmployeeScreen({super.key, this.existingEmployee});

  @override
  State<AddEmployeeScreen> createState() => _AddEmployeeScreenState();
}

class _AddEmployeeScreenState extends State<AddEmployeeScreen> {
  late TextEditingController nameController;
  late TextEditingController phoneController;
  late TextEditingController emailController;
  late TextEditingController zipController;
  late TextEditingController addressController;
  late TextEditingController remarkController;

  final String partyType = 'employee';
  bool isLoading = false;
  bool get isEditMode => widget.existingEmployee != null;

  @override
  void initState() {
    super.initState();
    // Initialize controllers with existing data if in edit mode
    nameController = TextEditingController(text: widget.existingEmployee?.name ?? '');
    phoneController = TextEditingController(text: widget.existingEmployee?.phone ?? '');
    emailController = TextEditingController(text: widget.existingEmployee?.email ?? '');
    zipController = TextEditingController(text: widget.existingEmployee?.zipCode ?? '');
    addressController = TextEditingController(text: widget.existingEmployee?.address ?? '');
    remarkController = TextEditingController(text: widget.existingEmployee?.remark ?? '');
  }

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    emailController.dispose();
    zipController.dispose();
    addressController.dispose();
    remarkController.dispose();
    super.dispose();
  }

  void clearAllFields() {
    nameController.clear();
    phoneController.clear();
    emailController.clear();
    zipController.clear();
    addressController.clear();
    remarkController.clear();
  }

  Future<void> submitEmployee() async {
    // Get trimmed values
    final name = nameController.text.trim();
    final phone = phoneController.text.trim();
    final email = emailController.text.trim();
    final zipCode = zipController.text.trim();
    final address = addressController.text.trim();
    final remarks = remarkController.text.trim();

    // Validate required fields
    if (name.isEmpty ||
        phone.isEmpty ||
        zipCode.isEmpty ||
        address.isEmpty ||
        remarks.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All fields except email are required')),
      );
      return;
    }

    if (!mounted) return;

    setState(() => isLoading = true);

    try {
      Map<String, dynamic> result;
      
      if (isEditMode) {
        // Update existing employee
        print("📤 Updating Employee:");
        print("   Name: $name");
        print("   Phone: $phone");
        print("   Email: $email");
        print("   ZipCode: $zipCode");
        print("   Address: $address");
        print("   Remarks: $remarks");
        print("   PartyType: $partyType");
        
        result = await PartyService.updateParty(
          partyId: widget.existingEmployee!.id,
          name: name,
          phone: phone,
          email: email.isEmpty ? '' : email,
          zipCode: zipCode,
          address: address,
          remarks: remarks,
          partyType: partyType,
        );
      } else {
        // Create new employee
        print("📤 Creating Employee:");
        print("   Name: $name");
        print("   Phone: $phone");
        print("   Email: $email");
        print("   ZipCode: $zipCode");
        print("   Address: $address");
        print("   Remarks: $remarks");
        print("   PartyType: $partyType");
        
        final success = await PartyService.createParty(
          name: name,
          phone: phone,
          email: email.isEmpty ? '' : email,
          zipCode: zipCode,
          address: address,
          remarks: remarks,
          partyType: partyType,
        );
        result = {'success': success};
      }

      if (!mounted) return;
      setState(() => isLoading = false);

      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? (isEditMode ? 'Employee updated successfully' : 'Employee added successfully')),
            backgroundColor: Colors.green,
          ),
        );
        if (!isEditMode) clearAllFields();
        Navigator.pop(context, true);
      } else {
        final errorMsg = result['message'] ?? (isEditMode ? 'Failed to update employee' : 'Failed to add employee');
        print("❌ Employee Update Error: $errorMsg");
        print("❌ Full result: $result");
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
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
            CustomAppBar(title: isEditMode ? "Update Employee" : "Add New Employee"),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                child: Column(
                  children: [
                    CustomTextFieldForAssignClient(
                      label: "Employee Name",
                      hintText: "Enter employee name",
                      controller: nameController,
                      isRequired: true,
                    ),
                    CustomTextFieldForAssignClient(
                      label: "Employee Phone",
                      hintText: "Enter employee phone",
                      controller: phoneController,
                      isRequired: true,
                    ),
                    CustomTextFieldForAssignClient(
                      label: "Employee Email",
                      hintText: "Enter employee email (optional)",
                      controller: emailController,
                      isRequired: false,
                    ),
                    CustomTextFieldForAssignClient(
                      label: "Zip Code",
                      hintText: "Enter zip code",
                      controller: zipController,
                      isRequired: true,
                    ),
                    CustomTextFieldForAssignClient(
                      label: "Employee Address",
                      hintText: "Enter employee address",
                      controller: addressController,
                      isRequired: true,
                    ),
                    CustomTextFieldForAssignClient(
                      label: "Remark",
                      hintText: "Enter remark",
                      controller: remarkController,
                      isRequired: true,
                    ),

                    const SizedBox(height: 24),

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
                          child: CustomButton(
                            title: isLoading ? "Please wait..." : (isEditMode ? "Update Employee" : "Add Employee"),
                            onPressed: submitEmployee,
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
