import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../chart/models/chart_trend_model.dart';

class SalesAnalyticsCard extends StatelessWidget {
  final ChartTrendSummary? summary;

  const SalesAnalyticsCard({
    super.key,
    this.summary,
  });

  // Color mapping for different categories
  static const Map<String, Color> categoryColors = {
    'Gross Margin': Colors.green,
    'Net Margin': Colors.blue,
    'Expense': Colors.redAccent,
    'Internal Expense': Colors.orange,
    'Total Hours': Colors.purpleAccent,
  };

  List<Map<String, dynamic>> get breakdown {
    if (summary == null) return [];
    
    final total = summary!.totalGrossMargin;
    if (total == 0) return [];

    return [
      {
        'label': 'Gross Margin',
        'value': summary!.totalGrossMargin,
        'color': categoryColors['Gross Margin']!,
      },
      {
        'label': 'Net Margin',
        'value': summary!.totalNetMargin,
        'color': categoryColors['Net Margin']!,
      },
      {
        'label': 'Expense',
        'value': summary!.totalExpense,
        'color': categoryColors['Expense']!,
      },
      {
        'label': 'Internal Expense',
        'value': summary!.totalInternalExpense,
        'color': categoryColors['Internal Expense']!,
      },
    ];
  }

  List<PieChartSectionData> get pieChartSections {
    if (summary == null) return [];
    
    final total = summary!.totalGrossMargin + 
                  summary!.totalNetMargin + 
                  summary!.totalExpense + 
                  summary!.totalInternalExpense;
    
    if (total == 0) return [];

    return [
      if (summary!.totalGrossMargin > 0)
        PieChartSectionData(
          color: categoryColors['Gross Margin']!,
          value: summary!.totalGrossMargin,
          showTitle: false,
          radius: 50,
        ),
      if (summary!.totalNetMargin > 0)
        PieChartSectionData(
          color: categoryColors['Net Margin']!,
          value: summary!.totalNetMargin,
          showTitle: false,
          radius: 50,
        ),
      if (summary!.totalExpense > 0)
        PieChartSectionData(
          color: categoryColors['Expense']!,
          value: summary!.totalExpense,
          showTitle: false,
          radius: 50,
        ),
      if (summary!.totalInternalExpense > 0)
        PieChartSectionData(
          color: categoryColors['Internal Expense']!,
          value: summary!.totalInternalExpense,
          showTitle: false,
          radius: 50,
        ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Container(
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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left Side (Text)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 💰 Total Expense
                Row(
                  children: [
                    const Icon(Icons.wallet, color: Colors.redAccent, size: 20),
                    const SizedBox(width: 6),
                    const Text(
                      "Total expense",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Colors.black54,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      summary != null 
                          ? "\$${summary!.totalExpense.toStringAsFixed(2)}"
                          : "\$0.00",
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // 📊 Breakdown List
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: breakdown.map((item) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: item['color'] as Color,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                item['label'],
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Colors.black54,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            "\$${(item['value'] as double).toStringAsFixed(2)}",
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          const SizedBox(width: 40),

          // Right Side (Pie Chart)
          SizedBox(
            width: 120,
            height: 210,
            child: summary != null && pieChartSections.isNotEmpty
                ? PieChart(
                    PieChartData(
                      sectionsSpace: 2,
                      centerSpaceRadius: 35,
                      sections: pieChartSections,
                    ),
                  )
                : const Center(
                    child: Text(
                      'No data',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
