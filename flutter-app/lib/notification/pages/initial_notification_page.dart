import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:timesheet_naresh/app/constants.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/secondary_custom_button.dart';
import 'package:timesheet_naresh/notification/pages/notification_page.dart';

class InitialNotificationScreen extends StatefulWidget {
  const InitialNotificationScreen({super.key});

  @override
  State<InitialNotificationScreen> createState() =>
      _InitialNotificationScreenState();
}

class _InitialNotificationScreenState extends State<InitialNotificationScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(10.0),
          child: Column(
            children: [
              // Back icon
              // Align(
              //   alignment: Alignment.centerLeft,
              //   child: IconButton(
              //     icon: Icon(Icons.arrow_back_ios),
              //     onPressed: () => Navigator.pop(context),
              //   ),
              // ),
              CustomAppBar(title: "Notification"),
              const SizedBox(height: 20),

              // Illustration
              Container(
                height: 200,
                child: SvgPicture.asset(
                  AppImages.notificationImg1
                ), // replace with your image
              ),
              const SizedBox(height: 20),

              // Heading
              SizedBox(
                width: double.infinity, // 👈 ensures full width
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Get notified about \nimportant stuff',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.start, // ✅ now works
                    ),
                    SizedBox(height: 24),
                    Text(
                      'We will notified when',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 16),

              // Notification options
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                ),
                padding: const EdgeInsets.all(15),
                child: Column(
                  children: const [
                    NotificationRow(icon: Icons.home, text: 'Gets new job'),
                    NotificationRow(
                      icon: Icons.campaign,
                      text: 'Promotion announcement',
                    ),
                    NotificationRow(
                      icon: Icons.local_shipping,
                      text: 'Delivery done',
                    ),
                    NotificationRow(
                      icon: Icons.settings,
                      text: 'Technical issue',
                    ),
                  ],
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: Text(
                  "You can adjust these settings later",
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  textAlign: TextAlign.start,
                ),
              ),
              SizedBox(height: 8),

              // Footer buttons
              Row(
                children: [
                  Expanded(
                    child: SecondaryCustomButton(
                      title: "Later",
                      onPressed: () {},
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: CustomButton(
                      title: "Got Notified",
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (context)=>NotificationScreen()));
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }
}

class NotificationRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const NotificationRow({super.key, required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: Colors.blue),
          const SizedBox(width: 10),
          Text(text, style: const TextStyle(fontSize: 16)),
        ],
      ),
    );
  }
}
