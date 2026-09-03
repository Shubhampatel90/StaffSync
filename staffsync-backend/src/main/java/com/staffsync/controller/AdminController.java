package com.staffsync.controller;

import com.staffsync.model.Employee;
import com.staffsync.service.EmployeeService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final EmployeeService employeeService;

    public AdminController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // ============================================================
    // GET ALL EMPLOYEES
    // ============================================================

    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getAllEmployees() {

        return ResponseEntity.ok(
                employeeService.getAllEmployees()
        );
    }

    // ============================================================
    // GET EMPLOYEE BY ID
    // ============================================================

    @GetMapping("/employees/{id}")
    public ResponseEntity<Employee> getEmployeeById(
            @PathVariable Long id) {

        Employee employee =
                employeeService.getEmployeeById(id);

        if (employee == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(employee);
    }

    // ============================================================
    // GET EMPLOYEE PROFILE IMAGE
    // ============================================================

    @GetMapping("/employees/{id}/image")
    public ResponseEntity<byte[]> getEmployeeImage(
            @PathVariable Long id) {

        Employee employee =
                employeeService.getEmployeeById(id);

        if (employee == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] image = employee.getProfileImage();

        if (image == null || image.length == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(image);
    }

    // ============================================================
    // CREATE EMPLOYEE
    // ============================================================

    @PostMapping(
            value = "/employees",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Employee> addEmployee(
            @RequestPart("employee") Employee employee,
            @RequestPart(value = "image", required = false)
            MultipartFile image) {

        try {

            if (image != null && !image.isEmpty()) {
                employee.setProfileImage(image.getBytes());
            }

            Employee savedEmployee =
                    employeeService.saveEmployee(employee);

            return ResponseEntity.ok(savedEmployee);

        } catch (Exception e) {

            return ResponseEntity.internalServerError().build();
        }
    }

    // ============================================================
    // UPDATE EMPLOYEE
    // ============================================================

    @PutMapping("/employees/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee) {

        Employee updatedEmployee =
                employeeService.updateEmployee(id, employee);

        return ResponseEntity.ok(updatedEmployee);
    }

    // ============================================================
    // DELETE EMPLOYEE
    // ============================================================

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<String> deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);

        return ResponseEntity.ok(
                "Employee deleted successfully"
        );
    }
}