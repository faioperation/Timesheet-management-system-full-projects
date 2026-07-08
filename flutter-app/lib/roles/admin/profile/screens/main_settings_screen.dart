import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/add_new_employee_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/client_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/internal_user_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/vendor_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/profile/screens/company_screen.dart';
import 'package:timesheet_naresh/roles/admin/profile/screens/email_template_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/profile/screens/role_permission_screen.dart';
import '../../activity/widgets/flow_list_item.dart';


class MainSettingsScreen extends StatelessWidget {
  const MainSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F2),
      appBar: CustomAppBar(title: "Settings"),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            FlowListItem(
              title: 'Company',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const CompanyProfileScreen(),
                  ),
                );
              },
            ),
            FlowListItem(
              title: 'Role Permission',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const RolePermissionUIScreen(),
                  ),
                );
              },
            ),
            FlowListItem(
              title: 'Email Template',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const EmailTemplateTableScreen(),
                  ),
                );
              },
            ),
            // FlowListItem(
            //   title: 'Subscription',
            //   onTap: () {
            //     Navigator.push(
            //       context,
            //       MaterialPageRoute(
            //         builder: (_) => const ClientListScreen(),
            //       ),
            //     );
            //   },
            // ),
          ],
        ),
      ),
    );
  }
}
