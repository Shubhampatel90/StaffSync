package com.staffsync.model;

import java.time.LocalDate;
import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class Employee {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String fullName;

	private String currentAddress;

	private String permanentAddress;

	private String phone;

	private String email;

	/*
	 * Password will be received from Flutter when creating/updating an employee,
	 * but it will NEVER be returned in JSON responses.
	 */
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String password;

	private String aadhaarOrPan;

	private LocalDate birthDate;

	private String maritalStatus;

	private String spouseName;

	private String spouseEmployer;

	private String spouseWorkPhone;

	/*
	 * Profile image is stored in MySQL.
	 *
	 * @JsonIgnore prevents the image byte[] from being returned as Base64 inside
	 * normal employee JSON responses.
	 */
	@Lob
	@Column(name = "profile_image", columnDefinition = "LONGBLOB")
	@JsonIgnore
	private byte[] profileImage;

	// ============================================================
	// DEFAULT CONSTRUCTOR
	// ============================================================

	public Employee() {
		super();
	}

	// ============================================================
	// FULL CONSTRUCTOR
	// ============================================================

	public Employee(Long id, String fullName, String currentAddress, String permanentAddress, String phone,
			String email, String password, String aadhaarOrPan, LocalDate birthDate, String maritalStatus,
			String spouseName, String spouseEmployer, String spouseWorkPhone, byte[] profileImage) {

		this.id = id;
		this.fullName = fullName;
		this.currentAddress = currentAddress;
		this.permanentAddress = permanentAddress;
		this.phone = phone;
		this.email = email;
		this.password = password;
		this.aadhaarOrPan = aadhaarOrPan;
		this.birthDate = birthDate;
		this.maritalStatus = maritalStatus;
		this.spouseName = spouseName;
		this.spouseEmployer = spouseEmployer;
		this.spouseWorkPhone = spouseWorkPhone;
		this.profileImage = profileImage;
	}

	// ============================================================
	// GETTERS / SETTERS
	// ============================================================

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

	public String getCurrentAddress() {
		return currentAddress;
	}

	public void setCurrentAddress(String currentAddress) {
		this.currentAddress = currentAddress;
	}

	public String getPermanentAddress() {
		return permanentAddress;
	}

	public void setPermanentAddress(String permanentAddress) {
		this.permanentAddress = permanentAddress;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getAadhaarOrPan() {
		return aadhaarOrPan;
	}

	public void setAadhaarOrPan(String aadhaarOrPan) {
		this.aadhaarOrPan = aadhaarOrPan;
	}

	public LocalDate getBirthDate() {
		return birthDate;
	}

	public void setBirthDate(LocalDate birthDate) {
		this.birthDate = birthDate;
	}

	public String getMaritalStatus() {
		return maritalStatus;
	}

	public void setMaritalStatus(String maritalStatus) {
		this.maritalStatus = maritalStatus;
	}

	public String getSpouseName() {
		return spouseName;
	}

	public void setSpouseName(String spouseName) {
		this.spouseName = spouseName;
	}

	public String getSpouseEmployer() {
		return spouseEmployer;
	}

	public void setSpouseEmployer(String spouseEmployer) {
		this.spouseEmployer = spouseEmployer;
	}

	public String getSpouseWorkPhone() {
		return spouseWorkPhone;
	}

	public void setSpouseWorkPhone(String spouseWorkPhone) {
		this.spouseWorkPhone = spouseWorkPhone;
	}

	public byte[] getProfileImage() {
		return profileImage;
	}

	public void setProfileImage(byte[] profileImage) {
		this.profileImage = profileImage;
	}

	// ============================================================
	// UPDATE EXISTING EMPLOYEE
	// ============================================================

	public void updateFrom(Employee employee) {

		this.fullName = employee.fullName;

		this.currentAddress = employee.currentAddress;

		this.permanentAddress = employee.permanentAddress;

		this.phone = employee.phone;

		this.email = employee.email;

		this.aadhaarOrPan = employee.aadhaarOrPan;

		this.birthDate = employee.birthDate;

		this.maritalStatus = employee.maritalStatus;

		this.spouseName = employee.spouseName;

		this.spouseEmployer = employee.spouseEmployer;

		this.spouseWorkPhone = employee.spouseWorkPhone;

		/*
		 * Do not replace the password with null/empty password during an employee
		 * profile update.
		 */
		if (employee.password != null && !employee.password.trim().isEmpty()) {

			this.password = employee.password;
		}

		/*
		 * Only replace image when a new image was supplied.
		 */
		if (employee.profileImage != null && employee.profileImage.length > 0) {

			this.profileImage = employee.profileImage;
		}
	}

	// ============================================================
	// TO STRING
	// ============================================================

	@Override
	public String toString() {

		return "Employee [id=" + id + ", fullName=" + fullName + ", currentAddress=" + currentAddress
				+ ", permanentAddress=" + permanentAddress + ", phone=" + phone + ", email=" + email
				+ ", password=********" + ", aadhaarOrPan=" + aadhaarOrPan + ", birthDate=" + birthDate
				+ ", maritalStatus=" + maritalStatus + ", spouseName=" + spouseName + ", spouseEmployer="
				+ spouseEmployer + ", spouseWorkPhone=" + spouseWorkPhone + ", profileImage="
				+ (profileImage != null ? profileImage.length + " bytes" : "null") + "]";
	}
}