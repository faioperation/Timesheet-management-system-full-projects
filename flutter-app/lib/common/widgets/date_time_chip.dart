import 'package:flutter/material.dart';

import '../../app/constants.dart';
class DateChip extends StatelessWidget {
  final String date;
  final String day;
  final bool isSelected;

  const DateChip({
    super.key,
    required this.date,
    required this.day,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4.0),
      width: 50,
      decoration: BoxDecoration(
        color: isSelected ? Colors.blue.shade700 : Colors.grey.shade200,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Text(
            date,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          Text(
            day,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.grey.shade600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

// ===============================================
// 2. REUSABLE COMPONENT: TimeOptionChip
// ===============================================

class TimeOptionChip extends StatelessWidget {
  final String text;
  final bool isButton;

  const TimeOptionChip({
    super.key,
    required this.text,
    this.isButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4.0),
      padding: EdgeInsets.symmetric(
          horizontal: isButton ? 16 : 12, vertical: isButton ? 8 : 10),
      decoration: BoxDecoration(
        color: isButton ? Colors.white : Colors.white.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20),
        border: isButton
            ? Border.all(color: Colors.white, width: 1)
            : null,
      ),
      child: Text(
        text,
        style: TextStyle(
          color: isButton ? AppColors.themeColor : Colors.white,
          fontWeight: isButton ? FontWeight.w600 : FontWeight.normal,
          fontSize: 12,
        ),
      ),
    );
  }
}