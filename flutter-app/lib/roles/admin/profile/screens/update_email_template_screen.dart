import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/roles/admin/profile/models/email_template_model.dart';
import 'package:timesheet_naresh/roles/admin/profile/services/email_template_service.dart';
import 'email_template_list_screen.dart';

class UpdateEmailTemplateScreen extends StatefulWidget {
  final EmailTemplateModel template;

  const UpdateEmailTemplateScreen({
    super.key,
    required this.template,
  });

  @override
  State<UpdateEmailTemplateScreen> createState() => _UpdateEmailTemplateScreenState();
}

class _UpdateEmailTemplateScreenState extends State<UpdateEmailTemplateScreen> {
  // Form controllers
  late final TextEditingController _templateNameController;
  late final TextEditingController _subjectController;
  late final TextEditingController _bodyController;

  // State variables
  String _parameterInsertLocation = 'Subject'; // 'Subject' or 'Template'
  final Map<String, bool> _usedByRoles = {
    'Business Admin': false,
    'Staff': false,
    'User': false,
  };

  final List<String> _availableParameters = [
    'User first name',
    'User last name',
    'Client name',
    'Start date',
    'End date',
    'Timesheet rejected by first name',
    'Timesheet rejected by last name',
    'Signature',
    'Private signature',
  ];

  bool _isSaving = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    // Initialize controllers with template data
    _templateNameController = TextEditingController(text: widget.template.templateName);
    _subjectController = TextEditingController(text: widget.template.subject);
    _bodyController = TextEditingController(text: widget.template.body);
    
