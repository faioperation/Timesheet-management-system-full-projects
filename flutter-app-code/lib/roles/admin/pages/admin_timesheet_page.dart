import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/notification/pages/initial_notification_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/add_timesheet_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/preview_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/update_timesheet_page.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/models/timesheet_model.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/services/timesheet_service.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_profile_service.dart';

import '../widgets/action_icon_cell.dart';

class TimesheetPage extends StatefulWidget {
  const TimesheetPage({super.key});

  @override
  State<TimesheetPage> createState() => _TimesheetPageState();
}

class _TimesheetPageState extends State<TimesheetPage> {
  final double rowHeight = 50; // fixed height for all cells
  List<TimesheetModel> timesheets = [];
  bool isLoading = false;
  String? userRole;
  int? currentUserId;

  @override
  void initState() {
    super.initState();
    _checkUserRoleAndLoadData();
  }

  Future<void> _checkUserRoleAndLoadData() async {
    final role = await TokenService.getRole();
    setState(() {
      userRole = role;
    });

    // Load data based on role
    if (role == 'admin' || role == 'staff') {
      _loadTimesheets();
    } else if (role == 'user') {
      // For user role, get user ID and load user-specific timesheets
      await _loadUserProfileAndTimesheets();
    }
  }

  Future<void> _loadUserProfileAndTimesheets() async {
    final token = await TokenService.getToken();
    if (token != null) {
      final profileData = await ProfileService.getProfile(token);
      if (profileData != null) {
        setState(() {
          currentUserId = profileData.id;
        });
        _loadUserTimesheets();
      }
    }
  }

