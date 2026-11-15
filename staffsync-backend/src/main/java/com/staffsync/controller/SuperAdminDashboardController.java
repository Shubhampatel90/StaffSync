package com.staffsync.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.staffsync.model.Admin;
import com.staffsync.model.AdminRole;
import com.staffsync.model.Attendance;
import com.staffsync.model.Employee;
import com.staffsync.repository.AdminRepository;
import com.staffsync.repository.AttendanceRepository;
import com.staffsync.repository.EmployeeRepository;
import com.staffsync.service.AttendanceService;
import com.staffsync.service.SuperAdminReportsService;

@RestController
@RequestMapping("/api/super-admin/")
@CrossOrigin(
	    origins = {
	        "http://localhost:5173",
	        "http://127.0.0.1:5173",
	        "https://staffsync-75b.pages.dev"
	    },
	    allowCredentials = "true"
	)
public class SuperAdminDashboardController {

	private final AdminRepository adminRepository;
	private final EmployeeRepository employeeRepository;
	private final AttendanceService attendanceService;
	private final AttendanceRepository attendanceRepository;
	private final SuperAdminReportsService reportsService;

	public SuperAdminDashboardController(AdminRepository adminRepository, EmployeeRepository employeeRepository,
			AttendanceService attendanceService, AttendanceRepository attendanceRepository,
			SuperAdminReportsService reportsServic) {

		this.adminRepository = adminRepository;
		this.employeeRepository = employeeRepository;
		this.attendanceService = attendanceService;
		this.attendanceRepository = attendanceRepository;
		this.reportsService = reportsServic;
	}

	// ============================================================
	// DASHBOARD
	// GET /api/super-admin/dashboard
	// ============================================================

