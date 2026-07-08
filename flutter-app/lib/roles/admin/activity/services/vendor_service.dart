import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:timesheet_naresh/app/utils/urls.dart';
import '../models/vendor_model.dart';

class VendorService {
  //static const String baseUrl = 'https://your-domain.com/api/vendors';

  static Future<List<VendorModel>> getVendors(String token) async {
    final response = await http.get(
      Uri.parse(Urls.vendorList),
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final List list = body['data'];

      return list.map((e) => VendorModel.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load vendors');
    }
  }
}
