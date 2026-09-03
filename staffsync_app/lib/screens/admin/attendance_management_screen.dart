import 'package:flutter/material.dart';
import 'package:staffsync_app/screens/admin/attendance_model.dart';

import '../../services/attendance_api_service.dart';
import 'add_attendance_screen.dart';

class AttendanceManagementScreen extends StatefulWidget {
  const AttendanceManagementScreen({
    super.key,
  });

  @override
  State<AttendanceManagementScreen> createState() =>
      _AttendanceManagementScreenState();
}

class _AttendanceManagementScreenState
    extends State<AttendanceManagementScreen> {
  List<Attendance> _allAttendance = [];
  List<Attendance> _filteredAttendance = [];

  bool _isLoading = true;

  String _selectedStatus = 'All';

  DateTime _selectedDate = DateTime.now();

  final TextEditingController _searchController =
  TextEditingController();

  @override
  void initState() {
    super.initState();

    _searchController.addListener(
      _applyFilters,
    );

    _loadAttendance();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // ============================================================
  // LOAD ATTENDANCE
  // ============================================================

  Future<void> _loadAttendance() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final data =
      await AttendanceApiService.getAttendanceByDate(
        _selectedDate,
      );

      if (!mounted) return;

      setState(() {
        _allAttendance = data;
        _filteredAttendance = data;
        _isLoading = false;
      });

      _applyFilters();
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString().replaceFirst(
              'Exception: ',
              '',
            ),
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // ============================================================
  // FILTER
  // ============================================================

  void _applyFilters() {
    final search =
    _searchController.text.trim().toLowerCase();

    setState(() {
      _filteredAttendance =
          _allAttendance.where((attendance) {
            final employeeName =
                attendance.employeeName?.toLowerCase() ?? '';

            final employeeId =
            attendance.employeeId.toString();

            final matchesSearch =
                employeeName.contains(search) ||
                    employeeId.contains(search);

            final matchesStatus =
                _selectedStatus == 'All' ||
                    attendance.status.toUpperCase() ==
                        _selectedStatus.toUpperCase();

            return matchesSearch && matchesStatus;
          }).toList();
    });
  }

  // ============================================================
  // DATE PICKER
  // ============================================================

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );

    if (picked == null) {
      return;
    }

    setState(() {
      _selectedDate = picked;
    });

    await _loadAttendance();
  }

  // ============================================================
  // ADD
  // ============================================================

  Future<void> _addAttendance() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            AddAttendanceScreen(
              selectedDate: _selectedDate,
            ),
      ),
    );

    if (result == true) {
      _loadAttendance();
    }
  }

  // ============================================================
  // EDIT
  // ============================================================

  Future<void> _editAttendance(
      Attendance attendance,
      ) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            AddAttendanceScreen(
              attendance: attendance,
              selectedDate: attendance.date,
            ),
      ),
    );

    if (result == true) {
      _loadAttendance();
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  Future<void> _deleteAttendance(
      Attendance attendance,
      ) async {
    if (attendance.id == null) {
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text(
            'Delete Attendance',
          ),
          content: Text(
            'Are you sure you want to delete attendance for '
                '${attendance.employeeName ?? "Employee #${attendance.employeeId}"}?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(
                  context,
                  false,
                );
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.pop(
                  context,
                  true,
                );
              },
              child: const Text('Delete'),
            ),
          ],
        );
      },
    );

    if (confirmed != true) {
      return;
    }

    try {
      await AttendanceApiService.deleteAttendance(
        attendance.id!,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Attendance deleted successfully',
          ),
          backgroundColor: Colors.green,
        ),
      );

      _loadAttendance();
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString().replaceFirst(
              'Exception: ',
              '',
            ),
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // ============================================================
  // DATE FORMAT
  // ============================================================

  String _formatDate(DateTime date) {
    final day =
    date.day.toString().padLeft(2, '0');

    final month =
    date.month.toString().padLeft(2, '0');

    final year =
    date.year.toString();

    return '$day $month $year';
  }

  // ============================================================
  // STATUS COLOR
  // ============================================================

  Color _statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PRESENT':
        return Colors.green;

      case 'LATE':
        return Colors.orange;

      case 'ABSENT':
        return Colors.red;

      case 'HALF_DAY':
      case 'HALF DAY':
        return Colors.blue;

      case 'LEAVE':
        return Colors.purple;

      default:
        return Colors.grey;
    }
  }

  // ============================================================
  // STATUS BADGE
  // ============================================================

  Widget _statusBadge(String status) {
    final color = _statusColor(status);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  // ============================================================
  // MOBILE CARD
  // ============================================================

  Widget _attendanceCard(
      Attendance attendance,
      ) {
    return Card(
      margin: const EdgeInsets.only(
        bottom: 12,
      ),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor:
                  Colors.indigo.shade100,
                  child: Text(
                    attendance.employeeId.toString(),
                    style: const TextStyle(
                      color: Colors.indigo,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: Column(
                    crossAxisAlignment:
                    CrossAxisAlignment.start,
                    children: [
                      Text(
                        attendance.employeeName ??
                            'Employee',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 4),

                      Text(
                        'Employee ID: ${attendance.employeeId}',
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),

                _statusBadge(
                  attendance.status,
                ),
              ],
            ),

            const Divider(height: 24),

            Row(
              children: [
                Expanded(
                  child: _timeItem(
                    'Check In',
                    attendance.formattedCheckIn,
                    Icons.login,
                  ),
                ),

                Expanded(
                  child: _timeItem(
                    'Check Out',
                    attendance.formattedCheckOut,
                    Icons.logout,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            Row(
              mainAxisAlignment:
              MainAxisAlignment.end,
              children: [
                IconButton(
                  tooltip: 'Edit',
                  onPressed: () {
                    _editAttendance(
                      attendance,
                    );
                  },
                  icon: const Icon(
                    Icons.edit,
                  ),
                ),

                IconButton(
                  tooltip: 'Delete',
                  onPressed: () {
                    _deleteAttendance(
                      attendance,
                    );
                  },
                  icon: const Icon(
                    Icons.delete,
                    color: Colors.red,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _timeItem(
      String title,
      String value,
      IconData icon,
      ) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: Colors.indigo,
        ),

        const SizedBox(width: 8),

        Column(
          crossAxisAlignment:
          CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),

            const SizedBox(height: 2),

            Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ============================================================
  // DESKTOP TABLE
  // ============================================================

  Widget _desktopTable() {
    return Card(
      elevation: 2,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columnSpacing: 35,
          headingRowColor:
          WidgetStateProperty.all(
            Colors.indigo.shade50,
          ),
          columns: const [
            DataColumn(
              label: Text(
                'ID',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            DataColumn(
              label: Text(
                'Employee',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            DataColumn(
              label: Text(
                'Check In',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            DataColumn(
              label: Text(
                'Check Out',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            DataColumn(
              label: Text(
                'Status',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            DataColumn(
              label: Text(
                'Action',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
          rows: _filteredAttendance.map(
                (attendance) {
              return DataRow(
                cells: [
                  DataCell(
                    Text(
                      attendance.employeeId
                          .toString(),
                    ),
                  ),

                  DataCell(
                    Text(
                      attendance.employeeName ??
                          'Employee',
                    ),
                  ),

                  DataCell(
                    Text(
                      attendance.formattedCheckIn,
                    ),
                  ),

                  DataCell(
                    Text(
                      attendance.formattedCheckOut,
                    ),
                  ),

                  DataCell(
                    _statusBadge(
                      attendance.status,
                    ),
                  ),

                  DataCell(
                    Row(
                      children: [
                        IconButton(
                          tooltip: 'Edit',
                          onPressed: () {
                            _editAttendance(
                              attendance,
                            );
                          },
                          icon: const Icon(
                            Icons.edit,
                            size: 20,
                          ),
                        ),

                        IconButton(
                          tooltip: 'Delete',
                          onPressed: () {
                            _deleteAttendance(
                              attendance,
                            );
                          },
                          icon: const Icon(
                            Icons.delete,
                            color: Colors.red,
                            size: 20,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ).toList(),
        ),
      ),
    );
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    final screenWidth =
        MediaQuery.of(context).size.width;

    final bool isDesktop =
        screenWidth >= 800;

    return Scaffold(
      backgroundColor: const Color(
        0xFFF5F7FB,
      ),

      appBar: AppBar(
        title: const Text(
          'Attendance Management',
        ),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _loadAttendance,
            icon: const Icon(
              Icons.refresh,
            ),
          ),
        ],
      ),

      floatingActionButton:
      FloatingActionButton.extended(
        onPressed: _addAttendance,
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        icon: const Icon(
          Icons.add,
        ),
        label: const Text(
          'Add Attendance',
        ),
      ),

      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // ==================================================
              // FILTER SECTION
              // ==================================================

              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Wrap(
                    spacing: 16,
                    runSpacing: 12,
                    crossAxisAlignment:
                    WrapCrossAlignment.center,
                    children: [
                      // DATE
                      InkWell(
                        onTap: _selectDate,
                        borderRadius:
                        BorderRadius.circular(8),
                        child: Container(
                          padding:
                          const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          decoration:
                          BoxDecoration(
                            border: Border.all(
                              color:
                              Colors.grey.shade300,
                            ),
                            borderRadius:
                            BorderRadius.circular(
                              8,
                            ),
                          ),
                          child: Row(
                            mainAxisSize:
                            MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.calendar_today,
                                size: 20,
                                color: Colors.indigo,
                              ),

                              const SizedBox(width: 10),

                              Text(
                                _formatDate(
                                  _selectedDate,
                                ),
                                style:
                                const TextStyle(
                                  fontWeight:
                                  FontWeight.w600,
                                ),
                              ),

                              const SizedBox(width: 8),

                              const Icon(
                                Icons.arrow_drop_down,
                              ),
                            ],
                          ),
                        ),
                      ),

                      // STATUS
                      SizedBox(
                        width: 160,
                        child:
                        DropdownButtonFormField<String>(
                          initialValue:
                          _selectedStatus,
                          decoration:
                          const InputDecoration(
                            labelText: 'Status',
                            border:
                            OutlineInputBorder(),
                          ),
                          items: const [
                            DropdownMenuItem(
                              value: 'All',
                              child: Text('All'),
                            ),
                            DropdownMenuItem(
                              value: 'PRESENT',
                              child: Text('Present'),
                            ),
                            DropdownMenuItem(
                              value: 'LATE',
                              child: Text('Late'),
                            ),
                            DropdownMenuItem(
                              value: 'ABSENT',
                              child: Text('Absent'),
                            ),
                            DropdownMenuItem(
                              value: 'HALF_DAY',
                              child:
                              Text('Half Day'),
                            ),
                            DropdownMenuItem(
                              value: 'LEAVE',
                              child: Text('Leave'),
                            ),
                          ],
                          onChanged: (value) {
                            if (value == null) {
                              return;
                            }

                            setState(() {
                              _selectedStatus =
                                  value;
                            });

                            _applyFilters();
                          },
                        ),
                      ),

                      // SEARCH
                      SizedBox(
                        width:
                        isDesktop ? 320 : 260,
                        child: TextField(
                          controller:
                          _searchController,
                          decoration:
                          InputDecoration(
                            labelText:
                            'Search Employee',
                            hintText:
                            'Name or Employee ID',
                            prefixIcon:
                            const Icon(
                              Icons.search,
                            ),
                            suffixIcon:
                            _searchController
                                .text
                                .isNotEmpty
                                ? IconButton(
                              onPressed: () {
                                _searchController
                                    .clear();
                              },
                              icon:
                              const Icon(
                                Icons.clear,
                              ),
                            )
                                : null,
                            border:
                            const OutlineInputBorder(),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // ==================================================
              // HEADER
              // ==================================================

              Row(
                children: [
                  const Icon(
                    Icons.fact_check,
                    color: Colors.indigo,
                  ),

                  const SizedBox(width: 8),

                  Text(
                    'Attendance for ${_formatDate(_selectedDate)}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const Spacer(),

                  Text(
                    '${_filteredAttendance.length} Records',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // ==================================================
              // CONTENT
              // ==================================================

              Expanded(
                child: _isLoading
                    ? const Center(
                  child:
                  CircularProgressIndicator(),
                )
                    : _filteredAttendance.isEmpty
                    ? _emptyState()
                    : isDesktop
                    ? _desktopTable()
                    : ListView.builder(
                  itemCount:
                  _filteredAttendance
                      .length,
                  itemBuilder:
                      (context, index) {
                    return _attendanceCard(
                      _filteredAttendance[
                      index],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisAlignment:
        MainAxisAlignment.center,
        children: [
          Icon(
            Icons.event_busy,
            size: 70,
            color: Colors.grey.shade400,
          ),

          const SizedBox(height: 16),

          const Text(
            'No Attendance Records',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 8),

          Text(
            'No attendance found for the selected date.',
            style: TextStyle(
              color: Colors.grey.shade600,
            ),
          ),

          const SizedBox(height: 20),

          ElevatedButton.icon(
            onPressed: _addAttendance,
            icon: const Icon(
              Icons.add,
            ),
            label: const Text(
              'Add Attendance',
            ),
          ),
        ],
      ),
    );
  }
}