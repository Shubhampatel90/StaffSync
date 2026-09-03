import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class AttendanceScreen extends StatefulWidget {
  final int employeeId;

  const AttendanceScreen({
    super.key,
    required this.employeeId,
  });

  @override
  State<AttendanceScreen> createState() =>
      _AttendanceScreenState();
}

class _AttendanceScreenState
    extends State<AttendanceScreen> {

  DateTime selectedMonth = DateTime.now();
  DateTime? selectedDate;

  bool isLoading = true;
  String? errorMessage;

  // ============================================================
  // STAFFSYNC COLORS
  // ============================================================

  static const Color navy = Color(0xFF0F2747);
  static const Color teal = Color(0xFF0D9488);
  static const Color blue = Color(0xFF2563EB);

  static const Color presentColor =
  Color(0xFF16A34A);

  static const Color halfDayColor =
  Color(0xFFF59E0B);

  static const Color leaveColor =
  Color(0xFF2563EB);

  static const Color absentColor =
  Color(0xFFDC2626);

  static const Color holidayColor =
  Color(0xFF64748B);

  static const Color lateColor =
  Color(0xFFF97316);

  // ============================================================
  // API
  // ============================================================

  final String baseUrl =
      "http://192.168.1.8:8080";

  // ============================================================
  // ATTENDANCE DATA
  // ============================================================

  final Map<String, Map<String, dynamic>> attendance =
  {};

  // ============================================================
  // INIT
  // ============================================================

  @override
  void initState() {
    super.initState();

    selectedMonth = DateTime.now();

    loadAttendance();
  }

  // ============================================================
  // LOAD ATTENDANCE
  // ============================================================

  Future<void> loadAttendance() async {

    if (mounted) {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });
    }

    try {

      final url =
          '$baseUrl/api/attendance/employee/${widget.employeeId}';

      debugPrint(
        'Loading attendance for employee: '
            '${widget.employeeId}',
      );

      debugPrint(
        'Attendance URL: $url',
      );

      final response = await http.get(
        Uri.parse(url),
      );

      debugPrint(
        'Attendance response: '
            '${response.statusCode}',
      );

      debugPrint(
        'Attendance body: '
            '${response.body}',
      );

      if (response.statusCode == 200) {

        final decoded =
        jsonDecode(response.body);

        if (decoded is! List) {
          throw Exception(
            'Invalid attendance response from server',
          );
        }

        attendance.clear();

        for (final item in decoded) {

          if (item is! Map<String, dynamic>) {
            continue;
          }

          final attendanceDate =
          item['attendanceDate']?.toString();

          if (attendanceDate == null ||
              attendanceDate.isEmpty) {
            continue;
          }

          attendance[attendanceDate] = {

            'id': item['id'],

            'attendanceDate':
            item['attendanceDate'],

            'punchIn':
            item['punchIn'],

            'punchOut':
            item['punchOut'],

            'status':
            normalizeStatus(
              item['status'],
            ),

            'remarks':
            item['remarks'],
          };
        }

        if (mounted) {
          setState(() {
            isLoading = false;
          });
        }

      } else {

        String message =
            'Failed to load attendance';

        try {

          final body =
          jsonDecode(response.body);

          if (body is String &&
              body.isNotEmpty) {
            message = body;
          }

          if (body is Map &&
              body['message'] != null) {
            message =
                body['message'].toString();
          }

        } catch (_) {}

        throw Exception(
          '$message '
              '(Status: ${response.statusCode})',
        );
      }

    } catch (e) {

      debugPrint(
        'Attendance error: $e',
      );

      if (mounted) {
        setState(() {

          isLoading = false;

          errorMessage =
              e.toString();

        });
      }
    }
  }

  // ============================================================
  // NORMALIZE STATUS
  // ============================================================

  String normalizeStatus(dynamic status) {

    if (status == null) {
      return '';
    }

    switch (
    status.toString().toUpperCase()) {

      case 'PRESENT':
        return 'present';

      case 'HALF_DAY':
      case 'HALFDAY':
        return 'halfday';

      case 'LEAVE':
        return 'leave';

      case 'ABSENT':
        return 'absent';

      case 'HOLIDAY':
        return 'holiday';

      case 'LATE':
        return 'late';

      default:
        return status
            .toString()
            .toLowerCase();
    }
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor:
      const Color(0xFFF8FAFC),

      appBar: AppBar(

        backgroundColor:
        Colors.white,

        elevation: 0,

        title: const Text(
          'Attendance',
          style: TextStyle(
            color: navy,
            fontWeight: FontWeight.bold,
          ),
        ),

        centerTitle: false,

        actions: [

          IconButton(
            onPressed:
            isLoading
                ? null
                : loadAttendance,

            icon: const Icon(
              Icons.refresh,
              color: navy,
            ),
          ),
        ],
      ),

      body: isLoading

          ? const Center(
        child:
        CircularProgressIndicator(),
      )

          : errorMessage != null

          ? buildError()

          : RefreshIndicator(

        onRefresh:
        loadAttendance,

        child:
        SingleChildScrollView(

          physics:
          const AlwaysScrollableScrollPhysics(),

          padding:
          const EdgeInsets.all(18),

          child: Column(

            crossAxisAlignment:
            CrossAxisAlignment.start,

            children: [

              buildMonthHeader(),

              const SizedBox(
                  height: 18),

              buildSummary(),

              const SizedBox(
                  height: 22),

              buildCalendar(),

              const SizedBox(
                  height: 22),

              buildLegend(),

              const SizedBox(
                  height: 22),

              if (selectedDate != null)
                buildSelectedDateDetails(),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  Widget buildError() {

    return Center(

      child: Padding(

        padding:
        const EdgeInsets.all(25),

        child: Column(

          mainAxisAlignment:
          MainAxisAlignment.center,

          children: [

            const Icon(
              Icons.cloud_off,
              size: 60,
              color: absentColor,
            ),

            const SizedBox(
                height: 15),

            const Text(
              'Unable to load attendance',
              style: TextStyle(
                fontSize: 18,
                fontWeight:
                FontWeight.bold,
                color: navy,
              ),
            ),

            const SizedBox(
                height: 8),

            Text(
              errorMessage ??
                  'Unknown error',

              textAlign:
              TextAlign.center,

              style: const TextStyle(
                color: Colors.grey,
                fontSize: 13,
              ),
            ),

            const SizedBox(
                height: 20),

            ElevatedButton.icon(

              onPressed:
              loadAttendance,

              icon:
              const Icon(Icons.refresh),

              label:
              const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // MONTH HEADER
  // ============================================================

  Widget buildMonthHeader() {

    final now = DateTime.now();

    final currentMonth =
    DateTime(
      now.year,
      now.month,
    );

    final isCurrentMonth =
        selectedMonth.year ==
            currentMonth.year &&
            selectedMonth.month ==
                currentMonth.month;

    return Container(

      padding:
      const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 14,
      ),

      decoration:
      BoxDecoration(
        color: Colors.white,
        borderRadius:
        BorderRadius.circular(18),
      ),

      child: Row(

        children: [

          IconButton(
            onPressed:
            previousMonth,

            icon: const Icon(
              Icons.chevron_left,
              color: navy,
            ),
          ),

          Expanded(

            child: Center(

              child: Text(

                '${monthName(selectedMonth.month)} '
                    '${selectedMonth.year}',

                style:
                const TextStyle(
                  fontSize: 19,
                  fontWeight:
                  FontWeight.bold,
                  color: navy,
                ),
              ),
            ),
          ),

          IconButton(

            onPressed:
            isCurrentMonth
                ? null
                : nextMonth,

            icon: Icon(

              Icons.chevron_right,

              color:
              isCurrentMonth
                  ? Colors.grey.shade300
                  : navy,
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // SUMMARY
  // ============================================================

  Widget buildSummary() {

    final present =
    countStatus('present');

    final late =
    countStatus('late');

    final halfDay =
    countStatus('halfday');

    final leave =
    countStatus('leave');

    final absent =
    countStatus('absent');

    return Row(

      children: [

        Expanded(
          child: summaryCard(
            'Present',
            present.toString(),
            presentColor,
            Icons.check_circle,
          ),
        ),

        const SizedBox(width: 6),

        Expanded(
          child: summaryCard(
            'Late',
            late.toString(),
            lateColor,
            Icons.schedule,
          ),
        ),

        const SizedBox(width: 6),

        Expanded(
          child: summaryCard(
            'Half Day',
            halfDay.toString(),
            halfDayColor,
            Icons.timelapse,
          ),
        ),

        const SizedBox(width: 6),

        Expanded(
          child: summaryCard(
            'Leave',
            leave.toString(),
            leaveColor,
            Icons.event_available,
          ),
        ),

        const SizedBox(width: 6),

        Expanded(
          child: summaryCard(
            'Absent',
            absent.toString(),
            absentColor,
            Icons.cancel,
          ),
        ),
      ],
    );
  }

  // ============================================================
  // SUMMARY CARD
  // ============================================================

  Widget summaryCard(
      String title,
      String value,
      Color color,
      IconData icon,
      ) {

    return Container(

      padding:
      const EdgeInsets.symmetric(
        vertical: 13,
        horizontal: 5,
      ),

      decoration:
      BoxDecoration(
        color: Colors.white,
        borderRadius:
        BorderRadius.circular(15),
      ),

      child: Column(

        children: [

          Icon(
            icon,
            color: color,
            size: 20,
          ),

          const SizedBox(height: 5),

          Text(
            value,
            style: TextStyle(
              color: color,
              fontWeight:
              FontWeight.bold,
              fontSize: 17,
            ),
          ),

          const SizedBox(height: 2),

          Text(
            title,
            style: const TextStyle(
              color: Colors.grey,
              fontSize: 9,
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // CALENDAR
  // ============================================================

  Widget buildCalendar() {

    final firstDay = DateTime(
      selectedMonth.year,
      selectedMonth.month,
      1,
    );

    final daysInMonth = DateTime(
      selectedMonth.year,
      selectedMonth.month + 1,
      0,
    ).day;

    final startingWeekday =
        firstDay.weekday;

    return Container(

      padding:
      const EdgeInsets.all(14),

      decoration:
      BoxDecoration(
        color: Colors.white,
        borderRadius:
        BorderRadius.circular(20),

        boxShadow: [

          BoxShadow(
            color:
            Colors.black.withOpacity(
              0.03,
            ),
            blurRadius: 10,
          ),
        ],
      ),

      child: Column(

        children: [

          Row(

            children: [

              calendarWeekDay('MON'),
              calendarWeekDay('TUE'),
              calendarWeekDay('WED'),
              calendarWeekDay('THU'),
              calendarWeekDay('FRI'),
              calendarWeekDay('SAT'),
              calendarWeekDay('SUN'),
            ],
          ),

          const SizedBox(
              height: 10),

          GridView.builder(

            shrinkWrap: true,

            physics:
            const NeverScrollableScrollPhysics(),

            itemCount:
            startingWeekday -
                1 +
                daysInMonth,

            gridDelegate:
            const SliverGridDelegateWithFixedCrossAxisCount(

              crossAxisCount: 7,

              mainAxisSpacing: 9,

              crossAxisSpacing: 5,

              childAspectRatio: 0.85,
            ),

            itemBuilder:
                (context, index) {

              if (index <
                  startingWeekday - 1) {

                return const SizedBox();
              }

              final day =
                  index -
                      startingWeekday +
                      2;

              final date =
              DateTime(
                selectedMonth.year,
                selectedMonth.month,
                day,
              );

              return buildCalendarDay(
                date,
              );
            },
          ),
        ],
      ),
    );
  }

  // ============================================================
  // WEEK DAY
  // ============================================================

  Widget calendarWeekDay(
      String text) {

    return Expanded(

      child: Center(

        child: Text(

          text,

          style:
          const TextStyle(
            color: Colors.grey,
            fontSize: 10,
            fontWeight:
            FontWeight.bold,
          ),
        ),
      ),
    );
  }

  // ============================================================
  // CALENDAR DAY
  // ============================================================

  Widget buildCalendarDay(
      DateTime date) {

    final key =
    dateKey(date);

    final record =
    attendance[key];

    final status =
    record?['status']
        ?.toString();

    final isSelected =
        selectedDate != null &&
            dateKey(
              selectedDate!,
            ) ==
                key;

    Color? statusColor;

    switch (status) {

      case 'present':
        statusColor =
            presentColor;
        break;

      case 'halfday':
        statusColor =
            halfDayColor;
        break;

      case 'leave':
        statusColor =
            leaveColor;
        break;

      case 'absent':
        statusColor =
            absentColor;
        break;

      case 'holiday':
        statusColor =
            holidayColor;
        break;

      case 'late':
        statusColor =
            lateColor;
        break;
    }

    return GestureDetector(

      onTap: () {

        setState(() {
          selectedDate = date;
        });
      },

      child: Container(

        decoration:
        BoxDecoration(

          color:
          statusColor
              ?.withOpacity(0.12),

          borderRadius:
          BorderRadius.circular(12),

          border:
          isSelected

              ? Border.all(
            color: navy,
            width: 2,
          )

              : Border.all(
            color:
            Colors.transparent,
          ),
        ),

        child: Column(

          mainAxisAlignment:
          MainAxisAlignment.center,

          children: [

            Text(

              '${date.day}',

              style:
              TextStyle(
                fontSize: 14,
                fontWeight:
                FontWeight.bold,

                color:
                statusColor ??
                    Colors.black87,
              ),
            ),

            const SizedBox(
                height: 5),

            if (statusColor != null)

              Container(

                height: 6,
                width: 6,

                decoration:
                BoxDecoration(
                  color:
                  statusColor,
                  shape:
                  BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // LEGEND
  // ============================================================

  Widget buildLegend() {

    return Container(

      padding:
      const EdgeInsets.all(16),

      decoration:
      BoxDecoration(
        color: Colors.white,
        borderRadius:
        BorderRadius.circular(18),
      ),

      child: Wrap(

        spacing: 18,
        runSpacing: 12,

        children: [

          legendItem(
            'Full Day',
            presentColor,
          ),

          legendItem(
            'Half Day',
            halfDayColor,
          ),

          legendItem(
            'Leave',
            leaveColor,
          ),

          legendItem(
            'Absent',
            absentColor,
          ),

          legendItem(
            'Holiday',
            holidayColor,
          ),

          legendItem(
            'Late',
            lateColor,
          ),
        ],
      ),
    );
  }

  // ============================================================
  // LEGEND ITEM
  // ============================================================

  Widget legendItem(
      String title,
      Color color,
      ) {

    return Row(

      mainAxisSize:
      MainAxisSize.min,

      children: [

        Container(

          height: 10,
          width: 10,

          decoration:
          BoxDecoration(
            color: color,
            shape:
            BoxShape.circle,
          ),
        ),

        const SizedBox(
            width: 7),

        Text(

          title,

          style:
          const TextStyle(
            fontSize: 11,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  // ============================================================
  // SELECTED DATE DETAILS
  // ============================================================

  Widget buildSelectedDateDetails() {

    final key =
    dateKey(selectedDate!);

    final record =
    attendance[key];

    final status =
        record?['status']
            ?.toString() ??
            '';

    final statusText =
    getStatusText(status);

    final statusColor =
    getStatusColor(status);

    final punchIn =
    formatTime(
      record?['punchIn'],
    );

    final punchOut =
    formatTime(
      record?['punchOut'],
    );

    // IMPORTANT:
    // First read backend working-hours remark.
    // If unavailable, calculate from punch times.

    final workingHours =
    getWorkingHoursFromRecord(
      record,
    );

    return Container(

      padding:
      const EdgeInsets.all(20),

      decoration:
      BoxDecoration(

        color: Colors.white,

        borderRadius:
        BorderRadius.circular(20),

        border: Border.all(
          color:
          statusColor.withOpacity(
            0.25,
          ),
        ),
      ),

      child: Column(

        crossAxisAlignment:
        CrossAxisAlignment.start,

        children: [

          Row(

            children: [

              Expanded(

                child: Column(

                  crossAxisAlignment:
                  CrossAxisAlignment.start,

                  children: [

                    const Text(
                      'Attendance Details',
                      style:
                      TextStyle(
                        fontSize: 17,
                        fontWeight:
                        FontWeight.bold,
                        color: navy,
                      ),
                    ),

                    const SizedBox(
                        height: 4),

                    Text(

                      '${selectedDate!.day} '
                          '${monthName(selectedDate!.month)} '
                          '${selectedDate!.year}',

                      style:
                      const TextStyle(
                        color: Colors.grey,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),

              Container(

                padding:
                const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 7,
                ),

                decoration:
                BoxDecoration(

                  color:
                  statusColor
                      .withOpacity(0.1),

                  borderRadius:
                  BorderRadius.circular(
                    20,
                  ),
                ),

                child: Text(

                  statusText,

                  style:
                  TextStyle(
                    color: statusColor,
                    fontWeight:
                    FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),

          const Divider(
              height: 28),

          Row(

            children: [

              Expanded(

                child: detailItem(
                  Icons.login,
                  'Punch In',
                  punchIn,
                  presentColor,
                ),
              ),

              Expanded(

                child: detailItem(
                  Icons.logout,
                  'Punch Out',
                  punchOut,
                  lateColor,
                ),
              ),

              Expanded(

                child: detailItem(
                  Icons.timer_outlined,
                  'Working',
                  workingHours,
                  blue,
                ),
              ),
            ],
          ),

          if (record?['remarks'] != null &&
              record!['remarks']
                  .toString()
                  .trim()
                  .isNotEmpty) ...[

            const SizedBox(
                height: 20),

            const Divider(),

            const SizedBox(
                height: 10),

            Text(

              'Remarks',

              style: TextStyle(
                color:
                Colors.grey.shade600,
                fontSize: 11,
              ),
            ),

            const SizedBox(
                height: 5),

            Text(

              record['remarks']
                  .toString(),

              style:
              const TextStyle(
                color: navy,
                fontWeight:
                FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ============================================================
  // WORKING HOURS FROM BACKEND RECORD
  // ============================================================

  String getWorkingHoursFromRecord(
      Map<String, dynamic>? record) {

    if (record == null) {
      return '--';
    }

    // ==========================================================
    // FIRST: READ BACKEND REMARKS
    // Example:
    // "Working hours: 8h 35m"
    // ==========================================================

    final remarks =
    record['remarks'];

    if (remarks != null) {

      final text =
      remarks.toString().trim();

      if (text.isNotEmpty) {

        final regex = RegExp(
          r'Working\s*hours\s*:\s*'
          r'(\d+)\s*h\s*'
          r'(\d+)\s*m',
          caseSensitive: false,
        );

        final match =
        regex.firstMatch(text);

        if (match != null) {

          final hours =
          match.group(1);

          final minutes =
          match.group(2);

          return '${hours}h ${minutes}m';
        }
      }
    }

    // ==========================================================
    // SECOND: CALCULATE FROM PUNCH IN / PUNCH OUT
    // ==========================================================

    return calculateWorkingHours(
      record['punchIn'],
      record['punchOut'],
    );
  }

  // ============================================================
  // WORKING HOURS CALCULATION
  // ============================================================

  String calculateWorkingHours(
      dynamic punchIn,
      dynamic punchOut,
      ) {

    if (punchIn == null ||
        punchOut == null) {

      return '--';
    }

    try {

      final inParts =
      punchIn.toString().split(':');

      final outParts =
      punchOut.toString().split(':');

      if (inParts.length < 2 ||
          outParts.length < 2) {

        return '--';
      }

      final inHour =
      int.parse(inParts[0]);

      final inMinute =
      int.parse(inParts[1]);

      final inSecond =
      inParts.length >= 3
          ? int.parse(
        inParts[2]
            .split('.')[0],
      )
          : 0;

      final outHour =
      int.parse(outParts[0]);

      final outMinute =
      int.parse(outParts[1]);

      final outSecond =
      outParts.length >= 3
          ? int.parse(
        outParts[2]
            .split('.')[0],
      )
          : 0;

      final startSeconds =
          inHour * 3600 +
              inMinute * 60 +
              inSecond;

      final endSeconds =
          outHour * 3600 +
              outMinute * 60 +
              outSecond;

      int difference =
          endSeconds -
              startSeconds;

      // ========================================================
      // OVERNIGHT SHIFT
      // ========================================================

      if (difference < 0) {

        difference +=
            24 * 60 * 60;
      }

      final hours =
          difference ~/ 3600;

      final minutes =
          (difference % 3600) ~/ 60;

      return '${hours}h ${minutes}m';

    } catch (e) {

      debugPrint(
        'Working hours calculation error: $e',
      );

      return '--';
    }
  }

  // ============================================================
  // DETAIL ITEM
  // ============================================================

  Widget detailItem(
      IconData icon,
      String title,
      String value,
      Color color,
      ) {

    return Column(

      children: [

        Icon(
          icon,
          color: color,
          size: 21,
        ),

        const SizedBox(
            height: 7),

        Text(
          title,
          style:
          const TextStyle(
            color: Colors.grey,
            fontSize: 10,
          ),
        ),

        const SizedBox(
            height: 3),

        Text(

          value,

          textAlign:
          TextAlign.center,

          style:
          const TextStyle(
            fontSize: 12,
            fontWeight:
            FontWeight.bold,
          ),
        ),
      ],
    );
  }

  // ============================================================
  // MONTH NAVIGATION
  // ============================================================

  void previousMonth() {

    setState(() {

      selectedMonth =
          DateTime(
            selectedMonth.year,
            selectedMonth.month - 1,
          );

      selectedDate = null;
    });
  }

  void nextMonth() {

    final now =
    DateTime.now();

    final currentMonth =
    DateTime(
      now.year,
      now.month,
    );

    final nextMonthDate =
    DateTime(
      selectedMonth.year,
      selectedMonth.month + 1,
    );

    if (nextMonthDate
        .isAfter(currentMonth)) {

      return;
    }

    setState(() {

      selectedMonth =
          nextMonthDate;

      selectedDate = null;
    });
  }

  // ============================================================
  // DATE KEY
  // ============================================================

  String dateKey(
      DateTime date) {

    return '${date.year}-'
        '${date.month.toString().padLeft(2, '0')}-'
        '${date.day.toString().padLeft(2, '0')}';
  }

  // ============================================================
  // COUNT STATUS
  // ============================================================

  int countStatus(
      String status) {

    int count = 0;

    attendance.forEach(
          (key, value) {

        try {

          final date =
          DateTime.parse(key);

          if (date.year ==
              selectedMonth.year &&
              date.month ==
                  selectedMonth.month &&
              value['status'] ==
                  status) {

            count++;
          }

        } catch (_) {}
      },
    );

    return count;
  }

  // ============================================================
  // STATUS TEXT
  // ============================================================

  String getStatusText(
      String status) {

    switch (status) {

      case 'present':
        return 'Full Day';

      case 'halfday':
        return 'Half Day';

      case 'leave':
        return 'Leave';

      case 'absent':
        return 'Absent';

      case 'holiday':
        return 'Holiday';

      case 'late':
        return 'Late';

      default:
        return 'No Record';
    }
  }

  // ============================================================
  // STATUS COLOR
  // ============================================================

  Color getStatusColor(
      String status) {

    switch (status) {

      case 'present':
        return presentColor;

      case 'halfday':
        return halfDayColor;

      case 'leave':
        return leaveColor;

      case 'absent':
        return absentColor;

      case 'holiday':
        return holidayColor;

      case 'late':
        return lateColor;

      default:
        return Colors.grey;
    }
  }

  // ============================================================
  // FORMAT TIME
  // ============================================================

  String formatTime(
      dynamic time) {

    if (time == null ||
        time.toString().trim().isEmpty) {

      return '--:--';
    }

    try {

      final parts =
      time.toString().split(':');

      if (parts.length < 2) {
        return time.toString();
      }

      int hour =
      int.parse(parts[0]);

      final minute =
      int.parse(parts[1]);

      final period =
      hour >= 12
          ? 'PM'
          : 'AM';

      final displayHour =
      hour % 12 == 0
          ? 12
          : hour % 12;

      return '${displayHour.toString().padLeft(2, '0')}:'
          '${minute.toString().padLeft(2, '0')} '
          '$period';

    } catch (_) {

      return time.toString();
    }
  }

  // ============================================================
  // MONTH NAME
  // ============================================================

  String monthName(
      int month) {

    const months = [

      '',

      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return months[month];
  }
}