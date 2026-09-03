import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import 'package:staffsync_app/screens/admin/employee_model.dart';






class EmployeeApiService {
  // ============================================================
  // BASE URL
  // ============================================================

  final String baseUrl = "http://192.168.1.8:8080";

  // ============================================================
  // GET ALL EMPLOYEES
  // ============================================================

  Future<List<Employee>> getEmployees() async {
    final response = await http.get(Uri.parse('$baseUrl/api/admin/employees'));

    if (response.statusCode == 200) {
      final dynamic decoded = jsonDecode(response.body);

      if (decoded is! List) {
        throw Exception('Invalid employee response from server.');
      }

      return decoded
          .map<Employee>(
            (json) => Employee.fromJson(Map<String, dynamic>.from(json)),
          )
          .toList();
    }

    throw Exception(
      'Failed to load employees: '
      '${response.statusCode}\n'
      '${response.body}',
    );
  }

  // ============================================================
  // ADD EMPLOYEE
  // ============================================================

  Future<Employee> addEmployee(Employee employee, File? image) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/api/admin/employees'),
    );

    // Employee JSON
    request.files.add(
      http.MultipartFile.fromString(
        'employee',
        jsonEncode(employee.toJson()),
        contentType: MediaType('application', 'json'),
      ),
    );

    // Profile image
    if (image != null) {
      if (!await image.exists()) {
        throw Exception('Selected profile image does not exist.');
      }

      request.files.add(await http.MultipartFile.fromPath('image', image.path));
    }

    final streamedResponse = await request.send();

    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200 || response.statusCode == 201) {
      if (response.body.isEmpty) {
        throw Exception(
          'Employee was created but server returned empty response.',
        );
      }

      final dynamic decoded = jsonDecode(response.body);

      if (decoded is! Map<String, dynamic>) {
        throw Exception('Invalid employee response from server.');
      }

      return Employee.fromJson(decoded);
    }

    throw Exception(
      'Failed to add employee: '
      '${response.statusCode}\n'
      '${response.body}',
    );
  }

  // ============================================================
  // UPDATE EMPLOYEE
  // ============================================================

  Future<bool> updateEmployee(Employee employee, File? image) async {
    if (employee.id == null) {
      throw Exception('Employee ID is required for update.');
    }

    final request = http.MultipartRequest(
      'PUT',
      Uri.parse('$baseUrl/api/admin/employees/${employee.id}'),
    );

    // Employee JSON
    request.files.add(
      http.MultipartFile.fromString(
        'employee',
        jsonEncode(employee.toJson()),
        contentType: MediaType('application', 'json'),
      ),
    );

    // Profile image
    if (image != null) {
      if (!await image.exists()) {
        throw Exception('Selected profile image does not exist.');
      }

      request.files.add(await http.MultipartFile.fromPath('image', image.path));
    }

    final streamedResponse = await request.send();

    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200 || response.statusCode == 204) {
      return true;
    }

    throw Exception(
      'Failed to update employee: '
      '${response.statusCode}\n'
      '${response.body}',
    );
  }

  // ============================================================
  // DELETE EMPLOYEE
  // ============================================================

  Future<bool> deleteEmployee(int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/admin/employees/$id'),
    );

    if (response.statusCode == 200 || response.statusCode == 204) {
      return true;
    }

    throw Exception(
      'Failed to delete employee: '
      '${response.statusCode}\n'
      '${response.body}',
    );
  }

  // ============================================================
  // GET EMPLOYEE IMAGE
  // ============================================================

  String getEmployeeImageUrl(int id) {
    return '$baseUrl/api/admin/employees/$id/image';
  }
}
