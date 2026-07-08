import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DateHeaderAndTime extends StatelessWidget {
  final String buttonText;
  final VoidCallback onPressed;

  const DateHeaderAndTime({
    super.key,
    required this.buttonText,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final day = DateFormat('d').format(now); // Example: 20
    final weekday = DateFormat('EEEE').format(now); // Example: Monday
    final month = DateFormat('MMMM').format(now); // Example: October

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // ⭕ Date Circle
        Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: const BoxDecoration(
                color: const Color(0xFF5069E5),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  day,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            // 📅 Weekday + Month
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  weekday,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  month,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ],
        ),

        //➕ Button (Dynamic)
        ElevatedButton.icon(
          onPressed: onPressed,
          icon: const Icon(Icons.add, color: Colors.white, size: 16),
          label: Text(
            buttonText,
            style: const TextStyle(color: Colors.white),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF5069E5),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }
}
