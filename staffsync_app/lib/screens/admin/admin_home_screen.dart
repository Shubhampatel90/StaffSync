import 'package:flutter/material.dart';
import 'package:staffsync_app/screens/admin/report_screen.dart';
import 'employee_management_screen.dart';
import 'attendance_management_screen.dart';

class AdminHomeScreen extends StatelessWidget {
  const AdminHomeScreen({super.key});

  static const Color primaryNavy = Color(0xFF0C2340);
  static const Color textGray = Color(0xFF9E9E9E);
  static const Color backgroundColor = Color(0xFFF8F9FC);

  String getGreeting() {
    final hour = DateTime.now().hour;

    if (hour >= 5 && hour < 12) {
      return "Good Morning 🌅";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon ☀️";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening 🌇";
    } else {
      return "Good Night 🌙";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,

      // ==========================================================
      // APP BAR
      // ==========================================================
      appBar: AppBar(
        backgroundColor: backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,

        leading: IconButton(
          icon: const Icon(Icons.arrow_back, size: 28, color: Colors.black87),
          onPressed: () {
            Navigator.pop(context);
          },
        ),

        title: const Text(
          "StaffSync Admin",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w400,
            color: Colors.black87,
          ),
        ),
      ),

      // ==========================================================
      // BODY
      // ==========================================================
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,

            children: [
              // ==================================================
              // HEADER SECTION
              // ==================================================
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,

                children: [
                  // ------------------------------------------------
                  // LOGO
                  // ------------------------------------------------
                  Container(
                    width: 64,
                    height: 64,

                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(18),

                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),

                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(18),

                      child: Image.asset(
                        "assets/images/staffsync_logo.png",
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),

                  const SizedBox(width: 16),

                  // ------------------------------------------------
                  // BRAND
                  // ------------------------------------------------
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,

                      children: [
                        Text(
                          "StaffSync",

                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: primaryNavy,
                            letterSpacing: -0.5,
                          ),
                        ),

                        SizedBox(height: 2),

                        Text(
                          "Admin",

                          style: TextStyle(
                            fontSize: 15,
                            color: textGray,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ------------------------------------------------
                  // NOTIFICATION
                  // ------------------------------------------------
                  Container(
                    width: 52,
                    height: 52,

                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),

                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),

                    child: IconButton(
                      onPressed: () {},

                      icon: const Icon(
                        Icons.notifications_none_outlined,
                        color: primaryNavy,
                        size: 26,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // ==================================================
              // GREETING
              // ==================================================
              Text(
                getGreeting(),

                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w400,
                  color: textGray,
                ),
              ),

              const SizedBox(height: 32),

              // ==================================================
              // ADMIN DASHBOARD
              // ==================================================
              const Text(
                "Admin Dashboard",

                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: primaryNavy,
                ),
              ),

              const SizedBox(height: 16),

              // ==================================================
              // EMPLOYEE MANAGEMENT
              // ==================================================
              _adminCard(
                context: context,
                icon: Icons.people_outline,
                title: "Employee Management",
                subtitle: "Create, update and delete employees",

                onTap: () {
                  Navigator.push(
                    context,

                    MaterialPageRoute(
                      builder: (context) => const EmployeeManagementScreen(),
                    ),
                  );
                },
              ),

              const SizedBox(height: 14),

              // ==================================================
              // ATTENDANCE MANAGEMENT
              // ==================================================
              _adminCard(
                context: context,
                icon: Icons.access_time,
                title: "Attendance Management",
                subtitle: "View and manage employee attendance",

                onTap: () {
                  Navigator.push(
                    context,

                    MaterialPageRoute(
                      builder: (context) => const AttendanceManagementScreen(),
                    ),
                  );
                },
              ),

              const SizedBox(height: 14),

              // ==================================================
              // REPORTS
              // ==================================================
              _adminCard(
                context: context,
                icon: Icons.bar_chart,
                title: "Reports",
                subtitle: "View employee attendance reports",

                onTap: () {
                  Navigator.push(
                    context,

                    MaterialPageRoute(
                      builder: (context) => const ReportsScreen(),
                    ),
                  );
                },
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  // ===============================================================
  // ADMIN CARD
  // ===============================================================

  Widget _adminCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      color: Colors.white,

      margin: EdgeInsets.zero,

      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),

      child: InkWell(
        borderRadius: BorderRadius.circular(18),

        onTap: onTap,

        child: Padding(
          padding: const EdgeInsets.all(16),

          child: Row(
            children: [
              // ==================================================
              // ICON
              // ==================================================
              Container(
                width: 50,
                height: 50,

                decoration: BoxDecoration(
                  color: const Color(0xFFEAF1F8),

                  borderRadius: BorderRadius.circular(14),
                ),

                child: Icon(icon, size: 26, color: primaryNavy),
              ),

              const SizedBox(width: 16),

              // ==================================================
              // TEXT
              // ==================================================
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,

                  children: [
                    Text(
                      title,

                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: primaryNavy,
                      ),
                    ),

                    const SizedBox(height: 4),

                    Text(
                      subtitle,

                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF8E8E8E),
                      ),
                    ),
                  ],
                ),
              ),

              // ==================================================
              // ARROW
              // ==================================================
              const Icon(Icons.arrow_forward_ios, size: 16, color: primaryNavy),
            ],
          ),
        ),
      ),
    );
  }
}