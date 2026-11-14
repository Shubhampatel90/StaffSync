package com.staffsync.config;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.staffsync.model.Attendance;
import com.staffsync.model.AttendanceStatus;
import com.staffsync.model.Employee;
import com.staffsync.repository.AttendanceRepository;
import com.staffsync.repository.EmployeeRepository;
import com.staffsync.service.SystemSettingService;

@Component
public class AttendanceScheduler {

	private final AttendanceRepository attendanceRepository;
	private final EmployeeRepository employeeRepository;
	private final SystemSettingService systemSettingService;

	public AttendanceScheduler(AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository,
			SystemSettingService systemSettingService) {
		this.attendanceRepository = attendanceRepository;
		this.employeeRepository = employeeRepository;
		this.systemSettingService = systemSettingService;
	}

	/**
	 * Runs every 5 minutes.
	 *
	 * Example:
	 *
	 * Office End Time = 18:30 Grace Period = 15 minutes
	 *
	 * Employees without attendance will be marked ABSENT after 18:45.
	 */
	@Scheduled(cron = "0 */5 * * * *")
	@Transactional
	public void markAbsentEmployees() {

		try {

			String officeEndTimeValue = systemSettingService.getSettingValue("officeEndTime");

			String gracePeriodValue = systemSettingService.getSettingValue("gracePeriod");

			/*
			 * If office end time has not been configured, do nothing.
			 */
			if (officeEndTimeValue == null || officeEndTimeValue.trim().isEmpty()) {

				return;
			}

			LocalTime officeEndTime = LocalTime.parse(officeEndTimeValue);

			/*
			 * Default grace period = 0 minutes.
			 */
			int gracePeriod = 0;

			if (gracePeriodValue != null && !gracePeriodValue.trim().isEmpty()) {

				try {

					gracePeriod = Integer.parseInt(gracePeriodValue);

				} catch (NumberFormatException ignored) {

					System.out.println("Invalid gracePeriod setting: " + gracePeriodValue);

					return;
				}
			}

			LocalTime absentMarkTime = officeEndTime.plusMinutes(gracePeriod);

			LocalTime currentTime = LocalTime.now();

			/*
			 * Do not mark employees absent before office end time + grace period.
			 */
			if (currentTime.isBefore(absentMarkTime)) {

				return;
			}

			LocalDate today = LocalDate.now();

			List<Employee> employees = employeeRepository.findAll();

			if (employees.isEmpty()) {
				return;
			}

			int markedAbsentCount = 0;

			for (Employee employee : employees) {

				/*
				 * Check whether this employee already has an attendance record today.
				 */
				boolean attendanceExists = attendanceRepository.existsByEmployeeAndAttendanceDate(employee, today);

				/*
				 * If attendance exists, do nothing.
				 *
				 * This includes: PRESENT HALF_DAY ABSENT etc.
				 */
				if (attendanceExists) {
					continue;
				}

				/*
				 * No attendance record means the employee has not punched in today.
				 */
				Attendance attendance = new Attendance();

				attendance.setAttendanceDate(today);

				attendance.setPunchIn(null);

				attendance.setPunchOut(null);

				attendance.setStatus(AttendanceStatus.ABSENT);

				attendance.setRemarks("Automatically marked absent");

				attendance.setEmployee(employee);

				attendanceRepository.save(attendance);

				markedAbsentCount++;
			}

			if (markedAbsentCount > 0) {

				System.out.println("StaffSync automatic absence: " + markedAbsentCount
						+ " employee(s) marked absent for " + today);
			}

		} catch (Exception e) {

			System.out.println("Automatic absence scheduler error: " + e.getMessage());

			e.printStackTrace();
		}
	}
}