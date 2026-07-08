import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/app/utils/urls.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/employee_model.dart';

class EmployeeService {

  static Future<List<EmployeeModel>> getEmployees(String token) async {
    final response = await http.get(
      Uri.parse(Urls.employeeList),
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final List list = body['data'];

      return list.map((e) => EmployeeModel.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load vendors');
    }
  }
}
