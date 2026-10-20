package com.hospital.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

/**
 * Explicit JDBC and Transaction Management Configuration.
 * Demonstrates direct JDBC setup via Spring JdbcTemplate without any ORM abstraction.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        log.info("Initializing Spring JdbcTemplate with HikariCP DataSource: {}", dataSource.getClass().getName());
        return new JdbcTemplate(dataSource);
    }

    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        log.info("Initializing DataSourceTransactionManager for JDBC transaction control.");
        return new DataSourceTransactionManager(dataSource);
    }
}
