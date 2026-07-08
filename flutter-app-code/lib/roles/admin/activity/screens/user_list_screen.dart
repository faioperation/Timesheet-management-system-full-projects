import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/user_service.dart';
import '../../../../common/widgets/custom_button.dart';
import '../../pages/add_user_page.dart';
import '../../pages/user_details_screen.dart';
import '../../pages/update_user_role_page.dart';
import '../../pages/assign_client_page.dart';
import '../../services/admin_service.dart';
import '../../models/user_model.dart';
import '../models/user_model.dart';

class UserListScreen extends StatefulWidget {
  const UserListScreen({super.key});

  @override
  State<UserListScreen> createState() => _UserListScreenState();
}

class _UserListScreenState extends State<UserListScreen> {
  late Future<List<UserModelUser>> futureUsers;
  final Map<int, Future<Map<String, dynamic>>> _singleUserFutures = {};
  String? _userRole;
  bool _isLoadingRole = true;

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    futureUsers = UserService.getUsers();
  }

  Future<void> _loadUserRole() async {
    final role = await TokenService.getRole();
    setState(() {
      _userRole = role;
      _isLoadingRole = false;
    });
  }

  bool get _isAdmin {
    return _userRole?.toLowerCase() == 'admin' || _userRole?.toLowerCase() == 'business admin';
  }

  Future<Map<String, dynamic>> _getSingleUserFuture(int userId) {
    return _singleUserFutures.putIfAbsent(userId, () => AdminService.getSingleUser(userId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      appBar: CustomAppBar(title: "User"),
      body: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CustomButton(
              width: 160,
              icon: Icons.add,
              title: "Add User",
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AddUserScreen(),
                  ),
                );
              },
            ),
            const SizedBox(height: 8),

            /// 🔥 API DATA
            Expanded(
              child: FutureBuilder<List<UserModelUser>>(
                future: futureUsers,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (snapshot.hasError) {
                    return Center(
                      child: Text(
                        snapshot.error.toString(),
                        style: const TextStyle(color: Colors.red),
                      ),
                    );
                  }

                  final users = snapshot.data!;
                  if (users.isEmpty) {
                    return const Center(child: Text('No users found'));
                  }

                  return SingleChildScrollView(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        /// LEFT
                        SizedBox(
                          width: 130,
                          child: Column(
                            children: [
                              _nameHeader(),
                              ...users.map((u) => _nameCell(u.name)),
                            ],
                          ),
                        ),

                        /// RIGHT
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

  // ---------- UI HELPERS (same as before) ----------

  Widget _nameHeader() => Container(
    height: 48,
    alignment: Alignment.centerLeft,
    padding: const EdgeInsets.symmetric(horizontal: 12),
    color: const Color(0xFFEFF3FF),
    child: const Text('Name', style: TextStyle(fontWeight: FontWeight.bold)),
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
        const _HeaderCell('Status', 120),
        _HeaderCell('Action', _isAdmin ? 300 : 240), // View + Edit + (optional) Assign + Delete (admin only)
      ],
    ),
  );

  Widget _rightRow(UserModelUser user) => Container(
    height: 48,
    decoration: const BoxDecoration(
      border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
    ),
    child: Row(
      children: [
        _Cell(user.email, 220),
        _Cell(user.phone, 150),
        _Cell(user.role, 120),
        _StatusDropdownCell(
          currentStatus: user.status,
          userId: user.id,
          onStatusChanged: () {
            // Refresh the list after status update
            setState(() {
              futureUsers = UserService.getUsers();
            });
          },
        ),
        SizedBox(
          width: _isAdmin ? 300 : 240,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              TextButton(
                onPressed: () => _handleViewUser(user.id),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('View', style: TextStyle(fontSize: 11)),
              ),
              const SizedBox(width: 4),
              TextButton(
                onPressed: () => _handleEditRole(user.id),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('Edit', style: TextStyle(fontSize: 11, color: Colors.green)),
              ),
              const SizedBox(width: 4),
              _buildAssignButton(user),
              if (_isAdmin) ...[
                const SizedBox(width: 4),
                TextButton(
                  onPressed: () => _handleDeleteUser(user.id, user.name),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Delete', style: TextStyle(fontSize: 11, color: Colors.red)),
                ),
              ],
            ],
          ),
        ),
      ],
    ),
  );

  Widget _buildAssignButton(UserModelUser user) {
    // Check client_rate for ALL roles (Staff, User, Business Admin)
    // Show Assign button if client_rate is 0 or null
    // Show Update Assign button if client_rate exists and > 0
    return FutureBuilder<Map<String, dynamic>>(
      future: _getSingleUserFuture(user.id),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          );
        }

        if (!snapshot.hasData) {
          return const SizedBox.shrink();
        }

        final resp = snapshot.data!;
        if (resp['success'] != true) {
          return const SizedBox.shrink();
        }

        final data = resp['data'] as Map<String, dynamic>?;
        final userDetails = data?['user_details'] as Map<String, dynamic>?;
        final int? userDetailsId = userDetails?['id'] as int?;
        final num? clientRate = userDetails?['client_rate'] as num?;

        // Show button only if userDetailsId exists
        if (userDetailsId == null) {
          return const SizedBox.shrink();
        }

        // Determine if it's update mode (client_rate exists and > 0)
        final isUpdateMode = clientRate != null && clientRate > 0;

        return TextButton(
          onPressed: () => _handleAssignClient(user, isUpdateMode: isUpdateMode, userData: data),
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: Text(
            isUpdateMode ? 'Update Assign' : 'Assign',
            style: TextStyle(fontSize: 11, color: isUpdateMode ? Colors.orange : Colors.blue),
          ),
        );
      },
    );
  }

  Future<void> _handleViewUser(int userId) async {
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await AdminService.getSingleUser(userId);
      Navigator.pop(context); // Close loading dialog

      if (response["success"] == true) {
        final user = UserModel.fromJson(response["data"]);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => UserDetailScreen(user: user),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response["message"] ?? "Failed to load user details"),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      Navigator.pop(context); // Close loading dialog
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Error: $e"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _handleDeleteUser(int userId, String userName) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete User'),
        content: Text('Are you sure you want to delete "$userName"? This action cannot be undone.'),
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
      final response = await AdminService.deleteUser(userId: userId);
      Navigator.pop(context); // Close loading dialog

      if (response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'User deleted successfully'),
              backgroundColor: Colors.green,
            ),
          );
          // Refresh the list
          setState(() {
            futureUsers = UserService.getUsers();
            _singleUserFutures.clear();
          });
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Failed to delete user'),
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

  Future<void> _handleAssignClient(UserModelUser user, {bool isUpdateMode = false, Map<String, dynamic>? userData}) async {
    int? userDetailsId = user.userDetailsId;

    // If userDetailsId missing (list API doesn't return it), fetch single user
    if (userDetailsId == null || (isUpdateMode && userData == null)) {
      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );
      try {
        final response = await AdminService.getSingleUser(user.id);
        Navigator.pop(context);
        if (response["success"] == true) {
          final data = response["data"];
          userDetailsId = data?["user_details"]?["id"] as int?;
          if (isUpdateMode) {
            userData = data;
          }
        }
      } catch (e) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Failed to fetch user details: $e"),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }
    }

    if (userDetailsId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("User details ID not found"),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AssignClientScreen(
          userDetailsId: userDetailsId!,
          existingData: isUpdateMode ? userData : null,
        ),
      ),
    );

    // After successful assignment/update, refresh the user list
    if (result == true || result == null) {
      _singleUserFutures.remove(user.id); // re-fetch for updated client_rate
      setState(() {
        futureUsers = UserService.getUsers();
      });
    }
  }

  Future<void> _handleEditRole(int userId) async {
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await AdminService.getSingleUser(userId);
      Navigator.pop(context); // Close loading dialog

      if (response["success"] == true) {
        final user = UserModel.fromJson(response["data"]);
        final result = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => UpdateUserRolePage(user: user),
          ),
        );

        // Refresh user list if role was updated
        if (result == true) {
          setState(() {
            futureUsers = UserService.getUsers();
          });
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response["message"] ?? "Failed to load user details"),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      Navigator.pop(context); // Close loading dialog
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Error: $e"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

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

