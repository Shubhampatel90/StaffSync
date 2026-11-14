package com.staffsync.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.staffsync.model.Attendance;
import com.staffsync.model.Employee;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

	// ============================================================
	// FIND ATTENDANCE FOR EMPLOYEE ON SPECIFIC DATE
	// ============================================================

	Optional<Attendance> findByEmployeeAndAttendanceDate(Employee employee, LocalDate attendanceDate);

	// ============================================================
	// CHECK WHETHER EMPLOYEE ALREADY HAS ATTENDANCE FOR DATE
	// Used by automatic absence scheduler
	// Prevents duplicate attendance records
	// ============================================================

	boolean existsByEmployeeAndAttendanceDate(Employee employee, LocalDate attendanceDate);

	// ============================================================
	// GET ALL ATTENDANCE FOR EMPLOYEE
	// Latest attendance first
	// ============================================================

	List<Attendance> findByEmployeeOrderByAttendanceDateDesc(Employee employee);

	// ============================================================
	// GET EMPLOYEE ATTENDANCE BETWEEN TWO DATES
	// ============================================================

	List<Attendance> findByEmployeeAndAttendanceDateBetween(Employee employee, LocalDate startDate, LocalDate endDate);

	// ============================================================
	// GET ALL EMPLOYEE ATTENDANCE FOR SPECIFIC DATE
	// Used by Admin
	// ============================================================

	List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

	// ============================================================
	// GET EMPLOYEE ATTENDANCE BY EMPLOYEE ID
	// BETWEEN TWO DATES
	// ============================================================

	List<Attendance> findByEmployee_IdAndAttendanceDateBetween(Long employeeId, LocalDate from, LocalDate to);

	// ============================================================
	// GET ALL ATTENDANCE BETWEEN TWO DATES
	// Used by Reports
	// ============================================================

	List<Attendance> findByAttendanceDateBetween(LocalDate from, LocalDate to);
}