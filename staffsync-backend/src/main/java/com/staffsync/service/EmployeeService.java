package com.staffsync.service;

import com.staffsync.model.Employee;
import com.staffsync.repository.EmployeeRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

	private final EmployeeRepository employeeRepository;

	public EmployeeService(EmployeeRepository employeeRepository) {
		this.employeeRepository = employeeRepository;
	}

	public Employee saveEmployee(Employee employee) {
		return employeeRepository.save(employee);
	}

	public List<Employee> getAllEmployees() {
		return employeeRepository.findAll();
	}

	public Employee getEmployeeById(Long id) {
		return employeeRepository.findById(id).orElse(null);
	}

	public Employee updateEmployee(Long id, Employee employee) {

		Employee existingEmployee = getEmployeeById(id);

		existingEmployee.updateFrom(employee);

		return employeeRepository.save(existingEmployee);
	}

	public void deleteEmployee(Long id) {

		Employee employee = getEmployeeById(id);

		employeeRepository.delete(employee);
	}
}