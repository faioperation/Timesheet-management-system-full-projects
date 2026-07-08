class ActivityEntryModel {
  final int id;
  final String entryDate;
  final String dailyHours;
  final String extraHours;
  final String vacationHours;
  final int totalHours;
  final int allHours;
  final String? note;
  final bool isWeekend;
  final ActivityTimesheet timesheet;

  ActivityEntryModel({
    required this.id,
    required this.entryDate,
    required this.dailyHours,
    required this.extraHours,
    required this.vacationHours,
    required this.totalHours,
    required this.allHours,
    this.note,
    required this.isWeekend,
    required this.timesheet,
  });

  factory ActivityEntryModel.fromJson(Map<String, dynamic> json) {
    return ActivityEntryModel(
      id: json['id'] ?? 0,
      entryDate: json['entry_date'] ?? '',
      dailyHours: json['daily_hours'] ?? '0.00',
      extraHours: json['extra_hours'] ?? '0.00',
      vacationHours: json['vacation_hours'] ?? '0.00',
      totalHours: json['total_hours'] ?? 0,
      allHours: json['all_hours'] ?? 0,
      note: json['note'],
      isWeekend: json['is_weekend'] ?? false,
      timesheet: ActivityTimesheet.fromJson(json['timesheet'] ?? {}),
    );
  }

  double get dailyHoursDouble => double.tryParse(dailyHours) ?? 0.0;
  double get extraHoursDouble => double.tryParse(extraHours) ?? 0.0;
  double get vacationHoursDouble => double.tryParse(vacationHours) ?? 0.0;
}

class ActivityTimesheet {
  final int id;
  final String status;
  final String startDate;
  final String endDate;
  final ActivityClient client;
  final ActivityUser user;

  ActivityTimesheet({
    required this.id,
    required this.status,
    required this.startDate,
    required this.endDate,
    required this.client,
    required this.user,
  });

  factory ActivityTimesheet.fromJson(Map<String, dynamic> json) {
    return ActivityTimesheet(
      id: json['id'] ?? 0,
      status: json['status'] ?? '',
      startDate: json['start_date'] ?? '',
      endDate: json['end_date'] ?? '',
      client: ActivityClient.fromJson(json['client'] ?? {}),
      user: ActivityUser.fromJson(json['user'] ?? {}),
    );
  }
}

class ActivityClient {
  final int id;
  final String name;

  ActivityClient({
    required this.id,
    required this.name,
  });

  factory ActivityClient.fromJson(Map<String, dynamic> json) {
    return ActivityClient(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
    );
  }
}

class ActivityUser {
  final int id;
  final String name;
  final String email;

  ActivityUser({
    required this.id,
    required this.name,
    required this.email,
  });

  factory ActivityUser.fromJson(Map<String, dynamic> json) {
    return ActivityUser(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
    );
  }
}

class ActivityEntryResponse {
  final bool success;
  final List<ActivityEntryModel> data;
  final ActivitySummary summary;

  ActivityEntryResponse({
    required this.success,
    required this.data,
    required this.summary,
  });

  factory ActivityEntryResponse.fromJson(Map<String, dynamic> json) {
    return ActivityEntryResponse(
      success: json['success'] ?? false,
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => ActivityEntryModel.fromJson(e))
              .toList() ??
          [],
      summary: ActivitySummary.fromJson(json['summary'] ?? {}),
    );
  }
}

class ActivitySummary {
  final double totalDailyHours;
  final double totalExtraHours;
  final double totalVacationHours;
  final double totalHours;
  final int totalEntries;

  ActivitySummary({
    required this.totalDailyHours,
    required this.totalExtraHours,
    required this.totalVacationHours,
    required this.totalHours,
    required this.totalEntries,
  });

  factory ActivitySummary.fromJson(Map<String, dynamic> json) {
    return ActivitySummary(
      totalDailyHours: (json['total_daily_hours'] as num?)?.toDouble() ?? 0.0,
      totalExtraHours: (json['total_extra_hours'] as num?)?.toDouble() ?? 0.0,
      totalVacationHours: (json['total_vacation_hours'] as num?)?.toDouble() ?? 0.0,
      totalHours: (json['total_hours'] as num?)?.toDouble() ?? 0.0,
      totalEntries: json['total_entries'] ?? 0,
    );
  }
}
