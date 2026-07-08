import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/roles/admin/pages/preview_page.dart';
import 'package:timesheet_naresh/roles/admin/pop_up/add_note_dialog.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/models/timesheet_model.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/services/timesheet_service.dart';
import 'package:timesheet_naresh/roles/admin/profile/services/email_template_service.dart';
import 'package:timesheet_naresh/roles/admin/profile/models/email_template_model.dart';
import '../../../app/constants.dart';
import '../../../common/widgets/custom_file_upload_field.dart';
import '../widgets/add_remark_pop_up.dart';
import '../widgets/time_input_field.dart';

class CustomDropdownField extends StatefulWidget {
  final String label;
  final List<String> options;
  final String initialValue;
  final void Function(String)? onChanged;

  const CustomDropdownField({
    super.key,
    required this.label,
    required this.options,
    required this.initialValue,
    this.onChanged,
  });

  @override
  _CustomDropdownFieldState createState() => _CustomDropdownFieldState();
}

class _CustomDropdownFieldState extends State<CustomDropdownField> {
  late String selectedValue;

  @override
  void initState() {
    super.initState();
    selectedValue = widget.initialValue.isNotEmpty
        ? widget.initialValue
        : (widget.options.isNotEmpty ? widget.options.first : '');
  }


  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: AppTextStyles.label.copyWith(color: AppColors.textDark)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: selectedValue,
          items: widget.options.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          onChanged: (val) {
            if (val != null) {
              setState(() => selectedValue = val);
              if (widget.onChanged != null) widget.onChanged!(val);
            }
          },
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.borderGrey),
            ),
          ),
        ),
      ],
    );
  }
}

class UpdateTimesheetPage extends StatefulWidget {
  final TimesheetModel? timesheet;

  const UpdateTimesheetPage({super.key, this.timesheet});

  @override
  State<UpdateTimesheetPage> createState() => _UpdateTimesheetPageState();
}

class _UpdateTimesheetPageState extends State<UpdateTimesheetPage> {
  DateTime? startDate;
  DateTime? endDate;
  List<Map<String, dynamic>> timesheetData = [];
  String? selectedEmailTemplate;
  String? selectedEmailTemplateId;
  List<EmailTemplateModel> emailTemplates = [];
  final TextEditingController toEmailController = TextEditingController();
  final TextEditingController subjectController = TextEditingController();
  final TextEditingController bodyController = TextEditingController();
  String remarks = '';
  bool isSubmitting = false;
  bool isLoadingTemplates = false;

  @override
  void initState() {
    super.initState();
    // If timesheet is provided, initialize the form with its data
    if (widget.timesheet != null) {
      _initializeFromTimesheet(widget.timesheet!);
    }
    _loadEmailTemplates();
  }

  Future<void> _handleUpdateTimesheet() async {
    if (widget.timesheet == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Timesheet data not found')),
      );
      return;
    }

