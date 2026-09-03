package com.staffsync.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class EmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    private String address;

    private String primaryPhone;

    private String relationship;

    @OneToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

	public EmergencyContact() {
		super();
		// TODO Auto-generated constructor stub
	}

	public EmergencyContact(Long id, String fullName, String address, String primaryPhone, String relationship,
			Employee employee) {
		super();
		this.id = id;
		this.fullName = fullName;
		this.address = address;
		this.primaryPhone = primaryPhone;
		this.relationship = relationship;
		this.employee = employee;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getPrimaryPhone() {
		return primaryPhone;
	}

	public void setPrimaryPhone(String primaryPhone) {
		this.primaryPhone = primaryPhone;
	}

	public String getRelationship() {
		return relationship;
	}

	public void setRelationship(String relationship) {
		this.relationship = relationship;
	}

	public Employee getEmployee() {
		return employee;
	}

	public void setEmployee(Employee employee) {
		this.employee = employee;
	}

	@Override
	public String toString() {
		return "EmergencyContact [id=" + id + ", fullName=" + fullName + ", address=" + address + ", primaryPhone="
				+ primaryPhone + ", relationship=" + relationship + ", employee=" + employee + "]";
	}
    
    
}