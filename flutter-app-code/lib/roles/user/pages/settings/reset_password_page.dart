import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_text_field.dart';

class UserResetPasswordScreen extends StatefulWidget {
  const UserResetPasswordScreen({super.key,});

  @override
  State<UserResetPasswordScreen> createState() => _UserResetPasswordScreenState();
}

class _UserResetPasswordScreenState extends State<UserResetPasswordScreen> {

  TextEditingController _passController = TextEditingController();
  TextEditingController _confirmPassController = TextEditingController();


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: "Reset Password"),
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

                const Text(
                  "Password",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
                ),
                const SizedBox(height: 8),
                CustomTextField(
                  label: "Password",
                  controller: _passController,
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                const Text(
                  "Confirm Password",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
                ),
                const SizedBox(height: 8),
                CustomTextField(
                  label: "Confirm Password",
                  controller: _confirmPassController,
                  obscureText: true,
                ),
            const SizedBox(height: 32),
            CustomButton(title: "Save", onPressed: () {}),
          ],
        ),
      ),
    );
  }
}
