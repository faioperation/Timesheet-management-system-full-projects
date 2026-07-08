import 'package:flutter/material.dart';
import 'package:timesheet_naresh/common/widgets/custom_app_bar.dart';
import 'package:timesheet_naresh/common/widgets/custom_button.dart';
import 'package:timesheet_naresh/common/widgets/custom_cancel_button.dart';
import 'package:timesheet_naresh/roles/admin/widgets/custom_text_field_for_assign_client.dart';
import 'package:timesheet_naresh/roles/admin/services/admin_service.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/client_service.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/internal_user_service.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/vendor_service.dart';
import 'package:timesheet_naresh/roles/admin/activity/services/employee_service.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/client_model.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/internal_user_model.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/vendor_model.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/employee_model.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/add_client_screen.dart';
import 'package:timesheet_naresh/roles/admin/activity/screens/add_new_vendor_screen.dart';
import 'package:timesheet_naresh/common/services/token_service.dart';

class AssignClientScreen extends StatefulWidget {
  final int userDetailsId;
  final Map<String, dynamic>? existingData;
  
  const AssignClientScreen({
    super.key, 
    required this.userDetailsId,
    this.existingData,
  });

  @override
  State<AssignClientScreen> createState() => _AssignClientScreenState();
}

class _AssignClientScreenState extends State<AssignClientScreen> {
  final TextEditingController clientRateController = TextEditingController();
  final TextEditingController otherRateController = TextEditingController();
  final TextEditingController w2Controller = TextEditingController();
  final TextEditingController c2cOrOtherController = TextEditingController();
  final TextEditingController ptaxController = TextEditingController();
  final TextEditingController accountManagerCommissionController = TextEditingController();
  final TextEditingController bdManagerCommissionController = TextEditingController();
  final TextEditingController recruiterCommissionController = TextEditingController();
  final TextEditingController startDateController = TextEditingController();
  final TextEditingController endDateController = TextEditingController();
  final TextEditingController employeeNameController = TextEditingController();
  final TextEditingController employeeRateController = TextEditingController();

  String? selectedInvoiceTo;
  int? selectedClientId;
  int? selectedVendorId;
  int? selectedEmployeeId;
  String? selectedTimeSheetPeriod;
  String selectedType = "W2";
  String? selectedAccountManagerId;
  String? selectedBdManagerId;
  String? selectedRecruiterId;
  String? accountManagerCommissionOn;
  String? accountManagerRateType;
  String? bdManagerCommissionOn;
  String? bdManagerRateType;
  String? recruiterCommissionOn;
  String? recruiterRateType;
  bool recursive = true;
  String? selectedMonth;

  List<ClientModel> clients = [];
  List<VendorModel> vendors = [];
  List<EmployeeModel> employees = [];
  List<InternalUserModel> accountManagers = [];
  List<InternalUserModel> bdManagers = [];
  List<InternalUserModel> recruiters = [];

  bool isLoadingClients = true;
  bool isLoadingVendors = true;
  bool isLoadingEmployees = true;
  bool isLoadingInternalUsers = true;
  bool isSubmitting = false;

  bool get isUpdateMode => widget.existingData != null;

  @override
  void initState() {
    super.initState();
    _loadData();
    if (isUpdateMode) {
      _loadExistingData();
    }
  }

