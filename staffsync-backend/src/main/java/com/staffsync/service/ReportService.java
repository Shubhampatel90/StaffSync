package com.staffsync.service;

import com.staffsync.model.Attendance;
import com.staffsync.model.AttendanceStatus;
import com.staffsync.model.Employee;
import com.staffsync.repository.AttendanceRepository;
import com.staffsync.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Builds the report rows consumed by ReportsController.
 *
 * Matches the actual Attendance entity + AttendanceStatus enum:
 *   - attendanceDate (LocalDate)
 *   - punchIn / punchOut (LocalTime)
 *   - status: PRESENT, ABSENT, HALF_DAY, LEAVE, WEEK_OFF, HOLIDAY
 *   - employee (ManyToOne -> Employee, accessed via getEmployee())
 *
 * IMPORTANT: There is no LATE status in this enum. "Late" is derived here by
 * comparing punchIn against a configurable shift-start time (default 09:15
 * AM) on days marked PRESENT. Adjust DEFAULT_SHIFT_START if your org's start
 * time differs, or pass a different shiftStart per call.
 *
 * Assumes Employee has getId() and getFullName(). Adjust if your Employee
 * entity names the field differently.
 *
 * Requires these two methods on AttendanceRepository (see the repository
 * additions file):
 *
 *   List<Attendance> findByEmployee_IdAndAttendanceDateBetween(Long employeeId, LocalDate from, LocalDate to);
 *   List<Attendance> findByAttendanceDateBetween(LocalDate from, LocalDate to);
 */
