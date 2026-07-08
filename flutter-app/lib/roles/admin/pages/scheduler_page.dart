import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../app/constants.dart';
import '../../../common/widgets/date_time_chip.dart';
import '../activity/models/activity_entry_model.dart';
import '../activity/services/activity_entry_service.dart';

class SchedulerPage extends StatefulWidget {
  @override
  _SchedulerPageState createState() => _SchedulerPageState();
}

class _SchedulerPageState extends State<SchedulerPage> {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  final CalendarFormat _calendarFormat = CalendarFormat.month;

  List<Map<String, String>> _upcomingDates = [];
  List<ActivityEntryModel> _activityEntries = [];
  ActivityEntryModel? _selectedEntry;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _upcomingDates = _generateUpcomingDates(_selectedDay);
    _loadActivityEntries();
  }

  Future<void> _loadActivityEntries() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Format month as YYYY-MM (e.g., "2026-01")
      final month = DateFormat('yyyy-MM').format(_focusedDay);
      final response = await ActivityEntryService.getActivityEntries(month);
      setState(() {
        _activityEntries = response.data;
        _updateSelectedEntry();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading activity entries: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _updateSelectedEntry() {
    final selectedDateStr = DateFormat('yyyy-MM-dd').format(_selectedDay);
    try {
      _selectedEntry = _activityEntries.firstWhere(
        (entry) => entry.entryDate == selectedDateStr,
      );
    } catch (e) {
      // No entry found for this date
      _selectedEntry = null;
    }
  }

  List<Map<String, String>> _generateUpcomingDates(DateTime startDay) {
    List<Map<String, String>> dates = [];

    DateTime startDate = startDay.subtract(const Duration(days: 3));

    for (int i = 0; i < 7; i++) {
      DateTime date = startDate.add(Duration(days: i));
      dates.add({
        'date': DateFormat('dd').format(date),
        'day': DateFormat('E').format(date),
        'selected': isSameDay(date, startDay) ? 'true' : 'false',
      });
    }
    return dates;
  }

  void _onLeftArrowTap() {
    setState(() {
      _focusedDay = DateTime(_focusedDay.year, _focusedDay.month - 1, _focusedDay.day);
      _loadActivityEntries(); // Reload data for new month
    });
  }

  void _onRightArrowTap() {
    setState(() {
      _focusedDay = DateTime(_focusedDay.year, _focusedDay.month + 1, _focusedDay.day);
      _loadActivityEntries(); // Reload data for new month
    });
  }

  @override
  Widget build(BuildContext context) {
    String selectedMonthDay = DateFormat('dd MMM, yyyy').format(_selectedDay);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        elevation: 0,
        toolbarHeight: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            // Header Section
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const <Widget>[
                      Text(
                        'Scheduler',
                        style: TextStyle(
                            fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Plan, organize, and manage tasks\nwith clarity and ease.',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                  const Icon(Icons.notifications_none,
                      color: Colors.grey, size: 28),
                ],
              ),
            ),

            Container(
              height: 70,
              child: _upcomingDates.isNotEmpty
                  ? ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _upcomingDates.length,
                itemBuilder: (context, index) {
                  final dateData = _upcomingDates[index];
                  return DateChip(
                    date: dateData['date']!,
                    day: dateData['day']!,
                    isSelected: dateData['selected'] == 'true',
                  );
                },
              )
                  : const Center(child: Text("Loading Dates...")),
            ),
            const SizedBox(height: 20),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.themeColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    // Header Row
                    Row(
                      children: <Widget>[
                        Expanded(
                          flex: 2,
                          child: Text(
                            selectedMonthDay,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            'Daily',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              fontSize: 12,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            'Extra',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              fontSize: 12,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            'Vacation',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              fontSize: 12,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Values Row
                    Row(
                      children: <Widget>[
                        Expanded(
                          flex: 2,
                          // Removed "Set default" option (keeps column width for alignment)
                          child: const SizedBox.shrink(),
                        ),
                        Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _selectedEntry != null
                                  ? _formatHours(_selectedEntry!.dailyHoursDouble)
                                  : '00:00',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _selectedEntry != null
                                  ? _formatHours(_selectedEntry!.extraHoursDouble)
                                  : '00:00',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _selectedEntry != null
                                  ? _formatHours(_selectedEntry!.vacationHoursDouble)
                                  : '00:00',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),

            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16.0),
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 2,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      GestureDetector(
                        onTap: _onLeftArrowTap,
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8.0),
                          child: Icon(Icons.arrow_left, size: 28, color: Colors.black),
                        ),
                      ),
                      Expanded(
                        child: Center(
                          child: Text(
                            DateFormat('MMMM, yyyy').format(_focusedDay),
                            style: const TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: _onRightArrowTap,
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8.0),
                          child: Icon(Icons.arrow_right, size: 28, color: Colors.black),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),

                  TableCalendar(
                    key: ValueKey('${_focusedDay.year}-${_focusedDay.month}-${_selectedDay.day}'),
                    focusedDay: _focusedDay,
                    firstDay: DateTime.utc(2020, 1, 1),
                    lastDay: DateTime.utc(2030, 12, 31),
                    calendarFormat: _calendarFormat,
                    startingDayOfWeek: StartingDayOfWeek.sunday,
                    headerVisible: false,
                    daysOfWeekHeight: 35,
                    rowHeight: 40,

                    onPageChanged: (focusedDay) {
                      setState(() {
                        _focusedDay = focusedDay;
                        _loadActivityEntries(); // Reload data when month changes via calendar swipe
                      });
                    },

                    selectedDayPredicate: (day) {
                      return isSameDay(_selectedDay, day);
                    },
                    onDaySelected: (selectedDay, focusedDay) {
                      // Only update if the selected day actually changed to prevent unnecessary rebuilds
                      if (!isSameDay(_selectedDay, selectedDay)) {
                        // Use post frame callback to avoid red error screen during state update
                        Future.microtask(() {
                          if (mounted) {
                            setState(() {
                              _selectedDay = selectedDay;
                              _focusedDay = focusedDay;
                              _upcomingDates = _generateUpcomingDates(selectedDay);
                              _updateSelectedEntry();
                            });
                          }
                        });
                      }
                    },

                    daysOfWeekStyle: DaysOfWeekStyle(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      weekendStyle: TextStyle(
                          color: Colors.red.shade700, fontWeight: FontWeight.bold),
                      weekdayStyle: const TextStyle(fontWeight: FontWeight.bold),
                      dowTextFormatter: (date, locale) {
                        return DateFormat.E(locale).format(date)[0];
                      },
                    ),

                    calendarStyle: CalendarStyle(
                      isTodayHighlighted: true,
                      selectedDecoration: BoxDecoration(
                        color: Colors.blue.shade700,
                        borderRadius: BorderRadius.circular(50),
                      ),
                      selectedTextStyle: const TextStyle(
                          color: Colors.white, fontWeight: FontWeight.bold),

                      defaultDecoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),

                      weekendDecoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      weekendTextStyle: TextStyle(
                          color: Colors.red.shade700,
                          fontWeight: FontWeight.normal),

                      outsideTextStyle: TextStyle(color: Colors.grey.shade400),
                      outsideDecoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),

                      todayDecoration: BoxDecoration(
                        color: Colors.blue.shade100.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(50),
                      ),
                      todayTextStyle: TextStyle(color: Colors.blue.shade700, fontWeight: FontWeight.bold),

                      cellMargin: const EdgeInsets.all(2.0),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Note Display Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      spreadRadius: 2,
                      blurRadius: 5,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.note_outlined,
                          color: AppColors.themeColor,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Note',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.themeColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.grey.shade200,
                          width: 1,
                        ),
                      ),
                      child: _selectedEntry != null &&
                              _selectedEntry!.note != null &&
                              _selectedEntry!.note!.isNotEmpty
                          ? Text(
                              _selectedEntry!.note!,
                              style: const TextStyle(
                                fontSize: 14,
                                color: Colors.black87,
                                height: 1.5,
                              ),
                            )
                          : Text(
                              'No note available',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade600,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  String _formatHours(double hours) {
    final hoursInt = hours.toInt();
    final minutes = ((hours - hoursInt) * 60).toInt();
    return '${hoursInt.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}';
  }
}