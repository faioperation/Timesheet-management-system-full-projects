import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/main_bottom_nav_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/activity_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/client_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/employee_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/internal_user_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/user_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/vendor_list_screen.dart';
import 'package:timesheet_naresh/roles/admin/pages/activity_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/home_revenue_page.dart';
import '../widgets/flow_list_item.dart';

class ActivityMainScreen extends StatefulWidget {
  const ActivityMainScreen({super.key});

  @override
  State<ActivityMainScreen> createState() => _ActivityMainScreenState();
}

class _ActivityMainScreenState extends State<ActivityMainScreen> {
  String? _userRole;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserRole();
  }

  Future<void> _loadUserRole() async {
    final role = await TokenService.getRole();
    setState(() {
      _userRole = role;
      _isLoading = false;
    });
  }

  bool get _isStaffRole {
    return _userRole?.toLowerCase() == 'staff' || _userRole?.toLowerCase() == 'supervisor';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F2),
      appBar: AppBar(
        title: Center(child: const Text('User Flow')),
        backgroundColor: const Color(0xFFF2F2F2),
        foregroundColor: Colors.black,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  FlowListItem(
                    title: 'User',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const UserListScreen(),
                        ),
                      );
                    },
                  ),
                  FlowListItem(
                    title: 'Internal User',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const InternalUserListScreen(),
                        ),
                      );
                    },
                  ),
                  FlowListItem(
                    title: 'Vendor',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const VendorListScreen(),
                        ),
                      );
                    },
                  ),
                  FlowListItem(
                    title: 'Client',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ClientListScreen(),
                        ),
                      );
                    },
                  ),
                  FlowListItem(
                    title: 'Employee',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const EmployeeListScreen(),
                        ),
                      );
                    },
                  ),
                  // Hide Activity option for Staff role
                  if (!_isStaffRole)
                    FlowListItem(
                      title: 'Activity',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ActivityListScreen(),
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
    );
  }
}
