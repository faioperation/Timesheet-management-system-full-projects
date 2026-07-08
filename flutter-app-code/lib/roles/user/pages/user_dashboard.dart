import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timesheet_naresh/app/constants.dart';
import 'package:timesheet_naresh/notification/pages/initial_notification_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/add_timesheet_page.dart';
import 'package:timesheet_naresh/roles/admin/pages/preview_page.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_profile_service.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/models/timesheet_model.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/services/timesheet_service.dart';
import '../../../common/widgets/date_header_and_time.dart';
import '../../../common/widgets/header_section.dart';

class UserDashboard extends StatefulWidget {
  const UserDashboard({super.key});

  @override
  State<UserDashboard> createState() => _UserDashboardState();
}

class _UserDashboardState extends State<UserDashboard> with WidgetsBindingObserver {
  String dropdownValue = "Weekly";
  String? userName;
  String? profileImageUrl;
  List<TimesheetModel> timesheets = [];
  bool isLoadingTimesheets = false;
  int? currentUserId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeData();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _initializeData();
    }
  }

  // Optimized: Load all data in parallel
  Future<void> _initializeData() async {
    // Load username from SharedPreferences (fast, no API call)
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      userName = prefs.getString("username") ?? "User";
    });

    // Load profile and timesheets in parallel
    final token = await TokenService.getToken();
    if (token != null) {
      // Load profile once and use it for both image and user ID
      final profileData = await ProfileService.getProfile(token);
      if (mounted && profileData != null) {
        setState(() {
          profileImageUrl = profileData.image;
          currentUserId = profileData.id;
        });
        
        // Load timesheets immediately after getting user ID
        if (currentUserId != null) {
          _loadTimesheetsOnly();
        }
      }
    }
  }

  Future<void> _loadTimesheetsOnly() async {
    if (currentUserId == null) return;

    setState(() => isLoadingTimesheets = true);

    try {
      final response = await TimesheetService.getUserTimesheets(currentUserId!);
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
      }
    }
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (e) {
      return dateStr;
    }
  }

  Icon _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return const Icon(Icons.check_circle, color: Colors.green, size: 20);
      case 'pending':
      case 'submitted':
        return const Icon(Icons.hourglass_bottom, color: Colors.amber, size: 20);
      case 'rejected':
        return const Icon(Icons.cancel, color: Colors.red, size: 20);
      default:
        return const Icon(Icons.help_outline, color: Colors.grey, size: 20);
    }
  }

  // Prepare graph data from timesheet entries
  Map<String, Map<String, double>> _prepareGraphData() {
    final Map<String, Map<String, double>> dateData = {};

    // Process all timesheets and their entries
    for (var timesheet in timesheets) {
      for (var entry in timesheet.entries) {
        // Format date as YYYY-MM-DD for grouping
        final dateKey = DateFormat('yyyy-MM-dd').format(entry.entryDate);

        if (!dateData.containsKey(dateKey)) {
          dateData[dateKey] = {
            'daily': 0.0,
            'extra': 0.0,
            'vacation': 0.0,
          };
        }
        dateData[dateKey]!['daily'] = dateData[dateKey]!['daily']! + entry.dailyHoursDouble;
        dateData[dateKey]!['extra'] = dateData[dateKey]!['extra']! + entry.extraHoursDouble;
        dateData[dateKey]!['vacation'] = dateData[dateKey]!['vacation']! + entry.vacationHoursDouble;
      }
    }

    return dateData;
  }

  // Get sorted dates for graph
  List<String> _getSortedDates() {
    final dateData = _prepareGraphData();
    final dates = dateData.keys.toList();
    dates.sort();
    return dates;
  }

  // Get max hours for Y-axis
  double _getMaxHours() {
    final dateData = _prepareGraphData();
    double max = 0;
    for (var data in dateData.values) {
      final total = data['daily']! + data['extra']! + data['vacation']!;
      if (total > max) max = total;
    }
    return max > 0 ? (max * 1.2).ceilToDouble() : 12; // Add 20% padding
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

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
                onPressed: () {
                  // User role doesn't have 3-dot menu - do nothing
                },
                onMenuPressed: () {},
                onNotificationPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const InitialNotificationScreen()),
                  );
                },
              ),
              SizedBox(height: screenHeight * 0.025),

              /// 📅 Date + Add Timesheet
              DateHeaderAndTime(
                buttonText: "Add timesheet",
                onPressed: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const AddTimesheetPage()),
                  );
                  // Refresh timesheet list if timesheet was created successfully
                  if (result == true) {
                    _initializeData();
                  }
                },
              ),
              SizedBox(height: screenHeight * 0.02),

              /// 📊 Hours Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Hours",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  // DropdownButton<String>(
                  //   value: dropdownValue,
                  //   items: const [
                  //     DropdownMenuItem(value: "Weekly", child: Text("Weekly")),
                  //     DropdownMenuItem(value: "Monthly", child: Text("Monthly")),
                  //   ],
                  //   onChanged: (value) => setState(() => dropdownValue = value!),
                  // ),
                ],
              ),
              SizedBox(height: screenHeight * 0.01),

              /// 📈 Chart Container
              isLoadingTimesheets
                  ? Container(
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
                      child: const Center(child: CircularProgressIndicator()),
                    )
                  : Builder(
                      builder: (context) {
                        final dateData = _prepareGraphData();
                        final sortedDates = _getSortedDates();
                        final maxHours = _getMaxHours();

                        return Container(
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
                          child: sortedDates.isEmpty
                              ? const Center(
                                  child: Text(
                                    "No data available",
                                    style: TextStyle(color: Colors.grey),
                                  ),
                                )
                              : SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: SizedBox(
                                    width: sortedDates.length * 50.0,
                                    child: BarChart(
                                      BarChartData(
                                        alignment: BarChartAlignment.spaceAround,
                                        maxY: maxHours,
                                        gridData: FlGridData(show: false),
                                        borderData: FlBorderData(show: false),
                                        titlesData: FlTitlesData(
                                          leftTitles: AxisTitles(
                                            sideTitles: SideTitles(
                                              showTitles: true,
                                              reservedSize: 30,
                                              getTitlesWidget: (value, meta) => Text(
                                                value.toInt().toString(),
                                                style: const TextStyle(fontSize: 10),
                                              ),
                                            ),
                                          ),
                                          bottomTitles: AxisTitles(
                                            sideTitles: SideTitles(
                                              showTitles: true,
                                              getTitlesWidget: (value, _) {
                                                if (value.toInt() >= 0 && value.toInt() < sortedDates.length) {
                                                  final date = DateTime.parse(sortedDates[value.toInt()]);
                                                  return Padding(
                                                    padding: const EdgeInsets.only(top: 8),
                                                    child: Text(
                                                      DateFormat('dd/MM').format(date),
                                                      style: const TextStyle(fontSize: 10),
                                                    ),
                                                  );
                                                }
                                                return const Text('');
                                              },
                                            ),
                                          ),
                                          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                        ),
                                        barGroups: sortedDates.asMap().entries.map((entry) {
                                          final index = entry.key;
                                          final dateKey = entry.value;
                                          final data = dateData[dateKey]!;
                                          final daily = data['daily']!;
                                          final extra = data['extra']!;
                                          final vacation = data['vacation']!;
                                          final total = daily + extra;

                                          return BarChartGroupData(
                                            x: index,
                                            barRods: [
                                              // Stacked Daily + Extra
                                              if (total > 0)
                                                BarChartRodData(
                                                  toY: total,
                                                  rodStackItems: [
                                                    BarChartRodStackItem(
                                                      0,
                                                      daily,
                                                      AppColors.themeColor,
                                                    ),
                                                    if (extra > 0)
                                                      BarChartRodStackItem(
                                                        daily,
                                                        total,
                                                        Colors.redAccent,
                                                      ),
                                                  ],
                                                  width: 16,
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                              // Vacation (separate bar)
                                              if (vacation > 0)
                                                BarChartRodData(
                                                  toY: vacation,
                                                  color: Colors.green,
                                                  width: 16,
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                            ],
                                          );
                                        }).toList(),
                                      ),
                                    ),
                                  ),
                                ),
                        );
                      },
                    ),

              /// 🟣 Legend
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  _Legend(color: Color(0xFF4E5FFF), label: "Daily hour"),
                  SizedBox(width: 16),
                  _Legend(color: Colors.redAccent, label: "Extra hour"),
                  SizedBox(width: 16),
                  _Legend(color: Colors.green, label: "Vacation"),
                ],
              ),
              SizedBox(height: screenHeight * 0.03),

              /// 🕒 Recent Timesheet Header
              const Text(
                "Recent timesheet",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              SizedBox(height: screenHeight * 0.01),

              /// 🧾 Responsive Table
              Container(
                width: double.infinity,
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
                child: isLoadingTimesheets
                    ? const Padding(
                        padding: EdgeInsets.all(20.0),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : timesheets.isEmpty
                        ? const Padding(
                            padding: EdgeInsets.all(20.0),
                            child: Center(
                              child: Text(
                                "No timesheets found",
                                style: TextStyle(fontSize: 16, color: Colors.grey),
                              ),
                            ),
                          )
                        : SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: DataTable(
                              columnSpacing: 24,
                              headingRowColor:
                              WidgetStateProperty.all(const Color(0xFFF7F8FC)),
                              columns: const [
                                DataColumn(label: Text("User", style: TextStyle(fontWeight: FontWeight.w600))),
                                DataColumn(label: Text("Start date", style: TextStyle(fontWeight: FontWeight.w600))),
                                DataColumn(label: Text("End date", style: TextStyle(fontWeight: FontWeight.w600))),
                                DataColumn(label: Text("Status", style: TextStyle(fontWeight: FontWeight.w600))),
                              ],
                              rows: timesheets
                                  .map(
                                    (timesheet) => DataRow(
                                      cells: [
                                        DataCell(
                                          InkWell(
                                            onTap: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) => TimesheetPreviewPage(
                                                    timesheet: timesheet,
                                                  ),
                                                ),
                                              );
                                            },
                                            child: Text(
                                              timesheet.user.name,
                                              style: const TextStyle(fontWeight: FontWeight.w500),
                                            ),
                                          ),
                                        ),
                                        DataCell(
                                          InkWell(
                                            onTap: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) => TimesheetPreviewPage(
                                                    timesheet: timesheet,
                                                  ),
                                                ),
                                              );
                                            },
                                            child: Text(_formatDate(timesheet.startDate)),
                                          ),
                                        ),
                                        DataCell(
                                          InkWell(
                                            onTap: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) => TimesheetPreviewPage(
                                                    timesheet: timesheet,
                                                  ),
                                                ),
                                              );
                                            },
                                            child: Text(_formatDate(timesheet.endDate)),
                                          ),
                                        ),
                                        DataCell(
                                          InkWell(
                                            onTap: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) => TimesheetPreviewPage(
                                                    timesheet: timesheet,
                                                  ),
                                                ),
                                              );
                                            },
                                            child: _getStatusIcon(timesheet.status),
                                          ),
                                        ),
                                      ],
                                    ),
                                  )
                                  .toList(),
                            ),
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// 🔘 Legend Widget
class _Legend extends StatelessWidget {
  final Color color;
  final String label;

  const _Legend({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
