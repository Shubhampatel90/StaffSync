package com.staffsync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StaffsyncBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(StaffsyncBackendApplication.class, args);
	}

}
