import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'attendance_screen.dart';
import 'profile_screen.dart';
import 'report_screen.dart';
import '../services/api_service.dart';

class HomePage extends StatefulWidget {
  // ============================================================
  // DYNAMIC EMPLOYEE ID
  // ============================================================

  final int employeeId;

  const HomePage({
    super.key,
    required this.employeeId,
  });

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  // ============================================================
  // COLORS
  // ============================================================

  static const Color navy = Color(0xFF0F2747);
  static const Color teal = Color(0xFF0D9488);
  static const Color blue = Color(0xFF2563EB);
  static const Color background = Color(0xFFF8FAFC);
  static const Color darkText = Color(0xFF1F2937);

  // ============================================================
  // API
  // ============================================================

  final String baseUrl = "http://192.168.1.8:8080";

  // ============================================================
  // ATTENDANCE STATE
  // ============================================================

  bool isPunchedIn = false;
  bool isPunching = false;

  DateTime? punchInTime;
  DateTime? punchOutTime;

  // ============================================================
  // NAVIGATION
  // ============================================================

  int selectedIndex = 0;

  // ============================================================
  // SWIPE
  // ============================================================

  double swipePosition = 0.0;

  // ============================================================
  // TIME / GREETING
  // ============================================================

  String greeting = 'Good Morning 👋';
  String currentTime = '';

  Timer? timer;

  // ============================================================
  // LIFECYCLE
  // ============================================================

