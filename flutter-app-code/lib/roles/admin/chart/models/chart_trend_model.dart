class ChartTrendModel {
  final String period;
  final int timesheetCount;
  final int totalHours;
  final double grossMargin;
  final double netMargin;
  final double expense;
  final double internalExpense;

  ChartTrendModel({
    required this.period,
    required this.timesheetCount,
    required this.totalHours,
    required this.grossMargin,
    required this.netMargin,
    required this.expense,
    required this.internalExpense,
  });

  factory ChartTrendModel.fromJson(Map<String, dynamic> json) {
    return ChartTrendModel(
      period: json['period'] ?? '',
      timesheetCount: json['timesheet_count'] ?? 0,
      totalHours: json['total_hours'] ?? 0,
      grossMargin: (json['gross_margin'] as num?)?.toDouble() ?? 0.0,
      netMargin: (json['net_margin'] as num?)?.toDouble() ?? 0.0,
      expense: (json['expense'] as num?)?.toDouble() ?? 0.0,
      internalExpense: (json['internal_expense'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class ChartTrendSummary {
  final int totalHours;
  final double totalGrossMargin;
  final double totalNetMargin;
  final double totalExpense;
  final double totalInternalExpense;
  final int totalTimesheets;

  ChartTrendSummary({
    required this.totalHours,
    required this.totalGrossMargin,
    required this.totalNetMargin,
    required this.totalExpense,
    required this.totalInternalExpense,
    required this.totalTimesheets,
  });

  factory ChartTrendSummary.fromJson(Map<String, dynamic> json) {
    return ChartTrendSummary(
      totalHours: json['total_hours'] ?? 0,
      totalGrossMargin: (json['total_gross_margin'] as num?)?.toDouble() ?? 0.0,
      totalNetMargin: (json['total_net_margin'] as num?)?.toDouble() ?? 0.0,
      totalExpense: (json['total_expense'] as num?)?.toDouble() ?? 0.0,
      totalInternalExpense: (json['total_internal_expense'] as num?)?.toDouble() ?? 0.0,
      totalTimesheets: json['total_timesheets'] ?? 0,
    );
  }
}

class ChartTrendResponse {
  final bool success;
  final List<ChartTrendModel> data;
  final ChartTrendSummary summary;

  ChartTrendResponse({
    required this.success,
    required this.data,
    required this.summary,
  });

  factory ChartTrendResponse.fromJson(Map<String, dynamic> json) {
    return ChartTrendResponse(
      success: json['success'] ?? false,
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => ChartTrendModel.fromJson(e))
              .toList() ??
          [],
      summary: ChartTrendSummary.fromJson(json['summary'] ?? {}),
    );
  }
}
