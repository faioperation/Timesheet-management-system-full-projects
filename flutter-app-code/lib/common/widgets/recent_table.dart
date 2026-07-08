import 'package:flutter/material.dart';

class RecentTable extends StatelessWidget {
  final String title;
  final String dropdownValue;
  final List<String> dropdownItems;
  final List<Map<String, dynamic>> data;
  final ValueChanged<String?> onDropdownChanged;
  final bool showDropdown;

  const RecentTable({
    super.key,
    required this.title,
    required this.dropdownValue,
    required this.dropdownItems,
    required this.data,
    required this.onDropdownChanged,
    this.showDropdown = true,
  });

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return Colors.green;
      case 'pending':
      case 'submitted':
        return Colors.amber.shade700;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _formatStatus(String status) {
    if (status.isEmpty) return '-';
    return status[0].toUpperCase() + status.substring(1);
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    final sampleData = [
      {"day": "Mon 10/15", "regular": 8, "overtime": 2, "vacation": 0, "holiday": 0, "total": 10},
      {"day": "Tue 10/16", "regular": 8, "overtime": 1, "vacation": 0, "holiday": 0, "total": 9},
      {"day": "Wed 10/17", "regular": 8, "overtime": 0, "vacation": 0, "holiday": 0, "total": 8},
      {"day": "Thu 10/18", "regular": 8, "overtime": 0, "vacation": 0, "holiday": 0, "total": 8},
      {"day": "Fri 10/19", "regular": 8, "overtime": 0, "vacation": 0, "holiday": 0, "total": 8},
      {"day": "Sat 10/20", "regular": 8, "overtime": 0, "vacation": 0, "holiday": 0, "total": 8},
      {"day": "Sun 10/21", "regular": 8, "overtime": 0, "vacation": 0, "holiday": 0, "total": 8},
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /// 🔹 Header Row (Title + Dropdown)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: screenWidth * 0.045,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (showDropdown)
                DropdownButton<String>(
                  value: dropdownValue,
                  items: dropdownItems
                      .map((item) => DropdownMenuItem(
                            value: item,
                            child: Text(item),
                          ))
                      .toList(),
                  onChanged: onDropdownChanged,
                ),
            ],
          ),

          const SizedBox(height: 12),

          /// 🔹 Table Header
          Container(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            decoration: BoxDecoration(
              color: Color.fromRGBO(242, 244, 255, 1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Text(
                    "User",
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: screenWidth * 0.035,
                    ),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Text(
                    "Status",
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: screenWidth * 0.035,
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    "Total Hour",
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: screenWidth * 0.035,
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Center(
                    child: Text(
                      "Action",
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: screenWidth * 0.035,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          /// 🔹 Table Rows (Scrollable)
          SizedBox(
            height: 240, // scrollable height
            child: ListView.separated(
              itemCount: data.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = data[index];
                return Container(
                  padding:
                  const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade300, width: 1),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.05),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: Text(
                          item['user'],
                          style: TextStyle(fontSize: screenWidth * 0.035),
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          _formatStatus(item['status'] ?? ''),
                          style: TextStyle(
                            fontSize: screenWidth * 0.035,
                            color: _getStatusColor(item['status'] ?? ''),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          "${item['totalHour']}",
                          style: TextStyle(
                            fontSize: screenWidth * 0.035,
                            color: Colors.blueAccent,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Center(
                          child: ElevatedButton(
                            onPressed: item['onView'] as VoidCallback?,
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                              const Color.fromRGBO(80, 105, 229, 1),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 8,
                              ),
                            ),
                            child: const Text(
                              "View",
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
