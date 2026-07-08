import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/client_model.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/add_client_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/client_service.dart';
import '../../../../common/widgets/custom_button.dart';
import '../../services/admin_service.dart';

// Keep import for delete functionality

class ClientListScreen extends StatefulWidget {
  const ClientListScreen({super.key});

  @override
  State<ClientListScreen> createState() => _UserListScreenState();
}

class _UserListScreenState extends State<ClientListScreen> {
  late Future<List<ClientModel>> clientFuture;
  String? _userRole = '';

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _loadClients();
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
    final role = _userRole?.toLowerCase() ?? '';
    return role == 'admin' || role == 'business admin';
  }

  bool get _canEdit {
    final role = _userRole?.toLowerCase() ?? '';
    return role == 'admin' || role == 'business admin' || role == 'staff' || role == 'supervisor';
  }
  
  void _loadClients() async{
    final token = await TokenService.getToken();
    
    if(token == null ){
      clientFuture = Future.error("Token Not Found");
    }
    else{
      clientFuture = ClientService.getClients(token);
    }
    setState(() {
      
    });
}

  @override
  Widget build(BuildContext context) {
    // final users = List.generate(
    //   20,
    //       (index) => ClientModel(
    //     name: 'Wade Warren',
    //     email: 'alma.lawson@example.com',
    //     phone: '(307) 555-0133',
    //     address: "Dhaka",
    //     zipCode: "7240",
    //     remark: "Good",
    //   ),
    // );

    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F4),
      appBar: CustomAppBar(title: "Client"),
      body: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CustomButton(
              width: 160,
              icon: Icons.add,
              title: "Add Client",
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const AddClientScreen(),
                  ),
                );
                // Refresh list if client was created successfully
                if (result == true) {
                  _loadClients();
                }
              },
            ),
            const SizedBox(height: 8),

            // Expanded(
            //   child: SingleChildScrollView(
            //     child: Row(
            //       crossAxisAlignment: CrossAxisAlignment.start,
            //       children: [
            //         SizedBox(
            //           width: 130,
            //           child: Column(
            //             children: [
            //               _nameHeader(),
            //               ...users.map((u) => _nameCell(u.name)),
            //             ],
            //           ),
            //         ),
            //
            //         Expanded(
            //           child: SingleChildScrollView(
            //             scrollDirection: Axis.horizontal,
            //             child: Column(
            //               children: [
            //                 _rightHeader(),
            //                 ...users.map((u) => _rightRow(u)),
            //               ],
            //             ),
            //           ),
            //         ),
            //       ],
            //     ),
            //   ),
            // ),
            Expanded(child: FutureBuilder(future: clientFuture, builder: (context,snapshot){
              if(snapshot.connectionState == ConnectionState.waiting){
                return const Center(child:  CircularProgressIndicator());
              }
              if(snapshot.hasError){
                return Center(child: Text(snapshot.hasError.toString()),);
              }
              
              final clients = snapshot.data ?? [];
              
              if(clients.isEmpty){
                return const Center(child: Text("No Clients Found"),);
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
                          ...clients.map((v)=>_nameCell(v.name))
                        ],
                      ),
                    ),
                    
                    Expanded(child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Column(
                        children: [
                          _rightHeader(),
                          ...clients.map((v)=>_rightRow(v))
                        ],
                      ),
                    ))
                  ],
                ),
              );
            }))
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

  Widget _rightRow(ClientModel client) {
    return Container(
      height: 48,
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
      ),
      child: Row(
        children: [
          // _Cell(client.email, 220),
          _Cell(client.phone, 150),
          _Cell(client.address, 120),
          _Cell(client.zipCode, 120),
          _Cell(client.remark, 100),
          if (_canEdit)
            SizedBox(
              width: _isAdmin ? 150 : 100,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: () => _handleEditClient(client),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('Edit', style: TextStyle(fontSize: 11, color: Colors.blue)),
                  ),
                  if (_isAdmin)
                    TextButton(
                      onPressed: () => _handleDeleteClient(client.id, client.name),
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

  Future<void> _handleEditClient(ClientModel client) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddClientScreen(existingClient: client),
      ),
    );
    // Refresh list if client was updated successfully
    if (result == true) {
      _loadClients();
    }
  }

  Future<void> _handleDeleteClient(int clientId, String clientName) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Client'),
        content: Text('Are you sure you want to delete "$clientName"? This action cannot be undone.'),
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

    if (!mounted) return;

    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await AdminService.deleteParty(partyId: clientId);
      if (!mounted) return;
      Navigator.pop(context); // Close loading dialog

      if (response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Client deleted successfully'),
              backgroundColor: Colors.green,
            ),
          );
          // Refresh the list
          _loadClients();
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Failed to delete client'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loading dialog
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
