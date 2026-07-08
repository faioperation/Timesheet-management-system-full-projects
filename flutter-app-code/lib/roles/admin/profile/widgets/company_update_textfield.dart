import 'package:flutter/material.dart';

class CompanyUpdateCustomTextField extends StatelessWidget {
  final int maxLines;
  final TextEditingController? controller;
  final TextInputType? keyboardType;

  const CompanyUpdateCustomTextField({
    super.key,
    this.maxLines = 1,
    this.controller,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.grey.shade300,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding:
        const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }
}
