package com.staffsync.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.staffsync.model.Attendance;
import com.staffsync.model.Employee;
import com.staffsync.repository.AttendanceRepository;
import com.staffsync.repository.EmployeeRepository;

@Service
public class SuperAdminReportsService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    public SuperAdminReportsService(
            EmployeeRepository employeeRepository,
            AttendanceRepository attendanceRepository) {

        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public Map<String, Object> generateReport(
            String type,
            LocalDate fromDate,
            LocalDate toDate) {

        if (fromDate != null && toDate != null
                && fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    "From date cannot be after to date"
            );
        }

        List<Employee> employees =
                employeeRepository.findAll();

        List<Attendance> allAttendance =
                attendanceRepository.findAll();

        List<Attendance> filteredAttendance =
                filterAttendance(
                        allAttendance,
                        fromDate,
                        toDate
                );

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "reportType",
                type == null ? "attendance" : type
        );

        response.put(
                "fromDate",
                fromDate
        );

        response.put(
                "toDate",
                toDate
        );

        response.put(
                "totalEmployees",
                employees.size()
        );

        long totalPresent =
                filteredAttendance.stream()
                        .filter(this::isPresent)
                        .count();

        long totalAbsent =
                filteredAttendance.stream()
                        .filter(this::isAbsent)
                        .count();

        response.put(
                "totalPresent",
                totalPresent
        );

        response.put(
                "totalAbsent",
                totalAbsent
        );

        response.put(
                "totalAttendance",
                filteredAttendance.size()
        );

        response.put(
                "attendanceRecords",
                buildAttendanceRecords(
                        filteredAttendance
                )
        );

        response.put(
                "employeeRecords",
                buildEmployeeRecords(employees)
        );

        return response;
    }

    private List<Attendance> filterAttendance(
            List<Attendance> attendanceList,
            LocalDate fromDate,
            LocalDate toDate) {

        if (fromDate == null && toDate == null) {
            return attendanceList;
        }

        List<Attendance> filtered =
                new ArrayList<>();

        for (Attendance attendance : attendanceList) {

            if (attendance == null) {
                continue;
            }

            LocalDate attendanceDate =
                    attendance.getAttendanceDate();

            if (attendanceDate == null) {
                continue;
            }

            boolean matchesFromDate =
                    fromDate == null
                            || !attendanceDate.isBefore(fromDate);

            boolean matchesToDate =
                    toDate == null
                            || !attendanceDate.isAfter(toDate);

            if (matchesFromDate && matchesToDate) {
                filtered.add(attendance);
            }
        }

        return filtered;
    }

    private List<Map<String, Object>> buildAttendanceRecords(
            List<Attendance> attendanceList) {

        List<Map<String, Object>> records =
                new ArrayList<>();

        for (Attendance attendance : attendanceList) {

            Map<String, Object> record =
                    new LinkedHashMap<>();

            Employee employee =
                    attendance.getEmployee();

            record.put(
                    "id",
                    attendance.getId()
            );

            record.put(
                    "employeeId",
                    employee != null
                            ? employee.getId()
                            : null
            );

            record.put(
                    "employeeName",
                    employee != null
                            ? employee.getFullName()
                            : "Unknown"
            );

            record.put(
                    "attendanceDate",
                    attendance.getAttendanceDate()
            );

            record.put(
                    "punchIn",
                    attendance.getPunchIn()
            );

            record.put(
                    "punchOut",
                    attendance.getPunchOut()
            );

            record.put(
                    "status",
                    attendance.getStatus() != null
                            ? attendance.getStatus().toString()
                            : null
            );

            record.put(
                    "remarks",
                    attendance.getRemarks()
            );

            records.add(record);
        }

        return records;
    }

    private List<Map<String, Object>> buildEmployeeRecords(
            List<Employee> employees) {

        List<Map<String, Object>> records =
                new ArrayList<>();

        for (Employee employee : employees) {

            Map<String, Object> record =
                    new LinkedHashMap<>();

            record.put(
                    "id",
                    employee.getId()
            );

            record.put(
                    "fullName",
                    employee.getFullName()
            );

            record.put(
                    "email",
                    employee.getEmail()
            );

            record.put(
                    "phone",
                    employee.getPhone()
            );

            record.put(
                    "currentAddress",
                    employee.getCurrentAddress()
            );

            record.put(
                    "permanentAddress",
                    employee.getPermanentAddress()
            );

            record.put(
                    "aadhaarOrPan",
                    employee.getAadhaarOrPan()
            );

            record.put(
                    "birthDate",
                    employee.getBirthDate()
            );

            record.put(
                    "maritalStatus",
                    employee.getMaritalStatus()
            );

            record.put(
                    "spouseName",
                    employee.getSpouseName()
            );

            record.put(
                    "spouseEmployer",
                    employee.getSpouseEmployer()
            );

            record.put(
                    "spouseWorkPhone",
                    employee.getSpouseWorkPhone()
            );

            records.add(record);
        }

        return records;
    }

    private boolean isPresent(Attendance attendance) {

        if (attendance.getStatus() == null) {
            return false;
        }

        return "PRESENT".equalsIgnoreCase(
                attendance.getStatus().toString()
        );
    }

    private boolean isAbsent(Attendance attendance) {

        if (attendance.getStatus() == null) {
            return false;
        }

        return "ABSENT".equalsIgnoreCase(
                attendance.getStatus().toString()
        );
    }
}