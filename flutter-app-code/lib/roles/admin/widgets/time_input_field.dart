import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../app/constants.dart';
class TimeInputField extends StatefulWidget {
  final String label;
  final bool isDate;
  final void Function(String?)? onChanged;
  final void Function(DateTime?)? onDateChanged;
  final String value;
  final DateTime? initialDate;

  const TimeInputField({
    super.key,
    required this.label,
    this.isDate = false,
    this.onChanged,
    this.onDateChanged,
    this.value = '',
    this.initialDate,
  });

  @override
  _TimeInputFieldState createState() => _TimeInputFieldState();
}

class _TimeInputFieldState extends State<TimeInputField> {
  late String value;

  @override
  void initState() {
    super.initState();
    if (widget.value.isNotEmpty) {
      value = widget.value;
    } else if (widget.isDate && widget.initialDate != null) {
      value = DateFormat('dd MMM yyyy').format(widget.initialDate!);
    } else {
      value = widget.value;
    }
  }

  @override
  void didUpdateWidget(TimeInputField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      value = widget.value;
    } else if (widget.isDate && widget.initialDate != null && value.isEmpty) {
      value = DateFormat('dd MMM yyyy').format(widget.initialDate!);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: AppTextStyles.label.copyWith(color: AppColors.textDark)),
        const SizedBox(height: 6),
        GestureDetector(
          onTap: () async {
            if (widget.isDate) {
              DateTime? picked = await showDatePicker(
                context: context,
                initialDate: widget.initialDate ?? (value.isNotEmpty 
                    ? (widget.value.contains('/') 
                        ? DateFormat('dd/MM/yyyy').parse(widget.value)
                        : DateTime.now())
                    : DateTime.now()),
                firstDate: DateTime(2000),
                lastDate: DateTime(2100),
              );
              if (picked != null) {
                final formattedDate = DateFormat('dd MMM yyyy').format(picked);
                setState(() => value = formattedDate);
                if (widget.onDateChanged != null) {
                  widget.onDateChanged!(picked);
                } else if (widget.onChanged != null) {
                  widget.onChanged!(formattedDate);
                }
              }
            } else {
              TimeOfDay? picked = await showTimePicker(
                context: context,
                initialTime: TimeOfDay.now(),
              );
              if (picked != null) {
                setState(() => value = picked.format(context));
                if (widget.onChanged != null) widget.onChanged!(value);
              }
            }
          },
          child: Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.borderGrey),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  value.isEmpty 
                      ? (widget.isDate ? 'Select Date' : 'Select Time') 
                      : value,
                  style: AppTextStyles.input.copyWith(color: AppColors.textDark)
                ),
                Icon(
                  widget.isDate ? Icons.calendar_today : Icons.access_time,
                  color: AppColors.borderGrey,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
