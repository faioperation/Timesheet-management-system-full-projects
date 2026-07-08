import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timesheet_naresh/notification/pages/initial_notification_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/add_user_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/admin_consultant_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/admin_hours_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/preview_page.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/models/timesheet_model.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/services/timesheet_service.dart';
import 'package:timesheet_naresh/roles/admin/chart/models/chart_trend_model.dart';
import 'package:timesheet_naresh/roles/admin/chart/services/chart_trend_service.dart';
import 'package:timesheet_naresh/roles/supervisor/pages/supervisor_dashboard.dart';
import 'package:timesheet_naresh/roles/user/pages/user_dashboard.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_profile_service.dart';
import '../../../common/widgets/custome_bottom_nav_bar.dart';
import '../../../common/widgets/date_header_and_time.dart';
import '../../../common/widgets/header_section.dart';
import '../../../common/widgets/recent_table.dart';
import '../widgets/analytics_card.dart';

class HomeRevenuePage extends StatefulWidget {
  final Function(Widget)? onPageChange;

  const HomeRevenuePage({super.key, this.onPageChange});

  @override
  State<HomeRevenuePage> createState() => _HomeRevenuePageState();
}

class _HomeRevenuePageState extends State<HomeRevenuePage> with WidgetsBindingObserver {
  String? userName;
  String? profileImageUrl; // Add profile image URL
  String dropdownValue = "Hours";
  List<TimesheetModel> timesheets = [];
  bool isLoadingTimesheets = false;
  ChartTrendSummary? chartSummary;
  bool isLoadingChart = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    loadUserName();
    loadProfileImage();
    loadTimesheets();
    loadChartTrend();
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


  Future<void> loadUserName() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      userName = prefs.getString("username") ?? "User";
    });
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

  Future<void> loadTimesheets() async {
    setState(() {
      isLoadingTimesheets = true;
    });

    try {
      final response = await TimesheetService.getTimesheets();
      if (mounted) {
        setState(() {
          timesheets = response.data;
          isLoadingTimesheets = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoadingTimesheets = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading timesheets: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> loadChartTrend() async {
    setState(() {
      isLoadingChart = true;
    });

    try {
      final response = await ChartTrendService.getChartTrend();
      if (mounted) {
        setState(() {
          chartSummary = response.summary;
          isLoadingChart = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoadingChart = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading chart data: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  List<Map<String, dynamic>> get recentData {
    return timesheets.map((timesheet) {
      return {
        'user': timesheet.user.name,
        'status': timesheet.status,
        'totalHour': double.tryParse(timesheet.totalHours) ?? 0.0,
        'onView': () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TimesheetPreviewPage(
                timesheet: timesheet,
              ),
            ),
          );
        },
      };
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final double screenHeight = MediaQuery.of(context).size.height;
    final double screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: screenWidth * 0.04,
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
                    // Show only Consultant and Hours (exclude current Revenue page)
                    showMenu(
                      context: context,
                      position: const RelativeRect.fromLTRB(100, 80, 10, 100),
                      items: [
                        const PopupMenuItem(
                          value: 'consultant',
                          child: Text('Consultant'),
                        ),
                        const PopupMenuItem(
                          value: 'hours',
                          child: Text('Hours'),
                        ),
                      ],
                    ).then((value) {
                      if (value == 'consultant') {
                        if (widget.onPageChange != null) {
                          widget.onPageChange!(AdminConsultantPage(onPageChange: widget.onPageChange));
                        } else {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const AdminConsultantPage(),
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

                SizedBox(height: screenHeight * 0.02),
          
                /// 📅 Date and Time
                DateHeaderAndTime(
                  buttonText: "Add User",
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (context)=>AddUserScreen()));
                  },
                ),
                SizedBox(height: screenHeight * 0.02),
          
                /// 📊 Sales Analytics Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Sales analytics",
                      style: TextStyle(
                        fontSize: screenWidth * 0.045,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    // DropdownButton<String>(
                    //   value: "Monthly",
                    //   items: const [
                    //     DropdownMenuItem(value: "Monthly", child: Text("Monthly")),
                    //     DropdownMenuItem(value: "Weekly", child: Text("Weekly")),
                    //   ],
                    //   onChanged: (_) {},
                    // ),
                  ],
                ),
                SizedBox(height: screenHeight * 0.015),
          
                /// 📈 Analytics Card (Pie chart + details)
                isLoadingChart
                    ? Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.1),
                              blurRadius: 10,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Padding(
                            padding: EdgeInsets.all(40.0),
                            child: CircularProgressIndicator(),
                          ),
                        ),
                      )
                    : SalesAnalyticsCard(
                        summary: chartSummary,
                      ),
                SizedBox(height: screenHeight * 0.0025),
          
                /// 🕒 Recent Table
                isLoadingTimesheets
                    ? const Center(child: CircularProgressIndicator())
                    : timesheets.isEmpty
                        ? Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Text(
                                "No timesheets found",
                                style: TextStyle(fontSize: 16),
                              ),
                            ),
                          )
                        : RecentTable(
                            title: "Recent",
                            dropdownValue: dropdownValue,
                            dropdownItems: const ["Hours"],
                            data: recentData,
                            showDropdown: false,
                            onDropdownChanged: (value) {
                              // Only "Hours" option is available; keep state simple
                              if (value != null) {
                                setState(() {
                                  dropdownValue = value;
                                });
                              }
                            },
                          ),
                SizedBox(height: screenHeight * 0.05),
              ],
            ),
          ),
        ),
      ),

      /// 🔻 Bottom Navigation
      // bottomNavigationBar: CustomBottomNav(
      //   currentIndex: 0,
      //   onTap: (index) {},
      // ),
    );
  }
}
