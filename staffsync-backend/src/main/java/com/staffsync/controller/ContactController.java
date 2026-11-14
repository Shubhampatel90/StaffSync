package com.staffsync.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000"
})
public class ContactController {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String supportEmail;

    public ContactController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostMapping
    public ResponseEntity<String> sendContactMessage(
            @RequestBody Map<String, String> request) {

      
        try {

            String name = request.get("name");
            String email = request.get("email");
            String phone = request.get("phone");
            String subject = request.get("subject");
            String message = request.get("message");

            // ====================================================
            // VALIDATION
            // ====================================================

            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("Name is required.");
            }

            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("Email is required.");
            }

            if (subject == null || subject.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("Subject is required.");
            }

            if (message == null || message.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("Message is required.");
            }

            // ====================================================
            // PHONE
            // ====================================================

            String phoneText =
                    phone == null || phone.isBlank()
                            ? "Not provided"
                            : phone;

            // ====================================================
            // CREATE EMAIL
            // ====================================================

            SimpleMailMessage mail = new SimpleMailMessage();

            mail.setTo(supportEmail);

            mail.setReplyTo(email);

            mail.setSubject(
                    "StaffSync Support - " + subject
            );

            String emailBody =
                    "New StaffSync Support Request\n"
                    + "====================================\n\n"
                    + "Name: " + name + "\n"
                    + "Email: " + email + "\n"
                    + "Phone: " + phoneText + "\n"
                    + "Subject: " + subject + "\n\n"
                    + "Message:\n"
                    + message
                    + "\n\n"
                    + "====================================\n"
                    + "Sent from StaffSync Contact Support";

            mail.setText(emailBody);

            // ====================================================
            // SEND EMAIL
            // ====================================================

            System.out.println("Sending email to: " + supportEmail);

            mailSender.send(mail);

            System.out.println("EMAIL SENT SUCCESSFULLY");

            return ResponseEntity.ok(
                    "Your message has been sent successfully."
            );

        } catch (Exception e) {

            System.out.println("EMAIL SENDING FAILED");
            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Unable to send your message. Please try again later."
                    );
        }
    }
}