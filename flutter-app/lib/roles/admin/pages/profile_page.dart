import 'package:flutter/material.dart';
import 'package:timesheet_naresh/auth/pages/sign_in_page.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_profile_service.dart';
import '../../../common/widgets/custom_cancel_button.dart';
import '../models/profile_model.dart';
import 'package:timesheet_naresh/roles/admin/pages/edit_profile.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  ProfileModel? profile;
  bool isLoading = true;
  String? userRole;

  @override
  void initState() {
    super.initState();
    loadRole();
    loadProfile();

  }
  Future<void> loadRole() async {
    final role = await TokenService.getRole();
    setState(() {
      userRole = role;
    });
  }

  Future<void> loadProfile() async {
    setState(() => isLoading = true);
    final token = await TokenService.getToken();

    if (token == null) {
      setState(() => isLoading = false);
      return;
    }

    final data = await ProfileService.getProfile(token);

    setState(() {
      profile = data;
      isLoading = false;
    });
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: userRole != 'user', // Hide back button for user role
        backgroundColor: Colors.white,
        elevation: 0,
        leading: userRole != 'user'
            ? IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back_ios_rounded),
              )
            : null,
        actions: [
          TextButton(
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const EditProfileScreen()),
              );

              if (result == true) {
                // Reload profile data including image
                await loadProfile();
                // Force rebuild to show updated image
                if (mounted) {
                  setState(() {});
                }
              }
            },
            child: const Text(
              'Edit',
              style: TextStyle(color: Colors.blue, fontSize: 16),
            ),
          ),

        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : profile == null
          ? const Center(child: Text("Profile Data Not Found"))
          : buildUI(),
    );
  }

  Widget buildUI() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          const SizedBox(height: 20),

          ClipOval(
            child: profile!.image != null && profile!.image!.isNotEmpty
                ? Image.network(
                    '${_getImageUrl(profile!.image!)}?t=${DateTime.now().millisecondsSinceEpoch}',
                    width: 140,
                    height: 140,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      // Silently handle 404 or other errors, show default image
                      return Image.asset(
                        "assets/images/profile.jpg",
                        width: 140,
                        height: 140,
                        fit: BoxFit.cover,
                      );
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        width: 140,
                        height: 140,
                        color: Colors.grey[300],
                        child: const Center(
                          child: CircularProgressIndicator(),
                        ),
                      );
                    },
                  )
                : Image.asset(
                    "assets/images/profile.jpg",
                    width: 140,
                    height: 140,
                    fit: BoxFit.cover,
                  ),
          ),

          const SizedBox(height: 10),

          Text(
            profile!.name,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 5),

          Text(
            profile!.email,
            style: const TextStyle(fontSize: 14, color: Colors.grey),
          ),

          const SizedBox(height: 30),

          InfoRow(label: 'Name', value: profile!.name),
          InfoRow(label: 'Email', value: profile!.email),
          InfoRow(label: 'Mobile', value: profile!.phone ?? "N/A"),
          InfoRow(label: 'Gender', value: profile!.gender ?? "N/A"),
          InfoRow(label: 'Marital Status', value: profile!.maritalStatus ?? "N/A"),

          const Spacer(),
          const SizedBox(height: 16),

          if (userRole == 'user')
            CancelCustomButton(
              icon: Icons.logout_outlined,
              title: "LogOut",
              onPressed: () async {
                await TokenService.clearAuth();
                Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context)=>SignInScreen()), (route)=>false);
              },
            ),

          SizedBox(height: 10,),
        ],
      ),
    );
  }

  String _getImageUrl(String imagePath) {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Prepend base URL with /storage/ path if it's a relative path
    const String baseUrl = "https://test5.fireai.agency";
    // Remove leading slash from imagePath if present to avoid double slashes
    final cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return '$baseUrl/storage/$cleanPath';
  }
}

class InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const InfoRow({
    super.key,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label,
                  style: const TextStyle(
                    color: Colors.black,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  )),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        const Divider(
          color: Colors.grey,
          thickness: 0.5,
          height: 1,
        ),
      ],
    );
  }
}
