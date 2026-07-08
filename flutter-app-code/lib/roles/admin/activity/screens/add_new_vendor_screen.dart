import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_cancel_button.dart';
import 'package:timesheet_naresh/roles/admin/widgets/custom_text_field_for_assign_client.dart';
import '../services/party_service.dart';
import '../models/vendor_model.dart';

class AddNewVendorScreen extends StatefulWidget {
  final VendorModel? existingVendor; // For edit mode

  const AddNewVendorScreen({super.key, this.existingVendor});

  @override
  State<AddNewVendorScreen> createState() => _AddNewVendorScreenState();
}

class _AddNewVendorScreenState extends State<AddNewVendorScreen> {
  late TextEditingController nameController;
  late TextEditingController phoneController;
  late TextEditingController emailController;
  late TextEditingController zipController;
  late TextEditingController addressController;
  late TextEditingController remarkController;

  String selectedVendorType = 'vendor';
  bool isLoading = false;
  bool get isEditMode => widget.existingVendor != null;

  @override
  void initState() {
    super.initState();
    // Initialize controllers with existing data if in edit mode
    nameController = TextEditingController(text: widget.existingVendor?.name ?? '');
    phoneController = TextEditingController(text: widget.existingVendor?.phone ?? '');
    emailController = TextEditingController(text: widget.existingVendor?.email ?? '');
    zipController = TextEditingController(text: widget.existingVendor?.zipCode ?? '');
    addressController = TextEditingController(text: widget.existingVendor?.address ?? '');
    remarkController = TextEditingController(text: widget.existingVendor?.remark ?? '');
    if (widget.existingVendor != null) {
      selectedVendorType = 'vendor'; // Keep vendor type for edit
    }
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

  Future<void> submitVendor() async {
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
        // Update existing vendor
        print("📤 Updating Vendor:");
        print("   Name: $name");
        print("   Phone: $phone");
        print("   Email: $email");
        print("   ZipCode: $zipCode");
        print("   Address: $address");
        print("   Remarks: $remarks");
        print("   PartyType: $selectedVendorType");
        
        result = await PartyService.updateParty(
          partyId: widget.existingVendor!.id,
          name: name,
          phone: phone,
          email: email.isEmpty ? '' : email,
          zipCode: zipCode,
          address: address,
          remarks: remarks,
          partyType: selectedVendorType,
        );
      } else {
        // Create new vendor
        print("📤 Creating Vendor:");
        print("   Name: $name");
        print("   Phone: $phone");
        print("   Email: $email");
        print("   ZipCode: $zipCode");
        print("   Address: $address");
        print("   Remarks: $remarks");
        print("   PartyType: $selectedVendorType");
        
        final success = await PartyService.createParty(
          name: name,
          phone: phone,
          email: email.isEmpty ? '' : email,
          zipCode: zipCode,
          address: address,
          remarks: remarks,
          partyType: selectedVendorType,
        );
        result = {'success': success};
      }

      if (!mounted) return;
      setState(() => isLoading = false);

      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? (isEditMode ? 'Vendor updated successfully' : 'Vendor added successfully')),
            backgroundColor: Colors.green,
          ),
        );
        if (!isEditMode) clearAllFields();
        Navigator.pop(context, true);
      } else {
        final errorMsg = result['message'] ?? (isEditMode ? 'Failed to update vendor' : 'Failed to add vendor');
        print("❌ Vendor Update Error: $errorMsg");
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
            CustomAppBar(title: isEditMode ? "Update Vendor" : "Add New Vendor"),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                child: Column(
                  children: [
                    CustomTextFieldForAssignClient(
                      label: "Vendor Name",
                      hintText: "Enter vendor name",
                      controller: nameController,
                      isRequired: true,
                    ),

                    CustomTextFieldForAssignClient(
                      label: "Vendor Phone",
                      hintText: "Enter vendor phone",
                      controller: phoneController,
                      isRequired: true,
                    ),

                    CustomTextFieldForAssignClient(
                      label: "Vendor Email",
                      hintText: "Enter vendor email (optional)",
                      controller: emailController,
                      isRequired: false,
                    ),

                    CustomTextFieldForAssignClient(
                      label: "Zip Code",
                      hintText: "Enter zip code",
                      controller: zipController,
                      isRequired: true,
                    ),

                    const SizedBox(height: 8),

                    CustomTextFieldForAssignClient(
                      label: "Vendor Address",
                      hintText: "Enter vendor address",
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
                            title: isLoading ? "Please wait..." : (isEditMode ? "Update Vendor" : "Add Vendor"),
                            onPressed: submitVendor,
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
