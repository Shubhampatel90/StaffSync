
package com.staffsync.controller;

import com.staffsync.model.Attendance;
import com.staffsync.model.Employee;
import com.staffsync.repository.AttendanceRepository;
import com.staffsync.service.EmployeeService;
import com.staffsync.service.SystemSettingService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

	private final EmployeeService employeeService;
	private final AttendanceRepository attendanceRepository;
	private final SystemSettingService systemSettingService;

	public AdminController(EmployeeService employeeService, AttendanceRepository attendanceRepository,
			SystemSettingService systemSettingService) {

		this.employeeService = employeeService;
		this.attendanceRepository = attendanceRepository;
		this.systemSettingService = systemSettingService;
	}

	// ============================================================
	// SYSTEM SETTINGS HELPERS
	// ============================================================

	private String getSettingOrDefault(String key, String defaultValue) {
		try {
			String value = systemSettingService.getSettingValue(key);

			return value == null || value.isBlank() ? defaultValue : value.trim();

		} catch (Exception exception) {
			return defaultValue;
		}
	}

	private LocalTime getTimeSetting(String key, LocalTime defaultValue) {

		String value = getSettingOrDefault(key, defaultValue.toString());

		try {
			return LocalTime.parse(value);
		} catch (Exception exception) {
			return defaultValue;
		}
	}

	private int getGracePeriodMinutes() {
		String value = getSettingOrDefault("gracePeriod", "0");

		try {
			return Math.max(0, Integer.parseInt(value));
		} catch (NumberFormatException exception) {
			return 0;
		}
	}

	// ============================================================
	// ADMIN DASHBOARD
	// ============================================================

	@GetMapping("/dashboard")
	public ResponseEntity<Map<String, Object>> getDashboard() {

		LocalDate today = LocalDate.now();

		List<Employee> employees = employeeService.getAllEmployees();

		int totalEmployees = employees.size();

		List<Attendance> todayAttendance = attendanceRepository.findByAttendanceDate(today);

		LocalTime officeStartTime = getTimeSetting("officeStartTime", LocalTime.of(9, 0));

		LocalTime officeEndTime = getTimeSetting("officeEndTime", LocalTime.of(18, 0));

		int gracePeriodMinutes = getGracePeriodMinutes();

		LocalTime lateThreshold = officeStartTime.plusMinutes(gracePeriodMinutes);

		int presentToday = 0;
		int lateToday = 0;

		for (Attendance attendance : todayAttendance) {

			if (attendance.getPunchIn() != null) {

				presentToday++;

				if (attendance.getPunchIn().isAfter(lateThreshold)) {
					lateToday++;
				}
			}
		}

		int absentToday = Math.max(0, totalEmployees - presentToday);

		double attendanceRate = 0.0;

		if (totalEmployees > 0) {
			attendanceRate = ((double) presentToday / totalEmployees) * 100.0;

			attendanceRate = Math.round(attendanceRate * 10.0) / 10.0;
		}

		LocalTime currentTime = LocalTime.now();

		boolean officeOpen = !currentTime.isBefore(officeStartTime) && currentTime.isBefore(officeEndTime);

		Map<String, Object> dashboard = new HashMap<>();

		dashboard.put("totalEmployees", totalEmployees);
		dashboard.put("presentToday", presentToday);
		dashboard.put("lateToday", lateToday);
		dashboard.put("absentToday", absentToday);
		dashboard.put("attendanceRate", attendanceRate);
		dashboard.put("attendanceDate", today.toString());

		dashboard.put("workingHours", officeStartTime + " - " + officeEndTime);

		dashboard.put("officeStartTime", officeStartTime.toString());
		dashboard.put("officeEndTime", officeEndTime.toString());
		dashboard.put("gracePeriod", gracePeriodMinutes);
		dashboard.put("officeStatus", officeOpen ? "Open" : "Closed");

		return ResponseEntity.ok(dashboard);
	}

	// ============================================================
	// SYSTEM INFORMATION
	// ============================================================

	@GetMapping("/system-info")
	public ResponseEntity<Map<String, Object>> getSystemInfo() {

		LocalTime officeStartTime = getTimeSetting("officeStartTime", LocalTime.of(9, 0));

		LocalTime officeEndTime = getTimeSetting("officeEndTime", LocalTime.of(18, 0));

		Map<String, Object> info = new HashMap<>();

		info.put("officeStartTime", officeStartTime.toString());
		info.put("officeEndTime", officeEndTime.toString());
		info.put("gracePeriod", getGracePeriodMinutes());

		return ResponseEntity.ok(info);
	}

	// ============================================================
	// EMPLOYEE MANAGEMENT
	// ============================================================

	@GetMapping("/employees")
	public ResponseEntity<List<Employee>> getAllEmployees() {

		return ResponseEntity.ok(employeeService.getAllEmployees());
	}

	@GetMapping("/employees/{id}")
	public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {

		Employee employee = employeeService.getEmployeeById(id);

		if (employee == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(employee);
	}

	@GetMapping("/employees/{id}/image")
	public ResponseEntity<byte[]> getEmployeeImage(@PathVariable Long id) {

		Employee employee = employeeService.getEmployeeById(id);

		if (employee == null) {
			return ResponseEntity.notFound().build();
		}

		byte[] image = employee.getProfileImage();

		if (image == null || image.length == 0) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(image);
	}

	@PostMapping(value = "/employees", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Employee> addEmployee(@RequestPart("employee") Employee employee,
			@RequestPart(value = "image", required = false) MultipartFile image) {

		try {
			if (image != null && !image.isEmpty()) {
				employee.setProfileImage(image.getBytes());
			}

			Employee savedEmployee = employeeService.saveEmployee(employee);

			return ResponseEntity.ok(savedEmployee);

		} catch (Exception exception) {
			return ResponseEntity.internalServerError().build();
		}
	}

	@PutMapping("/employees/{id}")
	public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {

		Employee updatedEmployee = employeeService.updateEmployee(id, employee);

		return ResponseEntity.ok(updatedEmployee);
	}

	@DeleteMapping("/employees/{id}")
	public ResponseEntity<String> deleteEmployee(@PathVariable Long id) {

		employeeService.deleteEmployee(id);

		return ResponseEntity.ok("Employee deleted successfully");
	}

	// ============================================================
	// ATTENDANCE MANAGEMENT
	// ============================================================

	@PutMapping("/attendance/{id}")
	public ResponseEntity<?> updateAttendance(@PathVariable Long id, @RequestBody Attendance attendanceDetails) {

		Optional<Attendance> optionalAttendance = attendanceRepository.findById(id);

		if (optionalAttendance.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		Attendance existingAttendance = optionalAttendance.get();

		if (attendanceDetails.getAttendanceDate() != null) {
			existingAttendance.setAttendanceDate(attendanceDetails.getAttendanceDate());
		}

		existingAttendance.setPunchIn(attendanceDetails.getPunchIn());

		existingAttendance.setPunchOut(attendanceDetails.getPunchOut());

		if (attendanceDetails.getStatus() != null) {
			existingAttendance.setStatus(attendanceDetails.getStatus());
		}

		existingAttendance.setRemarks(attendanceDetails.getRemarks());

		if (attendanceDetails.getEmployee() != null && attendanceDetails.getEmployee().getId() != null) {

			Employee employee = employeeService.getEmployeeById(attendanceDetails.getEmployee().getId());

			if (employee == null) {
				return ResponseEntity.badRequest().body("Employee not found.");
			}

			existingAttendance.setEmployee(employee);
		}

		LocalTime punchIn = existingAttendance.getPunchIn();
		LocalTime punchOut = existingAttendance.getPunchOut();

		if (punchIn != null && punchOut != null && punchOut.isBefore(punchIn)) {

			return ResponseEntity.badRequest().body("Punch-out time cannot be earlier than punch-in time.");
		}

		Attendance savedAttendance = attendanceRepository.save(existingAttendance);

		return ResponseEntity.ok(savedAttendance);
	}

	@PostMapping("/attendance")
	public ResponseEntity<?> addAttendance(@RequestBody Attendance attendanceDetails) {

		if (attendanceDetails.getEmployee() == null || attendanceDetails.getEmployee().getId() == null) {
			return ResponseEntity.badRequest().body("Please select an employee.");
		}

		if (attendanceDetails.getAttendanceDate() == null) {
			return ResponseEntity.badRequest().body("Attendance date is required.");
		}

		if (attendanceDetails.getPunchIn() == null) {
			return ResponseEntity.badRequest().body("Punch-in time is required.");
		}

		if (attendanceDetails.getStatus() == null) {
			return ResponseEntity.badRequest().body("Attendance status is required.");
		}

		Long employeeId = attendanceDetails.getEmployee().getId();

		Employee employee = employeeService.getEmployeeById(employeeId);

		if (employee == null) {
			return ResponseEntity.badRequest().body("Employee not found.");
		}

		LocalDate attendanceDate = attendanceDetails.getAttendanceDate();

		boolean alreadyExists = attendanceRepository.findByAttendanceDate(attendanceDate).stream()
				.anyMatch(record -> record.getEmployee() != null && record.getEmployee().getId().equals(employeeId));

		if (alreadyExists) {
			return ResponseEntity.badRequest()
					.body("Attendance already exists for this employee on this date. Please edit the existing record.");
		}

		LocalTime punchIn = attendanceDetails.getPunchIn();
		LocalTime punchOut = attendanceDetails.getPunchOut();

		if (punchOut != null && punchOut.isBefore(punchIn)) {
			return ResponseEntity.badRequest().body("Punch-out time cannot be earlier than punch-in time.");
		}

		Attendance newAttendance = new Attendance();
		newAttendance.setEmployee(employee);
		newAttendance.setAttendanceDate(attendanceDate);
		newAttendance.setPunchIn(punchIn);
		newAttendance.setPunchOut(punchOut);
		newAttendance.setStatus(attendanceDetails.getStatus());

		String remarks = attendanceDetails.getRemarks();
		newAttendance.setRemarks(remarks == null || remarks.isBlank() ? "Manually added by admin"
				: "Manually added by admin: " + remarks.trim());

		Attendance savedAttendance = attendanceRepository.save(newAttendance);

		return ResponseEntity.ok(savedAttendance);
	}
}