  Future<void> _loadTimesheets() async {
    setState(() {
      isLoading = true;
    });

    try {
      final response = await TimesheetService.getTimesheets();
      if (mounted) {
        setState(() {
          timesheets = response.data;
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading timesheets: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _loadUserTimesheets() async {
    if (currentUserId == null) return;

    setState(() {
      isLoading = true;
    });

    try {
      final response = await TimesheetService.getUserTimesheets(currentUserId!);
      if (mounted) {
        setState(() {
          timesheets = response.data;
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading timesheets: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('MM/dd/yyyy').format(date);
    } catch (e) {
      return dateStr;
    }
  }

  IconData? _getStatusIconData(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return Icons.check_circle;
      case 'pending':
      case 'submitted':
        return Icons.hourglass_bottom;
      case 'rejected':
        return Icons.cancel;
      default:
        return Icons.help_outline;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return Colors.green;
      case 'pending':
      case 'submitted':
        return Colors.amber;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Timesheet",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        "Accurate, simple, and efficient \n time tracking.",
                        style: TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      //color: Color(0xFFEAEAEA),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IconButton(onPressed: (){
                      Navigator.push(context, MaterialPageRoute(builder: (context)=>InitialNotificationScreen()));
                    }, icon: const Icon(Icons.notification_important_rounded))
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Add Button (show for admin/staff and user)
              Align(
                alignment: Alignment.centerRight,
                child: CustomButton(
                  width: 200,
                  icon: Icons.add,
                  title: "Add Timesheet",
                  onPressed: () async {
                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => AddTimesheetPage()),
                    );
                    // Refresh timesheet list if timesheet was created successfully
                    if (result == true) {
                      _checkUserRoleAndLoadData();
                    }
                  },
                ),
              ),
              const SizedBox(height: 20),
              const SizedBox(height: 20),

              // Table Section (entire table vertically scrollable)
              Expanded(
                child: isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : timesheets.isEmpty
                        ? Center(
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: const Text(
                                "No timesheets found",
                                style: TextStyle(fontSize: 16),
                              ),
                            ),
                          )
                        : SingleChildScrollView(
                            scrollDirection: Axis.vertical,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Fixed User column
                                SizedBox(
                                  width: 140,
                                  child: Column(
                                    children: [
                                      SizedBox(
                                        height: rowHeight,
                                        child: const HeaderCell(title: "User"),
                                      ),
                                      const SizedBox(height: 6),
                                      ...timesheets.map((timesheet) => SizedBox(
                                        height: rowHeight,
                                        width: 140, // Fixed width to ensure consistent box size
                                        child: DataCellBox(
                                          text: timesheet.user.name,
                                        ),
                                      )),
                                    ],
                                  ),
                                ),

                                // Scrollable right-side columns
                                Expanded(
                                  child: SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: SizedBox(
                                      width: userRole == 'user' ? 520 : 480, // Dynamic width based on role
                                      child: Column(
                                        children: [
                                          // Header row
                                          SizedBox(
                                            height: rowHeight,
                                            child: Row(
                                              children: [
                                                const SizedBox(
                                                  width: 120,
                                                  child: HeaderCell(title: "Start Date"),
                                                ),
                                                const SizedBox(
                                                  width: 120,
                                                  child: HeaderCell(title: "End Date"),
                                                ),
                                                const SizedBox(
                                                  width: 120,
                                                  child: HeaderCell(title: "Status"),
                                                ),
                                                SizedBox(
                                                  width: userRole == 'user' ? 160 : 120,
                                                  child: const HeaderCell(title: "Action"),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(height: 5),

                                          // Rows
                                          ...timesheets.map((timesheet) => SizedBox(
                                            height: rowHeight,
                                            child: Row(
                                              children: [
                                                SizedBox(
                                                  width: 120,
                                                  height: rowHeight,
                                                  child: DataCellBox(
                                                    text: _formatDate(timesheet.startDate),
                                                  ),
                                                ),
                                                SizedBox(
                                                  width: 120,
                                                  height: rowHeight,
                                                  child: DataCellBox(
                                                    text: _formatDate(timesheet.endDate),
                                                  ),
                                                ),
                                                SizedBox(
                                                  width: 120,
                                                  height: rowHeight,
                                                  child: userRole != 'admin'
                                                      ? Container(
                                                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                                                          margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                                                          decoration: BoxDecoration(
                                                            color: Colors.white,
                                                            border: Border.all(color: Colors.grey.shade300, width: 1),
                                                            borderRadius: BorderRadius.circular(8),
                                                          ),
                                                          child: Row(
                                                            mainAxisAlignment: MainAxisAlignment.center,
                                                            children: [
                                                              Icon(
                                                                _getStatusIconData(timesheet.status),
                                                                color: _getStatusColor(timesheet.status),
                                                                size: 20,
                                                              ),
                                                              const SizedBox(width: 6),
                                                              Flexible(
                                                                child: Text(
                                                                  timesheet.status[0].toUpperCase() + timesheet.status.substring(1),
                                                                  style: TextStyle(
                                                                    fontSize: 13.5,
                                                                    color: _getStatusColor(timesheet.status),
                                                                  ),
                                                                  overflow: TextOverflow.ellipsis,
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        )
                                                      : DropdownCellBox(
                                                          selectedValue: timesheet.status,
                                                          onChanged: (newValue) async {
                                                            if (newValue != null && newValue != timesheet.status) {
                                                              // Show loading indicator
                                                              final scaffoldMessenger = ScaffoldMessenger.of(context);
                                                              scaffoldMessenger.showSnackBar(
                                                                SnackBar(
                                                                  content: Row(
                                                                    children: [
                                                                      const SizedBox(
                                                                        width: 20,
                                                                        height: 20,
                                                                        child: CircularProgressIndicator(
                                                                          strokeWidth: 2,
                                                                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                                                        ),
                                                                      ),
                                                                      const SizedBox(width: 12),
                                                                      Text('Updating status to ${newValue[0].toUpperCase() + newValue.substring(1)}...'),
                                                                    ],
                                                                  ),
                                                                  duration: const Duration(seconds: 2),
                                                                ),
                                                              );

                                                              // Call API to update status
                                                              final result = await TimesheetService.updateTimesheetStatus(
                                                                timesheetId: timesheet.id,
                                                                status: newValue,
                                                              );

                                                              if (mounted) {
                                                                if (result['success']) {
                                                                  // Reload timesheets to get updated data
                                                                  _loadTimesheets();
                                                                  scaffoldMessenger.showSnackBar(
                                                                    SnackBar(
                                                                      content: Text(result['message'] ?? 'Status updated successfully'),
                                                                      backgroundColor: Colors.green,
                                                                    ),
                                                                  );
                                                                } else {
                                                                  scaffoldMessenger.showSnackBar(
                                                                    SnackBar(
                                                                      content: Text(result['message'] ?? 'Failed to update status'),
                                                                      backgroundColor: Colors.red,
                                                                    ),
                                                                  );
                                                                }
                                                              }
                                                            }
                                                          },
                                                        ),
                                                ),
                                                SizedBox(
                                                  width: userRole == 'user' ? 160 : 120,
                                                  height: rowHeight,
                                                  child: userRole == 'user'
                                                      ? DataCellBox(
                                                          icon: Icons.visibility,
                                                          iconColor: Colors.blue,
                                                          onTap: () {
                                                            Navigator.push(
                                                              context,
                                                              MaterialPageRoute(
                                                                builder: (_) => TimesheetPreviewPage(
                                                                  timesheet: timesheet,
                                                                ),
                                                              ),
                                                            );
                                                          },
                                                        )
                                                      : ActionIconsCell(
                                                          onViewTap: () {
                                                            Navigator.push(
                                                              context,
                                                              MaterialPageRoute(
                                                                builder: (_) => TimesheetPreviewPage(
                                                                  timesheet: timesheet,
                                                                ),
                                                              ),
                                                            );
                                                          },
                                                          onEditTap: () {
                                                            Navigator.push(
                                                              context,
                                                              MaterialPageRoute(
                                                                builder: (_) => UpdateTimesheetPage(
                                                                  timesheet: timesheet,
                                                                ),
                                                              ),
                                                            );
                                                          },
                                                        ),
                                                ),
                                              ],
                                            ),
                                          )),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class HeaderCell extends StatelessWidget {
  final String title;
  const HeaderCell({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F3F6),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
            color: Colors.black87,
          ),
        ),
      ),
    );
  }
}

class DataCellBox extends StatelessWidget {
  final String? text;
  final IconData? icon;
  final VoidCallback? onTap;
  final Color? iconColor;

  const DataCellBox({super.key, this.text, this.icon, this.onTap, this.iconColor});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12), // added padding
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: Colors.grey.shade300, width: 1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: icon != null
            ? Icon(icon, color: iconColor ?? Colors.grey, size: 20)
            : Text(
          text ?? "",
          style: const TextStyle(fontSize: 13.5, color: Colors.black87),
          overflow: TextOverflow.ellipsis,
        ),
      ),
    );
  }
}

// Dropdown Cell Box
class DropdownCellBox extends StatelessWidget {
  final String selectedValue;
  final ValueChanged<String?> onChanged;

  const DropdownCellBox({
    super.key,
    required this.selectedValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    // Status values matching API response (lowercase)
    final List<String> items = ["submitted", "approved", "pending", "rejected"];
    
    // Normalize selectedValue to lowercase for comparison
    final normalizedValue = selectedValue.toLowerCase();
    
    // Ensure the selected value exists in items, otherwise use null
    final String? validValue = items.contains(normalizedValue) ? normalizedValue : null;
    
    // Helper function to get display text (capitalize first letter)
    String getDisplayText(String val) {
      if (val.isEmpty) return val;
      return val[0].toUpperCase() + val.substring(1);
    }
    
    // Helper function to get color based on status
    Color getStatusColor(String val) {
      switch (val.toLowerCase()) {
        case "approved":
          return Colors.green;
        case "submitted":
        case "pending":
          return Colors.orange;
        case "rejected":
          return Colors.red;
        default:
          return Colors.grey;
      }
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300, width: 1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: validValue,
          isExpanded: true,
          icon: const Icon(Icons.arrow_drop_down, color: Colors.grey),
          items: items
              .map((val) => DropdownMenuItem(
            value: val,
            child: Center(
              child: Text(
                getDisplayText(val),
                style: TextStyle(
                  fontSize: 13.5,
                  color: getStatusColor(val),
                ),
              ),
            ),
          ))
              .toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