class _StatusDropdownCell extends StatefulWidget {
  final String currentStatus;
  final int userId;
  final VoidCallback onStatusChanged;

  const _StatusDropdownCell({
    required this.currentStatus,
    required this.userId,
    required this.onStatusChanged,
  });

  @override
  State<_StatusDropdownCell> createState() => _StatusDropdownCellState();
}

class _StatusDropdownCellState extends State<_StatusDropdownCell> {
  late String _selectedStatus;
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.currentStatus;
  }

  @override
  void didUpdateWidget(_StatusDropdownCell oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentStatus != widget.currentStatus) {
      _selectedStatus = widget.currentStatus;
    }
  }

  Future<void> _handleStatusChange(String? newStatus) async {
    if (newStatus == null || newStatus == _selectedStatus) {
      return;
    }

    setState(() {
      _isUpdating = true;
    });

    try {
      final response = await AdminService.updateUserStatus(
        userId: widget.userId,
        status: newStatus,
      );

      if (mounted) {
        setState(() {
          _isUpdating = false;
        });

        if (response['success'] == true) {
          setState(() {
            _selectedStatus = newStatus;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'User status updated successfully'),
              backgroundColor: Colors.green,
            ),
          );
          // Refresh the list
          widget.onStatusChanged();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Failed to update user status'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUpdating = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: _isUpdating
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : DropdownButton<String>(
              value: _selectedStatus,
              isExpanded: true,
              underline: Container(),
              items: ['pending', 'approved', 'rejected'].map((String status) {
                return DropdownMenuItem<String>(
                  value: status,
                  child: Text(
                    status,
                    style: const TextStyle(fontSize: 12),
                  ),
                );
              }).toList(),
              onChanged: _handleStatusChange,
            ),
    );
  }
}



