import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import '../models/internal_user_model.dart';
import '../services/internal_user_service.dart';
import 'add_internal_user_screen.dart';
import '../../services/admin_service.dart';

class InternalUserListScreen extends StatefulWidget {
  const InternalUserListScreen({super.key});

  @override
  State<InternalUserListScreen> createState() => _InternalUserListScreenState();
}

class _InternalUserListScreenState extends State<InternalUserListScreen> {
  late Future<List<InternalUserModel>> usersFuture;
  String? _userRole = '';

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _loadUsers();
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

  void _loadUsers() async {
    final token = await TokenService.getToken();

    if (token == null) {
      usersFuture = Future.error("Token not found");
    } else {
      usersFuture = InternalUserService.getInternalUsers(token);
    }

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      appBar: CustomAppBar(title: "Internal User"),
      body: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CustomButton(
              width: 220,
              icon: Icons.add,
              title: "Add Internal User",
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AddInternalUserScreen(),
                  ),
                );
                // Refresh list if user was created successfully
                if (result == true) {
                  _loadUsers();
                }
              },
            ),
            const SizedBox(height: 8),
            Expanded(
              child: FutureBuilder<List<InternalUserModel>>(
                future: usersFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (snapshot.hasError) {
                    return Center(child: Text(snapshot.error.toString()));
                  }

                  final users = snapshot.data ?? [];

                  if (users.isEmpty) {
                    return const Center(child: Text("No users found"));
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
                              ...users.map((u) => _nameCell(u.name)),
                            ],
                          ),
                        ),
                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Column(
                              children: [
                                _rightHeader(),
                                ...users.map((u) => _rightRow(u)),
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

  Widget _nameHeader() => Container(
    height: 48,
    alignment: Alignment.centerLeft,
    padding: const EdgeInsets.symmetric(horizontal: 12),
    color: const Color(0xFFEFF3FF),
    child: const Text(
      'Name',
      style: TextStyle(fontWeight: FontWeight.bold),
    ),
  );

  Widget _nameCell(String name) => Container(
    height: 48,
    alignment: Alignment.centerLeft,
    padding: const EdgeInsets.symmetric(horizontal: 12),
    decoration: const BoxDecoration(
      border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
    ),
    child: Text(name),
  );

  Widget _rightHeader() => Container(
    height: 48,
    color: const Color(0xFFEFF3FF),
    child: Row(
      children: [
        const _HeaderCell('Email', 220),
        const _HeaderCell('Phone', 150),
        const _HeaderCell('Role', 120),
        const _HeaderCell('Gender', 120),
        const _HeaderCell('Rate Type', 100),
        const _HeaderCell('Rate', 80),
        if (_canEdit) _HeaderCell('Action', _isAdmin ? 150 : 100),
      ],
    ),
  );

  Widget _rightRow(InternalUserModel u) => Container(
    height: 48,
    decoration: const BoxDecoration(
      border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
    ),
    child: Row(
      children: [
        _Cell(u.email, 220),
        _Cell(u.phone, 150),
        SizedBox(
          width: 120,
          child: _canEdit
              ? _RoleDropdownCell(
                  currentRole: u.role,
                  userId: u.id,
                  onRoleChanged: () => _loadUsers(),
                )
              : _Cell(u.role, 120),
        ),
        _Cell(u.gender ?? '', 120),
        _Cell(u.rateType ?? '', 100),
        _Cell(u.rate ?? '', 80),
        if (_canEdit)
          SizedBox(
            width: _isAdmin ? 150 : 100,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextButton(
                  onPressed: () => _handleEditInternalUser(u),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Edit', style: TextStyle(fontSize: 11, color: Colors.blue)),
                ),
                if (_isAdmin)
                  TextButton(
                    onPressed: () => _handleDeleteInternalUser(u.id, u.name),
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

  Future<void> _handleEditInternalUser(InternalUserModel user) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddInternalUserScreen(existingUser: user),
      ),
    );
    // Refresh list if user was updated successfully
    if (result == true) {
      _loadUsers();
    }
  }

  Future<void> _handleDeleteInternalUser(int internalUserId, String internalUserName) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Internal User'),
        content: Text('Are you sure you want to delete "$internalUserName"? This action cannot be undone.'),
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
      final response = await AdminService.deleteInternalUser(internalUserId: internalUserId);
      Navigator.pop(context); // Close loading dialog

      if (response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Internal user deleted successfully'),
              backgroundColor: Colors.green,
            ),
          );
          // Refresh the list
          _loadUsers();
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Failed to delete internal user'),
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

class _RoleDropdownCell extends StatefulWidget {
  final String currentRole;
  final int userId;
  final VoidCallback onRoleChanged;

  const _RoleDropdownCell({
    required this.currentRole,
    required this.userId,
    required this.onRoleChanged,
  });

  @override
  State<_RoleDropdownCell> createState() => _RoleDropdownCellState();
}

class _RoleDropdownCellState extends State<_RoleDropdownCell> {
  late String selectedRole;
  bool isUpdating = false;
  final List<String> roleList = ['bd_manager', 'ac_manager', 'recruiter'];

  @override
  void initState() {
    super.initState();
    selectedRole = widget.currentRole;
  }

  @override
  void didUpdateWidget(_RoleDropdownCell oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Update selectedRole if currentRole changed from parent
    if (oldWidget.currentRole != widget.currentRole) {
      selectedRole = widget.currentRole;
    }
  }

  Future<void> _updateRole(String newRole) async {
    if (newRole == selectedRole) {
      print('⚠️ Same role selected, skipping update');
      return;
    }

    final oldRole = selectedRole;
    
    if (!mounted) return;
    
    setState(() {
      isUpdating = true;
      selectedRole = newRole; // Optimistically update UI
    });

    try {
      print('📤 Updating role for user ${widget.userId}');
      print('   Current role: $oldRole');
      print('   New role: $newRole');
      
      final result = await InternalUserService.updateInternalUserRole(
        internalUserId: widget.userId,
        role: newRole,
      );

      print('📥 Role update result: $result');
      print('   Success: ${result['success']}');
      print('   Message: ${result['message']}');

      if (!mounted) return;

      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Role updated successfully'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
        // Refresh the list to get updated data
        widget.onRoleChanged();
      } else {
        // Revert on error
        if (mounted) {
          setState(() => selectedRole = oldRole);
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Failed to update role'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      // Revert on error
      setState(() => selectedRole = oldRole);
      print('❌ Role update error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error updating role: $e'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => isUpdating = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: isUpdating
          ? const Center(
              child: SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          : DropdownButton<String>(
              value: selectedRole,
              isExpanded: true,
              underline: const SizedBox(),
              icon: const Icon(Icons.arrow_drop_down, size: 20),
              style: const TextStyle(fontSize: 12, color: Colors.black),
              dropdownColor: Colors.white,
              items: roleList.map((role) {
                final isSelected = role == selectedRole;
                return DropdownMenuItem<String>(
                  value: role,
                  child: Text(
                    role,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.blue : Colors.black,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
              onChanged: isUpdating
                  ? null
                  : (newRole) {
                      if (newRole != null && newRole != selectedRole) {
                        print('🔄 Role dropdown changed:');
                        print('   User ID: ${widget.userId}');
                        print('   Old role: $selectedRole');
                        print('   New role: $newRole');
                        _updateRole(newRole);
                      } else {
                        print('⚠️ Same role selected or null value');
                      }
                    },
            ),
    );
  }
}

class _HeaderCell extends StatelessWidget {
  final String text;
  final double width;

  const _HeaderCell(this.text, this.width);

  @override
  Widget build(BuildContext context) => Container(
    width: width,
    alignment: Alignment.centerLeft,
    padding: const EdgeInsets.symmetric(horizontal: 12),
    child: Text(text, style: const TextStyle(fontWeight: FontWeight.bold)),
  );
}

class _Cell extends StatelessWidget {
  final String text;
  final double width;

  const _Cell(this.text, this.width);

  @override
  Widget build(BuildContext context) =>
      Container(
        width: width,
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Text(text),
      );
}