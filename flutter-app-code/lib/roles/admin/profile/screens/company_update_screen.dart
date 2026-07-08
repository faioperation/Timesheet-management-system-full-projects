import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import '../../../../common/widgets/custom_button.dart';
import '../widgets/company_update_textfield.dart';
import '../services/company_service.dart';
import '../models/company_model.dart';

class CompanyUpdateScreen extends StatefulWidget {
  const CompanyUpdateScreen({super.key});

  @override
  State<CompanyUpdateScreen> createState() => _CompanyUpdateScreenState();
}

class _CompanyUpdateScreenState extends State<CompanyUpdateScreen> {
  File? logo;
  CompanyModel? company;
  bool isLoading = true;
  bool isSaving = false;

  final picker = ImagePicker();
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final phoneController = TextEditingController();
  final addressController = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadCompany();
  }

  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    addressController.dispose();
    super.dispose();
  }

  Future<void> loadCompany() async {
    setState(() => isLoading = true);
    final data = await CompanyService.getCompany();
    setState(() {
      company = data;
      if (data != null) {
        nameController.text = data.name;
        emailController.text = data.email;
        phoneController.text = data.phone;
        addressController.text = data.address ?? '';
      }
      isLoading = false;
    });
  }

  Future<void> pickLogo() async {
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (picked != null) {
      setState(() => logo = File(picked.path));
    }
  }

  String _getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return '';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const String baseUrl = "https://test5.fireai.agency";
    // Remove leading slash from imagePath if present to avoid double slashes
    final cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return '$baseUrl/storage/$cleanPath';
  }

  Future<void> saveCompany() async {
    if (nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Company name is required'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Email is required'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Phone is required'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => isSaving = true);

    final result = await CompanyService.updateCompany(
      name: nameController.text.trim(),
      email: emailController.text.trim(),
      phone: phoneController.text.trim(),
      address: addressController.text.trim().isNotEmpty
          ? addressController.text.trim()
          : null,
      logoFile: logo,
    );

    setState(() => isSaving = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Company updated successfully'),
          backgroundColor: result['success'] == true ? Colors.green : Colors.red,
        ),
      );

      if (result['success'] == true) {
        Navigator.pop(context, true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F6F6),
      appBar: CustomAppBar(title: "Company Update"),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),

                  /// Logo
                  Center(
                    child: Column(
                      children: [
                        Container(
                          height: 90,
                          width: 90,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(
                                blurRadius: 10,
                                color: Colors.black.withOpacity(.08),
                              )
                            ],
                          ),
                          child: ClipOval(
                            child: logo != null
                                ? Image.file(logo!, fit: BoxFit.cover)
                                : (company?.logo != null &&
                                        company!.logo!.isNotEmpty
                                    ? Image.network(
                                        _getImageUrl(company!.logo),
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          return Image.asset(
                                            "assets/images/Logo.png",
                                            fit: BoxFit.cover,
                                          );
                                        },
                                      )
                                    : Image.asset("assets/images/Logo.png")),
                          ),
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: 180,
                          child: CustomButton(
                            title: "Upload Logo",
                            onPressed: pickLogo,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  _label("Company name"),
                  CompanyUpdateCustomTextField(
                    controller: nameController,
                  ),

                  _label("Email"),
                  CompanyUpdateCustomTextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                  ),

                  _label("Mobile"),
                  CompanyUpdateCustomTextField(
                    controller: phoneController,
                    keyboardType: TextInputType.phone,
                  ),

                  _label("Address"),
                  CompanyUpdateCustomTextField(
                    controller: addressController,
                    maxLines: 2,
                  ),

                  const SizedBox(height: 90),
                ],
              ),
            ),

      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: CustomButton(
          title: isSaving ? "Saving..." : "Save",
          onPressed: saveCompany,
        ),
      ),
    );
  }

  Widget _label(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 6, top: 14),
      child: Row(
        children: [
          Text(
            text,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 6),
          const Icon(Icons.edit, size: 16, color: Colors.grey),
        ],
      ),
    );
  }
}
