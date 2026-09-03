import 'package:flutter/material.dart';

import 'employee_model.dart';
import '../../services/employee_api_service.dart';
import 'add_employee_screen.dart';
import 'edit_employee_screen.dart';

class EmployeeManagementScreen extends StatefulWidget {
  const EmployeeManagementScreen({super.key});

  @override
  State<EmployeeManagementScreen> createState() =>
      _EmployeeManagementScreenState();
}

class _EmployeeManagementScreenState extends State<EmployeeManagementScreen> {
  // ============================================================
  // API SERVICE
  // ============================================================

  final EmployeeApiService _apiService = EmployeeApiService();

  // ============================================================
  // VARIABLES
  // ============================================================

  List<Employee> _employees = [];

  bool _isLoading = true;

  String? _errorMessage;

  // ============================================================
  // INIT STATE
  // ============================================================

  @override
  void initState() {
    super.initState();

    _loadEmployees();
  }

  // ============================================================
  // LOAD EMPLOYEES
  // ============================================================

  Future<void> _loadEmployees() async {
    if (mounted) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }

    try {
      final List<Employee> employees = await _apiService.getEmployees();

      if (!mounted) return;

      setState(() {
        _employees = employees;
        _isLoading = false;
        _errorMessage = null;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

  // ============================================================
  // ADD EMPLOYEE
  // ============================================================

  Future<void> _openAddEmployeeScreen() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const AddEmployeeScreen()),
    );

    if (!mounted) return;

    if (result == true) {
      await _loadEmployees();
    }
  }

  // ============================================================
  // EDIT EMPLOYEE
  // ============================================================

