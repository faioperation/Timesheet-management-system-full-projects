import 'package:flutter/material.dart';
import 'package:timesheet_naresh/app/constants.dart';
import 'package:timesheet_naresh/auth/pages/password_reset_successful_page.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import '../../common/widgets/custom_back_button.dart';
import '../services/auth_service.dart';

// class SetNewPasswordScreen extends StatefulWidget {
//   const SetNewPasswordScreen({super.key, required String email});
//
//   @override
//   State<SetNewPasswordScreen> createState() => _SetNewPasswordScreenState();
// }
//
// class _SetNewPasswordScreenState extends State<SetNewPasswordScreen> {
//   final TextEditingController newPasswordController = TextEditingController();
//   final TextEditingController retypePasswordController = TextEditingController();
//
//   bool _obscureNew = true;
//   bool _obscureRetype = true;
//
//   @override
//   Widget build(BuildContext context) {
//     final double width = MediaQuery.of(context).size.width;
//     final double height = MediaQuery.of(context).size.height;
//
//     return Scaffold(
//       body: Stack(
//         children: [
//           SizedBox(
//             width: width,
//             height: height,
//             child: Image.asset(
//               AppImages.backgroundImg,
//               fit: BoxFit.cover,
//             ),
//           ),
//           Positioned(
//             top: MediaQuery.of(context).size.height * 0.02 + MediaQuery.of(context).padding.top,
//             left: MediaQuery.of(context).size.width * 0.04,
//             child: const CustomBackButton(
//               iconColor: Colors.black,
//             ),
//           ),
//           Align(
//             alignment: Alignment.bottomCenter,
//             child: Container(
//               width: width,
//               padding: EdgeInsets.symmetric(horizontal: width * 0.06, vertical: height * 0.04),
//               decoration: BoxDecoration(
//                 color: Colors.white.withOpacity(0.85),
//                 borderRadius: const BorderRadius.only(
//                   topLeft: Radius.circular(24),
//                   topRight: Radius.circular(24),
//                 ),
//               ),
//               constraints: BoxConstraints(
//                 minHeight: height * 0.5,
//               ),
//               child: SingleChildScrollView(
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.stretch,
//                   children: [
//                     // Title
//                     Text(
//                       'Set a New Password',
//                       style: TextStyle(
//                         fontSize: width * 0.06,
//                         fontWeight: FontWeight.bold,
//                         color: Colors.black87,
//                       ),
//                       textAlign: TextAlign.center,
//                     ),
//                     SizedBox(height: height * 0.01),
//                     Text(
//                       'Create a new password. Ensure it differs from \n previous ones for security',
//                       style: TextStyle(
//                         fontSize: width * 0.04,
//                         fontWeight: FontWeight.bold,
//                         color: Colors.black87,
//                       ),
//                       textAlign: TextAlign.center,
//                     ),
//                     SizedBox(height: height * 0.03),
//
//                     // New Password Field
//                     TextField(
//                       controller: newPasswordController,
//                       obscureText: _obscureNew,
//                       decoration: InputDecoration(
//                         labelText: 'New Password',
//                         border: OutlineInputBorder(
//                           borderRadius: BorderRadius.circular(8),
//                         ),
//                         suffixIcon: IconButton(
//                           icon: Icon(_obscureNew ? Icons.visibility_off : Icons.visibility),
//                           onPressed: () {
//                             setState(() {
//                               _obscureNew = !_obscureNew;
//                             });
//                           },
//                         ),
//                       ),
//                     ),
//                     SizedBox(height: height * 0.015),
//
//                     // Retype New Password Field
//                     TextField(
//                       controller: retypePasswordController,
//                       obscureText: _obscureRetype,
//                       decoration: InputDecoration(
//                         labelText: 'Retype New Password',
//                         border: OutlineInputBorder(
//                           borderRadius: BorderRadius.circular(8),
//                         ),
//                         suffixIcon: IconButton(
//                           icon: Icon(_obscureRetype ? Icons.visibility_off : Icons.visibility),
//                           onPressed: () {
//                             setState(() {
//                               _obscureRetype = !_obscureRetype;
//                             });
//                           },
//                         ),
//                       ),
//                     ),
//                     SizedBox(height: height * 0.03),
//
//                     // Submit Button
//                     CustomButton(
//                       title: 'Reset Password',
//                       onPressed: () {
//                         Navigator.push(context, MaterialPageRoute(builder: (context)=>PasswordResetSuccessScreen()));
//                         if (newPasswordController.text != retypePasswordController.text) {
//                           ScaffoldMessenger.of(context).showSnackBar(
//                             const SnackBar(content: Text('Passwords do not match!')),
//                           );
//                         } else {
//                           // Call API or navigate
//                         }
//                       },
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }
class SetNewPasswordScreen extends StatefulWidget {
  final String email;
  const SetNewPasswordScreen({super.key, required this.email});

  @override
  State<SetNewPasswordScreen> createState() => _SetNewPasswordScreenState();
}

class _SetNewPasswordScreenState extends State<SetNewPasswordScreen> {
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController retypePasswordController = TextEditingController();

  bool _obscureNew = true;
  bool _obscureRetype = true;
  bool _isLoading = false;

  void _resetPassword() async {
    if (newPasswordController.text != retypePasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match!')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final result = await AuthService.resetPassword(
      email: widget.email,
      newPassword: newPasswordController.text,
    );

    print(result);

    setState(() {
      _isLoading = false;
    });

    if (result['success'] == true) {
      // Navigate to success screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const PasswordResetSuccessScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? 'Failed to reset password')),
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
          SizedBox(
            width: width,
            height: height,
            child: Image.asset(
              AppImages.backgroundImg,
              fit: BoxFit.cover,
            ),
          ),
          Positioned(
            top: MediaQuery.of(context).padding.top + 20,
            left: 16,
            child: const CustomBackButton(iconColor: Colors.black),
          ),
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
              constraints: BoxConstraints(minHeight: height * 0.5),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Set a New Password',
                      style: TextStyle(
                        fontSize: width * 0.06,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: height * 0.01),
                    Text(
                      'Create a new password. Ensure it differs from previous ones.',
                      style: TextStyle(fontSize: width * 0.04, fontWeight: FontWeight.bold, color: Colors.black87),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: height * 0.03),
                    TextField(
                      controller: newPasswordController,
                      obscureText: _obscureNew,
                      decoration: InputDecoration(
                        labelText: 'New Password',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        suffixIcon: IconButton(
                          icon: Icon(_obscureNew ? Icons.visibility_off : Icons.visibility),
                          onPressed: () => setState(() => _obscureNew = !_obscureNew),
                        ),
                      ),
                    ),
                    SizedBox(height: height * 0.015),
                    TextField(
                      controller: retypePasswordController,
                      obscureText: _obscureRetype,
                      decoration: InputDecoration(
                        labelText: 'Retype New Password',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        suffixIcon: IconButton(
                          icon: Icon(_obscureRetype ? Icons.visibility_off : Icons.visibility),
                          onPressed: () => setState(() => _obscureRetype = !_obscureRetype),
                        ),
                      ),
                    ),
                    SizedBox(height: height * 0.03),
                    CustomButton(
                      title: _isLoading ? 'Updating...' : 'Reset Password',
                      onPressed:  _resetPassword,
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

