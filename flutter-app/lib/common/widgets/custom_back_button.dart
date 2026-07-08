import 'package:flutter/material.dart';

class CustomBackButton extends StatelessWidget {
  final Color? iconColor; // Icon color
  final double? iconSize; // Icon size
  final Color? backgroundColor; // Background circle color
  final VoidCallback? onPressed; // Button click action
  final EdgeInsets? margin; // Optional margin around button

  const CustomBackButton({
    super.key,
    this.iconColor,
    this.iconSize,
    this.backgroundColor,
    this.onPressed,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    final double size = iconSize ?? MediaQuery.of(context).size.width * 0.06;

    return Container(
      margin: margin ?? EdgeInsets.all(MediaQuery.of(context).size.width * 0.03),
      decoration: BoxDecoration(
        color: backgroundColor ?? Colors.white.withOpacity(0.7),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 4,
            offset: const Offset(2, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(
          Icons.arrow_back_ios,
          color: iconColor ?? Colors.black87,
          size: size,
        ),
        onPressed: onPressed ?? () => Navigator.pop(context),
        splashRadius: size * 1.2,
      ),
    );
  }
}