  Future<void> _openEditEmployeeScreen(Employee employee) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditEmployeeScreen(employee: employee),
      ),
    );

    if (!mounted) return;

    if (result == true) {
      await _loadEmployees();
    }
  }

  // ============================================================
  // DELETE EMPLOYEE
  // ============================================================

  Future<void> _deleteEmployee(Employee employee) async {
    if (employee.id == null) {
      _showMessage("Employee ID is missing.", isError: true);

      return;
    }

    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.red),
              SizedBox(width: 8),
              Text("Delete Employee"),
            ],
          ),

          content: Text(
            "Are you sure you want to delete "
            "${employee.fullName}?\n\n"
            "This action cannot be undone.",
          ),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext, false);
              },
              child: const Text("Cancel"),
            ),

            ElevatedButton(
              onPressed: () {
                Navigator.pop(dialogContext, true);
              },

              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),

              child: const Text("Delete"),
            ),
          ],
        );
      },
    );

    if (confirmed != true) {
      return;
    }

    try {
      await _apiService.deleteEmployee(employee.id!);

      if (!mounted) return;

      _showMessage("Employee deleted successfully.");

      await _loadEmployees();
    } catch (e) {
      if (!mounted) return;

      _showMessage("Delete failed:\n$e", isError: true);
    }
  }

  // ============================================================
  // MESSAGE
  // ============================================================

  void _showMessage(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: isError ? Colors.red : Colors.green,
        ),
      );
  }

  // ============================================================
  // PROFILE IMAGE
  // ============================================================

  Widget _profileImage({required Employee employee, double radius = 32}) {
    final String name = employee.fullName.trim();

    final String firstLetter = name.isNotEmpty ? name[0].toUpperCase() : "?";

    // ----------------------------------------------------------
    // NO ID
    // ----------------------------------------------------------

    if (employee.id == null) {
      return _defaultProfileImage(firstLetter, radius);
    }

    final String imageUrl = employee.profileImageUrl;

    return CircleAvatar(
      radius: radius,

      backgroundColor: Colors.blue.shade100,

      child: ClipOval(
        child: Image.network(
          imageUrl,

          width: radius * 2,

          height: radius * 2,

          fit: BoxFit.cover,

          // ----------------------------------------------------
          // LOADING
          // ----------------------------------------------------
          loadingBuilder:
              (
                BuildContext context,
                Widget child,
                ImageChunkEvent? loadingProgress,
              ) {
                if (loadingProgress == null) {
                  return child;
                }

                return SizedBox(
                  width: radius * 2,
                  height: radius * 2,

                  child: const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,

                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                );
              },

          // ----------------------------------------------------
          // ERROR
          // ----------------------------------------------------
          errorBuilder:
              (BuildContext context, Object error, StackTrace? stackTrace) {
                return _defaultProfileImage(firstLetter, radius);
              },
        ),
      ),
    );
  }

  // ============================================================
  // DEFAULT PROFILE IMAGE
  // ============================================================

  Widget _defaultProfileImage(String firstLetter, double radius) {
    return CircleAvatar(
      radius: radius,

      backgroundColor: Colors.blue.shade100,

      child: Text(
        firstLetter,

        style: TextStyle(
          fontSize: radius * 0.75,

          fontWeight: FontWeight.bold,

          color: Colors.blue.shade700,
        ),
      ),
    );
  }

  // ============================================================
  // EMPLOYEE CARD
  // ============================================================

  Widget _employeeCard(Employee employee) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),

      elevation: 2,

      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),

      child: Padding(
        padding: const EdgeInsets.all(16),

        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,

          children: [
            // ==================================================
            // PROFILE IMAGE
            // ==================================================
            _profileImage(employee: employee, radius: 32),

            const SizedBox(width: 16),

            // ==================================================
            // EMPLOYEE INFORMATION
            // ==================================================
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,

                children: [
                  // ------------------------------------------------
                  // NAME
                  // ------------------------------------------------
                  Text(
                    employee.fullName,

                    maxLines: 1,

                    overflow: TextOverflow.ellipsis,

                    style: const TextStyle(
                      fontSize: 18,

                      fontWeight: FontWeight.bold,

                      color: Color(0xFF0C2340),
                    ),
                  ),

                  const SizedBox(height: 7),

                  // ------------------------------------------------
                  // EMAIL
                  // ------------------------------------------------
                  Row(
                    children: [
                      const Icon(
                        Icons.email_outlined,
                        size: 16,
                        color: Colors.grey,
                      ),

                      const SizedBox(width: 6),

                      Expanded(
                        child: Text(
                          employee.email,

                          maxLines: 1,

                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 5),

                  // ------------------------------------------------
                  // PHONE
                  // ------------------------------------------------
                  Row(
                    children: [
                      const Icon(
                        Icons.phone_outlined,
                        size: 16,
                        color: Colors.grey,
                      ),

                      const SizedBox(width: 6),

                      Text(employee.phone),
                    ],
                  ),

                  const SizedBox(height: 5),

                  // ------------------------------------------------
                  // MARITAL STATUS
                  // ------------------------------------------------
                  Row(
                    children: [
                      const Icon(
                        Icons.family_restroom,
                        size: 16,
                        color: Colors.grey,
                      ),

                      const SizedBox(width: 6),

                      Text(employee.maritalStatus),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // ------------------------------------------------
                  // LOGIN ACCOUNT INDICATOR
                  // ------------------------------------------------
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),

                    decoration: BoxDecoration(
                      color: Colors.green.shade50,

                      borderRadius: BorderRadius.circular(6),
                    ),

                    child: const Row(
                      mainAxisSize: MainAxisSize.min,

                      children: [
                        Icon(Icons.lock_outline, size: 14, color: Colors.green),

                        SizedBox(width: 4),

                        Text(
                          "Login account",
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.green,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // ==================================================
            // MENU
            // ==================================================
            PopupMenuButton<String>(
              onSelected: (String value) async {
                // ----------------------------------------------
                // EDIT
                // ----------------------------------------------

                if (value == "edit") {
                  await _openEditEmployeeScreen(employee);
                }

                // ----------------------------------------------
                // DELETE
                // ----------------------------------------------

                if (value == "delete") {
                  await _deleteEmployee(employee);
                }
              },

              itemBuilder: (BuildContext context) {
                return const [
                  PopupMenuItem<String>(
                    value: "edit",

                    child: Row(
                      children: [
                        Icon(Icons.edit_outlined),

                        SizedBox(width: 8),

                        Text("Edit"),
                      ],
                    ),
                  ),

                  PopupMenuItem<String>(
                    value: "delete",

                    child: Row(
                      children: [
                        Icon(Icons.delete_outline, color: Colors.red),

                        SizedBox(width: 8),

                        Text("Delete"),
                      ],
                    ),
                  ),
                ];
              },
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),

      // ========================================================
      // APP BAR
      // ========================================================
      appBar: AppBar(
        title: const Text("Employee Management"),

        backgroundColor: const Color(0xFFF8F9FC),

        foregroundColor: Colors.black,

        elevation: 0,

        actions: [
          // ----------------------------------------------------
          // ADD EMPLOYEE
          // ----------------------------------------------------
          Padding(
            padding: const EdgeInsets.only(right: 8),

            child: ElevatedButton.icon(
              onPressed: _openAddEmployeeScreen,

              icon: const Icon(Icons.person_add, size: 20),

              label: const Text("Add Employee"),

              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0C2340),

                foregroundColor: Colors.white,

                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),

          // ----------------------------------------------------
          // REFRESH
          // ----------------------------------------------------
          IconButton(
            onPressed: _isLoading ? null : _loadEmployees,

            icon: const Icon(Icons.refresh),
          ),
        ],
      ),

      // ========================================================
      // BODY
      // ========================================================
      body: _buildBody(),

      // ========================================================
      // FAB
      // ========================================================
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddEmployeeScreen,

        backgroundColor: const Color(0xFF0C2340),

        foregroundColor: Colors.white,

        icon: const Icon(Icons.person_add),

        label: const Text("Add Employee"),
      ),
    );
  }

  // ============================================================
  // BODY
  // ============================================================

  Widget _buildBody() {
    // ==========================================================
    // LOADING
    // ==========================================================

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    // ==========================================================
    // ERROR
    // ==========================================================

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),

          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,

            children: [
              const Icon(Icons.error_outline, size: 60, color: Colors.red),

              const SizedBox(height: 16),

              const Text(
                "Failed to load employees",

                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 8),

              Text(_errorMessage!, textAlign: TextAlign.center),

              const SizedBox(height: 20),

              ElevatedButton.icon(
                onPressed: _loadEmployees,

                icon: const Icon(Icons.refresh),

                label: const Text("Retry"),
              ),
            ],
          ),
        ),
      );
    }

    // ==========================================================
    // EMPTY
    // ==========================================================

    if (_employees.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadEmployees,

        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),

          children: [
            const SizedBox(height: 160),

            const Center(
              child: Column(
                children: [
                  Icon(Icons.people_outline, size: 70, color: Colors.grey),

                  SizedBox(height: 16),

                  Text(
                    "No employees found",

                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            Center(
              child: ElevatedButton.icon(
                onPressed: _openAddEmployeeScreen,

                icon: const Icon(Icons.person_add),

                label: const Text("Add First Employee"),
              ),
            ),
          ],
        ),
      );
    }

    // ==========================================================
    // EMPLOYEE LIST
    // ==========================================================

    return RefreshIndicator(
      onRefresh: _loadEmployees,

      child: ListView.builder(
        padding: const EdgeInsets.all(16),

        itemCount: _employees.length,

        itemBuilder: (context, index) {
          return _employeeCard(_employees[index]);
        },
      ),
    );
  }
}
