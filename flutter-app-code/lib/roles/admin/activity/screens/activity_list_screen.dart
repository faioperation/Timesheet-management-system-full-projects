import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/activity_model.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/activity_service.dart';

class ActivityListScreen extends StatefulWidget {
  const ActivityListScreen({super.key});

  @override
  State<ActivityListScreen> createState() => _ActivityListScreenState();
}

class _ActivityListScreenState extends State<ActivityListScreen> {
  String _selectedRole = 'All';
  String _selectedActivity = 'Activities';
  int _currentPage = 1;
  int _totalPages = 1;
  int _totalItems = 0;
  bool _isLoading = false;
  ActivityResponse? _activityResponse;
  List<ActivityModel> _displayedActivities = [];

  final List<String> _roleOptions = ['All', 'Business Admin', 'Staff', 'User'];
  final List<String> _activityOptions = [
    'Activities',
    'Timesheet Create',
    'Timesheet Approved',
    'Timesheet Reject',
    'Add User',
    'login',
    'logout',
    'create_employee',
    'create_vendor',
    'change_password',
  ];

  @override
  void initState() {
    super.initState();
    _loadActivities();
  }

  Future<void> _loadActivities({bool resetPage = true}) async {
    if (resetPage) {
      _currentPage = 1;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Fetch activities from API with pagination (50 per page)
      final response = await ActivityService.getActivities(
        role: null, // Always fetch all, filter client-side
        action: null, // Always fetch all, filter client-side
        page: _currentPage,
      );

      setState(() {
        _activityResponse = response;
        List<ActivityModel> activities = response.data.activities;
        
        // Apply client-side filtering by role
        if (_selectedRole != 'All') {
          activities = activities.where((activity) {
            final activityRole = activity.role; // e.g., "Business Admin", "Staff", "User"
            // Compare roles (case-insensitive)
            return activityRole.toLowerCase().trim() == _selectedRole.toLowerCase().trim();
          }).toList();
        }
        
        // Apply client-side filtering by action
        if (_selectedActivity != 'Activities') {
          activities = activities.where((activity) {
            final activityAction = activity.action.toLowerCase().trim();
            final selectedAction = _selectedActivity.toLowerCase().trim();
            
            // Map selected action to possible API action values
            final actionMatches = {
              'timesheet create': ['timesheet_create'],
              'timesheet approved': ['timesheet_approved'],
              'timesheet reject': ['timesheet_rejected'],
              'add user': ['add_user'],
              'login': ['login'],
              'logout': ['logout'],
              'create_employee': ['create_employee'],
              'create employee': ['create_employee'],
              'create_vendor': ['create_vendor'],
              'create vendor': ['create_vendor'],
              'change_password': ['change_password'],
              'change password': ['change_password'],
            };
            
            // Check if action matches directly or through mapping
            if (activityAction == selectedAction) return true;
            
            final possibleActions = actionMatches[selectedAction];
            if (possibleActions != null) {
              return possibleActions.contains(activityAction);
            }
            
            return false;
          }).toList();
        }
        
        _displayedActivities = activities;
        _totalPages = response.data.lastPage;
        _totalItems = response.data.total;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _displayedActivities = [];
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading activities: $e')),
        );
      }
    }
  }

  void _goToPage(int page) {
    if (page >= 1 && page <= _totalPages && page != _currentPage) {
      setState(() {
        _currentPage = page;
      });
      _loadActivities(resetPage: false);
    }
  }


  void _applyFilters() {
    _loadActivities();
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (e) {
      return dateString;
    }
  }

  String _formatAction(String action) {
    // Convert backend action to display format
    final actionMap = {
      'timesheet_create': 'Timesheet Create',
      'timesheet_approved': 'Timesheet Approved',
      'timesheet_rejected': 'Timesheet Reject',
      'add_user': 'Add User',
      'login': 'Login',
      'logout': 'Logout',
      'create_employee': 'create_employee',
      'create_vendor': 'create_vendor',
      'change_password': 'change_password',
    };
    final lowerAction = action.toLowerCase();
    return actionMap[lowerAction] ?? action;
  }

