import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/services/auth_interceptor.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/app/utils/urls.dart';
import 'dart:convert';

class WeekendSelectionScreen extends StatefulWidget {
  const WeekendSelectionScreen({super.key});

  @override
  State<WeekendSelectionScreen> createState() => _WeekendSelectionScreenState();
}

class _WeekendSelectionScreenState extends State<WeekendSelectionScreen> {
  final List<String> _weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  List<String> _selectedWeekends = [];
  bool _isLoading = false;
  bool _isLoadingInitial = true;

  @override
  void initState() {
    super.initState();
    _loadCurrentWeekends();
  }

  Future<void> _loadCurrentWeekends() async {
    // Try to load current weekends from API if available
    // For now, we'll start with empty selection
    setState(() {
      _isLoadingInitial = false;
    });
  }

  void _toggleWeekend(String day) {
    setState(() {
      if (_selectedWeekends.contains(day)) {
        // Remove if already selected
        _selectedWeekends.remove(day);
      } else {
        // Add if not selected and less than 2 selected
        if (_selectedWeekends.length < 2) {
          _selectedWeekends.add(day);
        } else {
          // Show message that max 2 can be selected
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('You can select maximum 2 weekends'),
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    });
  }

  Future<void> _saveWeekends() async {
    if (_selectedWeekends.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one weekend'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (_selectedWeekends.length > 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('You can select maximum 2 weekends'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final token = await TokenService.getToken();
      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found.");
      }

      final uri = Uri.parse(Urls.updateWeekendUrl);
      final response = await AuthInterceptor.post(
        uri,
        body: jsonEncode({
          'weekend': _selectedWeekends,
        }),
        context: context,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        
        if (mounted) {
          setState(() {
            _isLoading = false;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                jsonData['message'] ?? 'Weekend settings updated successfully',
              ),
              backgroundColor: Colors.green,
            ),
          );

          // Navigate back after successful save
          Navigator.pop(context, true);
        }
      } else {
        final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
        if (mounted) {
          setState(() {
            _isLoading = false;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                jsonData['message'] ?? 'Failed to update weekend settings',
              ),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F3F5),
      appBar: AppBar(
        title: const Text(
          'Add Weekend',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.black,
          ),
        ),
        backgroundColor: const Color(0xFFF3F3F5),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: _isLoadingInitial
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Instructions
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.blue.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: Colors.blue[700],
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Select maximum 2 days as your weekend',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.blue[900],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Selected count indicator
                    if (_selectedWeekends.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.check_circle,
                              color: Colors.green[700],
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '${_selectedWeekends.length} of 2 weekends selected',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.green[900],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    if (_selectedWeekends.isNotEmpty) const SizedBox(height: 20),

                    // Week days list
                    Expanded(
                      child: ListView.builder(
                        itemCount: _weekDays.length,
                        itemBuilder: (context, index) {
                          final day = _weekDays[index];
                          final isSelected = _selectedWeekends.contains(day);
                          final isDisabled =
                              !isSelected && _selectedWeekends.length >= 2;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected
                                    ? Colors.blue
                                    : isDisabled
                                        ? Colors.grey.withOpacity(0.3)
                                        : Colors.grey.withOpacity(0.2),
                                width: isSelected ? 2 : 1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 8,
                              ),
                              title: Text(
                                day,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  color: isDisabled
                                      ? Colors.grey
                                      : Colors.black,
                                ),
                              ),
                              trailing: isSelected
                                  ? Icon(
                                      Icons.check_circle,
                                      color: Colors.blue,
                                      size: 28,
                                    )
                                  : Icon(
                                      Icons.circle_outlined,
                                      color: isDisabled
                                          ? Colors.grey.withOpacity(0.3)
                                          : Colors.grey,
                                      size: 28,
                                    ),
                              onTap: isDisabled
                                  ? null
                                  : () {
                                      _toggleWeekend(day);
                                    },
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Save button
                    CustomButton(
                      title: _isLoading ? 'Saving...' : 'Save Weekends',
                      onPressed:  _saveWeekends,
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

