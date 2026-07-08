class StaffDashboardResponse {
  final bool success;
  final StaffDashboardData data;

  StaffDashboardResponse({
    required this.success,
    required this.data,
  });

  factory StaffDashboardResponse.fromJson(Map<String, dynamic> json) {
    return StaffDashboardResponse(
      success: json['success'] == true,
      data: StaffDashboardData.fromJson(json['data'] as Map<String, dynamic>),
    );
  }
}

class StaffDashboardData {
  final StaffDashboardStats stats;
  final List<StaffDashboardTimesheetSummary> timesheets;

  StaffDashboardData({
    required this.stats,
    required this.timesheets,
  });

  factory StaffDashboardData.fromJson(Map<String, dynamic> json) {
    return StaffDashboardData(
      stats: StaffDashboardStats.fromJson(json['stats'] as Map<String, dynamic>),
      timesheets: ((json['timesheets'] as List<dynamic>?) ?? [])
          .map((e) => StaffDashboardTimesheetSummary.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class StaffDashboardStats {
  final int totalManagedTimesheets;
  final double totalHours;
  final double totalGrossMargin;
  final double totalNetMargin;
  final double totalExpanse;

  StaffDashboardStats({
    required this.totalManagedTimesheets,
    required this.totalHours,
    required this.totalGrossMargin,
    required this.totalNetMargin,
    required this.totalExpanse,
  });

  static double _toDouble(dynamic v) => double.tryParse(v?.toString() ?? '') ?? 0.0;

  factory StaffDashboardStats.fromJson(Map<String, dynamic> json) {
    return StaffDashboardStats(
      totalManagedTimesheets: (json['total_managed_timesheets'] as num?)?.toInt() ?? 0,
      totalHours: _toDouble(json['total_hours']),
      totalGrossMargin: _toDouble(json['total_gross_margin']),
      totalNetMargin: _toDouble(json['total_net_margin']),
      totalExpanse: _toDouble(json['total_expanse']),
    );
  }
}

class StaffDashboardTimesheetSummary {
  final int id;
  final String consultantName;
  final String? clientName;
  final String startDate;
  final String endDate;
  final double totalHours;
  final String status;

  StaffDashboardTimesheetSummary({
    required this.id,
    required this.consultantName,
    required this.clientName,
    required this.startDate,
    required this.endDate,
    required this.totalHours,
    required this.status,
  });

  factory StaffDashboardTimesheetSummary.fromJson(Map<String, dynamic> json) {
    final totalHours = double.tryParse(json['total_hours']?.toString() ?? '') ?? 0.0;
    return StaffDashboardTimesheetSummary(
      id: (json['id'] as num).toInt(),
      consultantName: (json['consultant_name'] as String?) ?? '',
      clientName: json['client_name'] as String?,
      startDate: (json['start_date'] as String?) ?? '',
      endDate: (json['end_date'] as String?) ?? '',
      totalHours: totalHours,
      status: (json['status'] as String?) ?? '',
    );
  }
}

