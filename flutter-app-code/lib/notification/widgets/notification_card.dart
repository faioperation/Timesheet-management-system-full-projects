import 'package:flutter/material.dart';
class NotificationCard extends StatefulWidget {
  final String name;
  final String subtitle;
  final String time;
  final String imageUrl;
  final bool isNew;

  const NotificationCard({
    super.key,
    required this.name,
    required this.subtitle,
    required this.time,
    required this.imageUrl,
    this.isNew = false,
  });

  @override
  State<NotificationCard> createState() => _NotificationCardState();
}

class _NotificationCardState extends State<NotificationCard> {
  bool _isExpanded = false; // subtitle show/hide toggle

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: widget.isNew ? const Color(0xFFEFF2FF) : Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          ListTile(
            contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            leading: CircleAvatar(
              radius: 24,
              backgroundImage: widget.imageUrl.startsWith('http')
                  ? NetworkImage(widget.imageUrl)
                  : AssetImage(widget.imageUrl) as ImageProvider,

            ),
            title: Row(
              children: [
                Text(
                  widget.name,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, color: Colors.black),
                ),
                const SizedBox(width: 6),
                if (widget.isNew)
                  const Icon(Icons.circle, size: 8, color: Colors.red),
              ],
            ),
            subtitle: _isExpanded
                ? Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                widget.subtitle,
                style: const TextStyle(color: Colors.black54),
              ),
            )
                : null,
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.time,
                  style: const TextStyle(color: Colors.black54),
                ),
                IconButton(
                  icon: Icon(
                    _isExpanded ? Icons.expand_less : Icons.expand_more,
                    color: Colors.grey,
                  ),
                  onPressed: () {
                    setState(() {
                      _isExpanded = !_isExpanded;
                    });
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}