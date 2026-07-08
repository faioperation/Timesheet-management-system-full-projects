import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/roles/admin/profile/services/email_template_service.dart';
import 'package:timesheet_naresh/roles/admin/profile/models/email_template_model.dart';
import 'email_template_list_screen.dart';

class CreateEmailTemplateScreen extends StatefulWidget {
  const CreateEmailTemplateScreen({super.key});

  @override
  State<CreateEmailTemplateScreen> createState() => _CreateEmailTemplateScreenState();
}

class _CreateEmailTemplateScreenState extends State<CreateEmailTemplateScreen> {
  // Form controllers
  final TextEditingController _templateNameController = TextEditingController();
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _bodyController = TextEditingController();

  // State variables
  String _parameterInsertLocation = 'Subject'; // 'Subject' or 'Template'
  String? _selectedTemplateType;
  final List<String> _templateTypes = ['timesheet_submit', 'timesheet_approve', 'timesheet_reject','pending_timesheet_reminder','general'];
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

  // Track selected parameters for Subject and Template
  final Set<String> _selectedSubjectParameters = <String>{};
  final Set<String> _selectedTemplateParameters = <String>{};

  // Clone Template variables
  List<EmailTemplateModel> _availableTemplates = [];
  EmailTemplateModel? _selectedCloneTemplate;
  bool _isLoadingTemplates = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadTemplates();
  }

  @override
  void dispose() {
    _templateNameController.dispose();
    _subjectController.dispose();
    _bodyController.dispose();
    super.dispose();
  }

  Future<void> _loadTemplates() async {
    setState(() {
      _isLoadingTemplates = true;
    });

    try {
      final response = await EmailTemplateService.getEmailTemplates();
      if (mounted) {
        setState(() {
          _availableTemplates = response.templates;
          _isLoadingTemplates = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingTemplates = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading templates: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _onCloneTemplateSelected(EmailTemplateModel? template) {
    if (template == null) {
      setState(() {
        _selectedCloneTemplate = null;
      });
      return;
    }

    setState(() {
      _selectedCloneTemplate = template;
      
      // Populate all fields with template data
      _templateNameController.text = template.templateName;
      _selectedTemplateType = template.templateType;
      _subjectController.text = template.subject;
      _bodyController.text = template.body;
      
      // Populate used by roles based on template's usedBy field
      if (template.usedBy != null) {
        // Handle both role_id 1 and 2 as Business Admin
        _usedByRoles['Business Admin'] = template.usedBy!.contains(1) || template.usedBy!.contains(2);
        _usedByRoles['Staff'] = template.usedBy!.contains(3);
        _usedByRoles['User'] = template.usedBy!.contains(4);
      } else {
        // Reset if no usedBy data
        _usedByRoles['Business Admin'] = false;
        _usedByRoles['Staff'] = false;
        _usedByRoles['User'] = false;
      }
    });
  }

  String _getParameterPlaceholder(String paramName) {
    final paramMap = {
      'User first name': '{User first name}',
      'User last name': '{User last name}',
      'Client name': '{Client name}',
      'Start date': '{Start date}',
      'End date': '{End date}',
      'Timesheet rejected by first name': '{Timesheet rejected by first name}',
      'Timesheet rejected by last name': '{Timesheet rejected by last name}',
      'Signature': '{Signature}',
      'Private signature': '{Private signature}',
    };
    return paramMap[paramName] ?? '{$paramName}';
  }

  void _insertParameter(String paramName) {
    final placeholder = _getParameterPlaceholder(paramName);
    
    setState(() {
      if (_parameterInsertLocation == 'Subject') {
        // Toggle parameter selection
        if (_selectedSubjectParameters.contains(paramName)) {
          // Remove parameter from selection and from text
          _selectedSubjectParameters.remove(paramName);
          final currentText = _subjectController.text;
          _subjectController.text = currentText.replaceAll(placeholder, '').replaceAll(RegExp(r'\s+'), ' ').trim();
        } else {
          // Add parameter to selection and append to text
          _selectedSubjectParameters.add(paramName);
          final currentText = _subjectController.text.trim();
          // Check if parameter already exists in text
          if (!currentText.contains(placeholder)) {
            _subjectController.text = currentText.isEmpty ? placeholder : '$currentText $placeholder';
          }
        }
      } else {
        // Toggle parameter selection
        if (_selectedTemplateParameters.contains(paramName)) {
          // Remove parameter from selection and from text
          _selectedTemplateParameters.remove(paramName);
          final currentText = _bodyController.text;
          _bodyController.text = currentText.replaceAll(placeholder, '').replaceAll(RegExp(r'\s+'), ' ').trim();
        } else {
          // Add parameter to selection and append to text
          _selectedTemplateParameters.add(paramName);
          final currentText = _bodyController.text.trim();
          // Check if parameter already exists in text
          if (!currentText.contains(placeholder)) {
            _bodyController.text = currentText.isEmpty ? placeholder : '$currentText $placeholder';
          }
        }
      }
    });
  }

  List<int> _getSelectedRoleIds() {
    final List<int> roleIds = [];
    if (_usedByRoles['Business Admin'] == true) roleIds.add(2);
    if (_usedByRoles['Staff'] == true) roleIds.add(3);
    if (_usedByRoles['User'] == true) roleIds.add(4);
    return roleIds;
  }

  Future<void> _handleSave() async {
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

    if (_selectedTemplateType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select template type'),
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
      final response = await EmailTemplateService.createEmailTemplate(
        templateName: _templateNameController.text.trim(),
        templateType: _selectedTemplateType!,
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
            content: Text('Error creating template: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      appBar: CustomAppBar(title: "Create Template"),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTemplateTypeDropdown(),
            const SizedBox(height: 16),
            // Clone Template Dropdown
            _buildCloneTemplateDropdown(),
            const SizedBox(height: 24),

            // Parameter Insert Section
            _buildParameterInsertSection(),
            const SizedBox(height: 24),

            // Template Type Dropdown


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
                title: _isSaving ? "Saving..." : "Save",
                onPressed: _isSaving ? () {} : _handleSave,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCloneTemplateDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Clone Template',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: _isLoadingTemplates
              ? const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Center(child: CircularProgressIndicator()),
                )
              : DropdownButton<EmailTemplateModel>(
                  value: _selectedCloneTemplate,
                  isExpanded: true,
                  underline: const SizedBox(),
                  hint: const Text('Select template to clone'),
                  items: _availableTemplates.map((template) {
                    return DropdownMenuItem<EmailTemplateModel>(
                      value: template,
                      child: Text(template.templateName),
                    );
                  }).toList(),
                  onChanged: (value) {
                    _onCloneTemplateSelected(value);
                  },
                ),
        ),
      ],
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
              Text('Subject ${_selectedSubjectParameters.isNotEmpty ? "(${_selectedSubjectParameters.length})" : ""}'),
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
              Text('Template ${_selectedTemplateParameters.isNotEmpty ? "(${_selectedTemplateParameters.length})" : ""}'),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _availableParameters.map((param) {
              final isSelected = _parameterInsertLocation == 'Subject'
                  ? _selectedSubjectParameters.contains(param)
                  : _selectedTemplateParameters.contains(param);
              
              return InkWell(
                onTap: () => _insertParameter(param),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF556EE6).withOpacity(0.1) : const Color(0xFFF0F0F0),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF556EE6) : Colors.grey.shade300,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isSelected ? Icons.check_circle : Icons.arrow_forward,
                        size: 16,
                        color: isSelected ? const Color(0xFF556EE6) : Colors.grey,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        param,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                          color: isSelected ? const Color(0xFF556EE6) : Colors.black87,
                        ),
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

  Widget _buildTemplateTypeDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Template type*',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: DropdownButton<String>(
            value: _selectedTemplateType,
            isExpanded: true,
            underline: const SizedBox(),
            hint: const Text('Select template type'),
            items: _templateTypes.map((type) {
              return DropdownMenuItem<String>(
                value: type,
                child: Text(type.replaceAll('_', ' ').split(' ').map((word) {
                  return word[0].toUpperCase() + word.substring(1);
                }).join(' ')),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedTemplateType = value;
              });
            },
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
