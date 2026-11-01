package com.hospital.repository;

import com.hospital.model.Patient;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data access operations for Patients using explicit JDBC queries via JdbcTemplate.
 * Strictly avoids ORM/Hibernate to meet academic requirements.
 */
@Repository
public class PatientRepository {

    private final JdbcTemplate jdbcTemplate;

    public PatientRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Patient> rowMapper = (rs, rowNum) -> {
        Patient patient = new Patient();
        patient.setPatientId(rs.getLong("patient_id"));
        patient.setFirstName(rs.getString("first_name"));
        patient.setLastName(rs.getString("last_name"));
        patient.setEmail(rs.getString("email"));
        patient.setPhone(rs.getString("phone"));

        Date dob = rs.getDate("date_of_birth");
        if (dob != null) {
            patient.setDateOfBirth(dob.toLocalDate());
        }

        patient.setGender(rs.getString("gender"));
        patient.setBloodGroup(rs.getString("blood_group"));
        patient.setAddress(rs.getString("address"));
        patient.setActive(rs.getBoolean("is_active"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            patient.setCreatedAt(createdAt.toLocalDateTime());
        }

        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            patient.setUpdatedAt(updatedAt.toLocalDateTime());
        }

        return patient;
    };

    public List<Patient> findAll(String search, Boolean activeOnly) {
        StringBuilder sql = new StringBuilder(
                "SELECT patient_id, first_name, last_name, email, phone, date_of_birth, " +
                "gender, blood_group, address, is_active, created_at, updated_at " +
                "FROM patients WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (activeOnly != null && activeOnly) {
            sql.append("AND is_active = TRUE ");
        }

        if (search != null && !search.trim().isEmpty()) {
            String pattern = "%" + search.trim() + "%";
            sql.append("AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?) ");
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
        }

        sql.append("ORDER BY patient_id DESC");
        return jdbcTemplate.query(sql.toString(), rowMapper, params.toArray());
    }

    public Optional<Patient> findById(Long patientId) {
        String sql = "SELECT patient_id, first_name, last_name, email, phone, date_of_birth, " +
                     "gender, blood_group, address, is_active, created_at, updated_at " +
                     "FROM patients WHERE patient_id = ?";
        try {
            Patient patient = jdbcTemplate.queryForObject(sql, rowMapper, patientId);
            return Optional.ofNullable(patient);
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    public Optional<Patient> findByEmail(String email) {
        String sql = "SELECT patient_id, first_name, last_name, email, phone, date_of_birth, " +
                     "gender, blood_group, address, is_active, created_at, updated_at " +
                     "FROM patients WHERE email = ?";
        try {
            Patient patient = jdbcTemplate.queryForObject(sql, rowMapper, email);
            return Optional.ofNullable(patient);
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    public Long save(Patient patient) {
        String sql = "INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, " +
                     "gender, blood_group, address, is_active) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, patient.getFirstName());
            ps.setString(2, patient.getLastName());
            ps.setString(3, patient.getEmail());
            ps.setString(4, patient.getPhone());
            ps.setDate(5, patient.getDateOfBirth() != null ? Date.valueOf(patient.getDateOfBirth()) : null);
            ps.setString(6, patient.getGender());
            ps.setString(7, patient.getBloodGroup());
            ps.setString(8, patient.getAddress());
            ps.setBoolean(9, patient.isActive());
            return ps;
        }, keyHolder);

        java.util.Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null) {
            for (java.util.Map.Entry<String, Object> entry : keys.entrySet()) {
                if (entry.getKey().equalsIgnoreCase("patient_id") && entry.getValue() instanceof Number) {
                    return ((Number) entry.getValue()).longValue();
                }
            }
        }
        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : null;
    }

    public int update(Long patientId, Patient patient) {
        String sql = "UPDATE patients SET first_name = ?, last_name = ?, email = ?, phone = ?, " +
                     "date_of_birth = ?, gender = ?, blood_group = ?, address = ?, " +
                     "is_active = ?, updated_at = CURRENT_TIMESTAMP " +
                     "WHERE patient_id = ?";
        return jdbcTemplate.update(sql,
                patient.getFirstName(),
                patient.getLastName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getDateOfBirth() != null ? Date.valueOf(patient.getDateOfBirth()) : null,
                patient.getGender(),
                patient.getBloodGroup(),
                patient.getAddress(),
                patient.isActive(),
                patientId
        );
    }

    public int deactivate(Long patientId) {
        String sql = "UPDATE patients SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE patient_id = ?";
        return jdbcTemplate.update(sql, patientId);
    }

    public long countActive() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM patients WHERE is_active = TRUE", Long.class);
        return count != null ? count : 0L;
    }

    public long countTotal() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM patients", Long.class);
        return count != null ? count : 0L;
    }
}
