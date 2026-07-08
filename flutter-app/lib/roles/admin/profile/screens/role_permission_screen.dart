import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/roles/admin/profile/models/permission_model.dart';
import 'package:timesheet_naresh/roles/admin/profile/services/permission_service.dart';
import '../widgets/permission_card.dart';

class RolePermissionUIScreen extends StatefulWidget {
  const RolePermissionUIScreen({super.key});

  @override
  State<RolePermissionUIScreen> createState() => _RolePermissionUIScreenState();
}

class _RolePermissionUIScreenState extends State<RolePermissionUIScreen> {
  String _selectedRole = 'User'; // Default to User
  bool _isLoading = false;
  bool _isSaving = false;
  List<PermissionModel> _permissions = [];
  final Map<String, bool> _permissionStates = {}; // Maps permission name to enabled state

  @override
  void initState() {
    super.initState();
    _loadPermissions();
  }

  Future<void> _loadPermissions() async {
    setState(() {
      _isLoading = true;
    });

    try {
      PermissionResponse allResponse;
      PermissionResponse availableResponse;

      if (_selectedRole == 'Staff') {
        allResponse = await PermissionService.getSupervisorPermissions();
        availableResponse = await PermissionService.getSupervisorAvailablePermissions();
      } else {
        allResponse = await PermissionService.getUserPermissions();
        availableResponse = await PermissionService.getUserAvailablePermissions();
      }

      setState(() {
        _permissions = allResponse.permissions;

        // Build a set of permission IDs that are currently assigned (available)
        final Set<int> availableIds = availableResponse.permissions
            .map((p) => p.id)
            .toSet();

        // Initialize permissionStates based on availability:
        // - true  => permission id present in available list (switch ON)
        // - false => not present (switch OFF)
        _permissionStates.clear();
        for (var permission in _permissions) {
          _permissionStates[permission.name] = availableIds.contains(permission.id);
        }

        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading permissions: $e')),
        );
      }
    }
  }

  void _onRoleChanged(String role) {
    if (_selectedRole != role) {
      setState(() {
        _selectedRole = role;
        _permissions = [];
        _permissionStates.clear();
      });
      _loadPermissions();
    }
  }

  void _onPermissionChanged(String permissionName, bool value) {
    setState(() {
      _permissionStates[permissionName] = value;
    });
  }

  // Get role ID based on selected role
  int _getRoleId() {
    return _selectedRole == 'User' ? 4 : 3; // User = 4, Staff = 3
  }

  // Get all enabled permission IDs
  List<int> _getEnabledPermissionIds() {
    final List<int> enabledIds = [];
    for (var permission in _permissions) {
      if (_permissionStates[permission.name] == true) {
        enabledIds.add(permission.id);
      }
    }
    return enabledIds;
  }

  // Group permissions by their resource (e.g., "user", "timesheet", "party", etc.)
  Map<String, List<PermissionModel>> _groupPermissionsByResource() {
    final Map<String, List<PermissionModel>> grouped = {};

    for (var permission in _permissions) {
      // Extract resource name from permission name
      // e.g., "view_user" -> "user", "create_timesheet" -> "timesheet"
      String resourceName = '';
      final parts = permission.name.split('_');
      if (parts.length >= 2) {
        // Skip the action prefix (view, create, update, delete, submit)
        resourceName = parts.sublist(1).join('_');
      } else {
        resourceName = permission.name;
      }

      // Format resource name for display
      resourceName = resourceName
          .split('_')
          .map((word) => word[0].toUpperCase() + word.substring(1))
          .join(' ');

      if (!grouped.containsKey(resourceName)) {
        grouped[resourceName] = [];
      }
      grouped[resourceName]!.add(permission);
    }

    return grouped;
  }

  Future<void> _handleSave() async {
    // Get enabled permission IDs
    final enabledPermissionIds = _getEnabledPermissionIds();

    if (enabledPermissionIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enable at least one permission'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isSaving = true;
    });

    try {
      final roleId = _getRoleId();
      final response = await PermissionService.saveRolePermissions(
        roleId: roleId,
        permissionIds: enabledPermissionIds,
      );

      if (mounted) {
        setState(() {
          _isSaving = false;
        });

        if (response['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Permissions saved successfully'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Failed to save permissions'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving permissions: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final groupedPermissions = _groupPermissionsByResource();

    return Scaffold(
      backgroundColor: const Color(0xFFF3F3F3),
      appBar: CustomAppBar(title: "Role Permission"),
      body: Column(
        children: [
          // Role Toggle Section
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildRoleToggle(
                    label: 'User',
                    isSelected: _selectedRole == 'User',
                    onTap: () => _onRoleChanged('User'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildRoleToggle(
                    label: 'Staff',
                    isSelected: _selectedRole == 'Staff',
                    onTap: () => _onRoleChanged('Staff'),
                  ),
                ),
              ],
            ),
          ),

          // Permissions List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _permissions.isEmpty
                    ? const Center(
                        child: Text(
                          'No permissions found',
                          style: TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                      )
                    : ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        children: groupedPermissions.entries.map((entry) {
                          return PermissionCard(
                            title: entry.key,
                            permissions: entry.value,
                            permissionStates: _permissionStates,
                            onPermissionChanged: _onPermissionChanged,
                          );
                        }).toList(),
                      ),
          ),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: CustomButton(
          title: _isSaving ? "Saving..." : "Save",
          onPressed:  _handleSave,
        ),
      ),
    );
  }

  Widget _buildRoleToggle({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF556EE6) : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.black,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }
}
