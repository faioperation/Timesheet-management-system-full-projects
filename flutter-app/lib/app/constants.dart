import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class AppImages{
  static const String _imageUrl = 'assets/images';
  static const String backgroundImg = '$_imageUrl/background.jpg';
  static const String profileImg = '$_imageUrl/profile.jpg';
  static const String notificationImg1 = '$_imageUrl/notification_icon_1.svg';
  static const String notificationImg2 = '$_imageUrl/notification_icon_2.svg';
  static const String popUpImg = '$_imageUrl/popup_icon.svg';
}
class AppColors{
  static Color themeColor = Color.fromRGBO(80, 105, 229, 1);
  static Color secondaryColor = Color.fromRGBO(217, 223, 255, 1);
  static Color cancelColor = Color.fromRGBO(255, 247, 247, 1);
  static const Color supervisorText = Color(0xFFFF5252);
  static const Color userText = Color(0xFF64B5F6);
  static const Color primaryColor = Color(0xFF5683F2); // Primary Blue
  static const Color accentColor = Color(0xFFE5E9FF);  // Light Accent Blue
  static const Color softGrey = Color(0xFFF0F0F0);     // Background/Input Grey
  static const Color borderGrey = Color(0xFFCCCCCC);   // Border Grey
  static const Color redError = Color(0xFFFF5252);     // Red for Reset
  static const Color textDark = Color(0xFF333333);
}


class AppTextStyles {
  static const TextStyle roleSupervisor = TextStyle(
      color: AppColors.supervisorText,
      fontWeight: FontWeight.w600,
      fontSize: 12
  );
  static const TextStyle roleUser = TextStyle(
      color: AppColors.userText,
      fontWeight: FontWeight.w600,
      fontSize: 12
  );
  static const TextStyle label = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textDark,
  );
  static const TextStyle input = TextStyle(
    fontSize: 16,
    color: AppColors.textDark,
  );
  static const TextStyle buttonPrimary = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.white
  );
}