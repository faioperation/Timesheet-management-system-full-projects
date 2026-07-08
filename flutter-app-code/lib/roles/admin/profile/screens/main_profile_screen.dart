import 'package:flutter/material.dart';
import 'package:timesheet_naresh/auth/pages/sign_in_page.dart';
import 'package:timesheet_naresh/main_bottom_nav_screen.dart';
import 'package:timesheet_naresh/roles/admin/pages/profile_page.dart';
import 'package:timesheet_naresh/roles/admin/profile/screens/main_settings_screen.dart';
import 'package:timesheet_naresh/roles/admin/profile_page/my_profile_page_admin.dart';
import 'package:timesheet_naresh/roles/admin/profile_page/setting_page_admin.dart';

import '../../../../common/services/token_service.dart';
import '../../../../common/widgets/custom_app_bar.dart';
import '../../../../common/widgets/custom_cancel_button.dart';
import '../../activity/widgets/flow_list_item.dart';

class MainProfileScreen extends StatefulWidget {
  final UserRole role;
  const MainProfileScreen({super.key, required this.role});

  @override
  State<MainProfileScreen> createState() => _MainProfileScreenState();
}

class _MainProfileScreenState extends State<MainProfileScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F2),
      appBar: AppBar(
        title: Center(child: const Text('Settings')),
        backgroundColor: const Color(0xFFF2F2F2),
        foregroundColor: Colors.black,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            FlowListItem(
              title: 'My Profile',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const ProfileScreen(),
                  ),
                );
              },
            ),
            FlowListItem(
              title: 'Change Password',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const SettingPageAdmin(),
                  ),
                );
              },
            ),
            if (widget.role == UserRole.admin)
              FlowListItem(
                title: 'Settings',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const MainSettingsScreen(),
                    ),
                  );
                },
              ),

            const Spacer(),

            SizedBox(
              width: double.infinity,
              child: CancelCustomButton(
                icon: Icons.logout_outlined,
                title: "LogOut",
                onPressed: () async {
                  await TokenService.clearAuth();
                  Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context)=>SignInScreen()), (route)=>false);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
