import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/secondary_custom_button.dart';
import 'package:timesheet_naresh/roles/admin/timesheet/models/timesheet_model.dart';

class TimesheetPreviewPage extends StatelessWidget {
  final TimesheetModel? timesheet;
  // Legacy support for old format
  final String? clientName;
  final String? startDate;
  final String? endDate;
  final List<Map<String, dynamic>>? timesheetData;

  const TimesheetPreviewPage({
    super.key,
    this.timesheet,
    this.clientName,
    this.startDate,
    this.endDate,
    this.timesheetData,
  }) : assert(timesheet != null || (clientName != null && startDate != null && endDate != null && timesheetData != null),
           'Either timesheet or legacy parameters must be provided');

  // Getter methods for backward compatibility
  String get _clientName => timesheet?.client.name ?? clientName ?? '';
  String get _startDate => timesheet != null 
      ? DateFormat('MM/dd/yyyy').format(DateTime.parse(timesheet!.startDate))
      : startDate ?? '';
  String get _endDate => timesheet != null
      ? DateFormat('MM/dd/yyyy').format(DateTime.parse(timesheet!.endDate))
      : endDate ?? '';
  
  List<Map<String, dynamic>> get _timesheetData {
    if (timesheet != null) {
      return timesheet!.entries.map((entry) {
        final date = entry.entryDate;
        final daily = entry.dailyHoursDouble;
        final extra = entry.extraHoursDouble;
        final vacation = entry.vacationHoursDouble;
        final total = daily + extra + vacation;
        
        return {
          'day': DateFormat('EEE MM/dd').format(date),
          'regular': daily,
          'extra': extra,
          'vacation': vacation,
          'total': total,
        };
      }).toList();
    }
    // Legacy format - convert if needed
    if (timesheetData != null) {
      return timesheetData!.map((row) {
        final regular = (row['regular'] as num?)?.toDouble() ?? 0.0;
        final extra = (row['overtime'] as num?)?.toDouble() ?? 0.0;
        final vacation = (row['vacation'] as num?)?.toDouble() ?? 0.0;
        final total = regular + extra + vacation;
        return {
          'day': row['day'] ?? '',
          'regular': regular,
          'extra': extra,
          'vacation': vacation,
          'total': total,
        };
      }).toList();
    }
    return [];
  }
  
  // Calculate totals from timesheet entries
  double get _totalHours {
    if (timesheet != null) {
      return timesheet!.entries.fold(0.0, (sum, entry) => 
        sum + entry.dailyHoursDouble + entry.extraHoursDouble + entry.vacationHoursDouble);
    }
    return _timesheetData.fold(0.0, (sum, row) => sum + (row['total'] as num).toDouble());
  }
  
  double get _totalExtraHours {
    if (timesheet != null) {
      return timesheet!.entries.fold(0.0, (sum, entry) => sum + entry.extraHoursDouble);
    }
    return _timesheetData.fold(0.0, (sum, row) => sum + (row['extra'] as num).toDouble());
  }
  
  double get _totalVacationHours {
    if (timesheet != null) {
      return timesheet!.entries.fold(0.0, (sum, entry) => sum + entry.vacationHoursDouble);
    }
    return _timesheetData.fold(0.0, (sum, row) => sum + (row['vacation'] as num).toDouble());
  }

  // Get client rate from user_detail or entry snapshot, fallback to default
  double get _clientRate {
    if (timesheet != null) {
      // First try user_detail.client_rate
      if (timesheet!.userDetail?.clientRate != null) {
        return timesheet!.userDetail!.clientRate!;
      }
      // Then try first entry's client_rate_snapshot
      if (timesheet!.entries.isNotEmpty && timesheet!.entries.first.clientRateSnapshot != null) {
        return double.tryParse(timesheet!.entries.first.clientRateSnapshot!) ?? 15.0;
      }
    }
    return 15.0; // Default fallback
  }

