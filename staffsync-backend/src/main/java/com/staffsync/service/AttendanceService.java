package com.staffsync.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.staffsync.model.Attendance;
import com.staffsync.model.AttendanceStatus;
import com.staffsync.model.Employee;
import com.staffsync.repository.AttendanceRepository;
import com.staffsync.repository.EmployeeRepository;

@Service
public class AttendanceService {

	private final AttendanceRepository attendanceRepository;
	private final EmployeeRepository employeeRepository;

	// Adjust to your company's official start time
	private static final LocalTime LATE_CUTOFF = LocalTime.of(9, 30);

	public AttendanceService(AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {

		this.attendanceRepository = attendanceRepository;
		this.employeeRepository = employeeRepository;
	}

	// ============================================================
	// PUNCH IN
	// ============================================================

	@Transactional
	public Attendance punchIn(Long employeeId) {

		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

		LocalDate today = LocalDate.now();
		LocalTime currentTime = LocalTime.now();

		Attendance attendance = attendanceRepository.findByEmployeeAndAttendanceDate(employee, today).orElse(null);

		// Already punched in
		if (attendance != null && attendance.getPunchIn() != null) {
			throw new RuntimeException("Employee has already punched in today");
		}

		AttendanceStatus punchInStatus = determineStatusFromCheckInTime(currentTime);
		String remark = punchInStatus == AttendanceStatus.LATE ? "Punched in late" : "Punched in successfully";

		// Existing attendance record without punch-in
		if (attendance != null) {

			attendance.setPunchIn(currentTime);
			attendance.setStatus(punchInStatus);
			attendance.setRemarks(remark);

			return attendanceRepository.save(attendance);
		}

		// Create new attendance
		attendance = new Attendance();

		attendance.setEmployee(employee);
		attendance.setAttendanceDate(today);
		attendance.setPunchIn(currentTime);
		attendance.setStatus(punchInStatus);
		attendance.setRemarks(remark);

		return attendanceRepository.save(attendance);
	}

	// ============================================================
	// PUNCH OUT
	// ============================================================

	@Transactional
	public Attendance punchOut(Long employeeId) {

		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

		LocalDate today = LocalDate.now();

		Attendance attendance = attendanceRepository.findByEmployeeAndAttendanceDate(employee, today)
				.orElseThrow(() -> new RuntimeException("Please punch in first"));

		// Punch-in missing
		if (attendance.getPunchIn() == null) {
			throw new RuntimeException("Please punch in first");
		}

		// Already punched out
		if (attendance.getPunchOut() != null) {
			throw new RuntimeException("Employee has already punched out today");
		}

		LocalTime punchOut = LocalTime.now();

		attendance.setPunchOut(punchOut);

		// ========================================================
		// CALCULATE WORKING HOURS
		// ========================================================

		Duration duration = Duration.between(attendance.getPunchIn(), punchOut);

		long totalMinutes = duration.toMinutes();

		long hours = totalMinutes / 60;
		long minutes = totalMinutes % 60;

		// ========================================================
		// DETERMINE STATUS
		// Preserve LATE from punch-in unless hours are short enough
		// to count as a HALF_DAY regardless of arrival time.
		// ========================================================

		if (totalMinutes < 8 * 60) {
			attendance.setStatus(AttendanceStatus.HALF_DAY);
		} else if (attendance.getStatus() == AttendanceStatus.LATE) {
			attendance.setStatus(AttendanceStatus.LATE); // keep as-is
		} else {
			attendance.setStatus(AttendanceStatus.PRESENT);
		}

		attendance.setRemarks("Working hours: " + hours + "h " + minutes + "m");

		return attendanceRepository.save(attendance);
	}

	// ============================================================
	// GET ALL ATTENDANCE
	// ============================================================

	public List<Attendance> getAllAttendance() {

		return attendanceRepository.findAll();
	}

	// ============================================================
	// GET ATTENDANCE BY ID
	// ============================================================

	public Attendance getAttendanceById(Long id) {

		return attendanceRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));
	}

	// ============================================================
	// GET EMPLOYEE ATTENDANCE
	// ============================================================

	public List<Attendance> getEmployeeAttendance(Long employeeId) {

		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

		return attendanceRepository.findByEmployeeOrderByAttendanceDateDesc(employee);
	}

	// ============================================================
	// GET MONTH / DATE RANGE ATTENDANCE
	// ============================================================

	public List<Attendance> getMonthlyAttendance(Long employeeId, LocalDate startDate, LocalDate endDate) {

		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

		return attendanceRepository.findByEmployeeAndAttendanceDateBetween(employee, startDate, endDate);
	}

	// ============================================================
	// GET ATTENDANCE BY DATE
	// ============================================================

	public List<Attendance> getAttendanceByDate(LocalDate date) {

		return attendanceRepository.findByAttendanceDate(date);
	}

	// ============================================================
	// ADD ATTENDANCE
	// ============================================================

	@Transactional
	public Attendance addAttendance(Long employeeId, Attendance attendance) {

		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

		// Prevent manually updating an existing record
		attendance.setId(null);

		// Make sure employee comes from database
		attendance.setEmployee(employee);

		// Prevent duplicate attendance for same employee/date
		if (attendance.getAttendanceDate() != null) {

			boolean exists = attendanceRepository
					.findByEmployeeAndAttendanceDate(employee, attendance.getAttendanceDate()).isPresent();

			if (exists) {
				throw new RuntimeException(
						"Attendance already exists for this employee on " + attendance.getAttendanceDate());
			}
		}

		return attendanceRepository.save(attendance);
	}

	// ============================================================
	// UPDATE ATTENDANCE
	// ============================================================

	@Transactional
	public Attendance updateAttendance(Long attendanceId, Long employeeId, Attendance updatedAttendance) {

		Attendance existingAttendance = attendanceRepository.findById(attendanceId)
				.orElseThrow(() -> new RuntimeException("Attendance not found with id: " + attendanceId));

		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

		existingAttendance.setAttendanceDate(updatedAttendance.getAttendanceDate());

		existingAttendance.setPunchIn(updatedAttendance.getPunchIn());

		existingAttendance.setPunchOut(updatedAttendance.getPunchOut());

		existingAttendance.setStatus(updatedAttendance.getStatus());

		existingAttendance.setRemarks(updatedAttendance.getRemarks());

		existingAttendance.setEmployee(employee);

		return attendanceRepository.save(existingAttendance);
	}

	// ============================================================
	// DELETE ATTENDANCE
	// ============================================================

	@Transactional
	public void deleteAttendance(Long id) {

		Attendance attendance = attendanceRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));

		attendanceRepository.delete(attendance);
	}

	// ============================================================
	// HELPER: determine status from punch-in time
	// ============================================================

	private AttendanceStatus determineStatusFromCheckInTime(LocalTime checkInTime) {
		return checkInTime.isAfter(LATE_CUTOFF) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
	}
}