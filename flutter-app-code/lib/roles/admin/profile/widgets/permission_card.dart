import 'package:flutter/material.dart';
import '../models/permission_model.dart';

class PermissionCard extends StatelessWidget {
  final String title;
  final List<PermissionModel> permissions;
  final Map<String, bool> permissionStates; // Receive state from parent
  final Function(String permissionName, bool value)? onPermissionChanged;

  const PermissionCard({
    super.key,
    required this.title,
    required this.permissions,
    required this.permissionStates,
    this.onPermissionChanged,
  });

  String _formatPermissionName(String name) {
    // Convert "view_user" to "View User", "create_timesheet" to "Create Timesheet"
    return name
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }

  String _getActionLabel(String permissionName) {
    // Extract action from permission name (e.g., "create", "view", "update", "delete", "submit")
    if (permissionName.startsWith('create_')) return 'Create';
    if (permissionName.startsWith('view_')) return 'View';
    if (permissionName.startsWith('update_')) return 'Update';
    if (permissionName.startsWith('delete_')) return 'Delete';
    if (permissionName.startsWith('submit_')) return 'Submit';
    return _formatPermissionName(permissionName);
  }

  @override
  Widget build(BuildContext context) {
    if (permissions.isEmpty) {
      return const SizedBox.shrink();
    }

    // Sort permissions by action type for consistent display
    final sortedPermissions = List<PermissionModel>.from(permissions);
    sortedPermissions.sort((a, b) {
      final order = {'create': 0, 'view': 1, 'update': 2, 'submit': 3, 'delete': 4};
      final aAction = a.name.split('_').first;
      final bAction = b.name.split('_').first;
      return (order[aAction] ?? 99).compareTo(order[bAction] ?? 99);
    });

    // Build rows of 2 permissions each
    final List<Widget> rows = [];
    for (int i = 0; i < sortedPermissions.length; i += 2) {
      final leftPermission = sortedPermissions[i];
      final rightPermission = i + 1 < sortedPermissions.length 
          ? sortedPermissions[i + 1] 
          : null;

      rows.add(
        _row(
          leftLabel: _getActionLabel(leftPermission.name),
          leftValue: permissionStates[leftPermission.name] ?? true,
          onLeftChanged: (v) {
            onPermissionChanged?.call(leftPermission.name, v);
          },
          rightLabel: rightPermission != null 
              ? _getActionLabel(rightPermission.name) 
              : '',
          rightValue: rightPermission != null
              ? (permissionStates[rightPermission.name] ?? true)
              : false,
          onRightChanged: rightPermission != null
              ? (v) {
                  onPermissionChanged?.call(rightPermission.name, v);
                }
              : null,
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          ...rows,
        ],
      ),
    );
  }

  Widget _row({
    required String leftLabel,
    required bool leftValue,
    required ValueChanged<bool> onLeftChanged,
    required String rightLabel,
    required bool rightValue,
    required ValueChanged<bool>? onRightChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Expanded(
            child: _switch(leftLabel, leftValue, onLeftChanged),
          ),
          if (rightLabel.isNotEmpty)
            Expanded(
              child: _switch(rightLabel, rightValue, onRightChanged!),
            ),
        ],
      ),
    );
  }

  Widget _switch(
    String label,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: Text(
            label,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeColor: const Color(0xFF556EE6),
        ),
      ],
    );
  }
}