	@GetMapping("/dashboard")
	public ResponseEntity<?> getDashboardData() {

		try {

			LocalDate today = LocalDate.now();

			long totalAdmins = adminRepository.count();

			long activeAdmins = adminRepository.findAll().stream().filter(Admin::isActive).count();

			long totalEmployees = employeeRepository.count();

			List<Attendance> todayAttendance = attendanceService.getAttendanceByDate(today);

			long present = 0;
			long absent = 0;
			long halfDay = 0;

			for (Attendance attendance : todayAttendance) {

				if (attendance.getStatus() == null) {
					continue;
				}

				switch (attendance.getStatus().name()) {

				case "PRESENT":
					present++;
					break;

				case "ABSENT":
					absent++;
					break;

				case "HALF_DAY":
					halfDay++;
					break;

				default:
					break;
				}
			}

			double attendancePercentage = 0;

			if (totalEmployees > 0) {
				attendancePercentage = (present * 100.0) / totalEmployees;
			}

			Map<String, Object> response = new HashMap<>();

			response.put("date", today);
			response.put("totalAdmins", totalAdmins);
			response.put("totalEmployees", totalEmployees);
			response.put("activeAdmins", activeAdmins);
			response.put("present", present);
			response.put("absent", absent);
			response.put("halfDay", halfDay);
			response.put("attendancePercentage", Math.round(attendancePercentage * 10.0) / 10.0);
			response.put("todayAttendanceCount", todayAttendance.size());

			return ResponseEntity.ok(response);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ============================================================
	// ADMIN MANAGEMENT
	// ============================================================

	// ============================================================
	// GET ALL ADMINS
	// GET /api/super-admin/admins
	// ============================================================

	@GetMapping("/admins")
	public ResponseEntity<?> getAllAdmins() {

		try {

			List<Admin> admins = adminRepository.findAll();

			List<Map<String, Object>> response = admins.stream().map(admin -> {

				Map<String, Object> data = new HashMap<>();

				data.put("id", admin.getId());

				data.put("fullName", admin.getFullName());

				data.put("email", admin.getEmail());

				data.put("role", admin.getRole() != null ? admin.getRole().name() : null);

				data.put("active", admin.isActive());

				return data;
			}).toList();

			return ResponseEntity.ok(response);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ============================================================
	// GET ADMIN BY ID
	// GET /api/super-admin/admins/{id}
	// ============================================================

	@GetMapping("/admins/{id}")
	public ResponseEntity<?> getAdminById(@PathVariable Long id) {

		try {

			Admin admin = adminRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

			Map<String, Object> response = new HashMap<>();

			response.put("id", admin.getId());

			response.put("fullName", admin.getFullName());

			response.put("email", admin.getEmail());

			response.put("role", admin.getRole() != null ? admin.getRole().name() : null);

			response.put("active", admin.isActive());

			return ResponseEntity.ok(response);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ============================================================
	// CREATE ADMIN
	// POST /api/super-admin/admins
	// ============================================================

	@PostMapping("/admins")
	public ResponseEntity<?> createAdmin(@RequestBody Map<String, Object> request) {

		try {

			String fullName = request.get("fullName") != null ? request.get("fullName").toString().trim() : "";

			String email = request.get("email") != null ? request.get("email").toString().trim().toLowerCase() : "";

			String password = request.get("password") != null ? request.get("password").toString() : "";

			String roleValue = request.get("role") != null ? request.get("role").toString() : "ADMIN";

			if (fullName.isEmpty()) {

				return ResponseEntity.badRequest().body("Full name is required");
			}

			if (email.isEmpty()) {

				return ResponseEntity.badRequest().body("Email is required");
			}

			if (password.isEmpty()) {

				return ResponseEntity.badRequest().body("Password is required");
			}

			if (adminRepository.existsByEmail(email)) {

				return ResponseEntity.badRequest().body("Admin with this email already exists");
			}

			AdminRole role;

			try {

				role = AdminRole.valueOf(roleValue.toUpperCase());

			} catch (Exception e) {

				return ResponseEntity.badRequest().body("Invalid admin role");
			}

			Admin admin = new Admin(fullName, email, password, role);

			if (request.containsKey("active")) {

				Object activeValue = request.get("active");

				if (activeValue instanceof Boolean) {

					admin.setActive((Boolean) activeValue);
				}
			}

			Admin savedAdmin = adminRepository.save(admin);

			return ResponseEntity.ok(createAdminResponse(savedAdmin));

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ============================================================
	// UPDATE ADMIN
	// PUT /api/super-admin/admins/{id}
	// ============================================================

	@PutMapping("/admins/{id}")
	public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Map<String, Object> request) {

		try {

			Admin existingAdmin = adminRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

			String fullName = request.get("fullName") != null ? request.get("fullName").toString().trim()
					: existingAdmin.getFullName();

			String email = request.get("email") != null ? request.get("email").toString().trim().toLowerCase()
					: existingAdmin.getEmail();

			if (fullName.isEmpty()) {

				return ResponseEntity.badRequest().body("Full name is required");
			}

			if (email.isEmpty()) {

				return ResponseEntity.badRequest().body("Email is required");
			}

			if (!email.equalsIgnoreCase(existingAdmin.getEmail()) && adminRepository.existsByEmail(email)) {

				return ResponseEntity.badRequest().body("Another admin already uses this email");
			}

			existingAdmin.setFullName(fullName);
			existingAdmin.setEmail(email);

			if (request.get("role") != null) {

				try {

					AdminRole role = AdminRole.valueOf(request.get("role").toString().toUpperCase());

					existingAdmin.setRole(role);

				} catch (Exception e) {

					return ResponseEntity.badRequest().body("Invalid admin role");
				}
			}

			/*
			 * Password is optional while editing. If blank, the existing password remains
			 * unchanged.
			 */

			if (request.get("password") != null) {

				String password = request.get("password").toString().trim();

				if (!password.isEmpty()) {
					existingAdmin.setPassword(password);
				}
			}

			if (request.containsKey("active")) {

				Object activeValue = request.get("active");

				if (activeValue instanceof Boolean) {

					existingAdmin.setActive((Boolean) activeValue);
				}
			}

			Admin savedAdmin = adminRepository.save(existingAdmin);

			return ResponseEntity.ok(createAdminResponse(savedAdmin));

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ============================================================
	// ACTIVATE / DEACTIVATE ADMIN
	// PUT /api/super-admin/admins/{id}/status?active=true
	// ============================================================

	@PutMapping("/admins/{id}/status")
	public ResponseEntity<?> updateAdminStatus(@PathVariable Long id, @RequestParam boolean active) {

		try {

			Admin admin = adminRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

			admin.setActive(active);

			Admin savedAdmin = adminRepository.save(admin);

			return ResponseEntity.ok(createAdminResponse(savedAdmin));

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ============================================================
	// DELETE ADMIN
	// DELETE /api/super-admin/admins/{id}
	// ============================================================

	@DeleteMapping("/admins/{id}")
	public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {

		try {

			if (!adminRepository.existsById(id)) {

				return ResponseEntity.notFound().build();
			}

			adminRepository.deleteById(id);

			return ResponseEntity.noContent().build();

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ============================================================
	// ADMIN RESPONSE
	// ============================================================

	private Map<String, Object> createAdminResponse(Admin admin) {

		Map<String, Object> response = new HashMap<>();

		response.put("id", admin.getId());

		response.put("fullName", admin.getFullName());

		response.put("email", admin.getEmail());

		response.put("role", admin.getRole() != null ? admin.getRole().name() : null);

		response.put("active", admin.isActive());

		return response;
	}

	// ============================================================
	// EMPLOYEE MANAGEMENT
	// ============================================================

	@GetMapping("/employees")
	public ResponseEntity<List<Employee>> getAllEmployees() {

		return ResponseEntity.ok(employeeRepository.findAll());
	}

	@PostMapping("/employees/create")
	public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {

		return ResponseEntity.ok(employeeRepository.save(employee));
	}

	@PutMapping("/employees/{id}")
	public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {

		try {

			Employee existingEmployee = employeeRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

			existingEmployee.setFullName(employee.getFullName());

			existingEmployee.setCurrentAddress(employee.getCurrentAddress());

			existingEmployee.setPermanentAddress(employee.getPermanentAddress());

			existingEmployee.setPhone(employee.getPhone());

			existingEmployee.setEmail(employee.getEmail());

			existingEmployee.setAadhaarOrPan(employee.getAadhaarOrPan());

			existingEmployee.setBirthDate(employee.getBirthDate());

			existingEmployee.setMaritalStatus(employee.getMaritalStatus());

			existingEmployee.setSpouseName(employee.getSpouseName());

			existingEmployee.setSpouseEmployer(employee.getSpouseEmployer());

			existingEmployee.setSpouseWorkPhone(employee.getSpouseWorkPhone());

			if (employee.getPassword() != null && !employee.getPassword().trim().isEmpty()) {

				existingEmployee.setPassword(employee.getPassword());
			}

			return ResponseEntity.ok(employeeRepository.save(existingEmployee));

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@DeleteMapping("/employees/{id}")
	public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {

		try {

			if (!employeeRepository.existsById(id)) {

				return ResponseEntity.notFound().build();
			}

			employeeRepository.deleteById(id);

			return ResponseEntity.noContent().build();

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ============================================================
	// ATTENDANCE
	// ============================================================

	@GetMapping("/attendance")
	public ResponseEntity<?> getAllAttendance() {

		try {

			List<Attendance> attendanceList = attendanceService.getAllAttendance();

			return ResponseEntity.ok(attendanceList);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/attendance/{id}")
	public ResponseEntity<?> getAttendanceById(@PathVariable Long id) {

		try {

			Attendance attendance = attendanceService.getAttendanceById(id);

			return ResponseEntity.ok(attendance);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/attendance/employee/{employeeId}")
	public ResponseEntity<?> getAttendanceByEmployee(@PathVariable Long employeeId) {

		try {

			if (!employeeRepository.existsById(employeeId)) {

				return ResponseEntity.notFound().build();
			}

			List<Attendance> attendanceList = attendanceService.getEmployeeAttendance(employeeId);

			return ResponseEntity.ok(attendanceList);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/attendance/employee/{employeeId}/date")
	public ResponseEntity<?> getEmployeeAttendanceByDate(@PathVariable Long employeeId, @RequestParam LocalDate date) {

		try {

			if (!employeeRepository.existsById(employeeId)) {

				return ResponseEntity.notFound().build();
			}

			List<Attendance> attendanceList = attendanceService.getMonthlyAttendance(employeeId, date, date);

			return ResponseEntity.ok(attendanceList);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/attendance/date")
	public ResponseEntity<?> getAttendanceByDate(@RequestParam LocalDate date) {

		try {

			List<Attendance> attendanceList = attendanceService.getAttendanceByDate(date);

			return ResponseEntity.ok(attendanceList);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/attendance/employee/{employeeId}/range")
	public ResponseEntity<?> getEmployeeAttendanceByRange(@PathVariable Long employeeId,
			@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {

		try {

			if (!employeeRepository.existsById(employeeId)) {

				return ResponseEntity.notFound().build();
			}

			List<Attendance> attendanceList = attendanceService.getMonthlyAttendance(employeeId, startDate, endDate);

			return ResponseEntity.ok(attendanceList);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/attendance/range")
	public ResponseEntity<?> getAttendanceByRange(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {

		try {

			List<Attendance> attendanceList = attendanceService.getAllAttendance().stream()
					.filter(attendance -> attendance.getAttendanceDate() != null
							&& !attendance.getAttendanceDate().isBefore(startDate)
							&& !attendance.getAttendanceDate().isAfter(endDate))
					.toList();

			return ResponseEntity.ok(attendanceList);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PostMapping("/attendance/employee/{employeeId}")
	public ResponseEntity<?> addAttendance(@PathVariable Long employeeId, @RequestBody Attendance attendance) {

		try {

			Attendance savedAttendance = attendanceService.addAttendance(employeeId, attendance);

			return ResponseEntity.ok(savedAttendance);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PutMapping("/attendance/{attendanceId}/employee/{employeeId}")
	public ResponseEntity<?> updateAttendance(@PathVariable Long attendanceId, @PathVariable Long employeeId,
			@RequestBody Attendance attendance) {

		try {

			Attendance updatedAttendance = attendanceService.updateAttendance(attendanceId, employeeId, attendance);

			return ResponseEntity.ok(updatedAttendance);

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@DeleteMapping("/attendance/{id}")
	public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {

		try {

			attendanceService.deleteAttendance(id);

			return ResponseEntity.noContent().build();

		} catch (Exception e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/reports")
	public ResponseEntity<Map<String, Object>> getReports(
			@RequestParam(required = false, defaultValue = "attendance") String type,

			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,

			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

		return ResponseEntity.ok(reportsService.generateReport(type, fromDate, toDate));
	}
}