package com.staffsync.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.staffsync.model.Attendance;
import com.staffsync.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }


    // =========================
    // PUNCH IN
    // =========================

    @PostMapping("/punch-in/{employeeId}")
    public ResponseEntity<?> punchIn(
            @PathVariable Long employeeId) {

        try {

            Attendance attendance =
                    attendanceService.punchIn(employeeId);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================
    // PUNCH OUT
    // =========================

    @PostMapping("/punch-out/{employeeId}")
    public ResponseEntity<?> punchOut(
            @PathVariable Long employeeId) {

        try {

            Attendance attendance =
                    attendanceService.punchOut(employeeId);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================
    // GET ATTENDANCE
    // =========================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getAttendance(
            @PathVariable Long employeeId) {

        try {

            List<Attendance> attendance =
                    attendanceService
                            .getEmployeeAttendance(employeeId);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================
    // MONTHLY ATTENDANCE
    // =========================

    @GetMapping("/employee/{employeeId}/monthly")
    public ResponseEntity<?> getMonthlyAttendance(
            @PathVariable Long employeeId,
            @RequestParam int year,
            @RequestParam int month) {

        try {

            LocalDate startDate =
                    LocalDate.of(year, month, 1);

            LocalDate endDate =
                    startDate.withDayOfMonth(
                            startDate.lengthOfMonth()
                    );

            List<Attendance> attendance =
                    attendanceService.getMonthlyAttendance(
                            employeeId,
                            startDate,
                            endDate
                    );

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}