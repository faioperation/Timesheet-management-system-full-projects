import 'dart:convert';

import 'package:timesheet_naresh/app/utils/urls.dart';
import 'package:timesheet_naresh/roles/admin/activity/models/client_model.dart';
import 'package:http/http.dart' as http;

class ClientService {

  static Future<List<ClientModel>>getClients (String token)async{

    final response = await http.get(Uri.parse(Urls.clientList),
    headers: {
      'Authorization':'Bearer $token',
      'Accept':'application/json'
    }
    );

    if(response.statusCode == 200){
      final body = jsonDecode(response.body);
      final List list = body['data'];

      return list.map((e)=>ClientModel.fromJson(e)).toList();
    }
    else {
      throw Exception("Failed to load Client");
    }
  }
}