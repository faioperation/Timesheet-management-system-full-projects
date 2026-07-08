import 'package:flutter/material.dart';
import 'package:timesheet_naresh/auth/pages/sign_in_page.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import '../../app/constants.dart';
import '../../common/widgets/custom_back_button.dart';
import '../../common/widgets/custom_text_field.dart';
import '../services/auth_service.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController companyController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();

  bool isLoading = false;

  Future<void> handleSignup() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => isLoading = true);

    final res = await AuthService.registerUser(
      name: nameController.text.trim(),
      email: emailController.text.trim(),
      phone: phoneController.text.trim(),
      password: passwordController.text.trim(),
      company: companyController.text.trim(),
      confirmPassword: confirmPasswordController.text.trim(),
    );

    setState(() => isLoading = false);
    print("RAW RESPONSE: $res");
    print("SUCCESS VALUE: ${res["success"]}");


    if (res["success"]) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Signup Successful!")),
      );
      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context)=>SignInScreen()), (pre)=>false); // go back to login
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
            top: MediaQuery.of(context).size.height * 0.02 +
                MediaQuery.of(context).padding.top,
            left: MediaQuery.of(context).size.width * 0.04,
            child: const CustomBackButton(
              iconColor: Colors.black,
            ),
          ),

          // Main Container
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: width,
              padding: EdgeInsets.symmetric(
                  horizontal: width * 0.06, vertical: height * 0.04),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.8),
                borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24)),
              ),
              constraints: BoxConstraints(minHeight: height * 0.8),
              child: SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Title
                      Text(
                        'Create New Account',
                        style: TextStyle(
                          fontSize: width * 0.06,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: height * 0.03),

                      // Fields
                      CustomTextField(
                        label: 'Name',
                        controller: nameController,
                      ),
                      SizedBox(height: height * 0.015),

                      CustomTextField(
                        label: 'Email',
                        controller: emailController,
                      ),
                      SizedBox(height: height * 0.015),

                      CustomTextField(
                        label: 'Phone',
                        controller: phoneController,
                      ),
                      SizedBox(height: height * 0.015),

                      CustomTextField(
                        label: 'Company',
                        controller: companyController,
                      ),
                      SizedBox(height: height * 0.015),

                      CustomTextField(
                        label: 'Password',
                        controller: passwordController,
                        obscureText: true,
                      ),
                      SizedBox(height: height * 0.015),

                      CustomTextField(
                        label: 'Confirm Password',
                        controller: confirmPasswordController,
                        obscureText: true,
                      ),
                      SizedBox(height: height * 0.03),

                      // Signup Button
                      isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : CustomButton(
                        title: "SignUp",
                        onPressed: handleSignup,
                      ),

                      SizedBox(height: height * 0.02),

                      // Already have account?
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Already have an account? ',
                            style: TextStyle(
                                color: Colors.black87, fontSize: width * 0.04),
                          ),
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => SignInScreen()));
                            },
                            child: Text(
                              'Sign In',
                              style: TextStyle(
                                  fontSize: width * 0.04,
                                  fontWeight: FontWeight.bold,
                                  color: const Color.fromRGBO(13, 32, 128, 1)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
