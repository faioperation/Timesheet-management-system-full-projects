import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/roles/admin/pages/preview_page.dart';
import 'package:timesheet_naresh/roles/admin/pop_up/add_note_dialog.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/services/timesheet_service.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/models/default_timesheet_model.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_service.dart';
import 'package:timesheet_naresh/roles/admin/profile/services/email_template_service.dart';
import 'package:timesheet_naresh/roles/admin/profile/models/email_template_model.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_profile_service.dart';
import '../../../app/constants.dart';
import '../../../common/widgets/custom_file_upload_field.dart';
import '../widgets/add_remark_pop_up.dart';
import '../widgets/time_input_field.dart';

class CustomDropdownField extends StatefulWidget {
  final String label;
  final List<Map<String, dynamic>> options;
  final String? initialValue;
  final void Function(String?)? onChanged;
  final bool isLoading;

  const CustomDropdownField({
    super.key,
    required this.label,
    required this.options,
    this.initialValue,
    this.onChanged,
    this.isLoading = false,
  });

  @override
  _CustomDropdownFieldState createState() => _CustomDropdownFieldState();
}

class _CustomDropdownFieldState extends State<CustomDropdownField> {
  String? selectedValue;

  @override
  void initState() {
    super.initState();
    selectedValue = widget.initialValue;
  }

  @override
  void didUpdateWidget(CustomDropdownField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.options != oldWidget.options) {
      // Reset selection if options changed
      if (widget.options.isEmpty) {
        selectedValue = null;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: AppTextStyles.label.copyWith(color: AppColors.textDark)),
        const SizedBox(height: 6),
        widget.isLoading
            ? Container(
                height: 48,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderGrey),
                ),
                child: const Center(child: CircularProgressIndicator()),
              )
            : DropdownButtonFormField<String>(
                value: selectedValue,
                items: widget.options.map((e) {
                  final name = e['name'] as String? ?? '';
                  return DropdownMenuItem(
                    value: name,
                    child: Text(name),
                  );
                }).toList(),
                onChanged: widget.onChanged == null ? null : (val) {
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
                  filled: widget.onChanged == null,
                  fillColor: widget.onChanged == null ? Colors.grey[200] : null,
                ),
              ),
      ],
    );
  }
}

class AddTimesheetPage extends StatefulWidget {
  const AddTimesheetPage({super.key});

  @override
  State<AddTimesheetPage> createState() => _AddTimesheetPageState();
}

class _AddTimesheetPageState extends State<AddTimesheetPage> {
  DateTime? startDate;
  DateTime? endDate;
  List<Map<String, dynamic>> timesheetData = [];
  String? selectedEmailTemplateId;
  String? selectedEmailTemplateName;
  List<EmailTemplateModel> emailTemplates = [];
  List<Map<String, dynamic>> users = []; // {id, name}
  String? selectedUserId;
  String? selectedUserName;
  String? selectedFilePath;
  File? selectedFile;
  String remarks = '';
  final TextEditingController toEmailController = TextEditingController();
  final TextEditingController subjectController = TextEditingController();
  final TextEditingController bodyController = TextEditingController();
  
  // Default Timesheet variables
  List<DefaultTimesheetModel> defaultTimesheets = [];
  DefaultTimesheetModel? selectedDefaultTimesheet;
  bool isLoadingDefaultTimesheets = false;
  
  bool isLoadingUsers = false;
  bool isLoadingTemplates = false;
  bool isSubmitting = false;
  String? userRole;

  @override
  void initState() {
    super.initState();
    _checkUserRole();
    loadUsers();
    loadEmailTemplates();
  }

  Future<void> _checkUserRole() async {
    final role = await TokenService.getRole();
    setState(() {
      userRole = role;
    });
    
    // If user role is 'user', load default timesheets for logged-in user
    if (role == 'user' && selectedUserId != null) {
      loadDefaultTimesheets(int.parse(selectedUserId!));
    }
  }

