import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/vendor_model.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/add_new_vendor_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/vendor_service.dart';
import '../../../../common/widgets/custom_button.dart';
import '../../services/admin_service.dart';

class VendorListScreen extends StatefulWidget {
  const VendorListScreen({super.key});

  @override
  State<VendorListScreen> createState() => _VendorListScreenState();
}

class _VendorListScreenState extends State<VendorListScreen> {
  late Future<List<VendorModel>> vendorFuture;
  String? _userRole = '';

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _loadVendors();
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

  void _loadVendors() async {
    final token = await TokenService.getToken();

    if (token == null) {
      vendorFuture = Future.error("Token not found");
    } else {
      vendorFuture = VendorService.getVendors(token);
    }

    setState(() {});
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      appBar: CustomAppBar(title: "Vendor"),
      body: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CustomButton(
              width: 160,
              icon: Icons.add,
              title: "Add Vendor",
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AddNewVendorScreen(),
                  ),
                );
                // Refresh list if vendor was created successfully
                if (result == true) {
                  _loadVendors();
                }
              },
            ),
            const SizedBox(height: 8),

            Expanded(
              child: FutureBuilder<List<VendorModel>>(
                future: vendorFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (snapshot.hasError) {
                    return Center(child: Text(snapshot.error.toString()));
                  }

                  final vendors = snapshot.data ?? [];

                  if (vendors.isEmpty) {
                    return const Center(child: Text("No vendors found"));
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
                              ...vendors.map((v) => _nameCell(v.name)),
                            ],
                          ),
                        ),

                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Column(
                              children: [
                                _rightHeader(),
                                ...vendors.map((v) => _rightRow(v)),
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
          // _HeaderCell('Email', 220),
          const _HeaderCell('Phone', 150),
          const _HeaderCell('Address', 120),
          const _HeaderCell('Zip Code', 120),
          const _HeaderCell('Remark', 100),
          if (_canEdit) _HeaderCell('Action', _isAdmin ? 150 : 100),
        ],
      ),
    );
  }

  Widget _rightRow(VendorModel vendor) {
    return Container(
      height: 48,
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
      ),
      child: Row(
        children: [
          // _Cell(vendor.email, 220),
          _Cell(vendor.phone, 150),
          _Cell(vendor.address, 120),
          _Cell(vendor.zipCode, 120),
          _Cell(vendor.remark, 120),
          if (_canEdit)
            SizedBox(
              width: _isAdmin ? 150 : 100,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: () => _handleEditVendor(vendor),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('Edit', style: TextStyle(fontSize: 11, color: Colors.blue)),
                  ),
                  if (_isAdmin)
                    TextButton(
                      onPressed: () => _handleDeleteVendor(vendor.id, vendor.name),
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

  Future<void> _handleEditVendor(VendorModel vendor) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddNewVendorScreen(existingVendor: vendor),
      ),
    );
    // Refresh list if vendor was updated successfully
    if (result == true) {
      _loadVendors();
    }
  }

  Future<void> _handleDeleteVendor(int vendorId, String vendorName) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Vendor'),
        content: Text('Are you sure you want to delete "$vendorName"? This action cannot be undone.'),
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
      final response = await AdminService.deleteParty(partyId: vendorId);
      Navigator.pop(context); // Close loading dialog

      if (response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Vendor deleted successfully'),
              backgroundColor: Colors.green,
            ),
          );
          // Refresh the list
          _loadVendors();
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Failed to delete vendor'),
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
