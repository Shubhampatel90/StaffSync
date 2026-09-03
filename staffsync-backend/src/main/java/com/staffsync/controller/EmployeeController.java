package com.staffsync.controller;

import com.staffsync.model.Employee;
import com.staffsync.service.EmployeeService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Get logged-in employee profile
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getProfile(
            @PathVariable Long id) {

        Employee employee = employeeService.getEmployeeById(id);

        if (employee == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(employee);
    }

    // Update logged-in employee profile
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateProfile(
            @PathVariable Long id,
            @RequestBody Employee employee) {

        Employee updatedEmployee =
                employeeService.updateEmployee(id, employee);

        return ResponseEntity.ok(updatedEmployee);
    }

    // Get employee profile image
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getProfileImage(
            @PathVariable Long id) {

        Employee employee =
                employeeService.getEmployeeById(id);

        if (employee == null ||
            employee.getProfileImage() == null ||
            employee.getProfileImage().length == 0) {

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(employee.getProfileImage());
    }
}