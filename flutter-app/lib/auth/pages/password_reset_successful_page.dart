import 'package:flutter/material.dart';
import 'package:timesheet_naresh/auth/pages/sign_in_page.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import '../../app/constants.dart';
import '../../common/widgets/custom_back_button.dart';

class PasswordResetSuccessScreen extends StatelessWidget {
  const PasswordResetSuccessScreen({super.key});

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
          Positioned(
            top: MediaQuery.of(context).size.height * 0.02 + MediaQuery.of(context).padding.top,
            left: MediaQuery.of(context).size.width * 0.04,
            child: const CustomBackButton(
              iconColor: Colors.black,
            ),
          ),
          // Bottom Container
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: width,
              padding: EdgeInsets.symmetric(horizontal: width * 0.06, vertical: height * 0.04),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.85),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              constraints: BoxConstraints(
                minHeight: height * 0.5,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Success Icon
                  Icon(
                    Icons.check_circle_outline,
                    color: Colors.green,
                    size: width * 0.2,
                  ),
                  SizedBox(height: height * 0.03),

                  // Success Message
                  Text(
                    'Password Reset Successful!',
                    style: TextStyle(
                      fontSize: width * 0.06,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: height * 0.03),

                  // Go to SignIn Button
                  CustomButton(
                    title: 'Go to Sign In',
                    onPressed: () {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(builder: (context) => const SignInScreen()),
                            (route) => false,
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
