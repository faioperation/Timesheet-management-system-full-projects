import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_profile_service.dart';
import '../../../common/widgets/custom_profile_text_field.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();

  // Profile image and signature
  File? pickedImage;
  String? profileImage;
  File? pickedSignature;
  String? signatureImage;

  // Gender and marital status
  String? selectedGender;
  String? selectedMaritalStatus;

  final List<String> genderOptions = ['male', 'female'];
  final List<String> maritalStatusOptions = ['single', 'married'];

  bool isLoading = true;
  bool isUpdating = false;

  @override
  void initState() {
    super.initState();
    loadProfile();
  }

  Future<void> loadProfile() async {
    final token = await TokenService.getToken();
    if (token == null) return;

    final profileData = await ProfileService.getProfile(token);
    if (profileData != null) {
      setState(() {
        nameController.text = profileData.name;
        emailController.text = profileData.email;
        phoneController.text = profileData.phone ?? '';
        profileImage = profileData.image;
        signatureImage = profileData.signature;
        selectedGender = profileData.gender;
        selectedMaritalStatus = profileData.maritalStatus;
        isLoading = false;
      });
    } else {
      setState(() => isLoading = false);
    }
  }

  Future<void> pickProfileImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85, // Reduce quality slightly to ensure compatibility
    );

    if (pickedFile != null) {
      final file = File(pickedFile.path);
      final extension = file.path.split('.').last.toLowerCase();
      
      // Validate file extension
      if (['jpg', 'jpeg', 'png', 'gif'].contains(extension)) {
        setState(() {
          pickedImage = file;
          profileImage = pickedImage!.path;
        });
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please select a valid image format (JPEG, PNG, or GIF)'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> pickSignature() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85, // Reduce quality slightly to ensure compatibility
    );

    if (pickedFile != null) {
      final file = File(pickedFile.path);
      final extension = file.path.split('.').last.toLowerCase();
      
      // Validate file extension
      if (['jpg', 'jpeg', 'png', 'gif'].contains(extension)) {
        setState(() {
          pickedSignature = file;
          signatureImage = pickedSignature!.path;
        });
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please select a valid image format (JPEG, PNG, or GIF)'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> updateProfile() async {
    setState(() => isUpdating = true);
    final token = await TokenService.getToken();
    if (token == null) return;

    bool success = await ProfileService.updateProfile(
      token: token,
      name: nameController.text,
      email: emailController.text,
      phone: phoneController.text,
      gender: selectedGender,
      maritalStatus: selectedMaritalStatus,
      imageFile: pickedImage,
      signatureFile: pickedSignature,
    );

    setState(() => isUpdating = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success
            ? "Profile updated successfully"
            : "Failed to update profile"),
        backgroundColor: success ? Colors.green : Colors.red,
      ),
    );

    if (success) {
      Navigator.pop(context, true); // ProfileScreen refresh করবে
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: isUpdating ? null : updateProfile,
            child: Text(
              isUpdating ? "Updating..." : "Done",
              style: const TextStyle(color: Colors.blue, fontSize: 16),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile image
            GestureDetector(
              onTap: pickProfileImage,
              child: Stack(
                children: [
                  ClipOval(
                    child: pickedImage != null
                        ? Image.file(
                            pickedImage!,
                            width: 100,
                            height: 100,
                            fit: BoxFit.cover,
                          )
                        : (profileImage != null && profileImage!.isNotEmpty
                            ? Image.network(
                                '${_getImageUrl(profileImage!)}?t=${DateTime.now().millisecondsSinceEpoch}',
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  // Silently handle 404 or other errors, show default image
                                  return Image.asset(
                                    'assets/images/profile.jpg',
                                    width: 100,
                                    height: 100,
                                    fit: BoxFit.cover,
                                  );
                                },
                                loadingBuilder: (context, child, loadingProgress) {
                                  if (loadingProgress == null) return child;
                                  return Container(
                                    width: 100,
                                    height: 100,
                                    color: Colors.grey[300],
                                    child: const Center(
                                      child: CircularProgressIndicator(),
                                    ),
                                  );
                                },
                              )
                            : Image.asset(
                                'assets/images/profile.jpg',
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                              )),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: CircleAvatar(
                      radius: 16,
                      backgroundColor: Colors.blue,
                      child: const Icon(
                        Icons.photo_camera_outlined,
                        size: 18,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Text fields
            CustomProfileTextField(
              label: "Name",
              controller: nameController,
              hintText: "Enter Your Name",
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
            
            // Gender Dropdown
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Gender",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: selectedGender,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                  ),
                  items: genderOptions.map((gender) {
                    return DropdownMenuItem(
                      value: gender,
                      child: Text(gender[0].toUpperCase() + gender.substring(1)),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      selectedGender = value;
                    });
                  },
                  hint: const Text("Select Gender"),
                ),
              ],
            ),

            // Marital Status Dropdown
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Marital Status",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: selectedMaritalStatus,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                  ),
                  items: maritalStatusOptions.map((status) {
                    return DropdownMenuItem(
                      value: status,
                      child: Text(status[0].toUpperCase() + status.substring(1)),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      selectedMaritalStatus = value;
                    });
                  },
                  hint: const Text("Select Marital Status"),
                ),
              ],
            ),

            // Signature Upload
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Signature",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: pickSignature,
                  child: Container(
                    height: 120,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: pickedSignature != null
                        ? Image.file(
                            pickedSignature!,
                            fit: BoxFit.contain,
                          )
                        : (signatureImage != null && signatureImage!.isNotEmpty
                            ? Image.network(
                                _getImageUrl(signatureImage!),
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) {
                                  return const Center(
                                    child: Icon(Icons.image, size: 40, color: Colors.grey),
                                  );
                                },
                              )
                            : const Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.upload_file, size: 40, color: Colors.grey),
                                    SizedBox(height: 8),
                                    Text(
                                      "Tap to upload signature",
                                      style: TextStyle(color: Colors.grey),
                                    ),
                                  ],
                                ),
                              )),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  String _getImageUrl(String imagePath) {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const String baseUrl = "https://test5.fireai.agency";
    final cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return '$baseUrl/storage/$cleanPath';
  }
}
