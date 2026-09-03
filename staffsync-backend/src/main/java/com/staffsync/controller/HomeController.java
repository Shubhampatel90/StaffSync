package com.staffsync.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.staffsync.model.Employee;
import com.staffsync.model.LoginRequest;
import com.staffsync.repository.EmployeeRepository;

@RestController
public class HomeController {

    private final EmployeeRepository employeeRepository;

    public HomeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // ============================================================
    // HOME
    // ============================================================

    @GetMapping("/")
    public String home() {
        return "StaffSync Backend is running successfully!";
    }

    // ============================================================
    // HEALTH
    // ============================================================

    @GetMapping("/api/health")
    public String health() {
        return "StaffSync API is healthy!";
    }

    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/api/auth/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest request) {

        String email = request.getEmail();
        String password = request.getPassword();

        System.out.println("Email: " + email);
        System.out.println("Password: " + password);

        // ========================================================
        // RESPONSE OBJECT
        // ========================================================

        Map<String, Object> response = new HashMap<>();

        // ========================================================
        // ADMIN LOGIN
        // ========================================================

        if ("admin".equals(email) && "1234".equals(password)) {

            response.put("role", "ADMIN");

            return ResponseEntity.ok(response);
        }

        // ========================================================
        // EMPLOYEE LOGIN
        // ========================================================

        Optional<Employee> employeeOptional =
                employeeRepository.findByEmail(email);

        if (employeeOptional.isPresent()) {

            Employee emp = employeeOptional.get();

            if (password != null
                    && password.equals(emp.getPassword())) {

                response.put("role", "EMPLOYEE");
                response.put("employeeId", emp.getId());

                System.out.println(
                        "Employee Login Successful"
                );

                System.out.println(
                        "Employee ID: " + emp.getId()
                );

                return ResponseEntity.ok(response);
            }
        }

        // ========================================================
        // INVALID LOGIN
        // ========================================================

        response.put("role", "INVALID");

        return ResponseEntity.status(401)
                .body(response);
    }

    // ============================================================
    // LOGOUT
    // ============================================================

    @GetMapping("/api/auth/logout")
    public ResponseEntity<Boolean> logout() {

        return ResponseEntity.ok(true);
    }
}