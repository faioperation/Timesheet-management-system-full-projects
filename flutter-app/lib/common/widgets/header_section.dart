import 'package:flutter/material.dart';

class HeaderSection extends StatelessWidget {
  final String name;
  final VoidCallback onMenuPressed;
  final VoidCallback onNotificationPressed;
  final VoidCallback onPressed;
  final String? profileImageUrl; // Add profile image URL

  const HeaderSection({
    super.key,
    required this.name,
    required this.onPressed,
    required this.onMenuPressed,
    required this.onNotificationPressed,
    this.profileImageUrl, // Optional profile image URL
  });

  String _getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return '';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Prepend base URL with /storage/ path if it's a relative path
    const String baseUrl = "https://test5.fireai.agency";
    // Remove leading slash from imagePath if present to avoid double slashes
    final cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return '$baseUrl/storage/$cleanPath';
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = profileImageUrl != null ? _getImageUrl(profileImageUrl) : '';
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            ClipOval(
              child: imageUrl.isNotEmpty
                  ? Image.network(
                      imageUrl,
                      width: 44,
                      height: 44,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        // Silently handle 404 or other errors, show default image
                        return Image.asset(
                          'assets/images/profile.jpg',
                          width: 44,
                          height: 44,
                          fit: BoxFit.cover,
                        );
                      },
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Container(
                          width: 44,
                          height: 44,
                          color: Colors.grey[300],
                          child: const Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          ),
                        );
                      },
                    )
                  : Image.asset(
                      'assets/images/profile.jpg',
                      width: 44,
                      height: 44,
                      fit: BoxFit.cover,
                    ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Welcome back,", style: TextStyle(fontSize: 14)),
                Text(
                  name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ],
            ),
          ],
        ),
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_none, color: Colors.black),
              onPressed: onNotificationPressed,
            ),
            IconButton(
              icon: const Icon(Icons.menu, color: Colors.black),
              onPressed: onPressed,
            ),
          ],
        ),
      ],
    );
  }
}
