class Attendance {
  final int? id;
  final int employeeId;
  final String? employeeName;
  final DateTime date;
  final String? checkIn;
  final String? checkOut;
  final String status;

  Attendance({
    this.id,
    required this.employeeId,
    this.employeeName,
    required this.date,
    this.checkIn,
    this.checkOut,
    required this.status,
  });

  // ============================================================
  // JSON -> ATTENDANCE
  // ============================================================

  factory Attendance.fromJson(Map<String, dynamic> json) {
    // ----------------------------------------------------------
    // Spring Boot returns employee as nested object
    //
    // "employee": {
    //     "id": 101,
    //     "fullName": "Rahul Sharma"
    // }
    // ----------------------------------------------------------

    final dynamic employeeData = json['employee'];

    int employeeId = 0;
    String? employeeName;

    if (employeeData is Map) {
      employeeId = int.tryParse(
        employeeData['id']?.toString() ?? '',
      ) ??
          0;

      employeeName =
          employeeData['fullName']?.toString();
    }

    // ----------------------------------------------------------
    // Also support employeeId / employeeName directly
    // ----------------------------------------------------------

    if (employeeId == 0) {
      employeeId = int.tryParse(
        json['employeeId']?.toString() ?? '',
      ) ??
          0;
    }

    employeeName ??=
        json['employeeName']?.toString();

    return Attendance(
      id: json['id'] != null
          ? int.tryParse(
        json['id'].toString(),
      )
          : null,

      employeeId: employeeId,

      employeeName: employeeName,

      // Spring Boot field = attendanceDate
      date: DateTime.tryParse(
        json['attendanceDate']?.toString() ??
            json['date']?.toString() ??
            '',
      ) ??
          DateTime.now(),

      // Spring Boot field = punchIn
      checkIn: _normalizeTime(
        json['punchIn'] ?? json['checkIn'],
      ),

      // Spring Boot field = punchOut
      checkOut: _normalizeTime(
        json['punchOut'] ?? json['checkOut'],
      ),

      status:
      json['status']?.toString().toUpperCase() ??
          'ABSENT',
    );
  }

  // ============================================================
  // NORMALIZE TIME
  // ============================================================

  static String? _normalizeTime(dynamic value) {
    if (value == null) {
      return null;
    }

    final String time = value.toString().trim();

    if (time.isEmpty) {
      return null;
    }

    return time;
  }

  // ============================================================
  // FORMATTED CHECK IN
  // ============================================================

  String get formattedCheckIn {
    if (checkIn == null || checkIn!.isEmpty) {
      return '--';
    }

    return _formatTime(checkIn!);
  }

  // ============================================================
  // FORMATTED CHECK OUT
  // ============================================================

  String get formattedCheckOut {
    if (checkOut == null || checkOut!.isEmpty) {
      return '--';
    }

    return _formatTime(checkOut!);
  }

  // ============================================================
  // FORMAT TIME
  // ============================================================

  String _formatTime(String value) {
    try {
      final parts = value.split(':');

      if (parts.length < 2) {
        return value;
      }

      int hour = int.parse(parts[0]);
      final int minute = int.parse(parts[1]);

      final String period =
      hour >= 12 ? 'PM' : 'AM';

      hour = hour % 12;

      if (hour == 0) {
        hour = 12;
      }

      return '$hour:${minute.toString().padLeft(2, '0')} $period';
    } catch (_) {
      return value;
    }
  }

  // ============================================================
  // ATTENDANCE -> JSON
  // ============================================================

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,

      // Spring Boot expects attendanceDate
      'attendanceDate': _formatDateForApi(date),

      // Spring Boot expects punchIn
      'punchIn': checkIn,

      // Spring Boot expects punchOut
      'punchOut': checkOut,

      'status': status,
    };
  }

  // ============================================================
  // DATE FORMAT
  // ============================================================

  String _formatDateForApi(DateTime value) {
    return '${value.year.toString().padLeft(4, '0')}-'
        '${value.month.toString().padLeft(2, '0')}-'
        '${value.day.toString().padLeft(2, '0')}';
  }
}