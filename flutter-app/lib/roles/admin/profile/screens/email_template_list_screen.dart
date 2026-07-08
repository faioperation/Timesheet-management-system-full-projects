import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/roles/admin/profile/models/email_template_model.dart';
import 'package:timesheet_naresh/roles/admin/profile/services/email_template_service.dart';
import 'create_email_template_screen.dart';
import 'view_email_template_screen.dart';
import 'update_email_template_screen.dart';

class EmailTemplateTableScreen extends StatefulWidget {
  const EmailTemplateTableScreen({super.key});

  @override
  State<EmailTemplateTableScreen> createState() => _EmailTemplateTableScreenState();
}

class _EmailTemplateTableScreenState extends State<EmailTemplateTableScreen> {
  bool _isLoading = false;
  List<EmailTemplateModel> _templates = [];

  @override
  void initState() {
    super.initState();
    _loadTemplates();
  }

  Future<void> _loadTemplates() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await EmailTemplateService.getEmailTemplates();
      setState(() {
        _templates = response.templates;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading templates: $e')),
        );
      }
    }
  }

  String _formatTemplateType(String type) {
    return type.replaceAll('_', ' ').split(' ').map((word) {
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }

  String _getRoleName(int roleId) {
    switch (roleId) {
      case 1:
        return 'Business Admin';
      case 2:
        return 'Business Admin';
      case 3:
        return 'Staff';
      case 4:
        return 'User';
      default:
        return 'Role $roleId';
    }
  }

  Color _getRoleColor(int roleId) {
    switch (roleId) {
      case 1:
      case 2:
        return Colors.orange;
      case 3:
        return Colors.blue;
      case 4:
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  Future<void> _navigateToCreateScreen() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const CreateEmailTemplateScreen(),
      ),
    );
    // Reload templates after creating a new one
    if (result == true || mounted) {
      _loadTemplates();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      appBar: CustomAppBar(title: "Email Template"),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                CustomButton(
                  width: 220,
                  title: "Create Email Template",
                  onPressed: _navigateToCreateScreen,
                ),
              ],
            ),
            const SizedBox(height: 12),

            /// 📊 TABLE CARD
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 6,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _templates.isEmpty
                        ? const Center(
                            child: Text(
                              'No templates found',
                              style: TextStyle(fontSize: 16, color: Colors.grey),
                            ),
                          )
                        : SingleChildScrollView(
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                /// ⬅ FIXED NO COLUMN
                                SizedBox(
                                  width: 60,
                                  child: Column(
                                    children: [
                                      _noHeader(),
                                      ..._templates.asMap().entries.map((entry) {
                                        return _noCell(entry.key + 1);
                                      }).toList(),
                                    ],
                                  ),
                                ),

                                /// 👉 HORIZONTAL SCROLL AREA
                                Expanded(
                                  child: SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: Column(
                                      children: [
                                        _rightHeader(),
                                        ..._templates.map((template) {
                                          return _rightRow(template);
                                        }).toList(),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// NO COLUMN
  Widget _noHeader() {
    return Container(
      height: 48,
      alignment: Alignment.center,
      color: const Color(0xFFEFF3FF),
      child: const Text(
        "No",
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _noCell(int index) {
    return Container(
      height: 48,
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
      ),
      child: Text(index.toString().padLeft(2, '0')),
    );
  }

  /// HEADER (RIGHT SIDE)
  Widget _rightHeader() {
    return Container(
      height: 48,
      color: const Color(0xFFEFF3FF),
      child: const Row(
        children: [
          _HeaderCell("Template Name", 180),
          _HeaderCell("Template Type", 220),
          _HeaderCell("Subject", 260),
          _HeaderCell("Permission", 200),
          _HeaderCell("Action", 150),
        ],
      ),
    );
  }

  /// DATA ROW
  Widget _rightRow(EmailTemplateModel template) {
    return Container(
      height: 48,
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
      ),
      child: Row(
        children: [
          _Cell(template.templateName, 180),
          _Cell(_formatTemplateType(template.templateType), 220),
          _Cell(template.subject, 260),
          SizedBox(
            width: 200,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: template.usedBy != null && template.usedBy!.isNotEmpty
                  ? Wrap(
                      spacing: 4,
                      runSpacing: 4,
                      children: template.usedBy!.map((roleId) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: _getRoleColor(roleId).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: _getRoleColor(roleId), width: 1),
                          ),
                          child: Text(
                            _getRoleName(roleId),
                            style: TextStyle(
                              fontSize: 11,
                              color: _getRoleColor(roleId),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        );
                      }).toList(),
                    )
                  : Text(
                      'No roles',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
            ),
          ),
          SizedBox(
            width: 150,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ViewEmailTemplateScreen(
                          template: template,
                        ),
                      ),
                    );
                  },
                  child: const Text("View"),
                ),
                TextButton(
                  onPressed: () async {
                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => UpdateEmailTemplateScreen(
                          template: template,
                        ),
                      ),
                    );
                    // Reload templates after updating
                    if (result == true) {
                      _loadTemplates();
                    }
                  },
                  child: const Text("Edit"),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// HEADER CELL
class _HeaderCell extends StatelessWidget {
  final String text;
  final double width;

  const _HeaderCell(this.text, this.width);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Text(
        text,
        style: const TextStyle(fontWeight: FontWeight.bold),
      ),
    );
  }
}

/// DATA CELL
class _Cell extends StatelessWidget {
  final String text;
  final double width;

  const _Cell(this.text, this.width);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Text(
        text,
        overflow: TextOverflow.ellipsis,
        maxLines: 1,
      ),
    );
  }
}
