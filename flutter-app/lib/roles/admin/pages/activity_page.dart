import 'package:flutter/material.dart';
import '../../../common/widgets/activity_image_card.dart';

class ActivityPage extends StatefulWidget {
  const ActivityPage({super.key});

  @override
  State<ActivityPage> createState() => _ActivityPageState();
}

class _ActivityPageState extends State<ActivityPage> {
  String _selectedRole = 'All';
  String _selectedActivity = 'Activities';

  final List<Map<String, String>> _activityData = [
    {
      'name': 'Theresa Webb',
      'role': 'User',
      'activity': 'Timesheet approved',
      'date': '14 Sep 2025',
      'avatar': 'https://i.pravatar.cc/150?img=1',
    },
    {
      'name': 'Dianne Russell',
      'role': 'Supervisor',
      'activity': 'Timesheet approved',
      'date': '14 Sep 2025',
      'avatar': 'https://i.pravatar.cc/150?img=5',
    },
    {
      'name': 'Leslie Alexander',
      'role': 'User',
      'activity': 'Timesheet approved',
      'date': '14 Sep 2025',
      'avatar': 'https://i.pravatar.cc/150?img=3',
    },
    {
      'name': 'Bessie Cooper',
      'role': 'Supervisor',
      'activity': 'Timesheet approved',
      'date': '14 Sep 2025',
      'avatar': 'https://i.pravatar.cc/150?img=8',
    },
    {
      'name': 'Marvin McKinney',
      'role': 'User',
      'activity': 'Timesheet approved',
      'date': '14 Sep 2025',
      'avatar': 'https://i.pravatar.cc/150?img=7',
    },
    {
      'name': 'Cody Fisher',
      'role': 'Supervisor',
      'activity': 'Timesheet approved',
      'date': '14 Sep 2025',
      'avatar': 'https://i.pravatar.cc/150?img=11',
    },
    {
      'name': 'Jenny Wilson',
      'role': 'Supervisor',
      'activity': 'Timesheet approved',
      'date': '14 Sep 2025',
      'avatar': 'https://i.pravatar.cc/150?img=13',
    },
  ];

  void _showRolePopup(BuildContext context) async {
    // ধরো তোমার user role একটা variable এ আসে
    // (এটা তুমি real app এ login data থেকে নেবে)
    String currentUserRole = 'Admin'; // অথবা 'Supervisor'

    // role অনুযায়ী popup items তৈরি হবে
    List<PopupMenuEntry<String>> roleMenuItems = [];

    if (currentUserRole == 'Admin') {
      roleMenuItems = const [
        PopupMenuItem(value: 'All', child: Text('All')),
        PopupMenuItem(value: 'User', child: Text('User')),
        PopupMenuItem(value: 'Admin', child: Text('Admin')),
        PopupMenuItem(value: 'Supervisor', child: Text('Supervisor')),
      ];
    } else if (currentUserRole == 'Supervisor') {
      roleMenuItems = const [
        PopupMenuItem(value: 'All', child: Text('All')),
        PopupMenuItem(value: 'User', child: Text('User')),
        PopupMenuItem(value: 'Supervisor', child: Text('Supervisor')),
      ];
    }

    // popup দেখানো হচ্ছে
    final result = await showMenu(
      context: context,
      position: RelativeRect.fromLTRB(50, 200, 50, 0),
      items: roleMenuItems,
    );

    if (result != null) {
      setState(() => _selectedRole = result);
    }
  }


  void _showActivityPopup(BuildContext context) async {
    final result = await showMenu(
      context: context,
      position: RelativeRect.fromLTRB(200, 200, 50, 0),
      items: const [
        PopupMenuItem(value: 'Timesheet Reject', child: Text('Timesheet Reject')),
        PopupMenuItem(value: 'Timesheet Approved', child: Text('Timesheet Approved')),
        PopupMenuItem(value: 'Template Create', child: Text('Template Create')),
        PopupMenuItem(value: 'Timesheet Create', child: Text('Timesheet Create')),
        PopupMenuItem(value: 'Add User', child: Text('Add User')),
      ],
    );
    if (result != null) setState(() => _selectedActivity = result);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              /// Header (fixed)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Activity',
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Icon(Icons.notifications_none, color: Colors.black,),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'Your activity timeline, simplified.',
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
              const SizedBox(height: 16),

              /// Filters (fixed)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CustomDropdownFilter(
                    value: _selectedRole,
                    onTap: () => _showRolePopup(context),
                  ),
                  CustomDropdownFilter(
                    value: _selectedActivity,
                    onTap: () => _showActivityPopup(context),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              /// List (scrollable)
              Expanded(
                child: ListView.builder(
                  itemCount: _activityData.length,
                  itemBuilder: (context, index) {
                    final item = _activityData[index];
                    return ActivityItemCard(
                      avatarUrl: item['avatar']!,
                      activityType: item['activity']!,
                      userName: item['name']!,
                      date: item['date']!,
                      role: item['role']!,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Dummy dropdown filter widget
class CustomDropdownFilter extends StatelessWidget {
  final String value;
  final VoidCallback onTap;

  const CustomDropdownFilter({
    super.key,
    required this.value,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Text(value, style: const TextStyle(fontSize: 16)),
            const Icon(Icons.arrow_drop_down),
          ],
        ),
      ),
    );
  }
}
