package com.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main entry point for the Hospital Appointment and Patient Management System backend.
 * Uses Spring Boot with pure JdbcTemplate for direct, parameterized SQL interactions.
 */
@SpringBootApplication
@EnableTransactionManagement
public class HospitalManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalManagementApplication.class, args);
    }
}
