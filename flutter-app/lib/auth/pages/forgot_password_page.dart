import 'package:flutter/material.dart';
import 'package:timesheet_naresh/auth/pages/verify_otp_page.dart';
import 'package:timesheet_naresh/auth/services/auth_service.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import '../../app/constants.dart';
import '../../common/widgets/custom_back_button.dart';
import '../../common/widgets/custom_text_field.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController emailController = TextEditingController();
  bool isLoading = false;

  Future<void> handleSendCode() async {
    if (emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Enter your email")),
      );
      return;
    }

    setState(() => isLoading = true);

    final res = await AuthService.forgotPassword(
      emailController.text.trim(),
    );

    setState(() => isLoading = false);

    if (res["success"]) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Verification code sent!")),
      );

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => VerifyOTPScreen(email: emailController.text.trim(),),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res["message"])),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    final double height = MediaQuery.of(context).size.height;

    return Scaffold(
      body: Stack(
        children: [
          // Background Image
          SizedBox(
            width: width,
            height: height,
            child: Image.asset(
              AppImages.backgroundImg,
              fit: BoxFit.cover,
            ),
          ),

          // Back Button
          Positioned(
            top: height * 0.02 + MediaQuery.of(context).padding.top,
            left: width * 0.04,
            child: const CustomBackButton(
              iconColor: Colors.black,
            ),
          ),

          // Bottom Container
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: width,
              padding: EdgeInsets.symmetric(
                horizontal: width * 0.06,
                vertical: height * 0.04,
              ),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.8),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              constraints: BoxConstraints(minHeight: height * 0.5),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Title
                    Text(
                      'Forgot Password ?',
                      style: TextStyle(
                        fontSize: width * 0.06,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: height * 0.01),

                    Text(
                      'Enter your email and we will send you a\n verification code',
                      style: TextStyle(
                        fontSize: width * 0.04,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: height * 0.03),

                    // Email Input
                    CustomTextField(
                      label: 'Email',
                      controller: emailController,
                    ),
                    SizedBox(height: height * 0.03),

                    // Button with loader
                    isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : CustomButton(
                      title: 'Send Code',
                      onPressed: handleSendCode,
                    ),

                    SizedBox(height: height * 0.02),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