@Service
public class ReportService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    /** Default cutoff for "late" — punchIn after this on a PRESENT day counts as late. */
    private static final LocalTime DEFAULT_SHIFT_START = LocalTime.of(9, 15);

    public ReportService(AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    // ---------------------------------------------------------------
    // Employee-wise report
    // ---------------------------------------------------------------

    public List<Map<String, Object>> getEmployeeReport(Long employeeId, LocalDate from, LocalDate to) {
        List<Attendance> records =
                attendanceRepository.findByEmployee_IdAndAttendanceDateBetween(employeeId, from, to);
        records.sort(Comparator.comparing(Attendance::getAttendanceDate));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Attendance a : records) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", a.getAttendanceDate().format(DATE_FMT));
            row.put("checkIn", formatTime(a.getPunchIn()));
            row.put("checkOut", formatTime(a.getPunchOut()));
            row.put("status", displayStatus(a));
            row.put("remarks", a.getRemarks() != null ? a.getRemarks() : "");
            rows.add(row);
        }
        return rows;
    }

    // ---------------------------------------------------------------
    // Date-range report (all employees)
    // ---------------------------------------------------------------

    public List<Map<String, Object>> getDateRangeReport(LocalDate from, LocalDate to) {
        List<Attendance> records = attendanceRepository.findByAttendanceDateBetween(from, to);
        records.sort(Comparator
                .comparing(Attendance::getAttendanceDate)
                .thenComparing(a -> a.getEmployee() != null ? a.getEmployee().getFullName() : ""));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Attendance a : records) {
            Employee emp = a.getEmployee();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("employeeId", emp != null ? emp.getId() : null);
            row.put("employeeName", emp != null ? emp.getFullName() : "Unknown");
            row.put("date", a.getAttendanceDate().format(DATE_FMT));
            row.put("checkIn", formatTime(a.getPunchIn()));
            row.put("checkOut", formatTime(a.getPunchOut()));
            row.put("status", displayStatus(a));
            rows.add(row);
        }
        return rows;
    }

    // ---------------------------------------------------------------
    // Monthly summary grid (1 row per employee, day columns + totals)
    // ---------------------------------------------------------------

    public List<Map<String, Object>> getMonthlySummary(int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate from = yearMonth.atDay(1);
        LocalDate to = yearMonth.atEndOfMonth();
        int daysInMonth = yearMonth.lengthOfMonth();

        List<Attendance> records = attendanceRepository.findByAttendanceDateBetween(from, to);

        Map<Long, List<Attendance>> byEmployee = records.stream()
                .filter(a -> a.getEmployee() != null)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getId()));

        List<Employee> employees = employeeRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Employee emp : employees) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("employeeId", emp.getId());
            row.put("employeeName", emp.getFullName());

            List<Attendance> empRecords = byEmployee.getOrDefault(emp.getId(), Collections.emptyList());
            Map<Integer, Attendance> byDay = new HashMap<>();
            for (Attendance a : empRecords) {
                byDay.put(a.getAttendanceDate().getDayOfMonth(), a);
            }

            int present = 0, late = 0, halfDay = 0, absent = 0, leave = 0, weekOff = 0, holiday = 0;

            for (int day = 1; day <= daysInMonth; day++) {
                Attendance a = byDay.get(day);
                String code = a == null ? "-" : statusCode(a.getStatus());
                row.put("day" + day, code);

                if (a != null && isLate(a)) late++;

                switch (code) {
                    case "P": present++; break;
                    case "H": halfDay++; break;
                    case "A": absent++; break;
                    case "Lv": leave++; break;
                    case "WO": weekOff++; break;
                    case "Ho": holiday++; break;
                    default: break;
                }
            }

            row.put("presentCount", present);
            row.put("lateCount", late);
            row.put("halfDayCount", halfDay);
            row.put("absentCount", absent);
            row.put("leaveCount", leave);
            row.put("weekOffCount", weekOff);
            row.put("holidayCount", holiday);

            rows.add(row);
        }

        return rows;
    }

    // ---------------------------------------------------------------
    // Late-comers / Absentees
    // ---------------------------------------------------------------

    /** Late = PRESENT with punchIn after shiftStart (defaults to 09:15 AM). */
    public List<Map<String, Object>> getLateComers(LocalDate from, LocalDate to, int threshold) {
        List<Attendance> records = attendanceRepository.findByAttendanceDateBetween(from, to);

        Map<Long, List<Attendance>> byEmployee = records.stream()
                .filter(a -> a.getEmployee() != null)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getId()));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<Long, List<Attendance>> entry : byEmployee.entrySet()) {
            long count = entry.getValue().stream().filter(this::isLate).count();

            if (count >= threshold) {
                Employee emp = entry.getValue().get(0).getEmployee();
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("employeeId", entry.getKey());
                row.put("employeeName", emp != null ? emp.getFullName() : "Unknown");
                row.put("lateCount", count);
                rows.add(row);
            }
        }

        rows.sort((r1, r2) -> ((Long) r2.get("lateCount")).compareTo((Long) r1.get("lateCount")));
        return rows;
    }

    public List<Map<String, Object>> getAbsentees(LocalDate from, LocalDate to, int threshold) {
        return filterByStatusCount(from, to, AttendanceStatus.ABSENT, threshold);
    }

    private List<Map<String, Object>> filterByStatusCount(
            LocalDate from, LocalDate to, AttendanceStatus status, int threshold) {

        List<Attendance> records = attendanceRepository.findByAttendanceDateBetween(from, to);

        Map<Long, List<Attendance>> byEmployee = records.stream()
                .filter(a -> a.getEmployee() != null)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getId()));

        String countKey = status.name().toLowerCase() + "Count";
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Map.Entry<Long, List<Attendance>> entry : byEmployee.entrySet()) {
            long count = entry.getValue().stream()
                    .filter(a -> status.equals(a.getStatus()))
                    .count();

            if (count >= threshold) {
                Employee emp = entry.getValue().get(0).getEmployee();
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("employeeId", entry.getKey());
                row.put("employeeName", emp != null ? emp.getFullName() : "Unknown");
                row.put(countKey, count);
                rows.add(row);
            }
        }

        rows.sort((r1, r2) -> {
            Long c1 = ((Number) r1.get(countKey)).longValue();
            Long c2 = ((Number) r2.get(countKey)).longValue();
            return c2.compareTo(c1); // descending
        });

        return rows;
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private boolean isLate(Attendance a) {
        return a.getStatus() == AttendanceStatus.PRESENT
                && a.getPunchIn() != null
                && a.getPunchIn().isAfter(DEFAULT_SHIFT_START);
    }

    /** Status shown in row-level reports: shows "Late" as a derived label instead of the raw enum. */
    private String displayStatus(Attendance a) {
        if (isLate(a)) return "Late";
        return a.getStatus() != null ? toTitleCase(a.getStatus().name()) : "--";
    }

    private String statusCode(AttendanceStatus status) {
        if (status == null) return "-";
        switch (status) {
            case PRESENT: return "P";
            case HALF_DAY: return "H";
            case ABSENT: return "A";
            case LEAVE: return "Lv";
            case WEEK_OFF: return "WO";
            case HOLIDAY: return "Ho";
            default: return "-";
        }
    }

    private String toTitleCase(String enumName) {
        String[] parts = enumName.split("_");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (part.isEmpty()) continue;
            sb.append(Character.toUpperCase(part.charAt(0)))
              .append(part.substring(1).toLowerCase())
              .append(" ");
        }
        return sb.toString().trim();
    }

    private String formatTime(LocalTime time) {
        if (time == null) return "--";
        return time.format(TIME_FMT);
    }
}