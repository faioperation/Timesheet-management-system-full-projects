// import 'package:flutter/material.dart';
// import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
// import 'package:timesheet_naresh/common/widgets/custom_button.dart';
// import 'package:timesheet_naresh/common/widgets/custom_cancel_button.dart';
// import 'package:timesheet_naresh/roles/admin/widgets/custom_text_field_for_assign_client.dart';
//
// class AddClientScreen extends StatefulWidget {
//   const AddClientScreen({super.key});
//
//   @override
//   State<AddClientScreen> createState() => _AddClientScreenState();
// }
//
// class _AddClientScreenState extends State<AddClientScreen> {
//   final TextEditingController nameController = TextEditingController();
//   final TextEditingController phoneController = TextEditingController();
//   final TextEditingController zipController = TextEditingController();
//   final TextEditingController addressController = TextEditingController();
//   final TextEditingController remarkController = TextEditingController();
//
//   void clearAllFields() {
//     nameController.clear();
//     zipController.clear();
//     phoneController.clear();
//     addressController.clear();
//     remarkController.clear();
//   }
//
//   void onAddUser() {
//     ScaffoldMessenger.of(context).showSnackBar(
//       const SnackBar(content: Text('Add User clicked (Static UI)')),
//     );
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     final screenWidth = MediaQuery.of(context).size.width;
//     final horizontalPadding = screenWidth < 600 ? 8.0 : 24.0;
//
//     return Scaffold(
//       backgroundColor: const Color(0xFFF4F4F4),
//       body: SafeArea(
//         child: Column(
//           children: [
//             const CustomAppBar(title: "Add New Client"),
//
//             Expanded(
//               child: SingleChildScrollView(
//                 padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
//                 child: Column(
//                   children: [
//                     CustomTextFieldForAssignClient(
//                       label: "Name",
//                       hintText: "Enter your name",
//                       controller: nameController,
//                       isRequired: true,
//                     ),
//                     CustomTextFieldForAssignClient(
//                       label: 'Phone',
//                       controller: phoneController,
//                       hintText: 'Enter phone number',
//                       isRequired: true,
//                     ),
//                     CustomTextFieldForAssignClient(
//                       label: "Zip Code",
//                       hintText: "Enter your name",
//                       controller: zipController,
//                       isRequired: true,
//                     ),
//                     CustomTextFieldForAssignClient(
//                       label: 'Address',
//                       controller: addressController,
//                       hintText: 'Enter phone number',
//                       isRequired: true,
//                     ),
//                     CustomTextFieldForAssignClient(
//                       label: 'Remark',
//                       controller: remarkController,
//                       hintText: 'Enter phone number',
//                       isRequired: true,
//                     ),
//
//                     const SizedBox(height: 24),
//
//                     Row(
//                       children: [
//                         Expanded(
//                           child: CancelCustomButton(
//                             title: "Cancel",
//                             onPressed: clearAllFields,
//                           ),
//                         ),
//                         const SizedBox(width: 12),
//                         Expanded(
//                           child: CustomButton(
//                             title: "Add User",
//                             onPressed: onAddUser,
//                           ),
//                         ),
//                       ],
//                     ),
//
//                     const SizedBox(height: 40),
//                   ],
//                 ),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_cancel_button.dart';
import 'package:timesheet_naresh/roles/admin/widgets/custom_text_field_for_assign_client.dart';
import '../services/party_service.dart';
import '../models/client_model.dart';

class AddClientScreen extends StatefulWidget {
  final ClientModel? existingClient; // For edit mode

  const AddClientScreen({super.key, this.existingClient});

  @override
  State<AddClientScreen> createState() => _AddClientScreenState();
}

class _AddClientScreenState extends State<AddClientScreen> {
  late TextEditingController nameController;
  late TextEditingController phoneController;
  late TextEditingController emailController;
  late TextEditingController zipController;
  late TextEditingController addressController;
  late TextEditingController remarkController;

  final String partyType = 'client'; // 🔥 FIXED AS CLIENT
  bool isLoading = false;
  bool get isEditMode => widget.existingClient != null;

  @override
  void initState() {
    super.initState();
    // Initialize controllers with existing data if in edit mode
    nameController = TextEditingController(text: widget.existingClient?.name ?? '');
    phoneController = TextEditingController(text: widget.existingClient?.phone ?? '');
    emailController = TextEditingController(text: widget.existingClient?.email ?? '');
    zipController = TextEditingController(text: widget.existingClient?.zipCode ?? '');
    addressController = TextEditingController(text: widget.existingClient?.address ?? '');
    remarkController = TextEditingController(text: widget.existingClient?.remark ?? '');
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

  /// ✅ Client Submit Function
  Future<void> submitClient() async {
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
        // Update existing client
        print("📤 Updating Client:");
        print("   Name: $name");
        print("   Phone: $phone");
        print("   Email: $email");
        print("   ZipCode: $zipCode");
        print("   Address: $address");
        print("   Remarks: $remarks");
        print("   PartyType: $partyType");
        
        result = await PartyService.updateParty(
          partyId: widget.existingClient!.id,
          name: name,
          phone: phone,
          email: email.isEmpty ? '' : email,
          zipCode: zipCode,
          address: address,
          remarks: remarks,
          partyType: partyType,
        );
      } else {
        // Create new client
        print("📤 Creating Client:");
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
            content: Text(result['message'] ?? (isEditMode ? 'Client updated successfully' : 'Client added successfully')),
            backgroundColor: Colors.green,
          ),
        );
        if (!isEditMode) clearAllFields();
        Navigator.pop(context, true);
      } else {
        final errorMsg = result['message'] ?? (isEditMode ? 'Failed to update client' : 'Failed to add client');
        print("❌ Client Update Error: $errorMsg");
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
            CustomAppBar(title: isEditMode ? "Update Client" : "Add New Client"),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                child: Column(
                  children: [
                    CustomTextFieldForAssignClient(
                      label: "Client Name",
                      hintText: "Enter client name",
                      controller: nameController,
                      isRequired: true,
                    ),
                    CustomTextFieldForAssignClient(
                      label: "Client Phone",
                      hintText: "Enter client phone",
                      controller: phoneController,
                      isRequired: true,
                    ),
                    CustomTextFieldForAssignClient(
                      label: "Client Email",
                      hintText: "Enter client email (optional)",
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
                      label: "Client Address",
                      hintText: "Enter client address",
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
                            title: isLoading ? "Please wait..." : (isEditMode ? "Update Client" : "Add Client"),
                            onPressed: submitClient,
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
