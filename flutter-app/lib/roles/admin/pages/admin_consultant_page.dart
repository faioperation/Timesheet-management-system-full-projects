import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timesheet_naresh/notification/pages/initial_notification_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/add_user_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/admin_hours_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/preview_page.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/services/timesheet_service.dart';
import 'package:timesheet_naresh/common/models/staff_dashboard_model.dart';
import 'package:timesheet_naresh/common/services/staff_dashboard_service.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_profile_service.dart';
import '../../../common/widgets/date_header_and_time.dart';
import '../../../common/widgets/header_section.dart';
import '../../../common/widgets/recent_table.dart';
import 'home_revenue_page.dart';

class AdminConsultantPage extends StatefulWidget {
  final Function(Widget)? onPageChange;
  
  const AdminConsultantPage({super.key, this.onPageChange});

  @override
  State<AdminConsultantPage> createState() => _AdminConsultantPageState();
}

class _AdminConsultantPageState extends State<AdminConsultantPage> with WidgetsBindingObserver {
  String ? userName;
  String? profileImageUrl; // Add profile image URL
  String dropdownValue = "Weekly";

  bool _isLoadingDashboard = false;
  String? _dashboardError;
  StaffDashboardResponse? _dashboard;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    loadUserName();
    loadProfileImage(); // Load profile image
    _loadDashboard();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Refresh profile image when app comes to foreground
      loadProfileImage();
    }
  }

  Future<void> loadProfileImage() async {
    final token = await TokenService.getToken();
    if (token != null) {
      final profileData = await ProfileService.getProfile(token);
      if (mounted && profileData != null) {
        setState(() {
          profileImageUrl = profileData.image;
        });
      }
    }
  }

  Future<void> loadUserName() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      userName = prefs.getString("username") ?? "User";
    });
  }

  Future<void> _loadDashboard() async {
    setState(() {
      _isLoadingDashboard = true;
      _dashboardError = null;
    });

    try {
      final resp = await StaffDashboardService.getStaffDashboard();
      if (!mounted) return;
      setState(() {
        _dashboard = resp;
        _isLoadingDashboard = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _dashboardError = e.toString();
        _isLoadingDashboard = false;
      });
    }
  }

  Future<void> _handleViewTimesheet(int timesheetId) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final timesheet = await TimesheetService.getTimesheetById(timesheetId);
      if (!mounted) return;
      Navigator.pop(context);
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => TimesheetPreviewPage(timesheet: timesheet),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load timesheet: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    final stats = _dashboard?.data.stats;
    final timesheets = _dashboard?.data.timesheets ?? const [];


    return Scaffold(
      backgroundColor: const Color(0xFFF6F7FB),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: EdgeInsets.symmetric(
            horizontal: screenWidth * 0.05,
            vertical: screenHeight * 0.02,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              /// 👤 Header
              HeaderSection(
                name: userName ?? "Loading...",
                profileImageUrl: profileImageUrl, // Pass profile image URL
                onMenuPressed: () {},

                onNotificationPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => InitialNotificationScreen(),
                    ),
                  );
                },

                onPressed: () {
                  // Show only Revenue and Hours (exclude current Consultant page)
                  showMenu(
                    context: context,
                    position: const RelativeRect.fromLTRB(100, 80, 10, 100),
                    items: [
                      const PopupMenuItem(
                        value: 'sales',
                        child: Text('Sales Analytics'),
                      ),
                      const PopupMenuItem(
                        value: 'hours',
                        child: Text('Hours'),
                      ),
                    ],
                  ).then((value) {
                    if (value == 'sales') {
                      if (widget.onPageChange != null) {
                        widget.onPageChange!(HomeRevenuePage(onPageChange: widget.onPageChange));
                      } else {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const HomeRevenuePage(),
                          ),
                        );
                      }
                    } else if (value == 'hours') {
                      if (widget.onPageChange != null) {
                        widget.onPageChange!(AdminHoursPage(onPageChange: widget.onPageChange));
                      } else {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const AdminHoursPage(),
                          ),
                        );
                      }
                    }
                  });
                },
              ),
              SizedBox(height: screenHeight * 0.025),

              /// 📅 Date + Add User Button
              DateHeaderAndTime(
                buttonText: "Add user",
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context)=>AddUserScreen()));
                },
              ),
              SizedBox(height: screenHeight * 0.02),

              /// 📊 Consultant Chart Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Consultant",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  // DropdownButton<String>(
                  //   value: dropdownValue,
                  //   items: const [
                  //     DropdownMenuItem(value: "Weekly", child: Text("Weekly")),
                  //     DropdownMenuItem(value: "Monthly", child: Text("Monthly")),
                  //   ],
                  //   onChanged: (value) {
                  //     setState(() => dropdownValue = value!);
                  //   },
                  // ),
                ],
              ),
              SizedBox(height: screenHeight * 0.01),

              /// 📈 Consultant Circle Chart (from /staff-dashboard stats)
              Container(
                width: double.infinity,
                height: 240,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.shade200,
                      blurRadius: 6,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: _isLoadingDashboard
                    ? const Center(child: CircularProgressIndicator())
                    : (_dashboardError != null)
                        ? Center(
                            child: Text(
                              _dashboardError!,
                              style: const TextStyle(color: Colors.red),
                              textAlign: TextAlign.center,
                            ),
                          )
                        : (stats == null)
                            ? const Center(child: Text('No data'))
                            : _buildStatsPie(stats),
              ),

              SizedBox(height: screenHeight * 0.03),

              /// 🕒 Recent Table Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Recent",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  // DropdownButton<String>(
                  //   value: "w2",
                  //   items: const [
                  //     DropdownMenuItem(value: "w2", child: Text("w2")),
                  //     DropdownMenuItem(value: "c2c", child: Text("c2c")),
                  //   ],
                  //   onChanged: (_) {},
                  // ),
                ],
              ),
              SizedBox(height: screenHeight * 0.01),

              /// 🧾 Recent Table
              RecentTable(
                title: "",
                dropdownValue: "",
                dropdownItems: const [],
                data: timesheets
                    .map((t) => {
                          'user': t.consultantName,
                          'status': t.status,
                          'totalHour': t.totalHours.toStringAsFixed(2),
                          'onView': () => _handleViewTimesheet(t.id),
                        })
                    .toList(),
                onDropdownChanged: (_) {},
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Widget _buildStatsPie(StaffDashboardStats stats) {
  final items = <({String label, double value, Color color, String display})>[
    (
      label: 'Managed Timesheets',
      value: stats.totalManagedTimesheets.toDouble(),
      color: const Color(0xFF6674FF),
      display: stats.totalManagedTimesheets.toString(),
    ),
    (
      label: 'Total Hours',
      value: stats.totalHours,
      color: const Color(0xFF2ECC71),
      display: stats.totalHours.toStringAsFixed(2),
    ),
    (
      label: 'Gross Margin',
      value: stats.totalGrossMargin,
      color: const Color(0xFFF39C12),
      display: stats.totalGrossMargin.toStringAsFixed(2),
    ),
    (
      label: 'Net Margin',
      value: stats.totalNetMargin,
      color: const Color(0xFF9B59B6),
      display: stats.totalNetMargin.toStringAsFixed(2),
    ),
    (
      label: 'Expanse',
      value: stats.totalExpanse,
      color: const Color(0xFFE74C3C),
      display: stats.totalExpanse.toStringAsFixed(2),
    ),
  ];

  final sum = items.fold<double>(0.0, (s, e) => s + (e.value.abs()));
  final safeSum = sum == 0 ? 1.0 : sum;

  return Column(
    children: [
      Expanded(
        child: Row(
          children: [
            Expanded(
              flex: 3,
              child: PieChart(
                PieChartData(
                  sectionsSpace: 2,
                  centerSpaceRadius: 38,
                  sections: items.map((e) {
                    final v = e.value.abs();
                    return PieChartSectionData(
                      color: e.color,
                      value: v == 0 ? 0.01 : v,
                      title: '',
                      radius: 38,
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 4,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: items
                    .map((e) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: e.color,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  '${e.label}: ${e.display}',
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 12, color: Colors.black87),
                                ),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ),
          ],
        ),
      ),
      const SizedBox(height: 8),
      Text(
        'Total (for pie): ${(safeSum).toStringAsFixed(2)}',
        style: const TextStyle(fontSize: 11, color: Colors.black45),
      ),
    ],
  );
}

Widget _buildLegendDot({required Color color, required String text}) {
  return Row(
    children: [
      Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
      ),
      const SizedBox(width: 6),
      Text(
        text,
        style: const TextStyle(
          fontSize: 12,
          color: Colors.black54,
          fontWeight: FontWeight.w500,
        ),
      ),
    ],
  );
}