  @override
  Widget build(BuildContext context) {
    final double ratePerHour = _clientRate;
    final totals = _calculateColumnTotals(_timesheetData);
    final totalPayColumns = totals.map((t) => t * ratePerHour).toList();
    final grandTotalPay = totalPayColumns.isNotEmpty ? totalPayColumns.reduce((a, b) => a + b) : 0.0;

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Colors.grey[100],
        elevation: 0,
        title: const Text(
          "Preview",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          // Use screen width to make container adaptive
          final double tableWidth = constraints.maxWidth < 650
              ? 650
              : constraints.maxWidth - 32;

          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                _buildMessageCard(),
                const SizedBox(height: 16),

                /// ---------- Table Section ----------
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.vertical,
                      child: Container(
                        width: tableWidth,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey.shade300),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 5,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Center(
                              child: Text(
                                "Weekly Employee Timesheet",
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green,
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),

                            _buildCompanyAndEmployeeInfo(),
                            const SizedBox(height: 16),

                            _buildTableHeader(),
                            ..._timesheetData.map((row) => _buildTableRow(row)),

                            _buildFooterRow(
                              label: "Total Hours",
                              values: totals,
                              bgColor: Colors.blue.shade50,
                            ),
                            _buildFooterRow(
                              label: "Rate / Hour",
                              values: List.filled(totals.length, ratePerHour),
                              bgColor: Colors.orange.shade50,
                            ),
                            _buildFooterRow(
                              label: "Total Pay",
                              values: totalPayColumns,
                              bgColor: Colors.green.shade50,
                              bold: true,
                            ),

                            const SizedBox(height: 16),
                            
                            // Summary Section
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey.shade300),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    "Summary",
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: _buildSummaryCard(
                                          "Total Hours",
                                          _totalHours.toStringAsFixed(2),
                                          Colors.blue,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: _buildSummaryCard(
                                          "Extra Hours",
                                          _totalExtraHours.toStringAsFixed(2),
                                          Colors.orange,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: _buildSummaryCard(
                                          "Vacation Hours",
                                          _totalVacationHours.toStringAsFixed(2),
                                          Colors.green,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: Container(
                                      width: 280,
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: Colors.grey.shade100,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: Colors.grey.shade300,
                                        ),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            "Client Rate/Hour: \$${_clientRate.toStringAsFixed(2)}",
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            "Total Hours Reported: ${_totalHours.toStringAsFixed(2)}",
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            "Grand Total Pay: \$${grandTotalPay.toStringAsFixed(2)}",
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 15,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                /// ---------- Action Buttons ----------
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Expanded(
                      child: SecondaryCustomButton(
                        icon: Icons.download_rounded,
                        title: "Download",
                        onPressed: _downloadPdf,
                      ),
                    ),
                    SizedBox(width: 16),
                    Expanded(
                      child: CustomButton(
                        icon: Icons.print_rounded,
                        title: "Print",
                        //color: const Color(0xFF0D2080),
                        onPressed: _printPdf,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // 🧩 Top Message Card
  Widget _buildMessageCard() => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      boxShadow: [
        BoxShadow(
          color: Colors.grey.withOpacity(0.2),
          blurRadius: 5,
          offset: const Offset(0, 3),
        ),
      ],
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Hello,", style: TextStyle(fontSize: 16)),
        const SizedBox(height: 6),
        Text(
          "Timesheet is submitted for client: $_clientName",
          style: const TextStyle(fontSize: 16),
        ),
        const SizedBox(height: 6),
        Text(
          "For time period: $_startDate To $_endDate",
          style: const TextStyle(fontSize: 16),
        ),
        const SizedBox(height: 6),
        const Text(
          "Please check and approve.\n\nThank you.",
          style: TextStyle(fontSize: 16),
        ),
      ],
    ),
  );

  // 🏢 Company & Employee Info
  Widget _buildCompanyAndEmployeeInfo() {
    final user = timesheet?.user;
    final client = timesheet?.client;
    final approver = timesheet?.approver;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Client Information
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Client Information",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const SizedBox(height: 4),
              if (client != null) ...[
                Text("Name: ${client.name}"),
                if (client.address != null) Text("Address: ${client.address}"),
                if (client.phone != null) Text("Phone: ${client.phone}"),
                if (client.zipCode != null) Text("Zip Code: ${client.zipCode}"),
              ] else ...[
                const Text("Company Name"),
                const Text("Address Line 1"),
                const Text("City, State ZIP"),
                const Text("Phone: (000) 000-0000"),
              ],
            ],
          ),
        ),
        const SizedBox(width: 16),
        // User and Approver Information
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (user != null) ...[
                Text("Employee Name: ${user.name}"),
                Text("Email: ${user.email}"),
                if (user.phone != null) Text("Phone: ${user.phone}"),
              ] else ...[
                const Text("Employee Name: __________________"),
              ],
              const SizedBox(height: 4),
              if (approver != null) ...[
                Text("Approver Name: ${approver.name}"),
                Text("Approver Email: ${approver.email}"),
              ] else ...[
                const Text("Supervisor Name: ________________"),
              ],
              const SizedBox(height: 4),
              Text("Week of: $_startDate - $_endDate"),
            ],
          ),
        ),
      ],
    );
  }

  // 📊 Table Header
  Widget _buildTableHeader() => Container(
    color: Colors.green[100],
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: const [
          SizedBox(
            width: 120,
            child: Center(
              child: Text("Day", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          SizedBox(
            width: 100,
            child: Center(
              child: Text(
                "Regular",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
          SizedBox(
            width: 100,
            child: Center(
              child: Text("Extra Hours", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          SizedBox(
            width: 100,
            child: Center(
              child: Text(
                "Vacation",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
          SizedBox(
            width: 100,
            child: Center(
              child: Text(
                "Total",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    ),
  );

  // 📅 Table Rows
  Widget _buildTableRow(Map<String, dynamic> row) => Container(
    decoration: BoxDecoration(
      border: Border(bottom: BorderSide(color: Colors.grey.shade300)),
    ),
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Center(child: Text(row["day"].toString())),
          ),
          SizedBox(
            width: 100,
            child: Center(child: Text((row["regular"] as num).toStringAsFixed(2))),
          ),
          SizedBox(
            width: 100,
            child: Center(child: Text((row["extra"] as num).toStringAsFixed(2))),
          ),
          SizedBox(
            width: 100,
            child: Center(child: Text((row["vacation"] as num).toStringAsFixed(2))),
          ),
          SizedBox(
            width: 100,
            child: Center(child: Text((row["total"] as num).toStringAsFixed(2))),
          ),
        ],
      ),
    ),
  );

  // 📈 Footer Totals
  Widget _buildFooterRow({
    required String label,
    required List<double> values,
    Color? bgColor,
    bool bold = false,
  }) {
    return Container(
      color: bgColor ?? Colors.grey[100],
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Center(
              child: Text(
                label,
                style: TextStyle(
                  fontWeight: bold ? FontWeight.bold : FontWeight.w500,
                ),
              ),
            ),
          ),
          ...values.map(
            (v) => SizedBox(
              width: 100,
              child: Center(
                child: Text(
                  v.toStringAsFixed(2),
                  style: TextStyle(
                    fontWeight: bold ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  List<double> _calculateColumnTotals(List<Map<String, dynamic>> data){
    final keys = [
      "regular",
      "extra",
      "vacation",
      "total",
    ];
    return keys.map((key) {
      double sum = 0;
      for (var row in data) {
        sum += (row[key] ?? 0).toDouble();
      }
      return sum;
    }).toList();
  }

  // Helper footer row
  pw.Widget _pdfFooterRow(
    String label,
    List<double> values,
    PdfColor bgColor, {
    bool bold = false,
  }) {
    return pw.Container(
      color: bgColor,
      padding: const pw.EdgeInsets.symmetric(vertical: 6),
      child: pw.Row(
        children: [
          pw.Container(
            width: 100,
            child: pw.Text(
              label,
              style: pw.TextStyle(
                fontWeight: bold ? pw.FontWeight.bold : pw.FontWeight.normal,
              ),
            ),
          ),
          ...values.map(
            (v) => pw.Expanded(
              child: pw.Center(
                child: pw.Text(
                  v.toStringAsFixed(2),
                  style: pw.TextStyle(
                    fontWeight: bold
                        ? pw.FontWeight.bold
                        : pw.FontWeight.normal,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Generate PDF Document (used by both Download & Print)
  pw.Document _generatePdfDocument() {
    final pdf = pw.Document();
    final double ratePerHour = _clientRate;
    final totals = _calculateColumnTotals(_timesheetData);
    final totalPayColumns = totals.map((t) => t * ratePerHour).toList();

    pdf.addPage(
      pw.MultiPage(
        margin: const pw.EdgeInsets.all(24),
        build: (context) => [
          pw.Center(
            child: pw.Text(
              "WEEKLY EMPLOYEE TIMESHEET",
              style: pw.TextStyle(
                fontSize: 18,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.green800,
              ),
            ),
          ),
          pw.SizedBox(height: 16),

          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text(
                    "Company Name",
                    style: pw.TextStyle(
                      fontWeight: pw.FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  pw.Text("Address Line 1"),
                  pw.Text("City, State ZIP"),
                  pw.Text("Phone: (000) 000-0000"),
                  pw.Text("www.companyname.com"),
                  pw.Text("email@company.com"),
                ],
              ),
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text("Employee Name: __________________"),
                  pw.Text("Supervisor Name: ________________"),
                  pw.Text("Week of: _________________________"),
                ],
              ),
            ],
          ),

          pw.Text("Client: $_clientName"),
          pw.Text("Period: $_startDate - $_endDate"),
          pw.SizedBox(height: 16),
          pw.Table.fromTextArray(
            border: pw.TableBorder.all(color: PdfColors.grey400, width: 0.5),
            headerStyle: pw.TextStyle(
              fontWeight: pw.FontWeight.bold,
              color: PdfColors.white,
            ),
            headerDecoration: const pw.BoxDecoration(color: PdfColors.green),
            cellAlignment: pw.Alignment.center,
            headers: [
              "Day",
              "Regular",
              "Extra Hours",
              "Vacation",
              "Total",
            ],
            data: _timesheetData
                .map(
                  (row) => [
                    row["day"].toString(),
                    (row["regular"] as num).toStringAsFixed(2),
                    (row["extra"] as num).toStringAsFixed(2),
                    (row["vacation"] as num).toStringAsFixed(2),
                    (row["total"] as num).toStringAsFixed(2),
                  ],
                )
                .toList(),
          ),
          pw.SizedBox(height: 12),
          _pdfFooterRow("Total Hours", totals, PdfColors.blue50),
          _pdfFooterRow(
            "Rate / Hour",
            List.filled(totals.length, ratePerHour),
            PdfColors.orange50,
          ),
          _pdfFooterRow(
            "Total Pay",
            totalPayColumns,
            PdfColors.green50,
            bold: true,
          ),
          pw.SizedBox(height: 12),
          pw.Align(
            alignment: pw.Alignment.centerRight,
            child: pw.Container(
              width: 250,
              padding: const pw.EdgeInsets.all(10),
              decoration: pw.BoxDecoration(
                color: PdfColors.grey100,
                border: pw.Border.all(color: PdfColors.grey400),
                borderRadius: pw.BorderRadius.circular(6),
              ),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text(
                    "Client Rate/Hour: \$${_clientRate.toStringAsFixed(2)}",
                    style: pw.TextStyle(fontWeight: pw.FontWeight.normal),
                  ),
                  pw.SizedBox(height: 4),
                  pw.Text(
                    "Total Hours Reported: ${_totalHours.toStringAsFixed(2)}",
                    style: pw.TextStyle(fontWeight: pw.FontWeight.normal),
                  ),
                  pw.SizedBox(height: 4),
                  pw.Text(
                    "Grand Total Pay: \$${totalPayColumns.isNotEmpty ? totalPayColumns.reduce((a, b) => a + b).toStringAsFixed(2) : '0.00'}",
                    style: pw.TextStyle(
                      fontWeight: pw.FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );

    return pdf;
  }

  // Download PDF
  Future<void> _downloadPdf() async {
    final pdf = _generatePdfDocument();
    await Printing.sharePdf(
      bytes: await pdf.save(),
      filename: 'Weekly_Timesheet_Report.pdf',
    );
  }

  // Print PDF
  Future<void> _printPdf() async {
    final pdf = _generatePdfDocument();
    await Printing.layoutPdf(onLayout: (format) async => pdf.save());
  }
}
