package com.staffsync.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class Job {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String title;

	private String supervisor;

	private String workLocation;

	private String emailAddress;

	private String workPhone;

	private LocalDate startDate;

	private BigDecimal salary;

	@OneToOne
	@JoinColumn(name = "employee_id")
	private Employee employee;

	public Job() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Job(Long id, String title, String supervisor, String workLocation, String emailAddress, String workPhone,
			LocalDate startDate, BigDecimal salary, Employee employee) {
		super();
		this.id = id;
		this.title = title;
		this.supervisor = supervisor;
		this.workLocation = workLocation;
		this.emailAddress = emailAddress;
		this.workPhone = workPhone;
		this.startDate = startDate;
		this.salary = salary;
		this.employee = employee;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getSupervisor() {
		return supervisor;
	}

	public void setSupervisor(String supervisor) {
		this.supervisor = supervisor;
	}

	public String getWorkLocation() {
		return workLocation;
	}

	public void setWorkLocation(String workLocation) {
		this.workLocation = workLocation;
	}

	public String getEmailAddress() {
		return emailAddress;
	}

	public void setEmailAddress(String emailAddress) {
		this.emailAddress = emailAddress;
	}

	public String getWorkPhone() {
		return workPhone;
	}

	public void setWorkPhone(String workPhone) {
		this.workPhone = workPhone;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public BigDecimal getSalary() {
		return salary;
	}

	public void setSalary(BigDecimal salary) {
		this.salary = salary;
	}

	public Employee getEmployee() {
		return employee;
	}

	public void setEmployee(Employee employee) {
		this.employee = employee;
	}

	@Override
	public String toString() {
		return "Job [id=" + id + ", title=" + title + ", supervisor=" + supervisor + ", workLocation=" + workLocation
				+ ", emailAddress=" + emailAddress + ", workPhone=" + workPhone + ", startDate=" + startDate
				+ ", salary=" + salary + ", employee=" + employee + "]";
	}

}