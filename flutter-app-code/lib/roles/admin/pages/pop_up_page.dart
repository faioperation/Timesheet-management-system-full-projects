import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:timesheet_naresh/app/constants.dart';
import 'package:timesheet_naresh/roles/admin/pages/assign_client_page.dart';

void showSuccessDialog(BuildContext context, int? userDetailsId) {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (BuildContext context) {
      return SuccessPopup(userDetailsId: userDetailsId);
    },
  );
}

class SuccessPopup extends StatelessWidget {
  final int? userDetailsId;
  
  const SuccessPopup({super.key, this.userDetailsId});
  
  @override
  Widget build(BuildContext context) {
    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
      child: Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.0),
        ),
        child: Container(
          padding: const EdgeInsets.all(20.0),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.95),
            borderRadius: BorderRadius.circular(20.0),
            gradient: LinearGradient(
              colors: [
                Colors.green.shade50.withOpacity(0.8),
                Colors.white,
                Colors.pink.shade50.withOpacity(0.8),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              CircleAvatar(
                radius: 40,
                backgroundColor: Colors.transparent, // background দেখাবে না
                child: ClipOval(
                  child: SvgPicture.asset(
                    AppImages.popUpImg,
                    width: 80,  // 2*radius
                    height: 80, // 2*radius
                    fit: BoxFit.cover, // পুরো circle fill করবে
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'User has been registered successfully',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    if (userDetailsId != null) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => AssignClientScreen(userDetailsId: userDetailsId!),
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("User details ID not found")),
                      );
                    }
                  },
                  icon: const Icon(Icons.arrow_right_alt, color: Colors.white),
                  label: const Text(
                    'Assign client details',
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF5B69F8),
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    elevation: 5,
                  ),
                ),
              ),
              const SizedBox(height: 15),
              // Close বাটন
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    print('Close clicked');
                  },
                  child: const Text(
                    'Close',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.redAccent,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.red.shade50, // হাল্কা লাল রং
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
