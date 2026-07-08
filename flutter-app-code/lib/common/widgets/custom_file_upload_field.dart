import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';

class CustomFileUploadField extends StatefulWidget {
  final String label;                 // Field label (e.g., “Upload Document”)
  final IconData icon;                // Icon shown inside the field
  final void Function(String?)? onFileSelected; // Callback to return selected file path

  const CustomFileUploadField({
    super.key,
    required this.label,
    this.icon = Icons.attach_file,
    this.onFileSelected,
  });

  @override
  State<CustomFileUploadField> createState() => _CustomFileUploadFieldState();
}

class _CustomFileUploadFieldState extends State<CustomFileUploadField> {
  String? _fileName;

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles();

    if (result != null && result.files.single.name.isNotEmpty) {
      setState(() {
        _fileName = result.files.single.name;
      });
      widget.onFileSelected?.call(result.files.single.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _pickFile,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade400),
              color: Colors.white54,
            ),
            child: Row(
              children: [
                Icon(widget.icon, color: Colors.blueAccent),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _fileName ?? "No file choosen ...",
                    style: TextStyle(
                      fontSize: 15,
                      color: _fileName == null ? Colors.grey : Colors.black,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
