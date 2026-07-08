import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/employee_model.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/add_new_employee_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/employee_service.dart';
import '../../../../common/widgets/custom_button.dart';
import '../../services/admin_service.dart';

class EmployeeListScreen extends StatefulWidget {
  const EmployeeListScreen({super.key});

  @override
  State<EmployeeListScreen> createState() => _EmployeeListScreenState();
}

class _EmployeeListScreenState extends State<EmployeeListScreen> {
  late Future<List<EmployeeModel>> employeeFuture;
  String? _userRole = '';

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _loadEmployees();
  }

  Future<void> _loadUserRole() async {
    final role = await TokenService.getRole();
    if (mounted) {
      setState(() {
        _userRole = role ?? '';
      });
    }
  }

  bool get _isAdmin {
    return _userRole?.toLowerCase() == 'admin' || _userRole?.toLowerCase() == 'business admin';
  }

  bool get _canEdit {
    final role = _userRole?.toLowerCase() ?? '';
    return role == 'admin' || role == 'business admin' || role == 'staff' || role == 'supervisor';
  }

  void _loadEmployees() async {
    final token = await TokenService.getToken();

    if (token == null) {
      employeeFuture = Future.error("Token not found");
    } else {
      employeeFuture = EmployeeService.getEmployees(token);
    }

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      appBar: CustomAppBar(title: "Employee"),
      body: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CustomButton(
              width: 180,
              icon: Icons.add,
              title: "Add Employee",
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AddEmployeeScreen(),
                  ),
                );
                // Refresh list if employee was created successfully
                if (result == true) {
                  _loadEmployees();
                }
              },
            ),
            const SizedBox(height: 8),

            Expanded(
              child: FutureBuilder<List<EmployeeModel>>(
                future: employeeFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (snapshot.hasError) {
                    return Center(child: Text(snapshot.error.toString()));
                  }

                  final employees = snapshot.data ?? [];

                  if (employees.isEmpty) {
                    return const Center(child: Text("No employees found"));
                  }

                  return SingleChildScrollView(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 130,
                          child: Column(
                            children: [
                              _nameHeader(),
                              ...employees.map((e) => _nameCell(e.name)),
                            ],
                          ),
                        ),

                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Column(
                              children: [
                                _rightHeader(),
                                ...employees.map((e) => _rightRow(e)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ================= UI Helpers =================

  Widget _nameHeader() {
    return Container(
      height: 48,
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      color: const Color(0xFFEFF3FF),
      child: const Text(
        'Name',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _nameCell(String name) {
    return Container(
      height: 48,
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
      ),
      child: Text(name),
    );
  }

  Widget _rightHeader() {
    return Container(
      height: 48,
      color: const Color(0xFFEFF3FF),
      child: Row(
        children: [
          // _HeaderCell('Email', 150),
          const _HeaderCell('Phone', 150),
          const _HeaderCell('Address', 120),
          const _HeaderCell('Zip Code', 120),
          const _HeaderCell('Remark', 120),
          if (_canEdit) _HeaderCell('Action', _isAdmin ? 150 : 100),
        ],
      ),
    );
  }

  Widget _rightRow(EmployeeModel employee) {
    return Container(
      height: 48,
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
      ),
      child: Row(
        children: [
          // _Cell(employee.email, 150),
          _Cell(employee.phone, 150),
          _Cell(employee.address, 120),
          _Cell(employee.zipCode, 120),
          _Cell(employee.remark, 120),
          if (_canEdit)
            SizedBox(
              width: _isAdmin ? 150 : 100,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: () => _handleEditEmployee(employee),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('Edit', style: TextStyle(fontSize: 11, color: Colors.blue)),
                  ),
                  if (_isAdmin)
                    TextButton(
                      onPressed: () => _handleDeleteEmployee(employee.id, employee.name),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text('Delete', style: TextStyle(fontSize: 11, color: Colors.red)),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _handleEditEmployee(EmployeeModel employee) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddEmployeeScreen(existingEmployee: employee),
      ),
    );
    // Refresh list if employee was updated successfully
    if (result == true) {
      _loadEmployees();
    }
  }

  Future<void> _handleDeleteEmployee(int employeeId, String employeeName) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Employee'),
        content: Text('Are you sure you want to delete "$employeeName"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await AdminService.deleteParty(partyId: employeeId);
      Navigator.pop(context); // Close loading dialog

      if (response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Employee deleted successfully'),
              backgroundColor: Colors.green,
            ),
          );
          // Refresh the list
          _loadEmployees();
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Failed to delete employee'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      Navigator.pop(context); // Close loading dialog
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
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