  void _loadExistingData() {
    final data = widget.existingData!;
    final userDetails = data['user_details'] as Map<String, dynamic>?;
    
    if (userDetails != null) {
      // Load basic fields
      clientRateController.text = (userDetails['client_rate'] ?? '').toString();
      otherRateController.text = (userDetails['other_rate'] ?? '').toString();
      selectedInvoiceTo = userDetails['invoice_to'] as String?;
      
      // Load dates
      if (userDetails['start_date'] != null) {
        startDateController.text = userDetails['start_date'].toString().split(' ')[0];
      }
      if (userDetails['end_date'] != null) {
        endDateController.text = userDetails['end_date'].toString().split(' ')[0];
      }
      
      // Load timesheet period
      selectedTimeSheetPeriod = userDetails['time_sheet_period'] as String?;
      
      // Load recursive
      recursive = userDetails['recurssive'] == 1;
      selectedMonth = userDetails['recurssive_month'] as String?;
      
      // Load W2/C2C fields
      if (userDetails['w2'] != null && (userDetails['w2'] as num) > 0) {
        selectedType = "W2";
        w2Controller.text = userDetails['w2'].toString();
        ptaxController.text = (userDetails['ptax'] ?? '').toString();
      } else if (userDetails['c2c_or_other'] != null && (userDetails['c2c_or_other'] as num) > 0) {
        selectedType = "1099 C2C";
        c2cOrOtherController.text = userDetails['c2c_or_other'].toString();
        // Note: employee_name and employee_rate would need to be loaded if available
      }
      
      // Load party (client/vendor)
      final party = data['party'] as Map<String, dynamic>?;
      if (party != null) {
        final partyType = party['party_type'] as String?;
        if (partyType == 'client') {
          selectedClientId = party['id'] as int?;
        } else if (partyType == 'vendor') {
          selectedVendorId = party['id'] as int?;
        }
      }
      
      // Load commission fields
      if (userDetails['account_manager_id'] != null) {
        selectedAccountManagerId = userDetails['account_manager_id'].toString();
        accountManagerCommissionController.text = (userDetails['account_manager_commission'] ?? '').toString();
        accountManagerCommissionOn = userDetails['account_manager_commission_on'] as String?;
        accountManagerRateType = userDetails['account_manager_rate_type'] as String?;
      }
      
      if (userDetails['business_development_manager_id'] != null) {
        selectedBdManagerId = userDetails['business_development_manager_id'].toString();
        bdManagerCommissionController.text = (userDetails['business_development_manager_commission'] ?? '').toString();
        bdManagerCommissionOn = userDetails['business_development_manager_commission_on'] as String?;
        bdManagerRateType = userDetails['business_development_manager_rate_type'] as String?;
      }
      
      if (userDetails['recruiter_id'] != null) {
        selectedRecruiterId = userDetails['recruiter_id'].toString();
        recruiterCommissionController.text = (userDetails['recruiter_commission'] ?? '').toString();
        recruiterCommissionOn = userDetails['recruiter_commission_on'] as String?;
        recruiterRateType = userDetails['recruiter_rate_type'] as String?;
      }
    }
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadClients(),
      _loadVendors(),
      _loadEmployees(),
      _loadInternalUsers(),
    ]);
  }

  Future<void> _loadVendors() async {
    try {
      final token = await TokenService.getToken();
      if (token != null) {
        final vendorsList = await VendorService.getVendors(token);
        setState(() {
          vendors = vendorsList;
          isLoadingVendors = false;
        });
      } else {
        setState(() => isLoadingVendors = false);
      }
    } catch (e) {
      print("Error loading vendors: $e");
      setState(() => isLoadingVendors = false);
    }
  }

  Future<void> _loadEmployees() async {
    try {
      final token = await TokenService.getToken();
      if (token != null) {
        final employeesList = await EmployeeService.getEmployees(token);
        setState(() {
          employees = employeesList;
          isLoadingEmployees = false;
        });
      } else {
        setState(() => isLoadingEmployees = false);
      }
    } catch (e) {
      print("Error loading employees: $e");
      setState(() => isLoadingEmployees = false);
    }
  }

  Future<void> _loadClients() async {
    try {
      final token = await TokenService.getToken();
      if (token != null) {
        final clientsList = await ClientService.getClients(token);
        setState(() {
          clients = clientsList;
          isLoadingClients = false;
        });
      } else {
        setState(() => isLoadingClients = false);
      }
    } catch (e) {
      print("Error loading clients: $e");
      setState(() => isLoadingClients = false);
    }
  }

  Future<void> _loadInternalUsers() async {
    try {
      final token = await TokenService.getToken();
      if (token != null) {
        final allUsers = await InternalUserService.getInternalUsers(token);
        setState(() {
          accountManagers = allUsers.where((u) => u.role.toLowerCase() == 'ac_manager').toList();
          bdManagers = allUsers.where((u) => u.role.toLowerCase() == 'bd_manager').toList();
          recruiters = allUsers.where((u) => u.role.toLowerCase() == 'recruiter').toList();
          isLoadingInternalUsers = false;
        });
      } else {
        setState(() => isLoadingInternalUsers = false);
      }
    } catch (e) {
      print("Error loading internal users: $e");
      setState(() => isLoadingInternalUsers = false);
    }
  }

  Future<void> _handleAssignClient() async {
    // Validation
    if (selectedInvoiceTo == null || selectedInvoiceTo!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select Invoice To")),
      );
      return;
    }

    if (selectedClientId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select a client")),
      );
      return;
    }

    if (clientRateController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter client rate")),
      );
      return;
    }

    if (selectedTimeSheetPeriod == null || selectedTimeSheetPeriod!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select timesheet period")),
      );
      return;
    }

    if (startDateController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select start date")),
      );
      return;
    }

    if (endDateController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select end date")),
      );
      return;
    }

    if (!recursive && (selectedMonth == null || selectedMonth!.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select a month")),
      );
      return;
    }

    if (selectedType == "W2") {
      if (w2Controller.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Please enter W2")),
        );
        return;
      }
      if (ptaxController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Please enter Pay tax")),
        );
        return;
      }
    } else if (selectedType == "1099 C2C") {
      if (selectedEmployeeId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Please select an employee")),
        );
        return;
      }
      if (employeeRateController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Please enter employee rate")),
        );
        return;
      }
    }

    setState(() => isSubmitting = true);

    try {
      final response = await AdminService.assignClient(
        userDetailsId: widget.userDetailsId,
        partyId: selectedInvoiceTo == "Client" ? selectedClientId! : selectedVendorId!,
        clientRate: double.tryParse(clientRateController.text) ?? 0.0,
        otherRate: double.tryParse(otherRateController.text) ?? 0.0,
        w2: double.tryParse(w2Controller.text) ?? 0.0,
        c2cOrOther: double.tryParse(c2cOrOtherController.text) ?? 0.0,
        ptax: double.tryParse(ptaxController.text) ?? 0.0,
        timeSheetPeriod: selectedTimeSheetPeriod!,
        startDate: startDateController.text,
        endDate: endDateController.text,
        accountManagerId: _getUserId(selectedAccountManagerId),
        accountManagerCommission: selectedAccountManagerId != null && selectedAccountManagerId != "N/A"
            ? double.tryParse(accountManagerCommissionController.text)
            : null,
        businessDevelopmentManagerId: _getUserId(selectedBdManagerId),
        businessDevelopmentManagerCommission: selectedBdManagerId != null && selectedBdManagerId != "N/A"
            ? double.tryParse(bdManagerCommissionController.text)
            : null,
        recruiterId: _getUserId(selectedRecruiterId),
        recruiterCommission: selectedRecruiterId != null && selectedRecruiterId != "N/A"
            ? double.tryParse(recruiterCommissionController.text)
            : null,
        invoiceTo: selectedInvoiceTo!,
        recursive: recursive,
        recursiveMonth: !recursive ? selectedMonth : null,
        employeeName: selectedType == "1099 C2C" && selectedEmployeeId != null
            ? employees.firstWhere((e) => e.id == selectedEmployeeId).name
            : null,
      );

      setState(() => isSubmitting = false);

      if (!mounted) return;

      if (response['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response['message'] ?? "Client assigned successfully")),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response['message'] ?? "Failed to assign client")),
        );
      }
    } catch (e) {
      setState(() => isSubmitting = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  Future<void> _selectDate(TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      controller.text = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
    }
  }

  @override
  void dispose() {
    clientRateController.dispose();
    otherRateController.dispose();
    w2Controller.dispose();
    c2cOrOtherController.dispose();
    ptaxController.dispose();
    accountManagerCommissionController.dispose();
    bdManagerCommissionController.dispose();
    recruiterCommissionController.dispose();
    startDateController.dispose();
    endDateController.dispose();
    employeeNameController.dispose();
    employeeRateController.dispose();
    super.dispose();
  }

  // Helper method to get user ID from selected value
  int? _getUserId(String? value) {
    if (value == null || value == "N/A") return null;
    return int.tryParse(value);
  }

  // Helper method to populate commission fields when user is selected
  void _populateCommissionFields(String role, String? userIdStr) {
    if (userIdStr == null || userIdStr == "N/A") {
      return;
    }

    final userId = int.tryParse(userIdStr);
    if (userId == null) return;

    if (role == 'account_manager') {
      try {
        final user = accountManagers.firstWhere((u) => u.id == userId);
        setState(() {
          accountManagerCommissionController.text = user.rate ?? '';
          accountManagerCommissionOn = user.commissionOn;
          accountManagerRateType = user.rateType;
        });
      } catch (e) {
        return; // User not found
      }
    } else if (role == 'bd_manager') {
      try {
        final user = bdManagers.firstWhere((u) => u.id == userId);
        setState(() {
          bdManagerCommissionController.text = user.rate ?? '';
          bdManagerCommissionOn = user.commissionOn;
          bdManagerRateType = user.rateType;
        });
      } catch (e) {
        return; // User not found
      }
    } else if (role == 'recruiter') {
      try {
        final user = recruiters.firstWhere((u) => u.id == userId);
        setState(() {
          recruiterCommissionController.text = user.rate ?? '';
          recruiterCommissionOn = user.commissionOn;
          recruiterRateType = user.rateType;
        });
      } catch (e) {
        return; // User not found
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth < 600 ? 8.0 : 24.0;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              CustomAppBar(title: isUpdateMode ? "Update Assign Client" : "Assign Client"),
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(horizontalPadding),
                  child: Column(
                    children: [
                      // Invoice To and Client Name
                      Row(
                        children: [
                          Expanded(
                            child: CustomTextFieldForAssignClient(
                              label: 'Invoice to',
                              isDropdown: true,
                              isRequired: true,
                              hintText: 'Select',
                              dropdownItems: ['Client', 'Vendor'],
                              onChanged: (value) {
                                setState(() {
                                  selectedInvoiceTo = value;
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: isLoadingClients
                                ? const Center(child: CircularProgressIndicator())
                                : Row(
                                    children: [
                                      Expanded(
                                        child: CustomTextFieldForAssignClient(
                                          label: 'Client name',
                                          isDropdown: true,
                                          isRequired: true,
                                          hintText: 'Select client',
                                          dropdownItems: clients.map((c) => c.name).toList(),
                                          onChanged: (value) {
                                            if (value != null) {
                                              try {
                                                setState(() {
                                                  selectedClientId = clients
                                                      .firstWhere((c) => c.name == value)
                                                      .id;
                                                });
                                              } catch (e) {
                                                print("Error selecting client: $e");
                                              }
                                            }
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      GestureDetector(
                                        onTap: () async {
                                          if (!mounted) return;
                                          final result = await Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (_) => const AddClientScreen(),
                                            ),
                                          );
                                          if (!mounted) return;
                                          if (result == true) {
                                            _loadClients();
                                          }
                                        },
                                        child: Container(
                                          width: 40,
                                          height: 40,
                                          decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: const Icon(
                                            Icons.add,
                                            color: Colors.white,
                                            size: 24,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ],
                      ),

                      // Vendor Field
                      if (selectedInvoiceTo == "Vendor") ...[
                        isLoadingVendors
                            ? const Center(child: CircularProgressIndicator())
                            : Row(
                                children: [
                                  Expanded(
                                    child: CustomTextFieldForAssignClient(
                                      label: 'Vendor name',
                                      isDropdown: true,
                                      isRequired: true,
                                      hintText: 'Select vendor',
                                      dropdownItems: vendors.map((v) => v.name).toList(),
                                      onChanged: (value) {
                                        if (value != null) {
                                          try {
                                            setState(() {
                                              selectedVendorId = vendors
                                                  .firstWhere((v) => v.name == value)
                                                  .id;
                                            });
                                          } catch (e) {
                                            print("Error selecting vendor: $e");
                                          }
                                        }
                                      },
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  GestureDetector(
                                    onTap: () async {
                                      if (!mounted) return;
                                      final result = await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => const AddNewVendorScreen(),
                                        ),
                                      );
                                      if (!mounted) return;
                                      if (result == true) {
                                        _loadVendors();
                                      }
                                    },
                                    child: Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        color: Colors.blue,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(
                                        Icons.add,
                                        color: Colors.white,
                                        size: 24,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                      ],

                      // Client Rate and Other Rate
                      Row(
                        children: [
                          Expanded(
                            child: CustomTextFieldForAssignClient(
                              label: 'Client rate',
                              hintText: 'Enter rate',
                              isRequired: true,
                              controller: clientRateController,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: CustomTextFieldForAssignClient(
                              label: 'Other rate',
                              hintText: 'Enter other rate',
                              controller: otherRateController,
                            ),
                          ),
                        ],
                      ),

                      // Vendor Name Field
                      isLoadingVendors
                          ? const Center(child: CircularProgressIndicator())
                          : CustomTextFieldForAssignClient(
                              label: 'Vendor name',
                              isDropdown: true,
                              hintText: 'Select vendor',
                              dropdownItems: vendors.map((v) => v.name).toList(),
                              onChanged: (value) {
                                if (value != null) {
                                  try {
                                    setState(() {
                                      selectedVendorId = vendors
                                          .firstWhere((v) => v.name == value)
                                          .id;
                                    });
                                  } catch (e) {
                                    print("Error selecting vendor: $e");
                                  }
                                } else {
                                  setState(() {
                                    selectedVendorId = null;
                                  });
                                }
                              },
                            ),

                      // Timesheet Period
                      CustomTextFieldForAssignClient(
                        label: 'Timesheet period',
                        isDropdown: true,
                        isRequired: true,
                        hintText: "Select period",
                        dropdownItems: ['weekly', 'bi-weekly','monthly'],
                        onChanged: (value) {
                          setState(() {
                            selectedTimeSheetPeriod = value;
                          });
                        },
                      ),

                      // Start Date and End Date
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                RichText(
                                  text: const TextSpan(
                                    text: 'Start date',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.black,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    children: [
                                      TextSpan(
                                        text: ' *',
                                        style: TextStyle(color: Colors.red),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 6),
                                TextFormField(
                                  controller: startDateController,
                                  readOnly: true,
                                  onTap: () => _selectDate(startDateController),
                                  decoration: InputDecoration(
                                    hintText: 'Select start date',
                                    contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 14),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(
                                          color: Color.fromRGBO(206, 210, 229, 1)),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(
                                          color: Color.fromRGBO(206, 210, 229, 1)),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(
                                          color: Color.fromRGBO(206, 210, 229, 1)),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 14),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                RichText(
                                  text: const TextSpan(
                                    text: 'End date',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.black,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    children: [
                                      TextSpan(
                                        text: ' *',
                                        style: TextStyle(color: Colors.red),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 6),
                                TextFormField(
                                  controller: endDateController,
                                  readOnly: true,
                                  onTap: () => _selectDate(endDateController),
                                  decoration: InputDecoration(
                                    hintText: 'Select end date',
                                    contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 14),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(
                                          color: Color.fromRGBO(206, 210, 229, 1)),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(
                                          color: Color.fromRGBO(206, 210, 229, 1)),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(
                                          color: Color.fromRGBO(206, 210, 229, 1)),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 14),
                              ],
                            ),
                          ),
                        ],
                      ),

                      // Recursive Option
                      Row(
                        children: [
                          Expanded(
                            child: RadioListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Recursive (True)'),
                              value: true,
                              groupValue: recursive,
                              onChanged: (val) => setState(() {
                                recursive = val as bool;
                                if (recursive) {
                                  selectedMonth = null;
                                }
                              }),
                            ),
                          ),
                          Expanded(
                            child: RadioListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Recursive (False)'),
                              value: false,
                              groupValue: recursive,
                              onChanged: (val) => setState(() => recursive = val as bool),
                            ),
                          ),
                        ],
                      ),

                      // Month Selection (only when recursive is false)
                      if (!recursive) ...[
                        CustomTextFieldForAssignClient(
                          label: 'Select Month',
                          isDropdown: true,
                          isRequired: true,
                          hintText: 'Select month',
                          dropdownItems: [
                            'january',
                            'february',
                            'march',
                            'april',
                            'may',
                            'june',
                            'july',
                            'august',
                            'september',
                            'october',
                            'november',
                            'december',
                          ],
                          onChanged: (value) {
                            setState(() {
                              selectedMonth = value;
                            });
                          },
                        ),
                      ],

                      // Radio Button for W2 or 1099 C2C
                      Row(
                        children: [
                          Expanded(
                            child: RadioListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('W2'),
                              value: "W2",
                              groupValue: selectedType,
                              onChanged: (val) =>
                                  setState(() => selectedType = val.toString()),
                            ),
                          ),
                          Expanded(
                            child: RadioListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('1099 C2C'),
                              value: "1099 C2C",
                              groupValue: selectedType,
                              onChanged: (val) =>
                                  setState(() => selectedType = val.toString()),
                            ),
                          ),
                        ],
                      ),

                      // Conditional Fields based on selectedType
                      if (selectedType == "W2") ...[
                        CustomTextFieldForAssignClient(
                          label: 'W2',
                          hintText: 'Enter W2',
                          isRequired: true,
                          controller: w2Controller,
                        ),
                        CustomTextFieldForAssignClient(
                          label: 'Pay tax',
                          hintText: 'Enter pay tax',
                          isRequired: true,
                          controller: ptaxController,
                        ),
                      ] else if (selectedType == "1099 C2C") ...[
                        CustomTextFieldForAssignClient(
                          label: 'C2C or Other',
                          hintText: 'Enter C2C or Other',
                          controller: c2cOrOtherController,
                        ),
                        isLoadingEmployees
                            ? const Center(child: CircularProgressIndicator())
                            : CustomTextFieldForAssignClient(
                                label: 'Employee',
                                isDropdown: true,
                                isRequired: true,
                                hintText: 'Select employee',
                                dropdownItems: employees.map((e) => e.name).toList(),
                                onChanged: (value) {
                                  if (value != null) {
                                    try {
                                      setState(() {
                                        selectedEmployeeId = employees
                                            .firstWhere((e) => e.name == value)
                                            .id;
                                      });
                                    } catch (e) {
                                      print("Error selecting employee: $e");
                                    }
                                  }
                                },
                              ),
                        CustomTextFieldForAssignClient(
                          label: 'Employee Rate',
                          hintText: 'Enter employee rate',
                          isRequired: true,
                          controller: employeeRateController,
                        ),
                        CustomTextFieldForAssignClient(
                          label: 'Employee Zip Code',
                          hintText: 'Enter employee zip code',
                          isRequired: true,
                          //controller: employeeZipCodeController,
                        ),
                      ],

                      // Account Manager
                      isLoadingInternalUsers
                          ? const Center(child: CircularProgressIndicator())
                          : CustomTextFieldForAssignClient(
                              label: 'Account manager',
                              isDropdown: true,
                              hintText: 'Select account manager',
                              dropdownItems: ['N/A', ...accountManagers.map((u) => u.name)],
                              onChanged: (value) {
                                if (value != null) {
                                  setState(() {
                                    if (value == "N/A") {
                                      selectedAccountManagerId = "N/A";
                                      accountManagerCommissionController.clear();
                                      accountManagerCommissionOn = null;
                                      accountManagerRateType = null;
                                    } else {
                                      try {
                                        final user = accountManagers.firstWhere((u) => u.name == value);
                                        selectedAccountManagerId = user.id.toString();
                                        _populateCommissionFields('account_manager', selectedAccountManagerId);
                                      } catch (e) {
                                        print("Error selecting account manager: $e");
                                      }
                                    }
                                  });
                                }
                              },
                            ),

                      // Account Manager Commission Fields
                      if (selectedAccountManagerId != null && selectedAccountManagerId != "N/A") ...[
                        CustomTextFieldForAssignClient(
                          label: 'Commission',
                          hintText: 'Enter commission',
                          controller: accountManagerCommissionController,
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: CustomTextFieldForAssignClient(
                                label: 'Commission on',
                                isDropdown: true,
                                hintText: 'Select',
                                initialValue: accountManagerCommissionOn,
                                dropdownItems: ['gross-margin', 'net-margin'],
                                onChanged: (value) {
                                  setState(() {
                                    accountManagerCommissionOn = value;
                                  });
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: CustomTextFieldForAssignClient(
                                label: 'Rate type',
                                isDropdown: true,
                                hintText: 'Select',
                                initialValue: accountManagerRateType,
                                dropdownItems: ['percentage', 'fixed'],
                                onChanged: (value) {
                                  setState(() {
                                    accountManagerRateType = value;
                                  });
                                },
                              ),
                            ),
                          ],
                        ),
                      ],

                      // BD Manager
                      isLoadingInternalUsers
                          ? const SizedBox.shrink()
                          : CustomTextFieldForAssignClient(
                              label: 'BD manager',
                              isDropdown: true,
                              hintText: 'Select BD manager',
                              dropdownItems: ['N/A', ...bdManagers.map((u) => u.name)],
                              onChanged: (value) {
                                if (value != null) {
                                  setState(() {
                                    if (value == "N/A") {
                                      selectedBdManagerId = "N/A";
                                      bdManagerCommissionController.clear();
                                      bdManagerCommissionOn = null;
                                      bdManagerRateType = null;
                                    } else {
                                      try {
                                        final user = bdManagers.firstWhere((u) => u.name == value);
                                        selectedBdManagerId = user.id.toString();
                                        _populateCommissionFields('bd_manager', selectedBdManagerId);
                                      } catch (e) {
                                        print("Error selecting BD manager: $e");
                                      }
                                    }
                                  });
                                }
                              },
                            ),

                      // BD Manager Commission Fields
                      if (selectedBdManagerId != null && selectedBdManagerId != "N/A") ...[
                        CustomTextFieldForAssignClient(
                          label: 'Commission',
                          hintText: 'Enter commission',
                          controller: bdManagerCommissionController,
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: CustomTextFieldForAssignClient(
                                label: 'Commission on',
                                isDropdown: true,
                                hintText: 'Select',
                                initialValue: bdManagerCommissionOn,
                                dropdownItems: ['gross-margin', 'net-margin'],
                                onChanged: (value) {
                                  setState(() {
                                    bdManagerCommissionOn = value;
                                  });
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: CustomTextFieldForAssignClient(
                                label: 'Rate type',
                                isDropdown: true,
                                hintText: 'Select',
                                initialValue: bdManagerRateType,
                                dropdownItems: ['percentage', 'fixed'],
                                onChanged: (value) {
                                  setState(() {
                                    bdManagerRateType = value;
                                  });
                                },
                              ),
                            ),
                          ],
                        ),
                      ],

                      // Recruiter
                      isLoadingInternalUsers
                          ? const SizedBox.shrink()
                          : CustomTextFieldForAssignClient(
                              label: 'Recruiter',
                              isDropdown: true,
                              hintText: 'Select recruiter',
                              dropdownItems: ['N/A', ...recruiters.map((u) => u.name)],
                              onChanged: (value) {
                                if (value != null) {
                                  setState(() {
                                    if (value == "N/A") {
                                      selectedRecruiterId = "N/A";
                                      recruiterCommissionController.clear();
                                      recruiterCommissionOn = null;
                                      recruiterRateType = null;
                                    } else {
                                      try {
                                        final user = recruiters.firstWhere((u) => u.name == value);
                                        selectedRecruiterId = user.id.toString();
                                        _populateCommissionFields('recruiter', selectedRecruiterId);
                                      } catch (e) {
                                        print("Error selecting recruiter: $e");
                                      }
                                    }
                                  });
                                }
                              },
                            ),

                      // Recruiter Commission Fields
                      if (selectedRecruiterId != null && selectedRecruiterId != "N/A") ...[
                        CustomTextFieldForAssignClient(
                          label: 'Commission',
                          hintText: 'Enter commission',
                          controller: recruiterCommissionController,
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: CustomTextFieldForAssignClient(
                                label: 'Commission on',
                                isDropdown: true,
                                hintText: 'Select',
                                initialValue: recruiterCommissionOn,
                                dropdownItems: ['gross-margin', 'net-margin'],
                                onChanged: (value) {
                                  setState(() {
                                    recruiterCommissionOn = value;
                                  });
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: CustomTextFieldForAssignClient(
                                label: 'Rate type',
                                isDropdown: true,
                                hintText: 'Select',
                                initialValue: recruiterRateType,
                                dropdownItems: ['percentage', 'fixed'],
                                onChanged: (value) {
                                  setState(() {
                                    recruiterRateType = value;
                                  });
                                },
                              ),
                            ),
                          ],
                        ),
                      ],

                      const SizedBox(height: 20),

                      // Buttons Row
                      Row(
                        children: [
                          Expanded(
                            child: isSubmitting
                                ? const Center(child: CircularProgressIndicator())
                                : CustomButton(
                                    title: isUpdateMode ? 'Update Assign Client' : 'Assign client',
                                    onPressed: _handleAssignClient,
                                  ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: CancelCustomButton(
                              title: 'Cancel',
                              onPressed: () => Navigator.pop(context),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
