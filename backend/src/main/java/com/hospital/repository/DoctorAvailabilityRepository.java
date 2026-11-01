package com.hospital.repository;

import com.hospital.model.DoctorAvailability;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Data access operations for Doctor Availability using explicit JDBC queries via JdbcTemplate.
 */
@Repository
public class DoctorAvailabilityRepository {

    private final JdbcTemplate jdbcTemplate;

    public DoctorAvailabilityRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<DoctorAvailability> rowMapper = (rs, rowNum) -> {
        DoctorAvailability availability = new DoctorAvailability();
        availability.setAvailabilityId(rs.getLong("availability_id"));
        availability.setDoctorId(rs.getLong("doctor_id"));

        Date date = rs.getDate("available_date");
        if (date != null) {
            availability.setAvailableDate(date.toLocalDate());
        }

        Time start = rs.getTime("start_time");
        if (start != null) {
            availability.setStartTime(start.toLocalTime());
        }

        Time end = rs.getTime("end_time");
        if (end != null) {
            availability.setEndTime(end.toLocalTime());
        }

        return availability;
    };

    public List<DoctorAvailability> findByDoctorId(Long doctorId) {
        String sql = "SELECT availability_id, doctor_id, available_date, start_time, end_time " +
                     "FROM doctor_availability WHERE doctor_id = ? ORDER BY available_date ASC, start_time ASC";
        return jdbcTemplate.query(sql, rowMapper, doctorId);
    }

    public List<DoctorAvailability> findByDoctorIdAndDate(Long doctorId, LocalDate date) {
        String sql = "SELECT availability_id, doctor_id, available_date, start_time, end_time " +
                     "FROM doctor_availability WHERE doctor_id = ? AND available_date = ? " +
                     "ORDER BY start_time ASC";
        return jdbcTemplate.query(sql, rowMapper, doctorId, Date.valueOf(date));
    }

    public boolean hasAnyAvailabilityConfigured(Long doctorId, LocalDate date) {
        String sql = "SELECT COUNT(*) FROM doctor_availability WHERE doctor_id = ? AND available_date = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, doctorId, Date.valueOf(date));
        return count != null && count > 0;
    }

    public boolean isDoctorAvailable(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        // If availability is configured for the doctor on that date, ensure requested slot fits inside
        String sql = "SELECT COUNT(*) FROM doctor_availability " +
                     "WHERE doctor_id = ? AND available_date = ? " +
                     "AND start_time <= ? AND end_time >= ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class,
                doctorId, Date.valueOf(date), Time.valueOf(startTime), Time.valueOf(endTime));
        return count != null && count > 0;
    }

    public Long save(DoctorAvailability availability) {
        String sql = "INSERT INTO doctor_availability (doctor_id, available_date, start_time, end_time) " +
                     "VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, availability.getDoctorId());
            ps.setDate(2, Date.valueOf(availability.getAvailableDate()));
            ps.setTime(3, Time.valueOf(availability.getStartTime()));
            ps.setTime(4, Time.valueOf(availability.getEndTime()));
            return ps;
        }, keyHolder);

        java.util.Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null) {
            for (java.util.Map.Entry<String, Object> entry : keys.entrySet()) {
                if (entry.getKey().equalsIgnoreCase("availability_id") && entry.getValue() instanceof Number) {
                    return ((Number) entry.getValue()).longValue();
                }
            }
        }
        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : null;
    }

    public int delete(Long availabilityId) {
        String sql = "DELETE FROM doctor_availability WHERE availability_id = ?";
        return jdbcTemplate.update(sql, availabilityId);
    }
}
