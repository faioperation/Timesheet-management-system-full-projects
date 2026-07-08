import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_file_upload_field.dart';
import 'package:flutter/material.dart';

class SignatureScreen extends StatefulWidget {
  const SignatureScreen({super.key});

  @override
  State<SignatureScreen> createState() => _SignatureScreenState();
}

class _SignatureScreenState extends State<SignatureScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: "Signature"),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            CustomFileUploadField(
              label: "Upload Signature",
              onFileSelected: (filePath) {
                if (filePath != null) {
                  debugPrint("Selected file: $filePath");
                }
              },
            ),
            Spacer(),
            CustomButton(title: "Save", onPressed: (){}),
            SizedBox(height: 16,)
          ],
        ),
      ),
    );
  }
}
