package com.hospital.repository;

import com.hospital.model.Doctor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data access operations for Doctors using explicit JDBC queries via JdbcTemplate.
 */
@Repository
public class DoctorRepository {

    private final JdbcTemplate jdbcTemplate;

    public DoctorRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Doctor> rowMapper = (rs, rowNum) -> {
        Doctor doctor = new Doctor();
        doctor.setDoctorId(rs.getLong("doctor_id"));
        doctor.setFirstName(rs.getString("first_name"));
        doctor.setLastName(rs.getString("last_name"));
        doctor.setSpecialization(rs.getString("specialization"));
        doctor.setEmail(rs.getString("email"));
        doctor.setPhone(rs.getString("phone"));
        doctor.setConsultationFee(rs.getBigDecimal("consultation_fee"));
        doctor.setActive(rs.getBoolean("is_active"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            doctor.setCreatedAt(createdAt.toLocalDateTime());
        }

        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            doctor.setUpdatedAt(updatedAt.toLocalDateTime());
        }

        return doctor;
    };

    public List<Doctor> findAll(String search, String specialization, Boolean activeOnly) {
        StringBuilder sql = new StringBuilder(
                "SELECT doctor_id, first_name, last_name, specialization, email, phone, " +
                "consultation_fee, is_active, created_at, updated_at " +
                "FROM doctors WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (activeOnly != null && activeOnly) {
            sql.append("AND is_active = TRUE ");
        }

        if (specialization != null && !specialization.trim().isEmpty()) {
            sql.append("AND specialization = ? ");
            params.add(specialization.trim());
        }

        if (search != null && !search.trim().isEmpty()) {
            String pattern = "%" + search.trim() + "%";
            sql.append("AND (first_name LIKE ? OR last_name LIKE ? OR specialization LIKE ? OR email LIKE ?) ");
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
        }

        sql.append("ORDER BY first_name ASC, last_name ASC");
        return jdbcTemplate.query(sql.toString(), rowMapper, params.toArray());
    }

    public Optional<Doctor> findById(Long doctorId) {
        String sql = "SELECT doctor_id, first_name, last_name, specialization, email, phone, " +
                     "consultation_fee, is_active, created_at, updated_at " +
                     "FROM doctors WHERE doctor_id = ?";
        try {
            Doctor doctor = jdbcTemplate.queryForObject(sql, rowMapper, doctorId);
            return Optional.ofNullable(doctor);
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    public Optional<Doctor> findByEmail(String email) {
        String sql = "SELECT doctor_id, first_name, last_name, specialization, email, phone, " +
                     "consultation_fee, is_active, created_at, updated_at " +
                     "FROM doctors WHERE email = ?";
        try {
            Doctor doctor = jdbcTemplate.queryForObject(sql, rowMapper, email);
            return Optional.ofNullable(doctor);
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    public Long save(Doctor doctor) {
        String sql = "INSERT INTO doctors (first_name, last_name, specialization, email, phone, " +
                     "consultation_fee, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, doctor.getFirstName());
            ps.setString(2, doctor.getLastName());
            ps.setString(3, doctor.getSpecialization());
            ps.setString(4, doctor.getEmail());
            ps.setString(5, doctor.getPhone());
            ps.setBigDecimal(6, doctor.getConsultationFee());
            ps.setBoolean(7, doctor.isActive());
            return ps;
        }, keyHolder);

        java.util.Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null) {
            for (java.util.Map.Entry<String, Object> entry : keys.entrySet()) {
                if (entry.getKey().equalsIgnoreCase("doctor_id") && entry.getValue() instanceof Number) {
                    return ((Number) entry.getValue()).longValue();
                }
            }
        }
        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : null;
    }

    public int update(Long doctorId, Doctor doctor) {
        String sql = "UPDATE doctors SET first_name = ?, last_name = ?, specialization = ?, " +
                     "email = ?, phone = ?, consultation_fee = ?, is_active = ?, " +
                     "updated_at = CURRENT_TIMESTAMP WHERE doctor_id = ?";
        return jdbcTemplate.update(sql,
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                doctor.getPhone(),
                doctor.getConsultationFee(),
                doctor.isActive(),
                doctorId
        );
    }

    public List<String> findDistinctSpecializations() {
        String sql = "SELECT DISTINCT specialization FROM doctors ORDER BY specialization ASC";
        return jdbcTemplate.queryForList(sql, String.class);
    }

    public long countActive() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM doctors WHERE is_active = TRUE", Long.class);
        return count != null ? count : 0L;
    }

    public long countTotal() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM doctors", Long.class);
        return count != null ? count : 0L;
    }
}
