import 'package:flutter/material.dart';
import 'package:timesheet_naresh/roles/admin/pages/update_user.dart';
import 'package:timesheet_naresh/roles/admin/pages/user_details_screen.dart';
import '../../../common/widgets/admin_profile_card.dart';
import '../models/user_model.dart';
import '../profile_page/setting_page_admin.dart';
import '../services/admin_service.dart';
import 'add_user_page.dart';
import 'profile_page.dart';
import 'package:timesheet_naresh/auth/pages/sign_in_page.dart';
import 'package:timesheet_naresh/auth/services/auth_service.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';

class AdminProfilePage extends StatefulWidget {
  const AdminProfilePage({super.key});

  @override
  State<AdminProfilePage> createState() => _AdminProfilePageState();
}

class _AdminProfilePageState extends State<AdminProfilePage> {
  String _selectedRole = 'All';
  List<UserModel> users = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  Future<void> fetchUsers() async {
    setState(() => isLoading = true);
    try {
      final response = await AdminService.getUsers();
      if (response['success'] == true) {
        final List data = response['data'];
        setState(() {
          users = data.map((e) => UserModel.fromJson(e)).toList();
          isLoading = false;
        });
      } else {
        setState(() => isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response['message'] ?? 'Failed to fetch users')),
        );
      }
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  void _showRolePopup(BuildContext context) async {
    final result = await showMenu(
      context: context,
      position: RelativeRect.fromLTRB(50, 200, 50, 0),
      items: const [
        PopupMenuItem(value: 'All', child: Text('All')),
        PopupMenuItem(value: 'User', child: Text('User')),
        PopupMenuItem(value: 'Supervisor', child: Text('Supervisor')),
      ],
    );
    if (result != null) setState(() => _selectedRole = result);
  }

  void _showMoreMenu(BuildContext context) async {
    final result = await showMenu(
      context: context,
      position: RelativeRect.fromLTRB(100, 80, 16, 0),
      elevation: 4,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      items: [
        PopupMenuItem(
          value: "profile",
          child: Row(
            children: const [
              Icon(Icons.person, color: Colors.blue),
              SizedBox(width: 10),
              Text("My Profile", style: TextStyle(fontSize: 16)),
            ],
          ),
        ),
        PopupMenuItem(
          value: "settings",
          child: Row(
            children: const [
              Icon(Icons.settings, color: Colors.green),
              SizedBox(width: 10),
              Text("Settings", style: TextStyle(fontSize: 16)),
            ],
          ),
        ),
        PopupMenuItem(
          value: "logout",
          child: Row(
            children: const [
              Icon(Icons.logout, color: Colors.red),
              SizedBox(width: 10),
              Text("Log Out",
                  style: TextStyle(fontSize: 16, color: Colors.red)),
            ],
          ),
        ),
      ],
    );

    if (result == null) return;

    if (result == "profile") {
      Navigator.push(context,
          MaterialPageRoute(builder: (_) => const ProfileScreen()));
    } else if (result == "settings") {
      Navigator.push(context,
          MaterialPageRoute(builder: (_) => const SettingPageAdmin()));
    } else if (result == "logout") {
      AuthService.signOut();
      Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const SignInScreen()),
              (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              /// Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                      onTap: () => _showMoreMenu(context),
                      child: const Icon(Icons.more_horiz,
                          color: Colors.black, size: 28)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search by name or activity...',
                        prefixIcon:
                        const Icon(Icons.search, color: Colors.grey),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        filled: true,
                        fillColor: const Color(0xFFF5F6F8),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CustomDropdownFilter(
                    value: _selectedRole,
                    onTap: () => _showRolePopup(context),
                  ),
                  CustomButton(
                      width: 160,
                      icon: Icons.add,
                      title: "Add User",
                      onPressed: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => AddUserScreen()));
                      }
                      )
                ],
              ),
              const SizedBox(height: 20),

              /// User List
              Expanded(
                child: ListView.builder(
                  itemCount: users.length,
                  itemBuilder: (context, index) {
                    final user = users[index];

                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => UserDetailScreen(user: user),
                          ),
                        );
                      },
                      child: AdminProfileCard(
                        avatarUrl: 'https://i.pravatar.cc/150?img=${user.id}',
                        userName: user.name,
                        email: user.email,
                        role: user.roles.isNotEmpty ? user.roles[0].name : 'No Role',
                        button: 'Edit',
                        onViewPressed: () async {
                          // লোডিং দেখাও
                          showDialog(
                            context: context,
                            barrierDismissible: false,
                            builder: (_) => const Center(child: CircularProgressIndicator()),
                          );

                          final response = await AdminService.getSingleUser(user.id);

                          Navigator.pop(context); // close loading

                          if (response["success"] == true) {
                            final freshUser = UserModel.fromJson(response["data"]);

                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => UpdateUserPage(user: freshUser),
                              ),
                            );

                            if (result == true) {
                              fetchUsers(); // refresh the list
                            }


                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(response["message"] ?? "Failed to load user")),
                            );
                          }
                        },
                      ),
                    );
                  },
                ),
              ),


            ],
          ),
        ),
      ),
    );
  }
}

class CustomDropdownFilter extends StatelessWidget {
  final String value;
  final VoidCallback onTap;

  const CustomDropdownFilter({
    super.key,
    required this.value,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Text(value, style: const TextStyle(fontSize: 16)),
            const Icon(Icons.arrow_drop_down),
          ],
        ),
      ),
    );
  }
}
