import 'package:flutter/material.dart';
class ActionIconsCell extends StatelessWidget {
  final VoidCallback onViewTap;
  final VoidCallback onEditTap;

  const ActionIconsCell({
    super.key,
    required this.onViewTap,
    required this.onEditTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
      padding: const EdgeInsets.symmetric(horizontal: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          InkWell(
            onTap: onViewTap,
            child: const Icon(
              Icons.remove_red_eye,
              size: 20,
              color: Colors.blueGrey,
            ),
          ),
          InkWell(
            onTap: onEditTap,
            child: const Icon(
              Icons.edit,
              size: 20,
              color: Colors.green,
            ),
          ),
        ],
      ),
    );
  }
}
