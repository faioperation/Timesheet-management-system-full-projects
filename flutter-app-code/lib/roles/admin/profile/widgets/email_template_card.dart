import 'package:flutter/material.dart';
import '../models/email_template_model.dart';

class EmailTemplateCard extends StatelessWidget {
  final EmailTemplateModel template;
  final VoidCallback onView;

  const EmailTemplateCard({
    super.key,
    required this.template,
    required this.onView,
  });

  String _formatTemplateType(String type) {
    return type.replaceAll('_', ' ').split(' ').map((word) {
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /// Template name
          Text(
            template.templateName,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: 6),

          _row("Type", _formatTemplateType(template.templateType)),
          _row("Subject", template.subject),

          const SizedBox(height: 10),

          /// Status
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: template.status == 'active' 
                  ? Colors.green.shade50 
                  : Colors.grey.shade50,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(
                color: template.status == 'active' 
                    ? Colors.green 
                    : Colors.grey,
              ),
            ),
            child: Text(
              template.status.toUpperCase(),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: template.status == 'active' 
                    ? Colors.green 
                    : Colors.grey,
              ),
            ),
          ),

          const SizedBox(height: 12),

          /// Action
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: onView,
              child: const Text("View"),
            ),
          )
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 70,
            child: Text(
              "$label:",
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}
