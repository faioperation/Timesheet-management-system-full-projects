import 'package:flutter/material.dart';
import 'package:timesheet_naresh/roles/admin/profile/screens/company_update_screen.dart';
import 'package:timesheet_naresh/roles/admin/profile/services/company_service.dart';
import 'package:timesheet_naresh/roles/admin/profile/models/company_model.dart';
import '../widgets/company_custom_textfield.dart';

class CompanyProfileScreen extends StatefulWidget {
  const CompanyProfileScreen({super.key});

  @override
  State<CompanyProfileScreen> createState() => _CompanyProfileScreenState();
}

class _CompanyProfileScreenState extends State<CompanyProfileScreen> {
  CompanyModel? company;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadCompany();
  }

  Future<void> loadCompany() async {
    setState(() => isLoading = true);
    final data = await CompanyService.getCompany();
    setState(() {
      company = data;
      isLoading = false;
    });
  }

  String _getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return '';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Prepend base URL with /storage/ path if it's a relative path
    const String baseUrl = "https://test5.fireai.agency";
    // Remove leading slash from imagePath if present to avoid double slashes
    final cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return '$baseUrl/storage/$cleanPath';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Company",
          style: TextStyle(color: Colors.black),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CompanyUpdateScreen()),
              );
              if (result == true) {
                loadCompany();
              }
            },
            child: const Text(
              "Edit",
              style: TextStyle(color: Colors.blue),
            ),
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 10),

                  /// Logo
                  Center(
                    child: Container(
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
                        child: company?.logo != null && company!.logo!.isNotEmpty
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
                            : Image.asset(
                                "assets/images/Logo.png",
                                fit: BoxFit.cover,
                              ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  _label("Company name"),
                  CompanyCustomTextField(
                    initialValue: company?.name ?? '',
                    readOnly: true,
                  ),

                  _label("Email"),
                  CompanyCustomTextField(
                    initialValue: company?.email ?? '',
                    readOnly: true,
                  ),

                  _label("Mobile"),
                  CompanyCustomTextField(
                    initialValue: company?.phone ?? '',
                    readOnly: true,
                  ),

                  _label("Address"),
                  CompanyCustomTextField(
                    initialValue: company?.address ?? '',
                    readOnly: true,
                  ),
                ],
              ),
            ),
    );
  }

  Widget _label(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6, top: 14),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
