package com.hospital.repository;

import com.hospital.model.Appointment;
import com.hospital.model.DoctorRestPeriod;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class DoctorRestPeriodRepository {

    private final JdbcTemplate jdbcTemplate;

    public DoctorRestPeriodRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<DoctorRestPeriod> restPeriodRowMapper = (rs, rowNum) -> {
        DoctorRestPeriod rest = new DoctorRestPeriod();
        rest.setRestId(rs.getLong("rest_id"));
        rest.setDoctorId(rs.getLong("doctor_id"));
        Date d = rs.getDate("rest_date");
        rest.setRestDate(d != null ? d.toLocalDate() : null);
        rest.setStartTime(rs.getTime("start_time").toLocalTime());
        rest.setEndTime(rs.getTime("end_time").toLocalTime());
        rest.setReason(rs.getString("reason"));
        rest.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return rest;
    };

    public List<DoctorRestPeriod> findByDoctorIdAndDate(Long doctorId, LocalDate date) {
        String sql = "SELECT * FROM doctor_rest_periods WHERE doctor_id = ? AND (rest_date = ? OR rest_date IS NULL) ORDER BY start_time ASC";
        return jdbcTemplate.query(sql, restPeriodRowMapper, doctorId, Date.valueOf(date));
    }

    public List<DoctorRestPeriod> findAllByDoctorId(Long doctorId) {
        String sql = "SELECT * FROM doctor_rest_periods WHERE doctor_id = ? ORDER BY rest_date DESC, start_time ASC";
        return jdbcTemplate.query(sql, restPeriodRowMapper, doctorId);
    }

    public Optional<DoctorRestPeriod> findById(Long restId) {
        String sql = "SELECT * FROM doctor_rest_periods WHERE rest_id = ?";
        List<DoctorRestPeriod> list = jdbcTemplate.query(sql, restPeriodRowMapper, restId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public boolean hasRestOverlap(Long doctorId, LocalDate date, LocalTime start, LocalTime end, Long excludeRestId) {
        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) FROM doctor_rest_periods " +
                "WHERE doctor_id = ? AND (rest_date = ? OR rest_date IS NULL) " +
                "AND (start_time < ? AND end_time > ?) "
        );
        List<Object> params = new ArrayList<>();
        params.add(doctorId);
        params.add(Date.valueOf(date));
        params.add(Time.valueOf(end));
        params.add(Time.valueOf(start));

        if (excludeRestId != null) {
            sql.append("AND rest_id != ? ");
            params.add(excludeRestId);
        }

        Integer count = jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null && count > 0;
    }

    /**
     * Checks if any active scheduled appointment already exists during the proposed rest period.
     * Prevents administrative configuration changes that would silently conflict with existing bookings.
     */
    public List<Appointment> findConflictingAppointments(Long doctorId, LocalDate date, LocalTime start, LocalTime end) {
        StringBuilder sql = new StringBuilder(
                "SELECT * FROM appointments " +
                "WHERE doctor_id = ? " +
                "AND status IN ('SCHEDULED', 'RESCHEDULED', 'CHECKED_IN') " +
                "AND (start_time < ? AND end_time > ?) "
        );
        List<Object> params = new ArrayList<>();
        params.add(doctorId);
        params.add(Time.valueOf(end));
        params.add(Time.valueOf(start));

        if (date != null) {
            sql.append("AND appointment_date = ? ");
            params.add(Date.valueOf(date));
        }

        RowMapper<Appointment> mapper = (rs, rowNum) -> {
            Appointment appt = new Appointment();
            appt.setAppointmentId(rs.getLong("appointment_id"));
            appt.setPatientId(rs.getLong("patient_id"));
            appt.setDoctorId(rs.getLong("doctor_id"));
            appt.setAppointmentDate(rs.getDate("appointment_date").toLocalDate());
            appt.setStartTime(rs.getTime("start_time").toLocalTime());
            appt.setEndTime(rs.getTime("end_time").toLocalTime());
            appt.setStatus(rs.getString("status"));
            appt.setReasonForVisit(rs.getString("reason_for_visit"));
            return appt;
        };

        return jdbcTemplate.query(sql.toString(), mapper, params.toArray());
    }

    public Long save(DoctorRestPeriod restPeriod) {
        String sql = "INSERT INTO doctor_rest_periods (doctor_id, rest_date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, restPeriod.getDoctorId());
            if (restPeriod.getRestDate() != null) {
                ps.setDate(2, Date.valueOf(restPeriod.getRestDate()));
            } else {
                ps.setNull(2, java.sql.Types.DATE);
            }
            ps.setTime(3, Time.valueOf(restPeriod.getStartTime()));
            ps.setTime(4, Time.valueOf(restPeriod.getEndTime()));
            ps.setString(5, restPeriod.getReason() != null ? restPeriod.getReason() : "Rest / Lunch Break");
            return ps;
        }, keyHolder);

        return extractGeneratedId(keyHolder, "rest_id");
    }

    public boolean deleteById(Long restId) {
        String sql = "DELETE FROM doctor_rest_periods WHERE rest_id = ?";
        return jdbcTemplate.update(sql, restId) > 0;
    }

    private Long extractGeneratedId(KeyHolder keyHolder, String idColumnName) {
        List<Map<String, Object>> keyList = keyHolder.getKeyList();
        if (keyList != null && !keyList.isEmpty()) {
            Map<String, Object> keys = keyList.get(0);
            for (Map.Entry<String, Object> entry : keys.entrySet()) {
                if (entry.getKey().equalsIgnoreCase(idColumnName) && entry.getValue() instanceof Number) {
                    return ((Number) entry.getValue()).longValue();
                }
            }
        }
        Number singleKey = keyHolder.getKey();
        if (singleKey != null) {
            return singleKey.longValue();
        }
        throw new IllegalStateException("Failed to retrieve generated ID for " + idColumnName);
    }
}
