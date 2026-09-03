import 'dart:convert';
import 'package:http/http.dart' as http;

class AdminService {

  static const String baseUrl = "http://192.168.1.8:8080";

  static Future<bool> login(
      String email,
      String password,
      ) async {

    final response = await http.post(
      Uri.parse("$baseUrl/api/admin/login"),

      headers: {
        "Content-Type": "application/json",
      },

      body: jsonEncode({
        "email": email,
        "password": password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) == true;
    }

    return false;
  }
}