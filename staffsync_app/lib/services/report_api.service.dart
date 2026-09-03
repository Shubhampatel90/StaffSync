// lib/services/report_api_service.dart
//
// Handles all Reports-module API calls for StaffSync.
// Mirrors the pattern used by employee_api_service.dart / attendance_api_service.dart.

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:file_saver/file_saver.dart';

class ReportApiService {
  // Update to match your backend host (see api_service.dart for the shared base URL).
  static const String baseUrl = 'http://192.168.1.8:8080/api/admin/reports';

  /// Employee-wise report: attendance history for one employee over a date range.
  static Future<List<Map<String, dynamic>>> getEmployeeReport({
    required int employeeId,
    required DateTime from,
    required DateTime to,
  }) async {
    final uri = Uri.parse('$baseUrl/employee/$employeeId').replace(
      queryParameters: {
        'from': _formatDate(from),
        'to': _formatDate(to),
      },
    );
    final response = await http.get(uri);
    return _decodeList(response, 'employee report');
  }

  /// Date-range report: all employees' attendance over a date range.
  static Future<List<Map<String, dynamic>>> getDateRangeReport({
    required DateTime from,
    required DateTime to,
  }) async {
    final uri = Uri.parse('$baseUrl/date-range').replace(
      queryParameters: {
        'from': _formatDate(from),
        'to': _formatDate(to),
      },
    );
    final response = await http.get(uri);
    return _decodeList(response, 'date-range report');
  }

  /// Monthly summary grid: one row per employee, one column per day.
  static Future<List<Map<String, dynamic>>> getMonthlySummary({
    required int month,
    required int year,
  }) async {
    final uri = Uri.parse('$baseUrl/monthly').replace(
      queryParameters: {
        'month': month.toString(),
        'year': year.toString(),
      },
    );
    final response = await http.get(uri);
    return _decodeList(response, 'monthly summary');
  }

  /// Downloads an export (csv / excel / pdf) for the given report type + params,
  /// and saves it to the device's Downloads location using file_saver.
  ///
  /// file_saver uses the Storage Access Framework / MediaStore on Android and
  /// the native save dialog / Files app on iOS and desktop, so it works
  /// correctly on Android 10+ without needing WRITE_EXTERNAL_STORAGE or
  /// requestLegacyExternalStorage (which are ignored / restricted on modern
  /// Android and were causing the "No permissions found in manifest" log and
  /// silent save failures with the old raw-File approach).
  ///
  /// Returns the saved file's path (or platform-specific identifier — on
  /// some Android versions this may be a content:// URI rather than a plain
  /// file path, since that's how scoped storage represents saved files).
  static Future<String> exportReport({
    required String format, // 'csv' | 'excel' | 'pdf'
    required String reportType, // 'employee' | 'date-range' | 'monthly'
    required Map<String, String> params,
  }) async {
    final uri = Uri.parse('$baseUrl/export/$format').replace(
      queryParameters: {
        'type': reportType,
        ...params,
      },
    );

    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to export report ($format): ${response.statusCode}');
    }

    final extension = format == 'excel' ? 'xlsx' : format;
    final fileName = 'staffsync_${reportType}_report_${DateTime.now().millisecondsSinceEpoch}';

    final mimeType = switch (format) {
      'csv' => MimeType.csv,
      'excel' => MimeType.microsoftExcel,
      'pdf' => MimeType.pdf,
      _ => MimeType.other,
    };

    final savedPath = await FileSaver.instance.saveFile(
      name: fileName,
      bytes: response.bodyBytes,
      fileExtension: extension,
      mimeType: mimeType,
    );

    return savedPath;
  }

  static List<Map<String, dynamic>> _decodeList(http.Response response, String label) {
    if (response.statusCode != 200) {
      throw Exception('Failed to load $label: ${response.statusCode}');
    }
    final decoded = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(decoded);
  }

  static String _formatDate(DateTime date) {
    return '${date.year.toString().padLeft(4, '0')}-'
        '${date.month.toString().padLeft(2, '0')}-'
        '${date.day.toString().padLeft(2, '0')}';
  }
}