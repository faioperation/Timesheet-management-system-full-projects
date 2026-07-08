import 'package:flutter/material.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/activity_main_screen.dart';

import 'package:timesheet_naresh/roles/admin/pages/home_revenue_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/admin_timesheet_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/profile_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/scheduler_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/admin_profile_page.dart';
import 'package:timesheet_naresh/roles/admin/profile/screens/main_profile_screen.dart';

import 'package:timesheet_naresh/roles/supervisor/pages/supervisor_dashboard.dart';

import 'package:timesheet_naresh/roles/user/pages/settings/setting_page.dart';
import 'package:timesheet_naresh/roles/user/pages/user_dashboard.dart';

enum UserRole { admin, staff, user}

class MainBottomNavScreen extends StatefulWidget {
  final UserRole role;

  const MainBottomNavScreen({
    super.key,
    required this.role,
  });

  @override
  State<MainBottomNavScreen> createState() => _MainBottomNavScreenState();
}

class _MainBottomNavScreenState extends State<MainBottomNavScreen> {
  int _selectedIndex = 0;
  Widget? _currentAdminHomePage; // Track current admin home page
  Widget? _currentStaffHomePage; // Track current staff home page

  late final List<Map<String, dynamic>> _roleBasedPages;

  // Callback to change admin home page
  void changeAdminHomePage(Widget newPage) {
    setState(() {
      _currentAdminHomePage = newPage;
      // Update the page in the list
      _roleBasedPages[0]['page'] = newPage;
    });
  }

  // Callback to change staff home page
  void changeStaffHomePage(Widget newPage) {
    setState(() {
      _currentStaffHomePage = newPage;
      // Update the page in the list
      _roleBasedPages[0]['page'] = newPage;
    });
  }

  @override
  void initState() {
    super.initState();

    switch (widget.role) {
      case UserRole.admin:
        _currentAdminHomePage = HomeRevenuePage(onPageChange: changeAdminHomePage);
        _roleBasedPages = [
          {
            'page': _currentAdminHomePage!,
            'icon': Icons.dashboard,
            'label': 'Home',
          },
          {
            'page': const TimesheetPage(),
            'icon': Icons.access_time,
            'label': 'Timesheet',
          },
          {
            'page': SchedulerPage(),
            'icon': Icons.calendar_month,
            'label': 'Scheduler',
          },
          {
            'page': const ActivityMainScreen(),
            'icon': Icons.local_activity_outlined,
            'label': 'Activity',
          },
          // {
          //   'page': _getProfilePageByRole(widget.role), // ✅ Dynamic Profile
          //   'icon': Icons.person,
          //   'label': 'Profile',
          // },
          {
            'page': const MainProfileScreen(role : UserRole.admin),
            'icon': Icons.person,
            'label':'Profile',
          }
        ];
        break;

      case UserRole.staff:
        _currentStaffHomePage = SuperVisorDashBoard(onPageChange: changeStaffHomePage);
        _roleBasedPages = [
          {
            'page': _currentStaffHomePage!,
            'icon': Icons.dashboard,
            'label': 'Home',
          },
          {
            'page': const TimesheetPage(),
            'icon': Icons.access_time,
            'label': 'Timesheet',
          },
          {
            'page': SchedulerPage(),
            'icon': Icons.calendar_month,
            'label': 'Scheduler',
          },
          {
            'page': const ActivityMainScreen(),
            'icon': Icons.local_activity_outlined,
            'label': 'Activity',
          },
          // {
          //   'page': _getProfilePageByRole(widget.role),
          //   'icon': Icons.person,
          //   'label': 'Profile',
          // },
          {
            'page': const MainProfileScreen(role: UserRole.staff,),
            'icon': Icons.person,
            'label':'Profile',
          }
        ];
        break;

      case UserRole.user:
        _roleBasedPages = [
          {
            'page': const UserDashboard(),
            'icon': Icons.dashboard,
            'label': 'Home',
          },
          {
            'page': const TimesheetPage(),
            'icon': Icons.access_time,
            'label': 'Timesheet',
          },
          {
            'page': SettingsScreen(),
            'icon': Icons.settings,
            'label': 'Setting',
          },
          {
            'page': _getProfilePageByRole(widget.role),
            'icon': Icons.person,
            'label': 'Profile',
          },
        ];
        break;
    }
  }

  Widget _getProfilePageByRole(UserRole role) {
    switch (role) {
      case UserRole.admin:
        return const AdminProfilePage();
      case UserRole.staff:
        return const AdminProfilePage();
      case UserRole.user:
        return const ProfileScreen();
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _roleBasedPages[_selectedIndex]['page'],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blueAccent,
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        onTap: _onItemTapped,
        items: _roleBasedPages
            .map(
              (tab) => BottomNavigationBarItem(
            icon: Icon(tab['icon']),
            label: tab['label'],
          ),
        )
            .toList(),
      ),
    );
  }
}
