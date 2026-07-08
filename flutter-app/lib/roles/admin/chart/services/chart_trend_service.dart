import 'dart:convert';
import 'package:timesheet_naresh/common/services/auth_interceptor.dart';
import '../../../../app/utils/urls.dart';
import '../models/chart_trend_model.dart';

class ChartTrendService {
  static Future<ChartTrendResponse> getChartTrend() async {
    try {
      final uri = Uri.parse(Urls.chartTrendUrl);
      final response = await AuthInterceptor.get(uri, context: null);

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body);
        return ChartTrendResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load chart trend: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching chart trend: $e');
    }
  }
}
