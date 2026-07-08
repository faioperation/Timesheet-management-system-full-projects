import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_text_field.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_profile_service.dart';

import '../../../auth/pages/sign_in_page.dart';

class SettingPageAdmin extends StatefulWidget {
  const SettingPageAdmin({super.key});

  @override
  State<SettingPageAdmin> createState() => _SettingPageAdmin();
}

class _SettingPageAdmin extends State<SettingPageAdmin> {
  final TextEditingController _oldPassController = TextEditingController();
  final TextEditingController _newPassController = TextEditingController();
  final TextEditingController _confirmPassController = TextEditingController();

  bool _isLoading = false;
  //final AuthService _authService = AuthService(baseUrl: "{{baseURL}}"); // <-- set your baseURL

  Future<void> _handleChangePassword() async {
    final oldPassword = _oldPassController.text.trim();
    final newPassword = _newPassController.text.trim();
    final confirmPassword = _confirmPassController.text.trim();

    if (oldPassword.isEmpty || newPassword.isEmpty || confirmPassword.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill all fields")),
      );
      return;
    }

    if (newPassword != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("New password and confirm password do not match")),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';

    if (token.isEmpty) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("User not logged in")),
      );
      return;
    }

    final result = await ProfileService.changePassword(
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
      token: token,
    );

    setState(() {
      _isLoading = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(result["message"] ?? "Something went wrong")),
    );

    if (result["success"] == true) {
      _oldPassController.clear();
      _newPassController.clear();
      _confirmPassController.clear();
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => SignInScreen()),
    );

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: "Reset Password"),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.all(32.0),
              child: Center(
                child: Text(
                  "Your new password must be different \nfrom previously used passwords.",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontWeight: FontWeight.w500, fontSize: 16),
                ),
              ),
            ),
            const SizedBox(height: 32),

            const Text("Old Password", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400)),
            const SizedBox(height: 8),
            CustomTextField(label: "Old Password", controller: _oldPassController, obscureText: true),

            const SizedBox(height: 16),
            const Text("New Password", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400)),
            const SizedBox(height: 8),
            CustomTextField(label: "New Password", controller: _newPassController, obscureText: true),

            const SizedBox(height: 16),
            const Text("Confirm Password", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400)),
            const SizedBox(height: 8),
            CustomTextField(label: "Confirm Password", controller: _confirmPassController, obscureText: true),

            const SizedBox(height: 32),
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : CustomButton(title: "Save", onPressed: _handleChangePassword),
          ],
        ),
      ),
    );
  }
}
