package com.staffsync.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.staffsync.model.Attendance;
import com.staffsync.service.AttendanceService;

@RestController
@RequestMapping("/api/admin/attendance")
@CrossOrigin(origins = "*")
public class AdminAttendanceController {

    private final AttendanceService attendanceService;

    public AdminAttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // ============================================================
    // GET ALL ATTENDANCE
    // ============================================================

    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendance() {

        return ResponseEntity.ok(
                attendanceService.getAllAttendance()
        );
    }

    // ============================================================
    // GET ATTENDANCE BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getAttendanceById(
            @PathVariable Long id) {

        try {

            Attendance attendance =
                    attendanceService.getAttendanceById(id);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // GET ATTENDANCE BY DATE
    // Example:
    // GET /api/admin/attendance/date/2026-08-14
    // ============================================================

    @GetMapping("/date/{date}")
    public ResponseEntity<?> getAttendanceByDate(
            @PathVariable LocalDate date) {

        try {

            List<Attendance> attendance =
                    attendanceService.getAttendanceByDate(date);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // GET EMPLOYEE ATTENDANCE
    // Admin can view specific employee attendance
    // ============================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getEmployeeAttendance(
            @PathVariable Long employeeId) {

        try {

            List<Attendance> attendance =
                    attendanceService.getEmployeeAttendance(employeeId);

            return ResponseEntity.ok(attendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // GET EMPLOYEE ATTENDANCE BY DATE RANGE
    //
    // Example:
    // GET /api/admin/attendance/employee/5/range
    //     ?startDate=2026-08-01
    //     &endDate=2026-08-31
    // ============================================================

    @GetMapping("/employee/{employeeId}/range")
    public ResponseEntity<?> getMonthlyAttendance(
            @PathVariable Long employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        try {

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

    // ============================================================
    // ADD ATTENDANCE MANUALLY
    // ============================================================

    @PostMapping("/employee/{employeeId}")
    public ResponseEntity<?> addAttendance(
            @PathVariable Long employeeId,
            @RequestBody Attendance attendance) {

        try {

            Attendance savedAttendance =
                    attendanceService.addAttendance(
                            employeeId,
                            attendance
                    );

            return ResponseEntity.ok(savedAttendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // UPDATE ATTENDANCE
    // ============================================================

    @PutMapping("/{attendanceId}/employee/{employeeId}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Long attendanceId,
            @PathVariable Long employeeId,
            @RequestBody Attendance attendance) {

        try {

            Attendance updatedAttendance =
                    attendanceService.updateAttendance(
                            attendanceId,
                            employeeId,
                            attendance
                    );

            return ResponseEntity.ok(updatedAttendance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // DELETE ATTENDANCE
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttendance(
            @PathVariable Long id) {

        try {

            attendanceService.deleteAttendance(id);

            return ResponseEntity.ok(
                    "Attendance deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}