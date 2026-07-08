import 'package:flutter/material.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:timesheet_naresh/auth/pages/set_new_password_page.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import '../../app/constants.dart';
import '../../common/widgets/custom_back_button.dart';
import '../../roles/user/pages/settings/reset_password_page.dart';
import '../services/auth_service.dart';

class VerifyOTPScreen extends StatefulWidget {
  final String email;
  const VerifyOTPScreen({super.key, required this.email});

  @override
  State<VerifyOTPScreen> createState() => _VerifyOTPScreenState();
}

class _VerifyOTPScreenState extends State<VerifyOTPScreen> {
  final TextEditingController otpController = TextEditingController();
  bool isLoading = false;
  final _formKey = GlobalKey<FormState>();

  // Function to verify OTP
  Future<void> _verifyOTP() async {
    final otp = otpController.text.trim();
    if (otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a 6-digit OTP')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      final response = await AuthService.verifyForgotPasswordOtp(widget.email, otp);
      setState(() => isLoading = false);

      // ✅ Correct logic: only success == true
      if (response['success'] == true) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => SetNewPasswordScreen(email: widget.email),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response['message'] ?? 'Invalid OTP')),
        );
      }
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }


  // Function to resend OTP
  Future<void> _resendOTP() async {
    setState(() => isLoading = true);

    try {
      final response = await AuthService.forgotPassword(widget.email);
      setState(() => isLoading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response['message'] ?? 'OTP resent!')),
      );
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;

    return Scaffold(
      body: Stack(
        children: [
          // Background
          SizedBox(
            width: width,
            height: height,
            child: Image.asset(AppImages.backgroundImg, fit: BoxFit.cover),
          ),
          Positioned(
            top: MediaQuery.of(context).size.height * 0.02 + MediaQuery.of(context).padding.top,
            left: MediaQuery.of(context).size.width * 0.04,
            child: const CustomBackButton(iconColor: Colors.black),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: width,
              padding: EdgeInsets.symmetric(horizontal: width * 0.06, vertical: height * 0.04),
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
                    Text(
                      'Check your email',
                      style: TextStyle(
                        fontSize: width * 0.06,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: height * 0.01),
                    Text(
                      'We sent a OTP to your email. Please enter the 6 digit code.',
                      style: TextStyle(
                        fontSize: width * 0.04,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: height * 0.03),
                    PinCodeTextField(
                      appContext: context,
                      length: 6,
                      controller: otpController,
                      keyboardType: TextInputType.number,
                      autoFocus: true,
                      animationType: AnimationType.fade,
                      pinTheme: PinTheme(
                        shape: PinCodeFieldShape.box,
                        borderRadius: BorderRadius.circular(8),
                        fieldHeight: height * 0.07,
                        fieldWidth: width * 0.12,
                        activeColor: Colors.blue,
                        selectedColor: Colors.blueAccent,
                        inactiveColor: Colors.grey,
                      ),
                      onChanged: (value) {},
                    ),
                    SizedBox(height: height * 0.03),
                    CustomButton(
                      title: isLoading ? 'Verifying...' : 'Verify Code',
                      onPressed: _verifyOTP,
                    ),
                    SizedBox(height: height * 0.02),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Didn't receive OTP? ",
                          style: TextStyle(fontSize: width * 0.04, color: Colors.black87),
                        ),
                        GestureDetector(
                          onTap: _resendOTP,
                          child: Text(
                            'Resend',
                            style: TextStyle(
                              fontSize: width * 0.04,
                              fontWeight: FontWeight.bold,
                              color: const Color.fromRGBO(13, 32, 128, 1),
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
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
