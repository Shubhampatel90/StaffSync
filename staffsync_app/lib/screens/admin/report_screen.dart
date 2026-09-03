// lib/screens/admin/reports_screen.dart
//
// Admin Reports screen for StaffSync.
// Supports three report types (Employee-wise, Date-range, Monthly summary),
// an on-screen preview, and export to CSV / Excel / PDF via ReportApiService.

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:staffsync_app/services/report_api.service.dart';
import 'package:staffsync_app/services/employee_api_service.dart';
import 'package:staffsync_app/screens/admin/employee_model.dart';

enum ReportType { employeeWise, dateRange, monthlySummary }

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final EmployeeApiService _employeeApiService = EmployeeApiService();

  ReportType _selectedType = ReportType.employeeWise;

  // Employee-wise / date-range filters
  DateTime _fromDate = DateTime.now().subtract(const Duration(days: 7));
  DateTime _toDate = DateTime.now();

  // Monthly summary filters
  int _selectedMonth = DateTime.now().month;
  int _selectedYear = DateTime.now().year;

  List<Employee> _employees = [];
  int? _selectedEmployeeId;

  bool _loadingEmployees = true;
  bool _loadingReport = false;
  bool _exporting = false;
  String? _errorMessage;

  List<Map<String, dynamic>> _reportRows = [];

  final DateFormat _dateFmt = DateFormat('dd MMM yyyy');

  @override
  void initState() {
    super.initState();
    _loadEmployees();
  }

  Future<void> _loadEmployees() async {
    try {
      final employees = await _employeeApiService.getEmployees();
      setState(() {
        _employees = employees;
        _loadingEmployees = false;
        if (employees.isNotEmpty) {
          _selectedEmployeeId = employees.first.id;
        }
      });
    } catch (e) {
      setState(() {
        _loadingEmployees = false;
        _errorMessage = 'Failed to load employees: $e';
      });
    }
  }

  // ---------------- Quick range helpers ----------------

  void _applyQuickRange(String range) {
    final now = DateTime.now();
    setState(() {
      switch (range) {
        case 'today':
          _fromDate = DateTime(now.year, now.month, now.day);
          _toDate = _fromDate;
          break;
        case 'week':
          _fromDate = now.subtract(Duration(days: now.weekday - 1));
          _toDate = now;
          break;
        case 'month':
          _fromDate = DateTime(now.year, now.month, 1);
          _toDate = now;
          break;
        case 'lastMonth':
          final lastMonth = DateTime(now.year, now.month - 1, 1);
          _fromDate = lastMonth;
          _toDate = DateTime(now.year, now.month, 0); // last day of prev month
          break;
      }
    });
  }

  Future<void> _pickDate({required bool isFrom}) async {
    final initial = isFrom ? _fromDate : _toDate;
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        if (isFrom) {
          _fromDate = picked;
          if (_fromDate.isAfter(_toDate)) _toDate = _fromDate;
        } else {
          _toDate = picked;
          if (_toDate.isBefore(_fromDate)) _fromDate = _toDate;
        }
      });
    }
  }

  // ---------------- Report generation ----------------

  Future<void> _generateReport() async {
    setState(() {
      _loadingReport = true;
      _errorMessage = null;
      _reportRows = [];
    });

    try {
      List<Map<String, dynamic>> rows;
      switch (_selectedType) {
        case ReportType.employeeWise:
          if (_selectedEmployeeId == null) {
            throw Exception('Please select an employee.');
          }
          rows = await ReportApiService.getEmployeeReport(
            employeeId: _selectedEmployeeId!,
            from: _fromDate,
            to: _toDate,
          );
          break;
        case ReportType.dateRange:
          rows = await ReportApiService.getDateRangeReport(
            from: _fromDate,
            to: _toDate,
          );
          break;
        case ReportType.monthlySummary:
          rows = await ReportApiService.getMonthlySummary(
            month: _selectedMonth,
            year: _selectedYear,
          );
          break;
      }
      setState(() => _reportRows = rows);
    } catch (e) {
      setState(() => _errorMessage = 'Failed to generate report: $e');
    } finally {
      setState(() => _loadingReport = false);
    }
  }

  Future<void> _exportReport(String format) async {
    if (_reportRows.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Generate a report before exporting.')),
      );
      return;
    }

    setState(() => _exporting = true);
    try {
      final params = <String, String>{};
      String reportTypeKey;

      switch (_selectedType) {
        case ReportType.employeeWise:
          reportTypeKey = 'employee';
          params['employeeId'] = _selectedEmployeeId.toString();
          params['from'] = DateFormat('yyyy-MM-dd').format(_fromDate);
          params['to'] = DateFormat('yyyy-MM-dd').format(_toDate);
          break;
        case ReportType.dateRange:
          reportTypeKey = 'date-range';
          params['from'] = DateFormat('yyyy-MM-dd').format(_fromDate);
          params['to'] = DateFormat('yyyy-MM-dd').format(_toDate);
          break;
        case ReportType.monthlySummary:
          reportTypeKey = 'monthly';
          params['month'] = _selectedMonth.toString();
          params['year'] = _selectedYear.toString();
          break;
      }

      final path = await ReportApiService.exportReport(
        format: format,
        reportType: reportTypeKey,
        params: params,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Report saved: $path')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: $e')),
        );
      }
    } finally {
      setState(() => _exporting = false);
    }
  }

  // ---------------- UI ----------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      body: _loadingEmployees
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildReportTypeSelector(),
            const SizedBox(height: 16),
            if (_selectedType == ReportType.employeeWise) _buildEmployeeSelector(),
            if (_selectedType == ReportType.employeeWise) const SizedBox(height: 16),
            if (_selectedType == ReportType.employeeWise ||
                _selectedType == ReportType.dateRange)
              _buildDateRangeSelector(),
            if (_selectedType == ReportType.monthlySummary) _buildMonthSelector(),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _loadingReport ? null : _generateReport,
              icon: _loadingReport
                  ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
                  : const Icon(Icons.assessment),
              label: const Text('Generate Report'),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 20),
            if (_reportRows.isNotEmpty) _buildExportBar(),
            const SizedBox(height: 12),
            if (_reportRows.isNotEmpty) _buildReportPreview(),
          ],
        ),
      ),
    );
  }

  Widget _buildReportTypeSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Report Type', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SegmentedButton<ReportType>(
              segments: const [
                ButtonSegment(
                  value: ReportType.employeeWise,
                  label: Text('Employee-wise'),
                  icon: Icon(Icons.person),
                ),
                ButtonSegment(
                  value: ReportType.dateRange,
                  label: Text('Date Range'),
                  icon: Icon(Icons.date_range),
                ),
                ButtonSegment(
                  value: ReportType.monthlySummary,
                  label: Text('Monthly Summary'),
                  icon: Icon(Icons.calendar_month),
                ),
              ],
              selected: {_selectedType},
              onSelectionChanged: (selection) {
                setState(() {
                  _selectedType = selection.first;
                  _reportRows = [];
                  _errorMessage = null;
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmployeeSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: DropdownButtonFormField<int>(
          decoration: const InputDecoration(labelText: 'Employee'),
          value: _selectedEmployeeId,
          items: _employees
              .map((e) => DropdownMenuItem<int>(
            value: e.id,
            child: Text(e.fullName),
          ))
              .toList(),
          onChanged: (value) => setState(() => _selectedEmployeeId = value),
        ),
      ),
    );
  }

  Widget _buildDateRangeSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Date Range', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _pickDate(isFrom: true),
                    child: Text('From: ${_dateFmt.format(_fromDate)}'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _pickDate(isFrom: false),
                    child: Text('To: ${_dateFmt.format(_toDate)}'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                ActionChip(label: const Text('Today'), onPressed: () => _applyQuickRange('today')),
                ActionChip(label: const Text('This Week'), onPressed: () => _applyQuickRange('week')),
                ActionChip(label: const Text('This Month'), onPressed: () => _applyQuickRange('month')),
                ActionChip(
                    label: const Text('Last Month'), onPressed: () => _applyQuickRange('lastMonth')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMonthSelector() {
    final now = DateTime.now();
    final years = List.generate(5, (i) => now.year - i);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<int>(
                decoration: const InputDecoration(labelText: 'Month'),
                value: _selectedMonth,
                items: List.generate(12, (i) => i + 1)
                    .map((m) => DropdownMenuItem(
                  value: m,
                  child: Text(DateFormat('MMMM').format(DateTime(0, m))),
                ))
                    .toList(),
                onChanged: (value) => setState(() => _selectedMonth = value ?? _selectedMonth),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DropdownButtonFormField<int>(
                decoration: const InputDecoration(labelText: 'Year'),
                value: _selectedYear,
                items: years
                    .map((y) => DropdownMenuItem(value: y, child: Text(y.toString())))
                    .toList(),
                onChanged: (value) => setState(() => _selectedYear = value ?? _selectedYear),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExportBar() {
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 8,
      runSpacing: 8,
      children: [
        const Text('Export:', style: TextStyle(fontWeight: FontWeight.bold)),
        _exportButton('CSV', 'csv', Icons.table_rows),
        _exportButton('Excel', 'excel', Icons.grid_on),
        _exportButton('PDF', 'pdf', Icons.picture_as_pdf),
      ],
    );
  }

  Widget _exportButton(String label, String format, IconData icon) {
    return OutlinedButton.icon(
      onPressed: _exporting ? null : () => _exportReport(format),
      icon: Icon(icon, size: 16),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        visualDensity: VisualDensity.compact,
      ),
    );
  }

  Widget _buildReportPreview() {
    // Derive columns dynamically from the first row's keys, keeping
    // the preview generic across all three report types.
    final columns = _reportRows.first.keys.toList();

    return Card(
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: columns
              .map((c) => DataColumn(
            label: Text(
              c.toString().replaceAll('_', ' ').toUpperCase(),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ))
              .toList(),
          rows: _reportRows
              .map(
                (row) => DataRow(
              cells: columns
                  .map((c) => DataCell(Text(row[c]?.toString() ?? '--')))
                  .toList(),
            ),
          )
              .toList(),
        ),
      ),
    );
  }
}