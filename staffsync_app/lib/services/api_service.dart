import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiService {
  // ============================================================
  // BASE URL
  // ============================================================

  static const String baseUrl =
      "http://192.168.1.8:8080";

  // ============================================================
  // HEALTH CHECK
  // ============================================================

  static Future<String> healthCheck() async {
    try {
      final response = await http.get(
        Uri.parse("$baseUrl/api/health"),
      );

      if (response.statusCode == 200) {
        return response.body;
      }

      return "Error";
    } catch (e) {
      print("Health Check Error: $e");
      return "Error";
    }
  }

  // ============================================================
  // LOGIN
  // ============================================================

  static Future<Map<String, dynamic>> login(
      String email,
      String password,
      ) async {
    try {
      final response = await http.post(
        Uri.parse("$baseUrl/api/auth/login"),
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEncode({
          "email": email,
          "password": password,
        }),
      );

      print("Login Status: ${response.statusCode}");
      print("Login Response: ${response.body}");

      // ========================================================
      // SUCCESS
      // ========================================================

      if (response.statusCode == 200) {
        final dynamic data = jsonDecode(response.body);

        // ------------------------------------------------------
        // BACKEND RETURNS JSON OBJECT
        //
        // Example:
        // {
        //   "role": "EMPLOYEE",
        //   "employeeId": 5
        // }
        // ------------------------------------------------------

        if (data is Map<String, dynamic>) {
          return data;
        }

        // ------------------------------------------------------
        // BACKEND RETURNS ONLY STRING
        //
        // Example:
        // "EMPLOYEE"
        // ------------------------------------------------------

        if (data is String) {
          return {
            "role": data,
          };
        }

        return {
          "role": "ERROR",
        };
      }

      // ========================================================
      // INVALID LOGIN
      // ========================================================

      if (response.statusCode == 401) {
        return {
          "role": "INVALID",
        };
      }

      // ========================================================
      // OTHER SERVER ERROR
      // ========================================================

      return {
        "role": "ERROR",
      };
    } catch (e) {
      print("Login Error: $e");

      return {
        "role": "ERROR",
      };
    }
  }

  // ============================================================
  // GET EMPLOYEE PROFILE
  // ============================================================
  //
  // Backend:
  //
  // GET /api/employee/{id}
  //
  // Example:
  //
  // GET /api/employee/5
  //
  // ============================================================

  static Future<Map<String, dynamic>> getEmployeeProfile(
      int employeeId,
      ) async {
    try {
      final response = await http.get(
        Uri.parse(
          "$baseUrl/api/employee/$employeeId",
        ),
      );

      print(
        "Profile Status: ${response.statusCode}",
      );

      print(
        "Profile Response: ${response.body}",
      );

      // ========================================================
      // SUCCESS
      // ========================================================

      if (response.statusCode == 200) {
        final dynamic data =
        jsonDecode(response.body);

        if (data is Map<String, dynamic>) {
          return data;
        }

        throw Exception(
          "Invalid employee profile response",
        );
      }

      // ========================================================
      // EMPLOYEE NOT FOUND
      // ========================================================

      if (response.statusCode == 404) {
        throw Exception(
          "Employee profile not found",
        );
      }

      // ========================================================
      // OTHER ERROR
      // ========================================================

      throw Exception(
        "Failed to load employee profile: "
            "${response.statusCode}",
      );
    } catch (e) {
      print(
        "Get Employee Profile Error: $e",
      );

      rethrow;
    }
  }

  // ============================================================
  // GET EMPLOYEE PROFILE IMAGE
  // ============================================================
  //
  // Backend:
  //
  // GET /api/employee/{id}/image
  //
  // Example:
  //
  // GET /api/employee/5/image
  //
  // ============================================================

  static String getEmployeeImageUrl(
      int employeeId,
      ) {
    return "$baseUrl/api/employee/$employeeId/image";
  }

  // ============================================================
  // CHECK IF EMPLOYEE IMAGE EXISTS
  // ============================================================

  static Future<bool> hasEmployeeImage(
      int employeeId,
      ) async {
    try {
      final response = await http.get(
        Uri.parse(
          getEmployeeImageUrl(employeeId),
        ),
      );

      return response.statusCode == 200;
    } catch (e) {
      print(
        "Employee Image Error: $e",
      );

      return false;
    }
  }

  // ============================================================
  // UPDATE EMPLOYEE PROFILE
  // ============================================================
  //
  // Backend:
  //
  // PUT /api/employee/{id}
  //
  // NOTE:
  // This endpoint currently accepts JSON Employee data.
  //
  // ============================================================

  static Future<Map<String, dynamic>>
  updateEmployeeProfile(
      int employeeId,
      Map<String, dynamic> employeeData,
      ) async {
    try {
      final response = await http.put(
        Uri.parse(
          "$baseUrl/api/employee/$employeeId",
        ),
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEncode(employeeData),
      );

      print(
        "Update Profile Status: "
            "${response.statusCode}",
      );

      print(
        "Update Profile Response: "
            "${response.body}",
      );

      if (response.statusCode == 200) {
        final dynamic data =
        jsonDecode(response.body);

        if (data is Map<String, dynamic>) {
          return data;
        }

        throw Exception(
          "Invalid update profile response",
        );
      }

      throw Exception(
        "Failed to update profile: "
            "${response.statusCode}",
      );
    } catch (e) {
      print(
        "Update Employee Profile Error: $e",
      );

      rethrow;
    }
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  static Future<bool> logout() async {
    try {
      final response = await http.get(
        Uri.parse(
          "$baseUrl/api/auth/logout",
        ),
      );

      print(
        "Logout Status: ${response.statusCode}",
      );

      if (response.statusCode == 200) {
        return true;
      }

      return false;
    } catch (e) {
      print(
        "Logout Error: $e",
      );

      return false;
    }
  }
}