  Future<void> loadUsers() async {
    setState(() => isLoadingUsers = true);
    try {
      // Check if current user is 'user' role
      final role = await TokenService.getRole();
      
      if (role == 'user') {
        // For user role, only show the logged-in user
        final token = await TokenService.getToken();
        if (token != null) {
          final profile = await ProfileService.getProfile(token);
          if (profile != null && mounted) {
            setState(() {
              users = [
                {
                  'id': profile.id,
                  'name': profile.name,
                }
              ];
              selectedUserId = profile.id.toString();
              selectedUserName = profile.name;
              isLoadingUsers = false;
            });
            // Load default timesheets for logged-in user
            loadDefaultTimesheets(profile.id);
          } else {
            if (mounted) {
              setState(() => isLoadingUsers = false);
            }
          }
        } else {
          if (mounted) {
            setState(() => isLoadingUsers = false);
          }
        }
      } else {
        // For Business Admin and Staff, show all users with role 'user' or 'staff'
        final response = await AdminService.getUsers();
        if (response['success'] == true) {
          final List<dynamic> data = response['data'] ?? [];
          // Filter users with role 'user' or 'staff'
          final filteredUsers = data.where((user) {
            final roles = user['roles'] as List?;
            if (roles != null && roles.isNotEmpty) {
              final roleName = roles[0]['name'] as String?;
              return roleName?.toLowerCase() == 'user' || roleName?.toLowerCase() == 'staff';
            }
            return false;
          }).map((user) => {
            'id': user['id'] as int,
            'name': user['name'] as String? ?? '',
          }).toList();
          
          if (mounted) {
            setState(() {
              users = List<Map<String, dynamic>>.from(filteredUsers);
              isLoadingUsers = false;
            });
          }
        } else {
          if (mounted) {
            setState(() => isLoadingUsers = false);
          }
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => isLoadingUsers = false);
      }
      debugPrint('Error loading users: $e');
    }
  }

