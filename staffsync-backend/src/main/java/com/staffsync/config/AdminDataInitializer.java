
package com.staffsync.config;

import com.staffsync.model.Admin;
import com.staffsync.model.AdminRole;
import com.staffsync.repository.AdminRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminDataInitializer {

    @Bean
    CommandLineRunner createDefaultAdmins(
            AdminRepository adminRepository) {

        return args -> {

            // ============================================================
            // CREATE DEFAULT SUPER ADMIN
            // ============================================================

            String superAdminEmail = "superadmin@staffsync.com";
            String superAdminPassword = "ChangeMe123!";

            if (!adminRepository.existsByEmail(superAdminEmail)) {

                Admin superAdmin = new Admin();

                superAdmin.setFullName("Super Admin");
                superAdmin.setEmail(superAdminEmail);

                // Plain-text password for local development
                superAdmin.setPassword(superAdminPassword);

                superAdmin.setRole(AdminRole.SUPER_ADMIN);
                superAdmin.setActive(true);

                adminRepository.save(superAdmin);

                System.out.println(
                        "=============================================="
                );
                System.out.println(
                        "Default Super Admin created successfully."
                );
                System.out.println(
                        "Email    : " + superAdminEmail
                );
                System.out.println(
                        "Password : " + superAdminPassword
                );
                System.out.println(
                        "Role     : SUPER_ADMIN"
                );
                System.out.println(
                        "=============================================="
                );

            } else {

                System.out.println(
                        "Super Admin already exists: "
                                + superAdminEmail
                );
            }

            // ============================================================
            // CREATE DEFAULT ADMIN
            // ============================================================

            String adminEmail = "admin@staffsync.com";
            String adminPassword = "ChangeMe456!";

            if (!adminRepository.existsByEmail(adminEmail)) {

                Admin admin = new Admin();

                admin.setFullName("Admin");
                admin.setEmail(adminEmail);

                // Plain-text password for local development
                admin.setPassword(adminPassword);

                admin.setRole(AdminRole.ADMIN);
                admin.setActive(true);

                adminRepository.save(admin);

                System.out.println(
                        "=============================================="
                );
                System.out.println(
                        "Default Admin created successfully."
                );
                System.out.println(
                        "Email    : " + adminEmail
                );
                System.out.println(
                        "Password : " + adminPassword
                );
                System.out.println(
                        "Role     : ADMIN"
                );
                System.out.println(
                        "=============================================="
                );

            } else {

                System.out.println(
                        "Admin already exists: "
                                + adminEmail
                );
            }
        };
    }
}
