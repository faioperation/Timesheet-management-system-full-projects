import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/common/services/token_service.dart';

import '../../../../app/utils/urls.dart';
import '../models/user_model.dart';

class UserService {
  static Future<List<UserModelUser>> getUsers() async {
    final token = await TokenService.getToken();
    final url = Uri.parse(Urls.userListUrl);

    final response = await http.get(
      url,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final decoded = json.decode(response.body);
      final List list = decoded['data'];

      return list.map<UserModelUser>((json) {
        final userId = json['id'] ?? 0;
        final userDetails = json['user_details'];
        final int? userDetailsId = userDetails != null ? userDetails['id'] as int? : null;
        final num? clientRate = userDetails != null ? userDetails['client_rate'] as num? : null;
        return UserModelUser(
          id: userId,
          name: json['name'] ?? '',
          email: json['email'] ?? '',
          phone: json['phone'] ?? '',
          role: (json['roles'] != null && json['roles'].isNotEmpty)
              ? json['roles'][0]['name']
              : 'User',
          status: json['status'] ?? '',
          onView: () {
            print("View user id: $userId");
          },
          userDetailsId: userDetailsId,
          clientRate: clientRate,
        );
      }).toList();
    } else {
      throw Exception('Failed to load users');
    }
  }
}
