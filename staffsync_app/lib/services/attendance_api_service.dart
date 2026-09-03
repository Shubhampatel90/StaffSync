import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:staffsync_app/screens/admin/attendance_model.dart';

class AttendanceApiService {
  static const String baseUrl =
      "http://192.168.1.8:8080";

  static const String attendanceEndpoint =
      "$baseUrl/api/admin/attendance";

  // ============================================================
  // GET ALL ATTENDANCE
  // ============================================================

  static Future<List<Attendance>> getAttendance() async {
    try {
      final response = await http.get(
        Uri.parse(attendanceEndpoint),
        headers: {
          'Accept': 'application/json',
        },
      );

      print('GET ALL ATTENDANCE');
      print('Status: ${response.statusCode}');
      print('Response: ${response.body}');

      if (response.statusCode == 200) {
        return _parseAttendanceList(
          response.body,
        );
      }

      throw Exception(
        "Failed to load attendance. "
            "Status: ${response.statusCode}",
      );
    } catch (e) {
      throw Exception(
        "Unable to connect to attendance API: $e",
      );
    }
  }

  // ============================================================
  // GET ATTENDANCE BY DATE
  // ============================================================

  static Future<List<Attendance>> getAttendanceByDate(
      DateTime date,
      ) async {
    try {
      final formattedDate = _formatDate(date);

      // Backend:
      // GET /api/admin/attendance/date/{date}

      final uri = Uri.parse(
        "$attendanceEndpoint/date/$formattedDate",
      );

      print('========================================');
      print('GET ATTENDANCE BY DATE');
      print('Selected Date: $formattedDate');
      print('URL: $uri');
      print('========================================');

      final response = await http.get(
        uri,
        headers: {
          'Accept': 'application/json',
        },
      );

      print(
        'Status: ${response.statusCode}',
      );

      print(
        'Response: ${response.body}',
      );

      if (response.statusCode == 200) {
        return _parseAttendanceList(
          response.body,
        );
      }

      throw Exception(
        "Failed to load attendance for "
            "$formattedDate. "
            "Status: ${response.statusCode}\n"
            "${response.body}",
      );
    } catch (e) {
      throw Exception(
        "Unable to load attendance: $e",
      );
    }
  }

  // ============================================================
  // GET ATTENDANCE BY EMPLOYEE
  // ============================================================

  static Future<List<Attendance>>
  getAttendanceByEmployee(
      int employeeId,
      ) async {
    try {
      final uri = Uri.parse(
        "$attendanceEndpoint/employee/$employeeId",
      );

      final response = await http.get(
        uri,
        headers: {
          'Accept': 'application/json',
        },
      );

      print(
        'GET EMPLOYEE ATTENDANCE '
            '$employeeId',
      );

      print(
        'Status: ${response.statusCode}',
      );

      print(
        'Response: ${response.body}',
      );

      if (response.statusCode == 200) {
        return _parseAttendanceList(
          response.body,
        );
      }

      throw Exception(
        "Failed to load employee attendance. "
            "Status: ${response.statusCode}",
      );
    } catch (e) {
      throw Exception(
        "Unable to load employee attendance: $e",
      );
    }
  }

  // ============================================================
  // GET SINGLE ATTENDANCE
  // ============================================================

  static Future<Attendance> getAttendanceById(
      int id,
      ) async {
    try {
      final response = await http.get(
        Uri.parse(
          "$attendanceEndpoint/$id",
        ),
        headers: {
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return Attendance.fromJson(
          Map<String, dynamic>.from(
            jsonDecode(response.body),
          ),
        );
      }

      throw Exception(
        "Attendance not found. "
            "Status: ${response.statusCode}",
      );
    } catch (e) {
      throw Exception(
        "Unable to load attendance: $e",
      );
    }
  }

  // ============================================================
  // ADD ATTENDANCE
  // ============================================================

  static Future<Attendance> addAttendance(
      int employeeId,
      Attendance attendance,
      ) async {
    try {
      // Backend:
      // POST /api/admin/attendance/employee/{employeeId}

      final uri = Uri.parse(
        "$attendanceEndpoint/employee/$employeeId",
      );

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode(
          attendance.toJson(),
        ),
      );

      print('ADD ATTENDANCE');
      print('URL: $uri');
      print('Status: ${response.statusCode}');
      print('Response: ${response.body}');

      if (response.statusCode == 200 ||
          response.statusCode == 201) {
        return Attendance.fromJson(
          Map<String, dynamic>.from(
            jsonDecode(response.body),
          ),
        );
      }

      throw Exception(
        "Failed to add attendance. "
            "Status: ${response.statusCode}\n"
            "${response.body}",
      );
    } catch (e) {
      throw Exception(
        "Unable to add attendance: $e",
      );
    }
  }

  // ============================================================
  // UPDATE ATTENDANCE
  // ============================================================

  static Future<Attendance> updateAttendance(
      int attendanceId,
      int employeeId,
      Attendance attendance,
      ) async {
    try {
      // Backend:
      // PUT /api/admin/attendance/{attendanceId}/employee/{employeeId}

      final uri = Uri.parse(
        "$attendanceEndpoint/"
            "$attendanceId/employee/$employeeId",
      );

      final response = await http.put(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode(
          attendance.toJson(),
        ),
      );

      print('UPDATE ATTENDANCE');
      print('URL: $uri');
      print('Status: ${response.statusCode}');
      print('Response: ${response.body}');

      if (response.statusCode == 200) {
        return Attendance.fromJson(
          Map<String, dynamic>.from(
            jsonDecode(response.body),
          ),
        );
      }

      throw Exception(
        "Failed to update attendance. "
            "Status: ${response.statusCode}\n"
            "${response.body}",
      );
    } catch (e) {
      throw Exception(
        "Unable to update attendance: $e",
      );
    }
  }

  // ============================================================
  // DELETE ATTENDANCE
  // ============================================================

  static Future<bool> deleteAttendance(
      int id,
      ) async {
    try {
      final uri = Uri.parse(
        "$attendanceEndpoint/$id",
      );

      final response = await http.delete(
        uri,
        headers: {
          'Accept': 'application/json',
        },
      );

      print('DELETE ATTENDANCE');
      print('URL: $uri');
      print('Status: ${response.statusCode}');
      print('Response: ${response.body}');

      if (response.statusCode == 200 ||
          response.statusCode == 204) {
        return true;
      }

      throw Exception(
        "Failed to delete attendance. "
            "Status: ${response.statusCode}\n"
            "${response.body}",
      );
    } catch (e) {
      throw Exception(
        "Unable to delete attendance: $e",
      );
    }
  }

  // ============================================================
  // PARSE ATTENDANCE LIST
  // ============================================================

  static List<Attendance> _parseAttendanceList(
      String responseBody,
      ) {
    final dynamic decoded =
    jsonDecode(responseBody);

    if (decoded is! List) {
      throw Exception(
        "Invalid attendance response. "
            "Expected a list.",
      );
    }

    return decoded.map<Attendance>((json) {
      return Attendance.fromJson(
        Map<String, dynamic>.from(json),
      );
    }).toList();
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  static String _formatDate(
      DateTime date,
      ) {
    final year =
    date.year.toString().padLeft(4, '0');

    final month =
    date.month.toString().padLeft(2, '0');

    final day =
    date.day.toString().padLeft(2, '0');

    return '$year-$month-$day';
  }
}