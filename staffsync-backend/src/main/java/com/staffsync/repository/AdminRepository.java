package com.staffsync.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.staffsync.model.Admin;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

	Optional<Admin> findByEmail(String email);

	boolean existsByEmail(String email);
}