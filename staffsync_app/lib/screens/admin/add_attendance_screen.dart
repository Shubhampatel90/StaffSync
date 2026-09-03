import 'package:flutter/material.dart';
import 'package:staffsync_app/screens/admin/attendance_model.dart';


import '../../services/attendance_api_service.dart';

class AddAttendanceScreen extends StatefulWidget {
  final Attendance? attendance;
  final DateTime? selectedDate;

  const AddAttendanceScreen({
    super.key,
    this.attendance,
    this.selectedDate,
  });

  bool get isEdit => attendance != null;

  @override
  State<AddAttendanceScreen> createState() =>
      _AddAttendanceScreenState();
}

class _AddAttendanceScreenState
    extends State<AddAttendanceScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _employeeIdController =
  TextEditingController();

  final TextEditingController _checkInController =
  TextEditingController();

  final TextEditingController _checkOutController =
  TextEditingController();

  DateTime _selectedDate = DateTime.now();

  String _selectedStatus = 'PRESENT';

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();

    // ==========================================================
    // EDIT MODE
    // ==========================================================

    if (widget.attendance != null) {
      final attendance = widget.attendance!;

      _employeeIdController.text =
          attendance.employeeId.toString();

      _checkInController.text =
          attendance.checkIn ?? '';

      _checkOutController.text =
          attendance.checkOut ?? '';

      _selectedDate = attendance.date;

      _selectedStatus =
          attendance.status.toUpperCase();
    }

    // ==========================================================
    // ADD MODE
    // ==========================================================

    else if (widget.selectedDate != null) {
      _selectedDate = widget.selectedDate!;
    }
  }

  @override
  void dispose() {
    _employeeIdController.dispose();
    _checkInController.dispose();
    _checkOutController.dispose();

    super.dispose();
  }

  // ============================================================
  // SELECT DATE
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
  }

  // ============================================================
  // SELECT CHECK IN
  // ============================================================

  Future<void> _selectCheckIn() async {
    final initialTime =
        _parseTime(_checkInController.text) ??
            const TimeOfDay(
              hour: 9,
              minute: 0,
            );

    final picked = await showTimePicker(
      context: context,
      initialTime: initialTime,
    );

    if (picked == null) {
      return;
    }

    setState(() {
      _checkInController.text =
          _formatTimeForApi(picked);
    });
  }

  // ============================================================
  // SELECT CHECK OUT
  // ============================================================

  Future<void> _selectCheckOut() async {
    final initialTime =
        _parseTime(_checkOutController.text) ??
            const TimeOfDay(
              hour: 18,
              minute: 0,
            );

    final picked = await showTimePicker(
      context: context,
      initialTime: initialTime,
    );

    if (picked == null) {
      return;
    }

    setState(() {
      _checkOutController.text =
          _formatTimeForApi(picked);
    });
  }

  // ============================================================
  // SAVE
  // ============================================================

  Future<void> _saveAttendance() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final employeeId =
    int.tryParse(
      _employeeIdController.text.trim(),
    );

    if (employeeId == null) {
      _showError(
        'Please enter a valid Employee ID',
      );
      return;
    }

    setState(() {
      _isSaving = true;
    });

    final attendance = Attendance(
      id: widget.attendance?.id,
      employeeId: employeeId,
      employeeName:
      widget.attendance?.employeeName,
      date: _selectedDate,
      checkIn:
      _checkInController.text.trim().isEmpty
          ? null
          : _checkInController.text.trim(),
      checkOut:
      _checkOutController.text.trim().isEmpty
          ? null
          : _checkOutController.text.trim(),
      status: _selectedStatus,
    );

    try {
      if (widget.isEdit) {
        await AttendanceApiService.updateAttendance(
          widget.attendance!.id!,
          employeeId,
          attendance,
        );
      } else {
        await AttendanceApiService.addAttendance(
          employeeId,
          attendance,
        );
      }

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.isEdit
                ? 'Attendance updated successfully'
                : 'Attendance added successfully',
          ),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pop(
        context,
        true,
      );
    } catch (e) {
      if (!mounted) return;

      _showError(
        e.toString().replaceFirst(
          'Exception: ',
          '',
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  // ============================================================
  // TIME PARSER
  // ============================================================

  TimeOfDay? _parseTime(String value) {
    if (value.trim().isEmpty) {
      return null;
    }

    try {
      final parts = value.split(':');

      if (parts.length < 2) {
        return null;
      }

      return TimeOfDay(
        hour: int.parse(parts[0]),
        minute: int.parse(parts[1]),
      );
    } catch (_) {
      return null;
    }
  }

  // ============================================================
  // TIME FORMAT
  // ============================================================

  String _formatTimeForApi(
      TimeOfDay time,
      ) {
    final hour =
    time.hour.toString().padLeft(2, '0');

    final minute =
    time.minute.toString().padLeft(2, '0');

    return '$hour:$minute';
  }

  // ============================================================
  // DATE FORMAT
  // ============================================================

  String _formatDate(
      DateTime date,
      ) {
    final day =
    date.day.toString().padLeft(2, '0');

    final month =
    date.month.toString().padLeft(2, '0');

    final year =
    date.year.toString();

    return '$day-$month-$year';
  }

  // ============================================================
  // ERROR
  // ============================================================

  void _showError(
      String message,
      ) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  // ============================================================
  // FIELD DECORATION
  // ============================================================

  InputDecoration _inputDecoration(
      String label,
      IconData icon,
      ) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
      border: const OutlineInputBorder(),
    );
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    final bool isEdit = widget.isEdit;

    return Scaffold(
      backgroundColor:
      const Color(0xFFF5F7FB),

      appBar: AppBar(
        title: Text(
          isEdit
              ? 'Edit Attendance'
              : 'Add Attendance',
        ),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),

      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: ConstrainedBox(
            constraints:
            const BoxConstraints(
              maxWidth: 650,
            ),
            child: Card(
              elevation: 3,
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment:
                    CrossAxisAlignment.stretch,
                    children: [
                      // ==================================================
                      // HEADER
                      // ==================================================

                      Icon(
                        isEdit
                            ? Icons.edit_calendar
                            : Icons.calendar_month,
                        size: 55,
                        color: Colors.indigo,
                      ),

                      const SizedBox(height: 12),

                      Text(
                        isEdit
                            ? 'Update Attendance'
                            : 'Add New Attendance',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight:
                          FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 25),

                      // ==================================================
                      // EMPLOYEE ID
                      // ==================================================

                      TextFormField(
                        controller:
                        _employeeIdController,
                        keyboardType:
                        TextInputType.number,
                        decoration:
                        _inputDecoration(
                          'Employee ID',
                          Icons.badge,
                        ),
                        validator: (value) {
                          if (value == null ||
                              value.trim().isEmpty) {
                            return 'Employee ID is required';
                          }

                          final id =
                          int.tryParse(
                            value.trim(),
                          );

                          if (id == null ||
                              id <= 0) {
                            return 'Enter a valid Employee ID';
                          }

                          return null;
                        },
                      ),

                      const SizedBox(height: 18),

                      // ==================================================
                      // DATE
                      // ==================================================

                      InkWell(
                        onTap: _selectDate,
                        child: InputDecorator(
                          decoration:
                          _inputDecoration(
                            'Attendance Date',
                            Icons.calendar_today,
                          ),
                          child: Text(
                            _formatDate(
                              _selectedDate,
                            ),
                            style:
                            const TextStyle(
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // ==================================================
                      // CHECK IN
                      // ==================================================

                      TextFormField(
                        controller:
                        _checkInController,
                        readOnly: true,
                        onTap: _selectCheckIn,
                        decoration:
                        _inputDecoration(
                          'Check In',
                          Icons.login,
                        ).copyWith(
                          suffixIcon:
                          const Icon(
                            Icons.access_time,
                          ),
                          hintText:
                          'Select check-in time',
                        ),
                      ),

                      const SizedBox(height: 18),

                      // ==================================================
                      // CHECK OUT
                      // ==================================================

                      TextFormField(
                        controller:
                        _checkOutController,
                        readOnly: true,
                        onTap: _selectCheckOut,
                        decoration:
                        _inputDecoration(
                          'Check Out',
                          Icons.logout,
                        ).copyWith(
                          suffixIcon:
                          const Icon(
                            Icons.access_time,
                          ),
                          hintText:
                          'Select check-out time',
                        ),
                      ),

                      const SizedBox(height: 18),

                      // ==================================================
                      // STATUS
                      // ==================================================

                      DropdownButtonFormField<String>(
                        initialValue:
                        _selectedStatus,
                        decoration:
                        _inputDecoration(
                          'Attendance Status',
                          Icons.fact_check,
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'PRESENT',
                            child:
                            Text('Present'),
                          ),
                          DropdownMenuItem(
                            value: 'LATE',
                            child:
                            Text('Late'),
                          ),
                          DropdownMenuItem(
                            value: 'ABSENT',
                            child:
                            Text('Absent'),
                          ),
                          DropdownMenuItem(
                            value: 'HALF_DAY',
                            child:
                            Text('Half Day'),
                          ),
                          DropdownMenuItem(
                            value: 'LEAVE',
                            child:
                            Text('Leave'),
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
                        },
                      ),

                      const SizedBox(height: 30),

                      // ==================================================
                      // SAVE BUTTON
                      // ==================================================

                      SizedBox(
                        height: 52,
                        child: ElevatedButton.icon(
                          onPressed:
                          _isSaving
                              ? null
                              : _saveAttendance,
                          style:
                          ElevatedButton.styleFrom(
                            backgroundColor:
                            Colors.indigo,
                            foregroundColor:
                            Colors.white,
                            shape:
                            RoundedRectangleBorder(
                              borderRadius:
                              BorderRadius.circular(
                                8,
                              ),
                            ),
                          ),
                          icon: _isSaving
                              ? const SizedBox(
                            width: 20,
                            height: 20,
                            child:
                            CircularProgressIndicator(
                              strokeWidth: 2,
                              color:
                              Colors.white,
                            ),
                          )
                              : Icon(
                            isEdit
                                ? Icons.save
                                : Icons.add,
                          ),
                          label: Text(
                            _isSaving
                                ? 'Saving...'
                                : isEdit
                                ? 'Update Attendance'
                                : 'Add Attendance',
                            style:
                            const TextStyle(
                              fontSize: 16,
                              fontWeight:
                              FontWeight.bold,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 12),

                      // ==================================================
                      // CANCEL
                      // ==================================================

                      SizedBox(
                        height: 48,
                        child: OutlinedButton(
                          onPressed: _isSaving
                              ? null
                              : () {
                            Navigator.pop(
                              context,
                            );
                          },
                          child: const Text(
                            'Cancel',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}