  @override
  void initState() {
    super.initState();

    debugPrint(
      'HomePage Employee ID: ${widget.employeeId}',
    );

    updateTime();
    checkServer();
    loadTodayAttendance();

    timer = Timer.periodic(
      const Duration(seconds: 1),
          (_) {
        updateTime();
      },
    );
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  // ============================================================
  // CURRENT TIME
  // ============================================================

  void updateTime() {
    final now = DateTime.now();

    final int hour = now.hour == 0
        ? 12
        : now.hour > 12
        ? now.hour - 12
        : now.hour;

    final String newGreeting;

    if (now.hour >= 5 && now.hour < 12) {
      newGreeting = 'Good Morning 👋';
    } else if (now.hour >= 12 && now.hour < 17) {
      newGreeting = 'Good Afternoon ☀️';
    } else if (now.hour >= 17 && now.hour < 21) {
      newGreeting = 'Good Evening 🌆';
    } else {
      newGreeting = 'Good Night 🌙';
    }

    if (!mounted) return;

    setState(() {
      currentTime =
      '$hour:${now.minute.toString().padLeft(2, '0')}:'
          '${now.second.toString().padLeft(2, '0')} '
          '${now.hour >= 12 ? 'PM' : 'AM'}';

      greeting = newGreeting;
    });
  }

  // ============================================================
  // CHECK SERVER
  // ============================================================

  Future<void> checkServer() async {
    try {
      final String result = await ApiService.healthCheck();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      debugPrint(
        'Health Check Error: $e',
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Unable to connect to StaffSync API',
          ),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  // ============================================================
  // LOAD TODAY'S ATTENDANCE
  // ============================================================

  Future<void> loadTodayAttendance() async {
    try {
      debugPrint(
        'Loading attendance for employee: '
            '${widget.employeeId}',
      );

      final response = await http.get(
        Uri.parse(
          '$baseUrl/api/attendance/employee/${widget.employeeId}',
        ),
        headers: {
          'Accept': 'application/json',
        },
      );

      debugPrint(
        'Attendance GET Status: ${response.statusCode}',
      );

      debugPrint(
        'Attendance GET Response: ${response.body}',
      );

      if (response.statusCode != 200) {
        return;
      }

      final dynamic decoded =
      jsonDecode(response.body);

      if (decoded is! List) {
        return;
      }

      final List<dynamic> data = decoded;

      final DateTime today = DateTime.now();

      final String todayKey =
          '${today.year}-'
          '${today.month.toString().padLeft(2, '0')}-'
          '${today.day.toString().padLeft(2, '0')}';

      Map<String, dynamic>? todayRecord;

      for (final item in data) {
        if (item is! Map) {
          continue;
        }

        final String? attendanceDate =
        item['attendanceDate']?.toString();

        if (attendanceDate == todayKey) {
          todayRecord =
          Map<String, dynamic>.from(item);
          break;
        }
      }

      // No attendance today
      if (todayRecord == null) {
        if (!mounted) return;

        setState(() {
          isPunchedIn = false;
          punchInTime = null;
          punchOutTime = null;
        });

        return;
      }

      final String? punchIn =
      todayRecord['punchIn']?.toString();

      final String? punchOut =
      todayRecord['punchOut']?.toString();

      if (!mounted) return;

      setState(() {
        punchInTime =
            parseBackendTime(punchIn);

        punchOutTime =
            parseBackendTime(punchOut);

        isPunchedIn =
            punchIn != null &&
                punchIn.isNotEmpty &&
                (punchOut == null ||
                    punchOut.isEmpty);
      });

      debugPrint(
        'Today Punch In: $punchIn',
      );

      debugPrint(
        'Today Punch Out: $punchOut',
      );
    } catch (e) {
      debugPrint(
        'Load Today Attendance Error: $e',
      );
    }
  }

  // ============================================================
  // PUNCH ATTENDANCE
  // ============================================================

  Future<void> punchAttendance() async {
    if (isPunching) {
      return;
    }

    if (!isPunchedIn) {
      await punchIn();
    } else {
      await punchOut();
    }
  }

  // ============================================================
  // PUNCH IN
  // ============================================================

  Future<void> punchIn() async {
    if (isPunching) {
      return;
    }

    setState(() {
      isPunching = true;
    });

    try {
      debugPrint(
        '================================',
      );

      debugPrint(
        'PUNCH IN',
      );

      debugPrint(
        'Employee ID: ${widget.employeeId}',
      );

      final response = await http.post(
        Uri.parse(
          '$baseUrl/api/attendance/punch-in/${widget.employeeId}',
        ),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      );

      debugPrint(
        'Punch In Status: ${response.statusCode}',
      );

      debugPrint(
        'Punch In Response: ${response.body}',
      );

      if (response.statusCode == 200) {
        final dynamic decoded =
        jsonDecode(response.body);

        if (decoded is Map) {
          final String? backendPunchIn =
          decoded['punchIn']?.toString();

          final String? backendPunchOut =
          decoded['punchOut']?.toString();

          if (!mounted) return;

          setState(() {
            isPunchedIn = true;

            punchInTime =
                parseBackendTime(
                  backendPunchIn,
                );

            punchOutTime =
                parseBackendTime(
                  backendPunchOut,
                );
          });

          showMessage(
            'Punch In successful at '
                '${formatBackendTime(backendPunchIn)}',
            teal,
          );
        } else {
          await loadTodayAttendance();

          showMessage(
            'Punch In successful!',
            teal,
          );
        }
      } else {
        showApiError(
          response,
          'Punch In failed',
        );
      }
    } catch (e) {
      debugPrint(
        'Punch In Error: $e',
      );

      showMessage(
        'Unable to connect to StaffSync API',
        Colors.red,
      );
    } finally {
      if (mounted) {
        setState(() {
          isPunching = false;
        });
      }
    }
  }

  // ============================================================
  // PUNCH OUT
  // ============================================================

  Future<void> punchOut() async {
    if (isPunching) {
      return;
    }

    setState(() {
      isPunching = true;
    });

    try {
      debugPrint(
        '================================',
      );

      debugPrint(
        'PUNCH OUT',
      );

      debugPrint(
        'Employee ID: ${widget.employeeId}',
      );

      final response = await http.post(
        Uri.parse(
          '$baseUrl/api/attendance/punch-out/${widget.employeeId}',
        ),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      );

      debugPrint(
        'Punch Out Status: ${response.statusCode}',
      );

      debugPrint(
        'Punch Out Response: ${response.body}',
      );

      if (response.statusCode == 200) {
        final dynamic decoded =
        jsonDecode(response.body);

        if (decoded is Map) {
          final String? backendPunchIn =
          decoded['punchIn']?.toString();

          final String? backendPunchOut =
          decoded['punchOut']?.toString();

          if (!mounted) return;

          setState(() {
            isPunchedIn = false;

            punchInTime =
                parseBackendTime(
                  backendPunchIn,
                );

            punchOutTime =
                parseBackendTime(
                  backendPunchOut,
                );
          });

          showMessage(
            'Punch Out successful at '
                '${formatBackendTime(backendPunchOut)}',
            teal,
          );
        } else {
          await loadTodayAttendance();

          showMessage(
            'Punch Out successful!',
            teal,
          );
        }
      } else {
        showApiError(
          response,
          'Punch Out failed',
        );
      }
    } catch (e) {
      debugPrint(
        'Punch Out Error: $e',
      );

      showMessage(
        'Unable to connect to StaffSync API',
        Colors.red,
      );
    } finally {
      if (mounted) {
        setState(() {
          isPunching = false;
        });
      }
    }
  }

  // ============================================================
  // API ERROR
  // ============================================================

  void showApiError(
      http.Response response,
      String defaultMessage,
      ) {
    String message = defaultMessage;

    try {
      final dynamic decoded =
      jsonDecode(response.body);

      if (decoded is String) {
        message = decoded;
      } else if (decoded is Map) {
        message =
            decoded['message']?.toString() ??
                decoded['error']?.toString() ??
                decoded.toString();
      }
    } catch (_) {
      if (response.body.isNotEmpty) {
        message = response.body;
      }
    }

    showMessage(
      message,
      Colors.red,
    );
  }

  // ============================================================
  // BACKEND TIME → DATETIME
  // ============================================================

  DateTime? parseBackendTime(String? time) {
    if (time == null || time.isEmpty) {
      return null;
    }

    try {
      final parts = time.split(':');

      final int hour =
      int.parse(parts[0]);

      final int minute =
      int.parse(parts[1]);

      final int second =
      parts.length > 2
          ? int.parse(parts[2])
          : 0;

      final now = DateTime.now();

      return DateTime(
        now.year,
        now.month,
        now.day,
        hour,
        minute,
        second,
      );
    } catch (_) {
      return null;
    }
  }

  // ============================================================
  // BACKEND TIME FORMAT
  // ============================================================

  String formatBackendTime(String? time) {
    if (time == null || time.isEmpty) {
      return '--:--';
    }

    try {
      final parts = time.split(':');

      int hour =
      int.parse(parts[0]);

      final int minute =
      int.parse(parts[1]);

      final String period =
      hour >= 12 ? 'PM' : 'AM';

      hour = hour % 12;

      if (hour == 0) {
        hour = 12;
      }

      return '$hour:'
          '${minute.toString().padLeft(2, '0')} '
          '$period';
    } catch (_) {
      return time;
    }
  }

  // ============================================================
  // SNACKBAR
  // ============================================================

  void showMessage(
      String message,
      Color color,
      ) {
    if (!mounted) return;

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
          backgroundColor: color,
          duration: const Duration(seconds: 3),
        ),
      );
  }

  // ============================================================
  // FORMAT DATETIME
  // ============================================================

  String formatTime(DateTime? time) {
    if (time == null) {
      return '--:--';
    }

    final int hour = time.hour == 0
        ? 12
        : time.hour > 12
        ? time.hour - 12
        : time.hour;

    final String minute =
    time.minute.toString().padLeft(2, '0');

    final String period =
    time.hour >= 12 ? 'PM' : 'AM';

    return '$hour:$minute $period';
  }

  // ============================================================
  // WORKING HOURS
  // ============================================================

  String getWorkingHours() {
    if (punchInTime == null) {
      return '00:00';
    }

    final DateTime endTime =
        punchOutTime ?? DateTime.now();

    final Duration difference =
    endTime.difference(
      punchInTime!,
    );

    if (difference.isNegative) {
      return '00:00';
    }

    final int hours =
        difference.inHours;

    final int minutes =
    difference.inMinutes.remainder(60);

    return '${hours.toString().padLeft(2, '0')}:'
        '${minutes.toString().padLeft(2, '0')}';
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: background,

      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'StaffSync Employee',
          style: TextStyle(
            color: navy,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      // ========================================================
      // BODY
      // ========================================================

      body: SafeArea(
        child: IndexedStack(
          index: selectedIndex,

          children: [
            buildHomePage(),

            // ==================================================
            // DYNAMIC EMPLOYEE ID
            // ==================================================

            AttendanceScreen(
              employeeId: widget.employeeId,
            ),

            ReportScreen(
              employeeId: widget.employeeId,
            ),

            ProfileScreen(
              employeeId: widget.employeeId,
            )
          ],
        ),
      ),

      // ========================================================
      // BOTTOM NAVIGATION
      // ========================================================

      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,

        onDestinationSelected: (index) {
          setState(() {
            selectedIndex = index;
          });
        },

        backgroundColor: Colors.white,

        indicatorColor:
        const Color(0xFFDDF7F4),

        destinations: const [
          NavigationDestination(
            icon: Icon(
              Icons.home_outlined,
            ),
            selectedIcon: Icon(
              Icons.home,
              color: teal,
            ),
            label: 'Home',
          ),

          NavigationDestination(
            icon: Icon(
              Icons.access_time_outlined,
            ),
            selectedIcon: Icon(
              Icons.access_time_filled,
              color: teal,
            ),
            label: 'Attendance',
          ),

          NavigationDestination(
            icon: Icon(
              Icons.bar_chart_outlined,
            ),
            selectedIcon: Icon(
              Icons.bar_chart,
              color: teal,
            ),
            label: 'Reports',
          ),

          NavigationDestination(
            icon: Icon(
              Icons.person_outline,
            ),
            selectedIcon: Icon(
              Icons.person,
              color: teal,
            ),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  // ============================================================
  // SWIPE PUNCH BUTTON
  // ============================================================

  Widget buildSwipePunchButton() {
    return LayoutBuilder(
      builder: (context, constraints) {
        const double buttonHeight = 68;
        const double iconSize = 56;
        const double horizontalPadding = 6;

        final double maxSwipe =
        (constraints.maxWidth -
            iconSize -
            (horizontalPadding * 2))
            .clamp(
          0.0,
          double.infinity,
        );

        return Container(
          height: buttonHeight,
          width: double.infinity,

          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius:
            BorderRadius.circular(35),
          ),

          child: Stack(
            children: [
              // ==================================================
              // TEXT
              // ==================================================

              Center(
                child: AnimatedOpacity(
                  duration:
                  const Duration(
                    milliseconds: 100,
                  ),

                  opacity:
                  maxSwipe == 0
                      ? 1.0
                      : swipePosition >
                      maxSwipe * 0.25
                      ? 0.3
                      : 1.0,

                  child: Text(
                    isPunching
                        ? 'Processing...'
                        : isPunchedIn
                        ? 'Slide to Punch Out'
                        : 'Slide to Punch In',

                    style: const TextStyle(
                      color: navy,
                      fontSize: 15,
                      fontWeight:
                      FontWeight.bold,
                    ),
                  ),
                ),
              ),

              // ==================================================
              // SLIDING ICON
              // ==================================================

              Positioned(
                left:
                horizontalPadding +
                    swipePosition,

                top:
                (buttonHeight -
                    iconSize) /
                    2,

                child: GestureDetector(
                  behavior:
                  HitTestBehavior.opaque,

                  onHorizontalDragUpdate:
                  isPunching
                      ? null
                      : (details) {
                    if (maxSwipe <=
                        0) {
                      return;
                    }

                    setState(() {
                      swipePosition +=
                          details.delta.dx;

                      swipePosition =
                          swipePosition.clamp(
                            0.0,
                            maxSwipe,
                          );
                    });
                  },

                  onHorizontalDragEnd:
                  isPunching
                      ? null
                      : (details) async {
                    if (maxSwipe <=
                        0) {
                      return;
                    }

                    final bool
                    completed =
                        swipePosition >=
                            maxSwipe *
                                0.75;

                    if (completed) {
                      await punchAttendance();
                    }

                    if (mounted) {
                      setState(() {
                        swipePosition =
                        0.0;
                      });
                    }
                  },

                  child: Container(
                    height: iconSize,
                    width: iconSize,

                    decoration:
                    BoxDecoration(
                      color: isPunching
                          ? Colors.grey
                          : isPunchedIn
                          ? Colors.red
                          : const Color(
                        0xFF16A34A,
                      ),

                      shape: BoxShape.circle,

                      boxShadow: [
                        BoxShadow(
                          color: Colors.black
                              .withValues(
                            alpha: 0.15,
                          ),
                          blurRadius: 8,
                          offset:
                          const Offset(
                            0,
                            3,
                          ),
                        ),
                      ],
                    ),

                    child: isPunching
                        ? const SizedBox(
                      height: 22,
                      width: 22,
                      child:
                      CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color:
                        Colors.white,
                      ),
                    )
                        : Icon(
                      isPunchedIn
                          ? Icons.logout
                          : Icons.login,
                      color: Colors.white,
                      size: 26,
                    ),
                  ),
                ),
              ),

              // ==================================================
              // ARROW
              // ==================================================

              Positioned(
                right: 20,
                top: 0,
                bottom: 0,

                child: Center(
                  child: Icon(
                    Icons.double_arrow,
                    color: Colors.grey,
                    size: 22,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ============================================================
  // HOME PAGE
  // ============================================================

  Widget buildHomePage() {
    final now = DateTime.now();

    final String dateText =
        '${_weekday(now.weekday)}, '
        '${now.day} ${_month(now.month)} ${now.year}';

    return SingleChildScrollView(
      padding:
      const EdgeInsets.fromLTRB(
        20,
        20,
        20,
        25,
      ),

      child: Column(
        crossAxisAlignment:
        CrossAxisAlignment.start,

        children: [
          // ======================================================
          // HEADER
          // ======================================================

          Row(
            children: [
              Container(
                height: 52,
                width: 52,

                decoration:
                BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                  BorderRadius.circular(
                    16,
                  ),

                  boxShadow: [
                    BoxShadow(
                      color:
                      Colors.black.withValues(
                        alpha: 0.06,
                      ),
                      blurRadius: 10,
                      offset:
                      const Offset(0, 4),
                    ),
                  ],
                ),

                child: ClipRRect(
                  borderRadius:
                  BorderRadius.circular(
                    16,
                  ),

                  child: Image.asset(
                    'assets/images/staffsync_logo.png',

                    fit: BoxFit.contain,

                    errorBuilder:
                        (
                        context,
                        error,
                        stackTrace,
                        ) {
                      return const Icon(
                        Icons.business,
                        color: navy,
                        size: 28,
                      );
                    },
                  ),
                ),
              ),

              const SizedBox(width: 12),

              const Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,

                  children: [
                    Text(
                      'StaffSync',

                      style: TextStyle(
                        fontSize: 22,
                        fontWeight:
                        FontWeight.bold,
                        color: navy,
                      ),
                    ),

                    SizedBox(height: 2),

                    Text(
                      'Employee Attendance',

                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),

              Container(
                decoration:
                BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                  BorderRadius.circular(
                    14,
                  ),
                ),

                child: IconButton(
                  onPressed: () {
                    showMessage(
                      'No new notifications',
                      navy,
                    );
                  },

                  icon: const Icon(
                    Icons.notifications_none,
                    color: navy,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 28),

          // ======================================================
          // GREETING
          // ======================================================

          Text(
            greeting,

            style: const TextStyle(
              fontSize: 15,
              color: Colors.grey,
            ),
          ),

          const SizedBox(height: 5),

          const Text(
            'Shubham Singh',

            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: darkText,
            ),
          ),

          const SizedBox(height: 22),

          // ======================================================
          // DATE CARD
          // ======================================================

          Container(
            width: double.infinity,

            padding:
            const EdgeInsets.all(18),

            decoration:
            BoxDecoration(
              color: Colors.white,

              borderRadius:
              BorderRadius.circular(
                20,
              ),

              boxShadow: [
                BoxShadow(
                  color:
                  Colors.black.withValues(
                    alpha: 0.04,
                  ),
                  blurRadius: 12,
                  offset:
                  const Offset(0, 5),
                ),
              ],
            ),

            child: Row(
              children: [
                Container(
                  height: 50,
                  width: 50,

                  decoration:
                  BoxDecoration(
                    color:
                    const Color(
                      0xFFEFF6FF,
                    ),
                    borderRadius:
                    BorderRadius.circular(
                      14,
                    ),
                  ),

                  child: const Icon(
                    Icons.calendar_month,
                    color: blue,
                  ),
                ),

                const SizedBox(width: 14),

                Expanded(
                  child: Column(
                    crossAxisAlignment:
                    CrossAxisAlignment.start,

                    children: [
                      Text(
                        dateText,

                        style:
                        const TextStyle(
                          fontWeight:
                          FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),

                      const SizedBox(height: 5),

                      const Text(
                        'Office • Regular Working Day',

                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          // ======================================================
          // ATTENDANCE CARD
          // ======================================================

          Container(
            width: double.infinity,

            padding:
            const EdgeInsets.all(22),

            decoration:
            BoxDecoration(
              gradient:
              const LinearGradient(
                colors: [
                  navy,
                  teal,
                ],

                begin:
                Alignment.topLeft,
                end:
                Alignment.bottomRight,
              ),

              borderRadius:
              BorderRadius.circular(
                25,
              ),

              boxShadow: [
                BoxShadow(
                  color:
                  teal.withValues(
                    alpha: 0.20,
                  ),
                  blurRadius: 20,
                  offset:
                  const Offset(0, 10),
                ),
              ],
            ),

            child: Column(
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Today\'s Attendance',

                        style: TextStyle(
                          color:
                          Colors.white,
                          fontSize: 17,
                          fontWeight:
                          FontWeight.w600,
                        ),
                      ),
                    ),

                    Container(
                      padding:
                      const EdgeInsets
                          .symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),

                      decoration:
                      BoxDecoration(
                        color: Colors.white
                            .withValues(
                          alpha: 0.15,
                        ),

                        borderRadius:
                        BorderRadius.circular(
                          20,
                        ),
                      ),

                      child: Text(
                        isPunching
                            ? 'PROCESSING'
                            : isPunchedIn
                            ? 'PUNCHED IN'
                            : punchOutTime !=
                            null
                            ? 'COMPLETED'
                            : 'NOT PUNCHED',

                        style:
                        const TextStyle(
                          color:
                          Colors.white,
                          fontSize: 10,
                          fontWeight:
                          FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 25),

                Text(
                  currentTime,

                  style:
                  const TextStyle(
                    color: Colors.white,
                    fontSize: 38,
                    fontWeight:
                    FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 5),

                const Text(
                  'Current Time',

                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),

                const SizedBox(height: 25),

                buildSwipePunchButton(),
              ],
            ),
          ),

          const SizedBox(height: 22),

          // ======================================================
          // TODAY'S SUMMARY
          // ======================================================

          const Text(
            'Today\'s Summary',

            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: darkText,
            ),
          ),

          const SizedBox(height: 14),

          Row(
            children: [
              Expanded(
                child: buildStatCard(
                  icon: Icons.login,
                  title: 'Punch In',
                  value:
                  formatTime(
                    punchInTime,
                  ),
                  iconColor:
                  Colors.green,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: buildStatCard(
                  icon: Icons.logout,
                  title: 'Punch Out',
                  value:
                  formatTime(
                    punchOutTime,
                  ),
                  iconColor:
                  Colors.orange,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: buildStatCard(
                  icon:
                  Icons.timer_outlined,
                  title:
                  'Working Hours',
                  value:
                  getWorkingHours(),
                  iconColor: blue,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: buildStatCard(
                  icon: Icons
                      .check_circle_outline,
                  title: 'Status',
                  value: isPunchedIn
                      ? 'Present'
                      : punchOutTime !=
                      null
                      ? 'Completed'
                      : 'Pending',
                  iconColor: teal,
                ),
              ),
            ],
          ),

          const SizedBox(height: 25),

          // ======================================================
          // QUICK ACTIONS
          // ======================================================

          const Text(
            'Quick Actions',

            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: darkText,
            ),
          ),

          const SizedBox(height: 14),

          Row(
            children: [
              Expanded(
                child: buildQuickAction(
                  Icons.qr_code_scanner,
                  'Scan QR',
                      () {
                    showMessage(
                      'QR Scanner will open here.',
                      blue,
                    );
                  },
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: buildQuickAction(
                  Icons.history,
                  'History',
                      () {
                    setState(() {
                      selectedIndex = 1;
                    });
                  },
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: buildQuickAction(
                  Icons.description_outlined,
                  'Reports',
                      () {
                    setState(() {
                      selectedIndex = 2;
                    });
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ============================================================
  // STAT CARD
  // ============================================================

  Widget buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color iconColor,
  }) {
    return Container(
      padding:
      const EdgeInsets.all(16),

      decoration:
      BoxDecoration(
        color: Colors.white,
        borderRadius:
        BorderRadius.circular(
          18,
        ),
      ),

      child: Column(
        crossAxisAlignment:
        CrossAxisAlignment.start,

        children: [
          Container(
            height: 38,
            width: 38,

            decoration:
            BoxDecoration(
              color:
              iconColor.withValues(
                alpha: 0.1,
              ),

              borderRadius:
              BorderRadius.circular(
                10,
              ),
            ),

            child: Icon(
              icon,
              color: iconColor,
              size: 20,
            ),
          ),

          const SizedBox(height: 12),

          Text(
            title,

            style:
            const TextStyle(
              fontSize: 12,
              color: Colors.grey,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            value,

            style:
            const TextStyle(
              fontSize: 17,
              fontWeight:
              FontWeight.bold,
              color: darkText,
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // QUICK ACTION
  // ============================================================

  Widget buildQuickAction(
      IconData icon,
      String title,
      VoidCallback onTap,
      ) {
    return GestureDetector(
      onTap: onTap,

      child: Container(
        padding:
        const EdgeInsets.symmetric(
          vertical: 18,
        ),

        decoration:
        BoxDecoration(
          color: Colors.white,
          borderRadius:
          BorderRadius.circular(
            18,
          ),
        ),

        child: Column(
          children: [
            Icon(
              icon,
              size: 27,
              color: navy,
            ),

            const SizedBox(height: 8),

            Text(
              title,

              style:
              const TextStyle(
                fontSize: 12,
                fontWeight:
                FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // DATE HELPERS
  // ============================================================

  String _weekday(int day) {
    const weekdays = [
      '',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    if (day < 1 || day > 7) {
      return '';
    }

    return weekdays[day];
  }

  String _month(int month) {
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

    if (month < 1 || month > 12) {
      return '';
    }

    return months[month];
  }
}