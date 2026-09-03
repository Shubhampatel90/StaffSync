package com.staffsync.model;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Attendance {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private LocalDate attendanceDate;

	private LocalTime punchIn;

	private LocalTime punchOut;

	@Enumerated(EnumType.STRING)
	private AttendanceStatus status;

	private String remarks;

	@ManyToOne
	@JoinColumn(name = "employee_id")
	private Employee employee;

	public Attendance() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Attendance(Long id, LocalDate attendanceDate, LocalTime punchIn, LocalTime punchOut, AttendanceStatus status,
			String remarks, Employee employee) {
		super();
		this.id = id;
		this.attendanceDate = attendanceDate;
		this.punchIn = punchIn;
		this.punchOut = punchOut;
		this.status = status;
		this.remarks = remarks;
		this.employee = employee;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDate getAttendanceDate() {
		return attendanceDate;
	}

	public void setAttendanceDate(LocalDate attendanceDate) {
		this.attendanceDate = attendanceDate;
	}

	public LocalTime getPunchIn() {
		return punchIn;
	}

	public void setPunchIn(LocalTime punchIn) {
		this.punchIn = punchIn;
	}

	public LocalTime getPunchOut() {
		return punchOut;
	}

	public void setPunchOut(LocalTime punchOut) {
		this.punchOut = punchOut;
	}

	public AttendanceStatus getStatus() {
		return status;
	}

	public void setStatus(AttendanceStatus status) {
		this.status = status;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public Employee getEmployee() {
		return employee;
	}

	public void setEmployee(Employee employee) {
		this.employee = employee;
	}

	@Override
	public String toString() {
		return "Attendance [id=" + id + ", attendanceDate=" + attendanceDate + ", punchIn=" + punchIn + ", punchOut="
				+ punchOut + ", status=" + status + ", remarks=" + remarks + ", employee=" + employee + "]";
	}

	
}