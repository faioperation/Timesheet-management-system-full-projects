import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:timesheet_naresh/app/constants.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';

class EmptyNotificationScreen extends StatefulWidget {
  const EmptyNotificationScreen({super.key});

  @override
  State<EmptyNotificationScreen> createState() =>
      _EmptyNotificationScreenState();
}

class _EmptyNotificationScreenState extends State<EmptyNotificationScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [

              CustomAppBar(title: "Notification"),
              const SizedBox(height: 20),

              // Illustration
              Container(
                height: 200,
                child: SvgPicture.asset(
                  AppImages.notificationImg2
                ),  // replace with your image
              ),
              const SizedBox(height: 20),
              Text(
                'No notification yet',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                //textAlign: TextAlign.start, // ✅ now works
              ),
              SizedBox(height: 24),
              Text(
                'your notification appear here once\n          you have receive them',
                style: TextStyle(
                  color: Color.fromRGBO(61, 61, 64, 1),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// class NotificationRow extends StatelessWidget {
//   final IconData icon;
//   final String text;
//
//   const NotificationRow({super.key, required this.icon, required this.text});
//
//   @override
//   Widget build(BuildContext context) {
//     return Padding(
//       padding: const EdgeInsets.symmetric(vertical: 8.0),
//       child: Row(
//         children: [
//           Icon(icon, color: Colors.blue),
//           const SizedBox(width: 10),
//           Text(text, style: const TextStyle(fontSize: 16)),
//         ],
//       ),
//     );
//   }
// }