  Future<void> loadEmailTemplates() async {
    setState(() => isLoadingTemplates = true);
    try {
      final response = await EmailTemplateService.getEmailTemplates();
      if (mounted) {
        setState(() {
          emailTemplates = response.templates;
          isLoadingTemplates = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => isLoadingTemplates = false);
      }
      debugPrint('Error loading email templates: $e');
    }
  }

  Future<void> loadDefaultTimesheets(int userId) async {
    setState(() {
      isLoadingDefaultTimesheets = true;
      defaultTimesheets = [];
      selectedDefaultTimesheet = null;
    });

    try {
      final response = await TimesheetService.getUserDefaultTimesheets(userId);
      if (mounted) {
        setState(() {
          defaultTimesheets = response.data;
          isLoadingDefaultTimesheets = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => isLoadingDefaultTimesheets = false);
      }
      debugPrint('Error loading default timesheets: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading default timesheets: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _onDefaultTimesheetSelected(DefaultTimesheetModel? timesheet) {
    if (timesheet == null) {
      setState(() {
        selectedDefaultTimesheet = null;
        timesheetData = [];
        startDate = null;
        endDate = null;
      });
      return;
    }

    setState(() {
      selectedDefaultTimesheet = timesheet;
      startDate = DateTime.parse(timesheet.startDate);
      endDate = DateTime.parse(timesheet.endDate);
    });

    // Generate table based on default timesheet
    _generateTimesheetTableFromDefault(timesheet);
  }

  void _generateTimesheetTableFromDefault(DefaultTimesheetModel defaultTimesheet) {
    // Dispose old controllers
    for (var row in timesheetData) {
      (row['daily'] as TextEditingController).dispose();
      (row['extra'] as TextEditingController).dispose();
      (row['vacation'] as TextEditingController).dispose();
    }

    final List<Map<String, dynamic>> newData = [];
    DateTime currentDate = DateTime.parse(defaultTimesheet.startDate);
    final endDateParsed = DateTime.parse(defaultTimesheet.endDate);

    // Create a map of day_of_week to entry for quick lookup
    final entryMap = <int, DefaultTimesheetEntry>{};
    for (var entry in defaultTimesheet.entries) {
      entryMap[entry.dayOfWeek] = entry;
    }

    while (!currentDate.isAfter(endDateParsed)) {
      // Convert DateTime.weekday (1=Monday, 7=Sunday) to API format (0=Sunday, 1=Monday)
      final dayOfWeek = currentDate.weekday % 7; // This gives: Mon=1, Tue=2, ..., Sat=6, Sun=0
      final dayName = DateFormat('EEE').format(currentDate);
      final dateStr = DateFormat('dd MMM yyyy').format(currentDate);
      
      // Get default values from entry if available
      final entry = entryMap[dayOfWeek];
      final dailyHours = entry?.defaultDailyHours ?? '0.00';
      final extraHours = entry?.defaultExtraHours ?? '0.00';
      final vacationHours = entry?.defaultVacationHours ?? '0.00';
      
      newData.add({
        'date': currentDate,
        'day': '$dayName $dateStr',
        'daily': TextEditingController(text: dailyHours),
        'extra': TextEditingController(text: extraHours),
        'vacation': TextEditingController(text: vacationHours),
        'note': '',
      });
      
      currentDate = currentDate.add(const Duration(days: 1));
    }

    setState(() {
      timesheetData = newData;
    });
  }

  void _onEmailTemplateSelected(String? templateName) {
    if (templateName == null) {
      setState(() {
        selectedEmailTemplateId = null;
        selectedEmailTemplateName = null;
        subjectController.clear();
        bodyController.clear();
      });
      return;
    }

    final template = emailTemplates.firstWhere(
      (t) => t.templateName == templateName,
      orElse: () => emailTemplates.first,
    );

    setState(() {
      selectedEmailTemplateId = template.id.toString();
      selectedEmailTemplateName = templateName;
      subjectController.text = template.subject;
      bodyController.text = template.body;
    });
  }

  Future<void> _handleCreateTimesheet() async {
    // Validation
    if (selectedUserId == null || selectedUserName == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a user')),
      );
      return;
    }

    if (startDate == null || endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a default timesheet to set dates')),
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
      // Prepare entries
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

      // Check file size before uploading (limit to 5MB as per backend requirement)
      File? fileToUpload = selectedFile;
      if (fileToUpload != null && await fileToUpload.exists()) {
        final fileSize = await fileToUpload.length();
        const maxFileSize = 5 * 1024 * 1024; // 5MB (backend accepts up to 5MB)
        
        print('📎 File Info:');
        print('   Path: ${fileToUpload.path}');
        print('   Size: ${(fileSize / (1024 * 1024)).toStringAsFixed(2)} MB');
        print('   Max Allowed: ${(maxFileSize / (1024 * 1024)).toStringAsFixed(2)} MB');
        
        if (fileSize > maxFileSize) {
          if (mounted) {
            // Show dialog to let user choose: continue without file or cancel
            final shouldContinue = await showDialog<bool>(
              context: context,
              builder: (dialogContext) => AlertDialog(
                title: const Text('File Too Large'),
                content: Text(
                  'The selected file (${(fileSize / (1024 * 1024)).toStringAsFixed(2)} MB) exceeds the maximum size of 5MB.\n\n'
                  'Would you like to create the timesheet without the file?',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(dialogContext).pop(false),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(dialogContext).pop(true),
                    child: const Text('Continue Without File'),
                  ),
                ],
              ),
            );
            
            if (shouldContinue != true) {
              setState(() => isSubmitting = false);
              return;
            }
            // User chose to continue without file
            fileToUpload = null;
            print('⚠️ File removed due to size limit. Continuing without file.');
          } else {
            setState(() => isSubmitting = false);
            return;
          }
        } else {
          print('✅ File size is within limit. Proceeding with upload.');
        }
      } else if (fileToUpload == null) {
        print('ℹ️ No file selected. Proceeding without file.');
      }

      final response = await TimesheetService.createTimesheet(
        userId: int.parse(selectedUserId!),
        clientId: null, // Client removed as per requirements
        startDate: DateFormat('yyyy-MM-dd').format(startDate!),
        endDate: DateFormat('yyyy-MM-dd').format(endDate!),
        status: 'submitted',
        remarks: remarks.isNotEmpty ? remarks : null,
        mailTemplateId: selectedEmailTemplateId != null ? int.parse(selectedEmailTemplateId!) : null,
        sendTo: toEmailController.text.isNotEmpty ? toEmailController.text : null,
        file: fileToUpload, // Will be null if file is too large or not selected
        entries: entries,
      );

      setState(() => isSubmitting = false);

      if (mounted) {
        if (response['success']) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Timesheet created successfully'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context, true); // Return true to indicate success
        } else {
          // Check if it's a 413 error or status code 413
          final errorMessage = response['message'] ?? 'Failed to create timesheet';
          final statusCode = response['statusCode'];
          final is413Error = statusCode == 413 || 
                            errorMessage.toString().contains('413') || 
                            errorMessage.toString().contains('Request Entity Too Large') ||
                            errorMessage.toString().toLowerCase().contains('too large');
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                is413Error 
                  ? 'File size is too large (max 2MB). Please try without file or use a smaller file.'
                  : errorMessage,
              ),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 5),
            ),
          );
        }
      }
    } catch (e) {
      setState(() => isSubmitting = false);
      if (mounted) {
        final errorStr = e.toString();
        final is413Error = errorStr.contains('413') || 
                          errorStr.contains('Request Entity Too Large') ||
                          errorStr.contains('FormatException') ||
                          errorStr.contains('Unexpected character');
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              is413Error 
                ? 'File size is too large (max 2MB) or server error. Please try without file or use a smaller file.'
                : 'Error: $e',
            ),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: CustomAppBar(title: "Add Timesheet"),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Dropdown
            CustomDropdownField(
              label: 'User*',
              options: users,
              isLoading: isLoadingUsers,
              initialValue: userRole == 'user' ? selectedUserName : null,
              onChanged: userRole == 'user' ? null : (value) {
                if (value != null) {
                  final user = users.firstWhere((u) => u['name'] == value);
                  setState(() {
                    selectedUserId = user['id'].toString();
                    selectedUserName = value;
                    selectedDefaultTimesheet = null;
                    defaultTimesheets = [];
                    timesheetData = [];
                    startDate = null;
                    endDate = null;
                  });
                  // Load default timesheets for selected user
                  loadDefaultTimesheets(int.parse(selectedUserId!));
                }
              },
            ),
            const SizedBox(height: 16),

            // Default Timesheet Dropdown
            if (selectedUserId != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CustomDropdownField(
                    label: 'Default Timesheet',
                    options: defaultTimesheets.map((ts) => {
                      'id': ts.id,
                      'name': ts.displayName,
                    }).toList(),
                    isLoading: isLoadingDefaultTimesheets,
                    onChanged: (value) {
                      if (value != null) {
                        final timesheet = defaultTimesheets.firstWhere(
                          (ts) => ts.displayName == value,
                        );
                        _onDefaultTimesheetSelected(timesheet);
                      } else {
                        _onDefaultTimesheetSelected(null);
                      }
                    },
                  ),
                  // Display dates (read-only) when default timesheet is selected
                  if (selectedDefaultTimesheet != null && startDate != null && endDate != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppColors.borderGrey),
                                color: Colors.grey[100],
                              ),
                              child: Text(
                                'Start Date: ${DateFormat('dd MMM yyyy').format(startDate!)}',
                                style: TextStyle(
                                  color: AppColors.textDark,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppColors.borderGrey),
                                color: Colors.grey[100],
                              ),
                              child: Text(
                                'End Date: ${DateFormat('dd MMM yyyy').format(endDate!)}',
                                style: TextStyle(
                                  color: AppColors.textDark,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 16),
                ],
              ),

            // Row 2: File upload
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 6),
                CustomFileUploadField(
                  label: "File",
                  onFileSelected: (filePath) {
                    if (filePath != null) {
                      setState(() {
                        selectedFilePath = filePath;
                        selectedFile = File(filePath);
                      });
                      debugPrint("Selected file: $filePath");
                    }
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Field Select option (if needed)
            if (selectedDefaultTimesheet != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Field Select', style: AppTextStyles.label),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.borderGrey),
                    ),
                    child: const Text(
                      'Default timesheet selected',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            const SizedBox(height: 24),
            const Text('Timesheet Data', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            timesheetData.isEmpty
                ? Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Center(
                      child: Text(
                        selectedDefaultTimesheet == null
                            ? 'Please select a user and default timesheet to generate table'
                            : 'No timesheet data available',
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ),
                  )
                : _buildTimesheetTable(context),
            const SizedBox(height: 24),
                //   onPressed: () {
                //     showDialog(
                //       context: context,
                //       builder: (BuildContext context) {
                //         return AddRemarkDialog(
                //           onSave: (remark) {
                //             setState(() {
                //               remarks = remark;
                //             });
                //             Navigator.pop(context);
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

            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Email Template', style: AppTextStyles.label),
                const SizedBox(height: 6),
                isLoadingTemplates
                    ? Container(
                        height: 48,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.borderGrey),
                        ),
                        child: const Center(child: CircularProgressIndicator()),
                      )
                    : DropdownButtonFormField<String>(
                        value: selectedEmailTemplateName,
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
                  child: TextField(
                    controller: bodyController,
                    maxLines: 10,
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Email body content...',
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Action Buttons (Create & Preview)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Expanded(
                      child: isSubmitting
                          ? const Center(child: CircularProgressIndicator())
                          : ElevatedButton(
                              onPressed: _handleCreateTimesheet,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryColor,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('Create Timesheet', style: AppTextStyles.buttonPrimary),
                            ),
                    ),
                    const SizedBox(width: 16),
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
                    //             clientName: selectedClientName ?? "Client",
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

  Widget _buildTimesheetTable(BuildContext context) {
    // A simplified row structure for the table
    Widget _buildEditableTimeCell(TextEditingController controller) {
      return Container(
        height: 48, // Fixed height for consistency
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: AppColors.borderGrey, width: 1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: TextField(
          controller: controller,
          textAlign: TextAlign.center,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: AppTextStyles.input.copyWith(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          decoration: const InputDecoration(
            border: InputBorder.none,
            contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 12),
            isDense: true,
          ),
        ),
      );
    }

    Widget _buildHeaderCell(String text) {
      return Container(
        height: 48, // Fixed height matching data cells
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F3F6), // Light grey background
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.borderGrey, width: 1),
        ),
        child: Center(
          child: Text(
            text,
            style: AppTextStyles.label.copyWith(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: const Color(0xFF333333),
            ),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    Widget _buildDateCell(String text) {
      return Container(
        height: 48, // Fixed height matching other cells
        width: 120, // Slightly wider for date
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: AppColors.borderGrey, width: 1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Align(
          alignment: Alignment.centerLeft,
          child: Text(
            text,
            style: AppTextStyles.input.copyWith(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: const Color(0xFF333333),
            ),
          ),
        ),
      );
    }

    return Column(
      children: [
        // Table Headers
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 120,
                child: _buildHeaderCell('Date'),
              ),
              const SizedBox(width: 8),
              Expanded(child: _buildHeaderCell('Daily')),
              const SizedBox(width: 8),
              Expanded(child: _buildHeaderCell('Extra')),
              const SizedBox(width: 8),
              Expanded(child: _buildHeaderCell('Vacations')),
              const SizedBox(width: 8),
              Expanded(flex: 2, child: _buildHeaderCell('Notes')),
              const SizedBox(width: 8),
              const SizedBox(width: 40), // Space for edit icon
            ],
          ),
        ),

        // Table Rows
        ...timesheetData.asMap().entries.map((entry) {
          final index = entry.key;
          final row = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDateCell(row['day'] as String),
                const SizedBox(width: 8),
                Expanded(child: _buildEditableTimeCell(row['daily'] as TextEditingController)),
                const SizedBox(width: 8),
                Expanded(child: _buildEditableTimeCell(row['extra'] as TextEditingController)),
                const SizedBox(width: 8),
                Expanded(child: _buildEditableTimeCell(row['vacation'] as TextEditingController)),
                const SizedBox(width: 8),
                Expanded(
                  flex: 2,
                  child: Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 48, // Fixed height matching other cells
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: AppColors.borderGrey, width: 1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              (row['note'] as String? ?? '').isEmpty 
                                  ? 'Tap to add note' 
                                  : row['note'] as String,
                              style: TextStyle(
                                fontSize: 12,
                                color: (row['note'] as String? ?? '').isEmpty 
                                    ? Colors.grey.shade600
                                    : AppColors.textDark,
                                fontStyle: (row['note'] as String? ?? '').isEmpty 
                                    ? FontStyle.italic 
                                    : FontStyle.normal,
                                fontWeight: (row['note'] as String? ?? '').isEmpty 
                                    ? FontWeight.normal
                                    : FontWeight.w500,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () {
                          final currentNote = row['note'] as String? ?? '';
                          // Use a separate BuildContext for the dialog to prevent navigation issues
                          showDialog(
                            context: context,
                            barrierDismissible: true,
                            builder: (dialogBuildContext) {
                              return AddNoteDialog(
                                initialNote: currentNote,
                                onSave: (note) {
                                  // Save note to the row - this should not cause navigation
                                  if (mounted) {
                                    setState(() {
                                      timesheetData[index]['note'] = note;
                                    });
                                  }
                                  // Dialog will close itself in its own onSave handler
                                },
                              );
                            },
                          );
                        },
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppColors.primaryColor.withOpacity(0.1),
                            border: Border.all(color: AppColors.primaryColor.withOpacity(0.3), width: 1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          alignment: Alignment.center,
                          child: Icon(
                            Icons.edit_note,
                            color: AppColors.primaryColor,
                            size: 22,
                          ),
                        ),
                      ),
                    ],
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
