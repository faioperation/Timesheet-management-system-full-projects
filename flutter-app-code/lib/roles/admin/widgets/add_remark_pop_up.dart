import 'package:flutter/material.dart';
import 'package:timesheet_naresh/roles/admin/widgets/time_input_field.dart';
import '../../../app/constants.dart';

class AddRemarkDialog extends StatefulWidget {
  final Function(String)? onSave;
  
  const AddRemarkDialog({super.key, this.onSave});

  @override
  State<AddRemarkDialog> createState() => _AddRemarkDialogState();
}

class _AddRemarkDialogState extends State<AddRemarkDialog> {
  String _selectedHoliday = 'Saturday';
  final TextEditingController _remarkController = TextEditingController();

  // Toggle button state for weekly holidays
  bool _isFridaySelected = true;
  bool _isSaturdaySelected = true;

  @override
  void dispose() {
    _remarkController.dispose();
    super.dispose();
  }

  Widget _buildHolidayToggle(String text, bool isSelected, void Function(bool) onToggle) {
    return GestureDetector(
      onTap: () => onToggle(!isSelected),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryColor : AppColors.softGrey,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textDark,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {



    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Text('Add remark', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Daily Hour
            const TimeInputField(label: 'Daily hour', value: '08:00'),
            const SizedBox(height: 16),

            // Extra Hour
            const TimeInputField(label: 'Extra hour', value: '00:00'),
            const SizedBox(height: 16),

            // Weekly Holiday
            const Text('Weekly holiday', style: AppTextStyles.label),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildHolidayToggle('Friday', _isFridaySelected, (val) {
                  setState(() => _isFridaySelected = val);
                }),
                const SizedBox(width: 10),
                _buildHolidayToggle('Saturday', _isSaturdaySelected, (val) {
                  setState(() => _isSaturdaySelected = val);
                }),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    // Reset logic
                    setState(() {
                      _isFridaySelected = false;
                      _isSaturdaySelected = false;
                    });
                  },
                  child: const Text('Reset', style: TextStyle(color: AppColors.redError)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Remark Text Field
            const Text('Remark', style: AppTextStyles.label),
            const SizedBox(height: 8),
            TextField(
              controller: _remarkController,
              decoration: InputDecoration(
                hintText: 'Enter remark...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: AppColors.borderGrey),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),

            // Dropdown and Add Button
            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.borderGrey),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        isExpanded: true,
                        value: _selectedHoliday,
                        items: <String>['Saturday', 'Sunday', 'Monday', 'Tuesday']
                            .map<DropdownMenuItem<String>>((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: Text(value),
                          );
                        }).toList(),
                        onChanged: (String? newValue) {
                          setState(() {
                            _selectedHoliday = newValue!;
                          });
                        },
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.accentColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.add, color: AppColors.primaryColor),
                ),
              ],
            ),
          ],
        ),
      ),
      actions: <Widget>[
        // Close Button
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          style: TextButton.styleFrom(
            backgroundColor: AppColors.softGrey,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Text('Close', style: AppTextStyles.buttonPrimary.copyWith(color: AppColors.redError)),
        ),
        const SizedBox(width: 8),
        // Save Button
        ElevatedButton(
          onPressed: () {
            final remark = _remarkController.text.trim();
            if (widget.onSave != null) {
              widget.onSave!(remark);
            }
            Navigator.of(context).pop();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryColor,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: const Text('Save', style: AppTextStyles.buttonPrimary),
        ),
      ],
      actionsAlignment: MainAxisAlignment.end,
    );
  }
}