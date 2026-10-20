package com.hospital;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class HospitalManagementApplicationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void contextLoads() {
        // Verify that Spring Boot context loads and JdbcTemplate bean is properly wired
        assertNotNull(jdbcTemplate, "JdbcTemplate must be auto-configured and available in the application context");
    }
}
