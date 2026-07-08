import 'package:flutter/material.dart';
import 'package:timesheet_naresh/auth/pages/sign_in_page.dart';
import 'package:timesheet_naresh/auth/pages/sign_up_page.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/main_bottom_nav_screen.dart';
import '../../app/constants.dart';
import '../../common/widgets/custom_button.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkLogin();
  }

  // Future<void> _checkLogin() async {
  //   await Future.delayed(const Duration(seconds: 3));
  //
  //   final token = await TokenService.getToken();
  //   final roleString = await TokenService.getRole();
  //
  //   if (token != null && token.isNotEmpty && roleString != null) {
  //     final role = _parseUserRole(roleString);
  //
  //     Navigator.pushReplacement(
  //       context,
  //       MaterialPageRoute(
  //         builder: (_) => MainBottomNavScreen(role: role),
  //       ),
  //     );
  //   } else {
  //     Navigator.pushReplacement(
  //       context,
  //       MaterialPageRoute(
  //         builder: (_) => const SignInScreen(),
  //       ),
  //     );
  //   }
  // }
  UserRole _parseUserRole(String role) {
    final r = role.toLowerCase().trim();
    // Handle normalized roles from TokenService (admin, staff, user)
    if (r == 'admin') return UserRole.admin;
    if (r == 'staff') return UserRole.staff;
    if (r == 'user') return UserRole.user;
    // Fallback for direct API roles
    if (r.contains('business admin') || r.contains('admin')) return UserRole.admin;
    if (r.contains('staff')) return UserRole.staff;
    return UserRole.user;
  }

  Future<void> _checkLogin() async {
    await Future.delayed(const Duration(seconds: 3));

    final token = await TokenService.getToken();
    final roleString = await TokenService.getRole();

    // Validate token exists and is not empty
    if (token != null && token.isNotEmpty && roleString != null) {
      // Validate token by checking if it's still valid
      // If token validation fails, user will be redirected to login on first API call
      print("🔍 DEBUG: Role from TokenService (Splash): $roleString");
      final role = _parseUserRole(roleString);
      print("🔍 DEBUG: Parsed UserRole (Splash): $role");

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => MainBottomNavScreen(role: role)),
      );
    } else {
      // No token or role found, redirect to login
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const SignInScreen()),
      );
    }
  }



  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height;
    final width = MediaQuery.of(context).size.width;

    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            AppImages.backgroundImg,
            fit: BoxFit.cover,
          ),
          // Container(
          //   color: Colors.black.withOpacity(0.005),
          // ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: MediaQuery.of(context).size.height * 0.5,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.white54.withOpacity(1),
                  ],
                ),
              ),
            ),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(height: height * 0.4),
              Text(
                "Manage",
                style: TextStyle(
                  color: const Color.fromRGBO(109, 110, 115, 1),
                  fontSize: width * 0.1, // Responsive font
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              Text(
                "time, stay",
                style: TextStyle(
                  color: const Color.fromRGBO(12, 12, 13, 1),
                  fontSize: width * 0.1,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              Text(
                "productive",
                style: TextStyle(
                  color: const Color.fromRGBO(80, 105, 229, 1),
                  fontSize: width * 0.1,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: height * 0.03),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: width * 0.1),
                child:
                // CustomButton(
                //   title: "Get Started",
                //   onPressed: () {
                //     Navigator.push(context, MaterialPageRoute(builder: (context)=>SignUpScreen()));
                //   },
                // ),
                CustomButton(
                  title: "Get Started",
                  onPressed: () async {
                    final roleString = await TokenService.getRole();
                    final role = roleString != null ? _parseUserRole(roleString) : UserRole.user;

                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => MainBottomNavScreen(role: role),
                      ),
                    );
                  },
                ),

              ),
              SizedBox(height: height * 0.02),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Already have an account ?",
                    style: TextStyle(
                      color: Colors.black87,
                      fontSize: width * 0.04,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) => SignInScreen()));
                    },
                    child: Text(
                      'Sign In',
                      style: TextStyle(
                        fontSize: width * 0.04,
                        fontWeight: FontWeight.bold,
                        color: const Color.fromRGBO(13, 32, 128, 1),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: height * 0.05),
            ],
          ),
        ],
      ),
    );
  }
}
