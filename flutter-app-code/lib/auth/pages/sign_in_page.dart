import 'package:flutter/material.dart';
import 'package:timesheet_naresh/auth/pages/forgot_password_page.dart';
import 'package:timesheet_naresh/auth/pages/sign_up_page.dart';
import 'package:timesheet_naresh/auth/services/auth_service.dart';
import 'package:timesheet_naresh/common/widgets/custom_back_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/main_bottom_nav_screen.dart';
import 'package:timesheet_naresh/roles/admin/pages/home_revenue_page.dart';
import '../../app/constants.dart';
import '../../app/utils/role_helper.dart';
import '../../common/services/token_service.dart';
import '../../common/widgets/custom_text_field.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  bool rememberMe = false;

  bool isLoading = false;

  // Future<void> handleLogin() async {
  //   setState(() => isLoading = true);
  //
  //   final res = await AuthService.signIn(
  //     email: emailController.text.trim(),
  //     password: passwordController.text.trim(),
  //   );
  //
  //   setState(() => isLoading = false);
  //
  //   // if (res["success"]) {
  //   //   final data = res["data"];
  //   //
  //   //   final roleName = data["role"];
  //   //   final userRole = getRoleFromApi(roleName);
  //   //
  //   //   ScaffoldMessenger.of(context).showSnackBar(
  //   //     const SnackBar(content: Text("Login Successful")),
  //   //   );
  //   //
  //   //   Navigator.pushReplacement(
  //   //     context,
  //   //     MaterialPageRoute(
  //   //       builder: (context) => MainBottomNavScreen(role: userRole),
  //   //     ),
  //   //   );
  //   // }
  //   if (res['success']) {
  //     final roleString = await TokenService.getRole();
  //     final role = roleString != null ? _parseUserRole(roleString) : UserRole.user;
  //
  //     Navigator.pushReplacement(
  //       context,
  //       MaterialPageRoute(builder: (_) => MainBottomNavScreen(role: role)),
  //     );
  //   }
  //   else {
  //     ScaffoldMessenger.of(context).showSnackBar(
  //       SnackBar(content: Text(res["message"])),
  //     );
  //   }
  // }
  UserRole _parseUserRole(String role) {
    final r = role.toLowerCase().trim();
    // Handle normalized roles from TokenService (admin, staff, user)
    if (r == 'admin') return UserRole.admin;
    if (r == 'staff') return UserRole.staff;
    if (r == 'user') return UserRole.user;
    // Fallback for direct API roles (shouldn't happen after normalization, but just in case)
    if (r.contains('business admin') || r.contains('admin')) return UserRole.admin;
    if (r.contains('staff')) return UserRole.staff;
    return UserRole.user;
  }

  Future<void> handleLogin() async {
    setState(() => isLoading = true);

    final res = await AuthService.signIn(
      email: emailController.text.trim(),
      password: passwordController.text.trim(),
    );

    setState(() => isLoading = false);

    if (res['success']) {
      final roleString = await TokenService.getRole();
      print("🔍 DEBUG: Role from TokenService: $roleString");
      final role = roleString != null ? _parseUserRole(roleString) : UserRole.user;
      print("🔍 DEBUG: Parsed UserRole: $role");

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => MainBottomNavScreen(role: role)),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res["message"] ?? "Login failed")),
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
                  horizontal: width * 0.06, vertical: height * 0.04),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.8),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              constraints: BoxConstraints(minHeight: height * 0.7),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Title
                    Text(
                      'Welcome Back',
                      style: TextStyle(
                        fontSize: width * 0.06,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: height * 0.03),

                    // Form Fields
                    CustomTextField(
                      label: 'Email',
                      controller: emailController,
                    ),
                    SizedBox(height: height * 0.015),

                    CustomTextField(
                      label: 'Password',
                      controller: passwordController,
                      obscureText: true,
                    ),
                    SizedBox(height: height * 0.015),

                    // Remember + Forgot
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Checkbox(
                              value: rememberMe,
                              onChanged: (value) {
                                setState(() {
                                  rememberMe = value ?? false;
                                });
                              },
                            ),
                            Text('Remember Me',
                                style: TextStyle(fontSize: width * 0.04)),
                          ],
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) => ForgotPasswordScreen()));
                          },
                          child: Text(
                            'Forgot Password?',
                            style: TextStyle(
                              fontSize: width * 0.04,
                              color: const Color.fromRGBO(13, 32, 128, 1),
                              decoration: TextDecoration.underline,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: height * 0.02),

                    // SignIn Button
                    isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : CustomButton(
                      title: "Sign In",
                      onPressed: handleLogin,

                    ),

                    SizedBox(height: height * 0.02),

                    // No account?
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text("Don't have an account? ",
                            style: TextStyle(
                                fontSize: width * 0.04,
                                color: Colors.black87)),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) => SignUpScreen()));
                          },
                          child: Text(
                            'Sign Up',
                            style: TextStyle(
                              fontSize: width * 0.04,
                              fontWeight: FontWeight.bold,
                              color: const Color.fromRGBO(13, 32, 128, 1),
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
