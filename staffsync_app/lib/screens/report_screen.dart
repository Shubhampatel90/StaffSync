import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ReportScreen extends StatefulWidget {
  final int employeeId;

  const ReportScreen({
    super.key,
    required this.employeeId,
  });

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  // ============================================================
  // COLORS
  // ============================================================

  static const Color navy = Color(0xFF0F2747);
  static const Color blue = Color(0xFF2563EB);
  static const Color green = Color(0xFF16A34A);
  static const Color red = Color(0xFFDC2626);
  static const Color orange = Color(0xFFF59E0B);

  // ============================================================
  // API
  // ============================================================

  final String baseUrl = "http://192.168.1.8:8080";

  // ============================================================
  // STATE
  // ============================================================

  bool isLoading = true;
  String? errorMessage;

  List<dynamic> attendanceRecords = [];

  int presentDays = 0;
  int halfDays = 0;
  int absentDays = 0;
  int leaveDays = 0;

  Duration totalWorkingTime = Duration.zero;

  // ============================================================
  // INIT
  // ============================================================

  @override
  void initState() {
    super.initState();

    loadAttendanceReport();
  }

  // ============================================================
  // LOAD DATA FROM DATABASE
  // ============================================================

  Future<void> loadAttendanceReport() async {
    if (!mounted) return;

    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final response = await http.get(
        Uri.parse(
          '$baseUrl/api/attendance/employee/${widget.employeeId}',
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data =
        jsonDecode(response.body);

        calculateReport(data);

        if (!mounted) return;

        setState(() {
          attendanceRecords = data;
          isLoading = false;
        });
      } else {
        throw Exception(
          'Server returned status ${response.statusCode}',
        );
      }
    } catch (e) {
      if (!mounted) return;

      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  // ============================================================
  // CALCULATE REPORT
  // ============================================================

  void calculateReport(List<dynamic> records) {
    int present = 0;
    int halfDay = 0;
    int absent = 0;
    int leave = 0;

    Duration workingTime = Duration.zero;

    for (final record in records) {
      final String status =
          record['status']
              ?.toString()
              .toUpperCase() ??
              '';

      switch (status) {
        case 'PRESENT':
          present++;
          break;

        case 'HALF_DAY':
        case 'HALFDAY':
          halfDay++;
          break;

        case 'ABSENT':
          absent++;
          break;

        case 'LEAVE':
          leave++;
          break;
      }

      workingTime += calculateWorkingTime(
        record['punchIn'],
        record['punchOut'],
      );
    }

    setState(() {
      presentDays = present;
      halfDays = halfDay;
      absentDays = absent;
      leaveDays = leave;
      totalWorkingTime = workingTime;
    });
  }

  // ============================================================
  // CALCULATE WORKING TIME
  // ============================================================

  Duration calculateWorkingTime(
      dynamic punchIn,
      dynamic punchOut,
      ) {
    if (punchIn == null ||
        punchOut == null) {
      return Duration.zero;
    }

    try {
      final inParts =
      punchIn.toString().split(':');

      final outParts =
      punchOut.toString().split(':');

      final int inHour =
      int.parse(inParts[0]);

      final int inMinute =
      int.parse(inParts[1]);

      final int outHour =
      int.parse(outParts[0]);

      final int outMinute =
      int.parse(outParts[1]);

      int startMinutes =
          inHour * 60 + inMinute;

      int endMinutes =
          outHour * 60 + outMinute;

      int difference =
          endMinutes - startMinutes;

      // Handles night shift
      if (difference < 0) {
        difference += 24 * 60;
      }

      return Duration(
        minutes: difference,
      );
    } catch (_) {
      return Duration.zero;
    }
  }

  // ============================================================
  // ATTENDANCE PERCENTAGE
  // ============================================================

  double getAttendancePercentage() {
    final int totalWorkingDays =
        presentDays +
            halfDays +
            absentDays +
            leaveDays;

    if (totalWorkingDays == 0) {
      return 0;
    }

    // Full day = 1
    // Half day = 0.5
    final double attendedDays =
        presentDays +
            (halfDays * 0.5);

    return (attendedDays /
        totalWorkingDays) *
        100;
  }

  // ============================================================
  // TOTAL WORKING HOURS
  // ============================================================

  String getTotalWorkingHours() {
    final int hours =
        totalWorkingTime.inHours;

    final int minutes =
    totalWorkingTime.inMinutes
        .remainder(60);

    return '${hours}h ${minutes}m';
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:
      const Color(0xFFF5F7FB),

      appBar: AppBar(
        title: const Text(
          'Attendance Reports',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: navy,
          ),
        ),

        backgroundColor:
        Colors.white,

        elevation: 0,

        actions: [
          IconButton(
            onPressed:
            isLoading
                ? null
                : loadAttendanceReport,
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
        loadAttendanceReport,

        child:
        SingleChildScrollView(
          physics:
          const AlwaysScrollableScrollPhysics(),

          padding:
          const EdgeInsets.all(
            20,
          ),

          child: Column(
            children: [
              // EMPLOYEE ID
              buildEmployeeCard(),

              const SizedBox(
                height: 15,
              ),

              // ATTENDANCE %
              reportCard(
                'Attendance Percentage',
                '${getAttendancePercentage().toStringAsFixed(1)}%',
                Icons.percent,
                blue,
              ),

              const SizedBox(
                height: 15,
              ),

              // PRESENT
              reportCard(
                'Present Days',
                presentDays.toString(),
                Icons
                    .check_circle_outline,
                green,
              ),

              const SizedBox(
                height: 15,
              ),

              // HALF DAY
              reportCard(
                'Half Days',
                halfDays.toString(),
                Icons
                    .timelapse,
                orange,
              ),

              const SizedBox(
                height: 15,
              ),

              // ABSENT
              reportCard(
                'Absent Days',
                absentDays.toString(),
                Icons
                    .cancel_outlined,
                red,
              ),

              const SizedBox(
                height: 15,
              ),

              // LEAVE
              reportCard(
                'Leave Days',
                leaveDays.toString(),
                Icons
                    .event_available,
                blue,
              ),

              const SizedBox(
                height: 15,
              ),

              // TOTAL RECORDS
              reportCard(
                'Total Attendance Records',
                attendanceRecords
                    .length
                    .toString(),
                Icons
                    .calendar_month,
                navy,
              ),

              const SizedBox(
                height: 15,
              ),

              // TOTAL WORKING HOURS
              reportCard(
                'Total Working Hours',
                getTotalWorkingHours(),
                Icons
                    .access_time,
                blue,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================
  // EMPLOYEE CARD
  // ============================================================

  Widget buildEmployeeCard() {
    return Container(
      width: double.infinity,

      padding:
      const EdgeInsets.all(18),

      decoration: BoxDecoration(
        color: Colors.white,

        borderRadius:
        BorderRadius.circular(18),
      ),

      child: Row(
        children: [
          Container(
            height: 50,
            width: 50,

            decoration: BoxDecoration(
              color:
              const Color(0xFFEFF6FF),

              borderRadius:
              BorderRadius.circular(
                14,
              ),
            ),

            child: const Icon(
              Icons.person,
              color: blue,
              size: 28,
            ),
          ),

          const SizedBox(width: 15),

          Expanded(
            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment.start,

              children: [
                const Text(
                  'Employee Attendance',

                  style: TextStyle(
                    fontSize: 16,
                    fontWeight:
                    FontWeight.bold,
                    color: navy,
                  ),
                ),

                const SizedBox(height: 5),

                Text(
                  'Employee ID: ${widget.employeeId}',

                  style:
                  const TextStyle(
                    color: Colors.grey,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // REPORT CARD
  // ============================================================

  Widget reportCard(
      String title,
      String value,
      IconData icon,
      Color iconColor,
      ) {
    return Container(
      width: double.infinity,

      padding:
      const EdgeInsets.all(20),

      decoration: BoxDecoration(
        color: Colors.white,

        borderRadius:
        BorderRadius.circular(18),
      ),

      child: Row(
        children: [
          Container(
            height: 50,
            width: 50,

            decoration: BoxDecoration(
              color: iconColor
                  .withOpacity(0.1),

              borderRadius:
              BorderRadius.circular(
                14,
              ),
            ),

            child: Icon(
              icon,
              color: iconColor,
            ),
          ),

          const SizedBox(width: 15),

          Expanded(
            child: Text(
              title,

              style:
              const TextStyle(
                fontWeight:
                FontWeight.w600,
                color: Colors.black87,
              ),
            ),
          ),

          Text(
            value,

            style: TextStyle(
              fontSize: 20,
              fontWeight:
              FontWeight.bold,
              color: iconColor,
            ),
          ),
        ],
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
              color: red,
            ),

            const SizedBox(
              height: 15,
            ),

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
              height: 10,
            ),

            Text(
              errorMessage ??
                  'Unknown error',

              textAlign:
              TextAlign.center,

              style:
              const TextStyle(
                color: Colors.grey,
                fontSize: 13,
              ),
            ),

            const SizedBox(
              height: 20,
            ),

            ElevatedButton.icon(
              onPressed:
              loadAttendanceReport,

              icon: const Icon(
                Icons.refresh,
              ),

              label:
              const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}