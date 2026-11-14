package com.staffsync.controller;

import com.staffsync.model.Admin;
import com.staffsync.repository.AdminRepository;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class AuthController {

    private final AdminRepository adminRepository;

    public AuthController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Admin loginAdmin,
            HttpServletRequest request) {

        // ============================================================
        // FIND ADMIN
        // ============================================================

        Admin admin = adminRepository
                .findByEmail(loginAdmin.getEmail())
                .orElse(null);

        if (admin == null) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }

        // ============================================================
        // CHECK ACTIVE STATUS
        // ============================================================

        if (!admin.isActive()) {
            return ResponseEntity
                    .status(403)
                    .body("Account is inactive");
        }

        // ============================================================
        // CHECK PASSWORD
        // ============================================================

        if (!loginAdmin.getPassword().equals(admin.getPassword())) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }

        // ============================================================
        // CREATE SPRING SECURITY AUTHENTICATION
        // ============================================================

        String role = admin.getRole().name();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        admin.getEmail(),
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + role
                                )
                        )
                );

        // ============================================================
        // STORE AUTHENTICATION IN SECURITY CONTEXT
        // ============================================================

        SecurityContext securityContext =
                SecurityContextHolder.createEmptyContext();

        securityContext.setAuthentication(authentication);

        SecurityContextHolder.setContext(securityContext);

        // ============================================================
        // SAVE SECURITY CONTEXT TO HTTP SESSION
        // ============================================================

        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository
                        .SPRING_SECURITY_CONTEXT_KEY,
                securityContext
        );

        // ============================================================
        // RESPONSE
        // ============================================================

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "id",
                admin.getId()
        );

        response.put(
                "fullName",
                admin.getFullName()
        );

        response.put(
                "email",
                admin.getEmail()
        );

        response.put(
                "role",
                role
        );

        return ResponseEntity.ok(response);
    }
}