  String _formatRole(String role) {
    // The role already comes from activity.role which returns user.roles.first.name
    // So it should already be in the correct format like "Business Admin", "Staff", "User"
    return role;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      appBar: CustomAppBar(title: "Activity"),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Filter Dropdowns
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: _buildDropdown(
                    value: _selectedActivity,
                    options: _activityOptions,
                    onChanged: (value) {
                      setState(() {
                        _selectedActivity = value ?? 'Activities';
                      });
                      _applyFilters();
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildDropdown(
                    value: _selectedRole,
                    options: _roleOptions,
                    onChanged: (value) {
                      setState(() {
                        _selectedRole = value ?? 'All';
                      });
                      _applyFilters();
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Activity Table
            Expanded(
              child: _isLoading && _displayedActivities.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : _displayedActivities.isEmpty
                      ? const Center(
                          child: Text(
                            'No activities found',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                        )
                      : SingleChildScrollView(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Fixed S.No column
                              SizedBox(
                                width: 60,
                                child: Column(
                                  children: [
                                    _snoHeader(),
                                    ..._displayedActivities.asMap().entries.map((entry) {
                                      final index = entry.key;
                                      // Calculate serial number based on current page
                                      final serialNo = ((_currentPage - 1) * 50) + index + 1;
                                      return _snoRow(serialNo);
                                    }).toList(),
                                  ],
                                ),
                              ),
                              // Scrollable columns: Name, Created Date, Role, Action
                              Expanded(
                                child: SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: Column(
                                    children: [
                                      _scrollableHeader(),
                                      ..._displayedActivities.asMap().entries.map((entry) {
                                        final activity = entry.value;
                                        return _scrollableRow(activity);
                                      }).toList(),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
            ),
            // Pagination Controls
            if (!_isLoading && _displayedActivities.isNotEmpty) _buildPaginationControls(),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required List<String> options,
    required Function(String?) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
        color: Colors.white,
      ),
      child: DropdownButton<String>(
        value: value,
        isExpanded: true,
        underline: const SizedBox(),
        items: options.map((option) {
          return DropdownMenuItem<String>(
            value: option,
            child: Text(option),
          );
        }).toList(),
        onChanged: onChanged,
      ),
    );
  }

  Widget _snoHeader() {
    return Container(
      height: 48,
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      color: const Color(0xFFEFF3FF),
      child: const Text(
        'S.No',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _snoRow(int serialNo) {
    return Container(
      height: 48,
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
      ),
      child: Text('$serialNo'),
    );
  }

  Widget _scrollableHeader() {
    return Container(
      height: 48,
      color: const Color(0xFFEFF3FF),
      child: Row(
        children: const [
          _HeaderCell('Name', 150),
          _HeaderCell('Created Date', 150),
          _HeaderCell('Role', 150),
          _HeaderCell('Action', 200),
        ],
      ),
    );
  }

  Widget _scrollableRow(ActivityModel activity) {
    return Container(
      height: 48,
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
      ),
      child: Row(
        children: [
          _Cell(activity.user.name, 150),
          _Cell(_formatDate(activity.createdAt), 150),
          _Cell(_formatRole(activity.role), 150),
          _Cell(_formatAction(activity.action), 200),
        ],
      ),
    );
  }

  Widget _buildPaginationControls() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Previous button
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: _currentPage > 1
                ? () => _goToPage(_currentPage - 1)
                : null,
          ),
          const SizedBox(width: 8),
          
          // Page numbers
          ...List.generate(
            _totalPages > 5 ? 5 : _totalPages,
            (index) {
              int pageNumber;
              if (_totalPages <= 5) {
                pageNumber = index + 1;
              } else {
                // Show pages around current page
                if (_currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (_currentPage >= _totalPages - 2) {
                  pageNumber = _totalPages - 4 + index;
                } else {
                  pageNumber = _currentPage - 2 + index;
                }
              }
              
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: GestureDetector(
                  onTap: () => _goToPage(pageNumber),
                  child: Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: _currentPage == pageNumber
                          ? Colors.blue
                          : Colors.white,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(
                        color: _currentPage == pageNumber
                            ? Colors.blue
                            : Colors.grey.shade300,
                      ),
                    ),
                    child: Text(
                      '$pageNumber',
                      style: TextStyle(
                        color: _currentPage == pageNumber
                            ? Colors.white
                            : Colors.black,
                        fontWeight: _currentPage == pageNumber
                            ? FontWeight.bold
                            : FontWeight.normal,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
          
          const SizedBox(width: 8),
          // Next button
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: _currentPage < _totalPages
                ? () => _goToPage(_currentPage + 1)
                : null,
          ),
        ],
      ),
    );
  }
}

// ================= Small Widgets =================

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
      child: Text(text),
    );
  }
}