    if (startDate == null || endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select start and end dates')),
      );
      return;
    }

    if (timesheetData.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please generate timesheet table first')),
      );
      return;
    }

    if (toEmailController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter email address')),
      );
      return;
    }

    setState(() => isSubmitting = true);

    try {
      // Prepare entries (same format as createTimesheet)
      final List<Map<String, dynamic>> entries = [];
      for (var row in timesheetData) {
        final date = row['date'] as DateTime;
        final dailyController = row['daily'] as TextEditingController;
        final extraController = row['extra'] as TextEditingController;
        final vacationController = row['vacation'] as TextEditingController;
        final note = row['note'] as String? ?? '';

        entries.add({
          'entry_date': DateFormat('yyyy-MM-dd').format(date),
          'daily_hours': double.tryParse(dailyController.text) ?? 0.0,
          'extra_hours': double.tryParse(extraController.text) ?? 0.0,
          'vacation_hours': double.tryParse(vacationController.text) ?? 0.0,
          'note': note,
        });
      }

      final timesheet = widget.timesheet!;

      final response = await TimesheetService().updateTimesheet(
        timesheetId: timesheet.id,
        userId: timesheet.userId,
        clientId: timesheet.clientId,
        startDate: DateFormat('yyyy-MM-dd').format(startDate!),
        endDate: DateFormat('yyyy-MM-dd').format(endDate!),
        status: timesheet.status,
        remarks: remarks.isNotEmpty ? remarks : timesheet.remarks,
        mailTemplateId: selectedEmailTemplateId != null
            ? int.tryParse(selectedEmailTemplateId!)
            : timesheet.mailTemplateId,
        sendTo: toEmailController.text.isNotEmpty
            ? toEmailController.text
            : timesheet.sendTo,
        file: null, // File update not supported here for now
        entries: entries,
      );

      setState(() => isSubmitting = false);

      if (!mounted) return;

      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Timesheet updated successfully'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Failed to update timesheet'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      setState(() => isSubmitting = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error updating timesheet: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _initializeFromTimesheet(TimesheetModel timesheet) {
    try {
      startDate = DateTime.parse(timesheet.startDate);
      endDate = DateTime.parse(timesheet.endDate);

      // Generate timesheet data from entries
      timesheetData = timesheet.entries.map((entry) {
        final DateTime entryDate = entry.entryDate;
        return {
          'day': DateFormat('EEE MM/dd').format(entryDate),
          'date': entryDate,
          'daily': TextEditingController(text: entry.dailyHours),
          'extra': TextEditingController(text: entry.extraHours),
          'vacation': TextEditingController(text: entry.vacationHours),
          'note': entry.note ?? '',
        };
      }).toList();

      // Pre-fill email fields if available
      toEmailController.text = timesheet.sendTo ?? '';
      subjectController.text = '${timesheet.user.name} timesheet (${DateFormat('MM/dd/yyyy').format(startDate!)} - ${DateFormat('MM/dd/yyyy').format(endDate!)})';
      remarks = timesheet.remarks ?? '';
    } catch (e) {
      // If parsing fails, leave fields empty
    }
  }

  Future<void> _loadEmailTemplates() async {
    setState(() => isLoadingTemplates = true);
    try {
      final response = await EmailTemplateService.getEmailTemplates();
      if (!mounted) return;
      setState(() {
        emailTemplates = response.templates;
        isLoadingTemplates = false;
      });

      // Pre-select template from timesheet if available
      final timesheet = widget.timesheet;
      if (timesheet != null && timesheet.mailTemplateId != null) {
        final tpl = emailTemplates.firstWhere(
          (t) => t.id == timesheet.mailTemplateId,
          orElse: () => emailTemplates.isNotEmpty ? emailTemplates.first : EmailTemplateModel(
            id: 0,
            templateName: '',
            templateType: '',
            subject: '',
            body: '',
            status: 'active',
            isLocked: 0,
            businessId: 0,
            createdAt: '',
            updatedAt: '',
          ),
        );
        if (tpl.id != 0) {
          _onEmailTemplateSelected(tpl.templateName);
        }
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoadingTemplates = false);
    }
  }

  void _onEmailTemplateSelected(String? templateName) {
    if (templateName == null || templateName.isEmpty) {
      setState(() {
        selectedEmailTemplate = null;
        selectedEmailTemplateId = null;
      });
      return;
    }

    final template = emailTemplates.firstWhere(
      (t) => t.templateName == templateName,
      orElse: () => emailTemplates.first,
    );

    setState(() {
      selectedEmailTemplate = template.templateName;
      selectedEmailTemplateId = template.id.toString();
      subjectController.text = template.subject;
      bodyController.text = template.body;
    });
  }

  @override
  void dispose() {
    // Dispose all text controllers
    for (var row in timesheetData) {
      (row['daily'] as TextEditingController).dispose();
      (row['extra'] as TextEditingController).dispose();
      (row['vacation'] as TextEditingController).dispose();
    }
    toEmailController.dispose();
    subjectController.dispose();
    bodyController.dispose();
    super.dispose();
  }

  void _generateTimesheetTable() {
    if (startDate == null || endDate == null) return;

    // Dispose old controllers
    for (var row in timesheetData) {
      (row['daily'] as TextEditingController).dispose();
      (row['extra'] as TextEditingController).dispose();
      (row['vacation'] as TextEditingController).dispose();
    }

    final List<Map<String, dynamic>> newData = [];
    DateTime currentDate = startDate!;

    while (!currentDate.isAfter(endDate!)) {
      final dayName = DateFormat('EEE').format(currentDate);
      final dateStr = DateFormat('dd MMM yyyy').format(currentDate);
      
      newData.add({
        'date': currentDate,
        'day': '$dayName $dateStr',
        'daily': TextEditingController(text: '8'),
        'extra': TextEditingController(text: '0'),
        'vacation': TextEditingController(text: '0'),
        'note': '',
      });
      
      currentDate = currentDate.add(const Duration(days: 1));
    }

    setState(() {
      timesheetData = newData;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: CustomAppBar(title: "Update Timesheet"),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row 1: User & Client
            Row(
              children: [
                Expanded(
                  child: CustomDropdownField(
                    label: 'User*',
                    options: [
                      if (widget.timesheet != null) widget.timesheet!.user.name else 'User',
                    ],
                    initialValue: widget.timesheet?.user.name ?? 'User',
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: CustomDropdownField(
                    label: 'Client*',
                    options: [
                      if (widget.timesheet != null) widget.timesheet!.client.name else 'Client',
                    ],
                    initialValue: widget.timesheet?.client.name ?? 'Client',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Row 2: File upload
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 6),
                CustomFileUploadField(
                  label: "File",
                  onFileSelected: (filePath) {
                    if (filePath != null) {
                      debugPrint("Selected file: $filePath");
                    }
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: TimeInputField(
                    label: 'Start Date*',
                    value: startDate != null ? DateFormat('dd MMM yyyy').format(startDate!) : '',
                    initialDate: startDate,
                    isDate: true,
                    onDateChanged: (date) {
                      if (date != null) {
                        setState(() {
                          startDate = date;
                        });
                      }
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TimeInputField(
                    label: 'End Date*',
                    value: endDate != null ? DateFormat('dd MMM yyyy').format(endDate!) : '',
                    initialDate: endDate,
                    isDate: true,
                    onDateChanged: (date) {
                      if (date != null) {
                        setState(() {
                          endDate = date;
                        });
                      }
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () {
                    if (startDate == null || endDate == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please select both start and end dates')),
                      );
                      return;
                    }
                    if (endDate!.isBefore(startDate!)) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('End date must be after start date')),
                      );
                      return;
                    }
                    _generateTimesheetTable();
                  },
                  style: TextButton.styleFrom(
                    backgroundColor: AppColors.accentColor,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text('Set default', style: AppTextStyles.buttonPrimary.copyWith(color: AppColors.primaryColor)),
                ),
                // ElevatedButton(
                //   onPressed: () {
                //     showDialog(
                //       context: context,
                //       builder: (BuildContext context) {
                //         return AddRemarkDialog(
                //           onSave: (value) {
                //             setState(() {
                //               remarks = value;
                //             });
                //           },
                //         );
                //       },
                //     );
                //   },
                //   style: ElevatedButton.styleFrom(
                //     backgroundColor: AppColors.primaryColor,
                //     padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                //     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                //   ),
                //   child: const Text('Add remark', style: AppTextStyles.buttonPrimary),
                // ),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Timesheet Data', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            timesheetData.isEmpty
                ? const Padding(
                    padding: EdgeInsets.all(20.0),
                    child: Center(
                      child: Text(
                        'Please select dates and click "Set default" to generate table',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ),
                  )
                : _buildTimesheetTable(context),
            const SizedBox(height: 24),

            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Email Template', style: AppTextStyles.label),
                const SizedBox(height: 6),
                isLoadingTemplates
                    ? const SizedBox(
                        height: 48,
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : DropdownButtonFormField<String>(
                        value: selectedEmailTemplate,
                        isExpanded: true,
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: AppColors.borderGrey),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: AppColors.borderGrey),
                          ),
                        ),
                        hint: const Text('Select email template'),
                        items: emailTemplates.map((template) {
                          return DropdownMenuItem(
                            value: template.templateName,
                            child: Text(template.templateName),
                          );
                        }).toList(),
                        onChanged: _onEmailTemplateSelected,
                      ),
                const SizedBox(height: 16),

                // To Input
                const Text('To*', style: AppTextStyles.label),
                const SizedBox(height: 6),
                TextField(
                  controller: toEmailController,
                  decoration: InputDecoration(
                    hintText: 'example@gmail.com',
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(8)), borderSide: BorderSide(color: AppColors.borderGrey)),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                  ),
                ),
                const SizedBox(height: 16),

                // Subject Input
                const Text('Subject*', style: AppTextStyles.label),
                const SizedBox(height: 6),
                TextField(
                  controller: subjectController,
                  decoration: InputDecoration(
                    hintText: 'Naresh Vyas timesheet',
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(8)), borderSide: BorderSide(color: AppColors.borderGrey)),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                  ),
                ),
                const SizedBox(height: 16),

                // Rich Text Editor Toolbar (Simplified)
                _buildRichTextToolbar(),
                const SizedBox(height: 8),

                // Email Content Box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.borderGrey),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Hello,', style: AppTextStyles.input),
                      const SizedBox(height: 8),
                      Text(
                        'Timesheet is submit for client : ${widget.timesheet?.client.name ?? "Client"}\nfor time period: ${startDate != null && endDate != null ? "${DateFormat('MM/dd/yyyy').format(startDate!)} To ${DateFormat('MM/dd/yyyy').format(endDate!)}" : "Select dates"}',
                        style: AppTextStyles.input.copyWith(fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 8),
                      if (bodyController.text.isNotEmpty)
                        Text(
                          bodyController.text,
                          style: AppTextStyles.input,
                        )
                      else
                        const Text('Please check and approve.', style: AppTextStyles.input),
                      const SizedBox(height: 16),
                      const Text('Thank you.', style: AppTextStyles.input),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Action Buttons (Create & Preview)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Expanded(
                      child: ElevatedButton(
                      onPressed: isSubmitting ? null : _handleUpdateTimesheet,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryColor,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      child: isSubmitting
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text('Update Timesheet', style: AppTextStyles.buttonPrimary),
                      ),
                    ),
                    // const SizedBox(width: 16),
                    // Expanded(
                    //   child: TextButton(
                    //     onPressed: () {
                    //       if (timesheetData.isEmpty) {
                    //         ScaffoldMessenger.of(context).showSnackBar(
                    //           const SnackBar(content: Text('Please generate timesheet table first')),
                    //         );
                    //         return;
                    //       }
                    //       // Convert timesheetData to preview format
                    //       final previewData = timesheetData.map((row) {
                    //         final daily = double.tryParse((row['daily'] as TextEditingController).text) ?? 0;
                    //         final extra = double.tryParse((row['extra'] as TextEditingController).text) ?? 0;
                    //         final vacation = double.tryParse((row['vacation'] as TextEditingController).text) ?? 0;
                    //         final total = daily + extra + vacation;
                    //
                    //         return {
                    //           'day': row['day'],
                    //           'regular': daily,
                    //           'overtime': extra,
                    //           'sick': 0,
                    //           'vacation': vacation,
                    //           'holiday': 0,
                    //           'unpaid': 0,
                    //           'other': 0,
                    //           'total': total,
                    //         };
                    //       }).toList();
                    //
                    //       Navigator.push(
                    //         context,
                    //         MaterialPageRoute(
                    //           builder: (context) => TimesheetPreviewPage(
                    //             clientName: "R12",
                    //             startDate: startDate != null ? DateFormat('MM/dd/yyyy').format(startDate!) : '',
                    //             endDate: endDate != null ? DateFormat('MM/dd/yyyy').format(endDate!) : '',
                    //             timesheetData: previewData,
                    //           ),
                    //         ),
                    //       );
                    //     },
                    //     style: TextButton.styleFrom(
                    //       backgroundColor: AppColors.accentColor,
                    //       padding: const EdgeInsets.symmetric(vertical: 16),
                    //       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    //     ),
                    //     child: Text('Preview', style: AppTextStyles.buttonPrimary.copyWith(color: AppColors.primaryColor)),
                    //   ),
                    // ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimesheetTable(BuildContext context) {
    // A simplified row structure for the table
    Widget _buildEditableTimeCell(TextEditingController controller) {
      return Container(
        alignment: Alignment.center,
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.borderGrey),
          borderRadius: BorderRadius.circular(8),
        ),
        child: TextField(
          controller: controller,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          style: AppTextStyles.input.copyWith(fontSize: 14),
          decoration: const InputDecoration(
            border: InputBorder.none,
            contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          ),
        ),
      );
    }

    Widget _buildHeaderCell(String text) {
      return Text(text, style: AppTextStyles.label.copyWith(fontWeight: FontWeight.bold));
    }

    return Column(
      children: [
        // Table Headers
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
          child: Row(
            children: [
              const SizedBox(width: 80), // For Date column width
              Expanded(child: Center(child: _buildHeaderCell('Daily'))),
              Expanded(child: Center(child: _buildHeaderCell('Extra'))),
              Expanded(child: Center(child: _buildHeaderCell('Vacations'))),
              Expanded(child: Center(child: _buildHeaderCell('Notes'))),
            ],
          ),
        ),

        // Table Rows
        ...timesheetData.asMap().entries.map((entry) {
          final index = entry.key;
          final row = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 100,
                  child: Text(
                    row['day'] as String,
                    style: AppTextStyles.input.copyWith(fontSize: 14),
                  ),
                ),
                Expanded(child: _buildEditableTimeCell(row['daily'] as TextEditingController)),
                Expanded(child: _buildEditableTimeCell(row['extra'] as TextEditingController)),
                Expanded(child: _buildEditableTimeCell(row['vacation'] as TextEditingController)),
                GestureDetector(
                  onTap: () {
                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) {
                        return AddNoteDialog(
                          onSave: (note) {
                            setState(() {
                              timesheetData[index]['note'] = note;
                            });
                            Navigator.pop(context);
                          },
                        );
                      },
                    );
                  },
                  child: Container(
                    width: 30,
                    height: 40,
                    alignment: Alignment.center,
                    child: const Icon(
                      Icons.edit_note,
                      color: AppColors.primaryColor,
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildRichTextToolbar() {
    // Toolbar icons list
    const List<IconData> icons = [
      Icons.format_bold,
      Icons.format_italic,
      Icons.format_underline,
      Icons.format_strikethrough,
      Icons.superscript,
      Icons.subscript,
      Icons.palette,
      Icons.format_size,
      Icons.format_list_bulleted,
      Icons.format_list_numbered,
      Icons.insert_link,
    ];

    // Wrap the icons in a horizontal scrolling list for a compact view
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.softGrey,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderGrey),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: icons.map((icon) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4.0),
              child: Icon(icon, color: AppColors.textDark, size: 24),
            );
          }).toList(),
        ),
      ),
    );
  }
}