    // Note: We don't have used_by in the GET response, so we'll default to all false
    // The user will need to select roles again
    _isLoading = false;
  }

  @override
  void dispose() {
    _templateNameController.dispose();
    _subjectController.dispose();
    _bodyController.dispose();
    super.dispose();
  }

  String _getParameterPlaceholder(String paramName) {
    final paramMap = {
      'User first name': '{{ User first name }}',
      'User last name': '{{ User last name }}',
      'Client name': '{{ Client name }}',
      'Start date': '{{ Start date }}',
      'End date': '{{ End date }}',
      'Timesheet rejected by first name': '{{ Timesheet rejected by first name }}',
      'Timesheet rejected by last name': '{{ Timesheet rejected by last name }}',
      'Signature': '{{ Signature }}',
      'Private signature': '{{ Private signature }}',
    };
    return paramMap[paramName] ?? '{{ $paramName }}';
  }

  void _insertParameter(String paramName) {
    final placeholder = _getParameterPlaceholder(paramName);
    
    if (_parameterInsertLocation == 'Subject') {
      final currentText = _subjectController.text;
      final selection = _subjectController.selection;
      final newText = currentText.replaceRange(
        selection.start,
        selection.end,
        placeholder,
      );
      _subjectController.text = newText;
      _subjectController.selection = TextSelection.collapsed(
        offset: selection.start + placeholder.length,
      );
    } else {
      final currentText = _bodyController.text;
      final selection = _bodyController.selection;
      final newText = currentText.replaceRange(
        selection.start,
        selection.end,
        placeholder,
      );
      _bodyController.text = newText;
      _bodyController.selection = TextSelection.collapsed(
        offset: selection.start + placeholder.length,
      );
    }
  }

  List<int> _getSelectedRoleIds() {
    final List<int> roleIds = [];
    if (_usedByRoles['Business Admin'] == true) roleIds.add(2);
    if (_usedByRoles['Staff'] == true) roleIds.add(3);
    if (_usedByRoles['User'] == true) roleIds.add(4);
    return roleIds;
  }

  Future<void> _handleUpdate() async {
    // Validation
    if (_templateNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter template name'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (_subjectController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter subject'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (_bodyController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter template body'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final selectedRoleIds = _getSelectedRoleIds();
    if (selectedRoleIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one role'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isSaving = true;
    });

    try {
      final response = await EmailTemplateService.updateEmailTemplate(
        templateId: widget.template.id,
        templateName: _templateNameController.text.trim(),
        templateType: widget.template.templateType, // Use existing template type
        subject: _subjectController.text.trim(),
        body: _bodyController.text.trim(),
        usedBy: selectedRoleIds,
      );

      if (mounted) {
        setState(() {
          _isSaving = false;
        });

        if (response.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message),
              backgroundColor: Colors.green,
            ),
          );
          // Navigate back to email template list screen
          Navigator.of(context).pop(true); // Return true to indicate success
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error updating template: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _formatTemplateType(String type) {
    return type.replaceAll('_', ' ').split(' ').map((word) {
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      appBar: CustomAppBar(title: "Update Template"),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Parameter Insert Section
            _buildParameterInsertSection(),
            const SizedBox(height: 24),

            // Template Type (Read-only)
            _buildTemplateTypeReadOnly(),
            const SizedBox(height: 16),

            // Template Name
            _buildTextField(
              label: 'Template Name*',
              controller: _templateNameController,
              hintText: 'Enter template name',
            ),
            const SizedBox(height: 16),

            // Template is used by
            _buildUsedBySection(),
            const SizedBox(height: 16),

            // Subject
            _buildTextField(
              label: 'Subject*',
              controller: _subjectController,
              hintText: 'Enter subject',
            ),
            const SizedBox(height: 16),

            // Template Body with Rich Text Editor
            _buildTemplateBodySection(),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    "Cancel",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: CustomButton(
                title: _isSaving ? "Updating..." : "Update",
                onPressed: _isSaving ? () {} : _handleUpdate,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildParameterInsertSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Parameter Insert on:',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Radio<String>(
                value: 'Subject',
                groupValue: _parameterInsertLocation,
                onChanged: (value) {
                  setState(() {
                    _parameterInsertLocation = value!;
                  });
                },
                activeColor: const Color(0xFF556EE6),
              ),
              const Text('Subject'),
              const SizedBox(width: 24),
              Radio<String>(
                value: 'Template',
                groupValue: _parameterInsertLocation,
                onChanged: (value) {
                  setState(() {
                    _parameterInsertLocation = value!;
                  });
                },
                activeColor: const Color(0xFF556EE6),
              ),
              const Text('Template'),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _availableParameters.map((param) {
              return InkWell(
                onTap: () => _insertParameter(param),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F0F0),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.arrow_forward, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        param,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildTemplateTypeReadOnly() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Template type',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  _formatTemplateType(widget.template.templateType),
                  style: const TextStyle(
                    fontSize: 15,
                    color: Colors.black87,
                  ),
                ),
              ),
              const Icon(Icons.lock, size: 18, color: Colors.grey),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Template type cannot be changed',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
            fontStyle: FontStyle.italic,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required String hintText,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: hintText,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFF556EE6)),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
            filled: true,
            fillColor: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildUsedBySection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Template is used by:',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          ..._usedByRoles.keys.map((role) {
            return CheckboxListTile(
              title: Text(role),
              value: _usedByRoles[role],
              onChanged: (value) {
                setState(() {
                  _usedByRoles[role] = value ?? false;
                });
              },
              controlAffinity: ListTileControlAffinity.leading,
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildTemplateBodySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Template*',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        // Rich Text Toolbar
        _buildRichTextToolbar(),
        const SizedBox(height: 8),
        // Template Body Text Area
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8),
          ),
          child: TextField(
            controller: _bodyController,
            maxLines: 10,
            decoration: const InputDecoration(
              border: InputBorder.none,
              hintText: 'Enter template body...',
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRichTextToolbar() {
    const List<IconData> icons = [
      Icons.format_bold,
      Icons.format_italic,
      Icons.format_underline,
      Icons.superscript,
      Icons.subscript,
      Icons.palette,
      Icons.format_size,
      Icons.format_align_left,
      Icons.format_align_center,
      Icons.format_align_right,
      Icons.format_align_justify,
      Icons.format_list_bulleted,
      Icons.format_list_numbered,
      Icons.table_chart,
      Icons.link,
      Icons.image,
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: icons.map((icon) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4.0),
              child: IconButton(
                icon: Icon(icon, size: 20),
                onPressed: () {
                  // TODO: Implement rich text formatting
                },
                color: Colors.black87,
                padding: const EdgeInsets.all(4),
                constraints: const BoxConstraints(),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
