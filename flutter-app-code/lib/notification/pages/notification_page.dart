import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';

import '../widgets/notification_card.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      {
        'name': 'Jack Jr.',
        'subtitle': 'Jack Jr. Created Timesheet',
        'time': 'Now',
        'image': 'assets/images/image1.png',
        'isNew': true
      },
      {
        'name': 'Eleanor Pena',
        'subtitle': 'Eleanor updated a record',
        'time': '01:55 pm',
        'image': 'assets/images/image2.png'
      },
      {
        'name': 'Dianne Russell',
        'subtitle': 'Dianne added a note',
        'time': '02:02 am',
        'image': 'assets/images/image3.png'
      },
      {
        'name': 'Ronald Richards',
        'subtitle': 'Ronald changed settings',
        'time': '05:36 pm',
        'image': 'assets/images/image4.png'
      },
      {
        'name': 'Jack Jr.',
        'subtitle': 'Jack Jr. Created Timesheet',
        'time': 'Now',
        'image': 'assets/images/image1.png',
        'isNew': true
      },
      {
        'name': 'Eleanor Pena',
        'subtitle': 'Eleanor updated a record',
        'time': '01:55 pm',
        'image': 'assets/images/image2.png'
      },
      {
        'name': 'Dianne Russell',
        'subtitle': 'Dianne added a note',
        'time': '02:02 am',
        'image': 'assets/images/image3.png'
      },
      {
        'name': 'Ronald Richards',
        'subtitle': 'Ronald changed settings',
        'time': '05:36 pm',
        'image': 'assets/images/image4.png'
      },
      {
        'name': 'Jack Jr.',
        'subtitle': 'Jack Jr. Created Timesheet',
        'time': 'Now',
        'image': 'assets/images/image1.png',
        'isNew': true
      },
      {
        'name': 'Eleanor Pena',
        'subtitle': 'Eleanor updated a record',
        'time': '01:55 pm',
        'image': 'assets/images/image2.png'
      },
      {
        'name': 'Dianne Russell',
        'subtitle': 'Dianne added a note',
        'time': '02:02 am',
        'image': 'assets/images/image3.png'
      },
      {
        'name': 'Ronald Richards',
        'subtitle': 'Ronald changed settings',
        'time': '05:36 pm',
        'image': 'assets/images/image4.png'
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF6F6F9),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              CustomAppBar(title: "Notification"),
              SizedBox(height: 10,),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: notifications.length,
                  itemBuilder: (context, index) {
                    final item = notifications[index];
                    return NotificationCard(
                      name: item['name'] as String,
                      subtitle: item['subtitle'] as String? ?? '',
                      time: item['time'] as String,
                      imageUrl: item['image'] as String,
                      isNew: item['isNew'] as bool? ?? false,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      )
    );
  }
}


