import 'package:flutter/material.dart';

class CustomTextFieldForAssignClient extends StatefulWidget {
  final String label;
  final String? hintText;
  final bool isDropdown;
  final bool isRequired;
  final bool isPassword; // 👈 নতুন parameter
  final TextEditingController? controller;
  final List<String>? dropdownItems;
  final String? initialValue; // 👈 initial value for dropdown
  final void Function(String?)? onChanged;

  const CustomTextFieldForAssignClient({
    super.key,
    required this.label,
    this.hintText,
    this.isDropdown = false,
    this.isRequired = false,
    this.isPassword = false, // 👈 default false
    this.controller,
    this.dropdownItems,
    this.initialValue,
    this.onChanged,
  });

  @override
  State<CustomTextFieldForAssignClient> createState() =>
      _CustomTextFieldForAssignClientState();
}

class _CustomTextFieldForAssignClientState
    extends State<CustomTextFieldForAssignClient> {
  String? selectedValue;
  bool _obscureText = true; // 👈 password hide/show control

  @override
  void initState() {
    super.initState();
    if (widget.initialValue != null) {
      selectedValue = widget.initialValue;
    }
  }

  @override
  void didUpdateWidget(CustomTextFieldForAssignClient oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialValue != oldWidget.initialValue) {
      selectedValue = widget.initialValue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: Color.fromRGBO(206, 210, 229, 1)),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label + Required *
        RichText(
          text: TextSpan(
            text: widget.label,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black,
              fontWeight: FontWeight.w500,
            ),
            children: widget.isRequired
                ? const [
              TextSpan(
                text: ' *',
                style: TextStyle(color: Colors.red),
              ),
            ]
                : [],
          ),
        ),
        const SizedBox(height: 6),

        // ✅ Dropdown field
        widget.isDropdown
            ? DropdownButtonFormField<String>(
          value: selectedValue,
          isExpanded: true, // ✅ Fix overflow by expanding dropdown
          items: widget.dropdownItems
              ?.map((e) =>
              DropdownMenuItem(
                value: e,
                child: Text(
                  e,
                  overflow: TextOverflow.ellipsis, // ✅ Handle long text
                ),
              ))
              .toList(),
          onChanged: (value) {
            setState(() {
              selectedValue = value;
            });
            if (widget.controller != null) {
              widget.controller!.text = value ?? '';
            }
            if (widget.onChanged != null) {
              widget.onChanged!(value);
            }
          },
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(
                horizontal: 12, vertical: 14),
            hintText: widget.hintText ?? 'Select',
            border: border,
            enabledBorder: border,
            focusedBorder: border,
          ),
          selectedItemBuilder: (BuildContext context) {
            // ✅ Custom builder for selected item to handle overflow
            return widget.dropdownItems?.map<Widget>((String item) {
              return Text(
                item,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.black),
              );
            }).toList() ?? [];
          },
        )

        // ✅ Text Field (Normal / Password)
            : TextFormField(
          controller: widget.controller,
          obscureText: widget.isPassword ? _obscureText : false,
          decoration: InputDecoration(
            hintText: widget.hintText ?? '',
            contentPadding: const EdgeInsets.symmetric(
                horizontal: 12, vertical: 14),
            border: border,
            enabledBorder: border,
            focusedBorder: border,

            // 👇 Password toggle icon
            suffixIcon: widget.isPassword
                ? IconButton(
              icon: Icon(
                _obscureText
                    ? Icons.visibility_off
                    : Icons.visibility,
                color: Colors.grey,
              ),
              onPressed: () {
                setState(() {
                  _obscureText = !_obscureText;
                });
              },
            )
                : null,
          ),
        ),

        const SizedBox(height: 14),
      ],
    );
  }
}
