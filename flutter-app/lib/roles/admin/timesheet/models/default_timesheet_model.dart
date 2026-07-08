class DefaultTimesheetModel {
  final int id;
  final int businessId;
  final int userId;
  final int userDetailsId;
  final String startDate;
  final String endDate;
  final String timeSheetPeriod;
  final String totalHours;
  final int isBusinessDefault;
  final String createdAt;
  final String updatedAt;
  final List<DefaultTimesheetEntry> entries;
  final Map<String, dynamic>? userDetail;

  DefaultTimesheetModel({
    required this.id,
    required this.businessId,
    required this.userId,
    required this.userDetailsId,
    required this.startDate,
    required this.endDate,
    required this.timeSheetPeriod,
    required this.totalHours,
    required this.isBusinessDefault,
    required this.createdAt,
    required this.updatedAt,
    required this.entries,
    this.userDetail,
  });

  factory DefaultTimesheetModel.fromJson(Map<String, dynamic> json) {
    return DefaultTimesheetModel(
      id: json['id'] as int,
      businessId: json['business_id'] as int,
      userId: json['user_id'] as int,
      userDetailsId: json['user_details_id'] as int,
      startDate: json['start_date'] as String,
      endDate: json['end_date'] as String,
      timeSheetPeriod: json['time_sheet_period'] as String,
      totalHours: json['total_hours'] as String,
      isBusinessDefault: json['is_business_default'] as int,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      entries: (json['entries'] as List)
          .map((e) => DefaultTimesheetEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
      userDetail: json['user_detail'] as Map<String, dynamic>?,
    );
  }

  String get displayName => 'Default ($startDate to $endDate)';
}

class DefaultTimesheetEntry {
  final int id;
  final int timesheetDefaultId;
  final int dayOfWeek; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  final String defaultDailyHours;
  final String defaultExtraHours;
  final String defaultVacationHours;
  final String createdAt;
  final String updatedAt;

  DefaultTimesheetEntry({
    required this.id,
    required this.timesheetDefaultId,
    required this.dayOfWeek,
    required this.defaultDailyHours,
    required this.defaultExtraHours,
    required this.defaultVacationHours,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DefaultTimesheetEntry.fromJson(Map<String, dynamic> json) {
    return DefaultTimesheetEntry(
      id: json['id'] as int,
      timesheetDefaultId: json['timesheet_default_id'] as int,
      dayOfWeek: json['day_of_week'] as int,
      defaultDailyHours: json['default_daily_hours'] as String,
      defaultExtraHours: json['default_extra_hours'] as String,
      defaultVacationHours: json['default_vacation_hours'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }
}

class DefaultTimesheetResponse {
  final bool success;
  final List<DefaultTimesheetModel> data;

  DefaultTimesheetResponse({
    required this.success,
    required this.data,
  });

  factory DefaultTimesheetResponse.fromJson(Map<String, dynamic> json) {
    return DefaultTimesheetResponse(
      success: json['success'] as bool,
      data: (json['data'] as List)
          .map((e) => DefaultTimesheetModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
