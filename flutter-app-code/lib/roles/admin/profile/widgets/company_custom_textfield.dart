import 'package:flutter/material.dart';

class CompanyCustomTextField extends StatelessWidget {
  final String? initialValue;
  final bool readOnly;
  final int maxLines;

  const CompanyCustomTextField({
    super.key,
    this.initialValue,
    this.readOnly = false,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      readOnly: readOnly,
      controller: TextEditingController(text: initialValue),
      maxLines: maxLines,
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.grey.shade300,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        contentPadding:
        const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }
}
