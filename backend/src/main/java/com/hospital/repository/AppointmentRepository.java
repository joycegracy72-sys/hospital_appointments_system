package com.hospital.repository;

import com.hospital.dto.response.AppointmentDetailResponse;
import com.hospital.model.Appointment;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data access operations for Appointments using explicit JDBC queries via JdbcTemplate.
 * Implements joined queries and appointment conflict/overlap detection.
 */
@Repository
public class AppointmentRepository {

    private final JdbcTemplate jdbcTemplate;

    public AppointmentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Appointment> appointmentRowMapper = (rs, rowNum) -> {
        Appointment appt = new Appointment();
        appt.setAppointmentId(rs.getLong("appointment_id"));
        appt.setPatientId(rs.getLong("patient_id"));
        appt.setDoctorId(rs.getLong("doctor_id"));

        Date date = rs.getDate("appointment_date");
        if (date != null) {
            appt.setAppointmentDate(date.toLocalDate());
        }

        Time start = rs.getTime("start_time");
        if (start != null) {
            appt.setStartTime(start.toLocalTime());
        }

        Time end = rs.getTime("end_time");
        if (end != null) {
            appt.setEndTime(end.toLocalTime());
        }

        appt.setStatus(rs.getString("status"));
        appt.setReasonForVisit(rs.getString("reason_for_visit"));
        appt.setNotes(rs.getString("notes"));
        appt.setCancellationReason(rs.getString("cancellation_reason"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            appt.setCreatedAt(createdAt.toLocalDateTime());
        }

        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            appt.setUpdatedAt(updatedAt.toLocalDateTime());
        }

        return appt;
    };

    private final RowMapper<AppointmentDetailResponse> detailRowMapper = (rs, rowNum) -> {
        AppointmentDetailResponse detail = new AppointmentDetailResponse();
        detail.setAppointmentId(rs.getLong("appointment_id"));

        detail.setPatientId(rs.getLong("patient_id"));
        detail.setPatientName(rs.getString("patient_name"));
        detail.setPatientEmail(rs.getString("patient_email"));
        detail.setPatientPhone(rs.getString("patient_phone"));

        detail.setDoctorId(rs.getLong("doctor_id"));
        detail.setDoctorName(rs.getString("doctor_name"));
        detail.setDoctorSpecialization(rs.getString("doctor_specialization"));
        detail.setConsultationFee(rs.getBigDecimal("consultation_fee"));

        Date date = rs.getDate("appointment_date");
        if (date != null) {
            detail.setAppointmentDate(date.toLocalDate());
        }

        Time start = rs.getTime("start_time");
        if (start != null) {
            detail.setStartTime(start.toLocalTime());
        }

        Time end = rs.getTime("end_time");
        if (end != null) {
            detail.setEndTime(end.toLocalTime());
        }

        detail.setStatus(rs.getString("status"));
        detail.setReasonForVisit(rs.getString("reason_for_visit"));
        detail.setNotes(rs.getString("notes"));
        detail.setCancellationReason(rs.getString("cancellation_reason"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            detail.setCreatedAt(createdAt.toLocalDateTime());
        }

        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            detail.setUpdatedAt(updatedAt.toLocalDateTime());
        }

        return detail;
    };

    public Optional<Appointment> findById(Long appointmentId) {
        String sql = "SELECT appointment_id, patient_id, doctor_id, appointment_date, start_time, end_time, " +
                     "status, reason_for_visit, notes, cancellation_reason, created_at, updated_at " +
                     "FROM appointments WHERE appointment_id = ?";
        try {
            Appointment appt = jdbcTemplate.queryForObject(sql, appointmentRowMapper, appointmentId);
            return Optional.ofNullable(appt);
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    public Optional<AppointmentDetailResponse> findDetailById(Long appointmentId) {
        String sql = "SELECT a.appointment_id, p.patient_id, " +
                     "CONCAT(p.first_name, ' ', p.last_name) AS patient_name, " +
                     "p.email AS patient_email, p.phone AS patient_phone, " +
                     "d.doctor_id, CONCAT(d.first_name, ' ', d.last_name) AS doctor_name, " +
                     "d.specialization AS doctor_specialization, d.consultation_fee, " +
                     "a.appointment_date, a.start_time, a.end_time, a.status, " +
                     "a.reason_for_visit, a.notes, a.cancellation_reason, a.created_at, a.updated_at " +
                     "FROM appointments a " +
                     "JOIN patients p ON a.patient_id = p.patient_id " +
                     "JOIN doctors d ON a.doctor_id = d.doctor_id " +
                     "WHERE a.appointment_id = ?";
        try {
            AppointmentDetailResponse detail = jdbcTemplate.queryForObject(sql, detailRowMapper, appointmentId);
            return Optional.ofNullable(detail);
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    public List<AppointmentDetailResponse> findAllDetails(LocalDate date, Long doctorId, Long patientId, String status) {
        StringBuilder sql = new StringBuilder(
                "SELECT a.appointment_id, p.patient_id, " +
                "CONCAT(p.first_name, ' ', p.last_name) AS patient_name, " +
                "p.email AS patient_email, p.phone AS patient_phone, " +
                "d.doctor_id, CONCAT(d.first_name, ' ', d.last_name) AS doctor_name, " +
                "d.specialization AS doctor_specialization, d.consultation_fee, " +
                "a.appointment_date, a.start_time, a.end_time, a.status, " +
                "a.reason_for_visit, a.notes, a.cancellation_reason, a.created_at, a.updated_at " +
                "FROM appointments a " +
                "JOIN patients p ON a.patient_id = p.patient_id " +
                "JOIN doctors d ON a.doctor_id = d.doctor_id " +
                "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (date != null) {
            sql.append("AND a.appointment_date = ? ");
            params.add(Date.valueOf(date));
        }

        if (doctorId != null) {
            sql.append("AND a.doctor_id = ? ");
            params.add(doctorId);
        }

        if (patientId != null) {
            sql.append("AND a.patient_id = ? ");
            params.add(patientId);
        }

        if (status != null && !status.trim().isEmpty()) {
            sql.append("AND a.status = ? ");
            params.add(status.trim().toUpperCase());
        }

        sql.append("ORDER BY a.appointment_date DESC, a.start_time DESC");
        return jdbcTemplate.query(sql.toString(), detailRowMapper, params.toArray());
    }

    public boolean hasOverlap(Long doctorId, LocalDate appointmentDate, LocalTime startTime, LocalTime endTime, Long excludeAppointmentId) {
        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) FROM appointments " +
                "WHERE doctor_id = ? " +
                "AND appointment_date = ? " +
                "AND status IN ('SCHEDULED', 'RESCHEDULED') " +
                "AND (start_time < ? AND end_time > ?) "
        );
        List<Object> params = new ArrayList<>();
        params.add(doctorId);
        params.add(Date.valueOf(appointmentDate));
        params.add(Time.valueOf(endTime));
        params.add(Time.valueOf(startTime));

        if (excludeAppointmentId != null) {
            sql.append("AND appointment_id != ? ");
            params.add(excludeAppointmentId);
        }

        Integer count = jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null && count > 0;
    }

    public Long save(Appointment appointment) {
        String sql = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, start_time, end_time, " +
                     "status, reason_for_visit, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, appointment.getPatientId());
            ps.setLong(2, appointment.getDoctorId());
            ps.setDate(3, Date.valueOf(appointment.getAppointmentDate()));
            ps.setTime(4, Time.valueOf(appointment.getStartTime()));
            ps.setTime(5, Time.valueOf(appointment.getEndTime()));
            ps.setString(6, appointment.getStatus());
            ps.setString(7, appointment.getReasonForVisit());
            ps.setString(8, appointment.getNotes());
            return ps;
        }, keyHolder);

        java.util.Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null) {
            for (java.util.Map.Entry<String, Object> entry : keys.entrySet()) {
                if (entry.getKey().equalsIgnoreCase("appointment_id") && entry.getValue() instanceof Number) {
                    return ((Number) entry.getValue()).longValue();
                }
            }
        }
        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : null;
    }

    public int reschedule(Long appointmentId, LocalDate newDate, LocalTime newStartTime, LocalTime newEndTime) {
        String sql = "UPDATE appointments SET appointment_date = ?, start_time = ?, end_time = ?, " +
                     "status = 'RESCHEDULED', updated_at = CURRENT_TIMESTAMP WHERE appointment_id = ?";
        return jdbcTemplate.update(sql, Date.valueOf(newDate), Time.valueOf(newStartTime), Time.valueOf(newEndTime), appointmentId);
    }

    public int cancel(Long appointmentId, String cancellationReason) {
        String sql = "UPDATE appointments SET status = 'CANCELLED', cancellation_reason = ?, " +
                     "updated_at = CURRENT_TIMESTAMP WHERE appointment_id = ?";
        return jdbcTemplate.update(sql, cancellationReason, appointmentId);
    }

    public int updateStatus(Long appointmentId, String status, String notes) {
        String sql = "UPDATE appointments SET status = ?, notes = COALESCE(?, notes), " +
                     "updated_at = CURRENT_TIMESTAMP WHERE appointment_id = ?";
        return jdbcTemplate.update(sql, status, notes, appointmentId);
    }

    public long countTotal() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM appointments", Long.class);
        return count != null ? count : 0L;
    }

    public long countByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status);
        return count != null ? count : 0L;
    }

    public long countUpcoming(LocalDate fromDate) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE appointment_date >= ? AND status IN ('SCHEDULED', 'RESCHEDULED')";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, Date.valueOf(fromDate));
        return count != null ? count : 0L;
    }

    public long countToday(LocalDate today) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE appointment_date = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, Date.valueOf(today));
        return count != null ? count : 0L;
    }

    public List<AppointmentDetailResponse> findUpcomingLimit(LocalDate fromDate, int limit) {
        String sql = "SELECT a.appointment_id, p.patient_id, " +
                     "CONCAT(p.first_name, ' ', p.last_name) AS patient_name, " +
                     "p.email AS patient_email, p.phone AS patient_phone, " +
                     "d.doctor_id, CONCAT(d.first_name, ' ', d.last_name) AS doctor_name, " +
                     "d.specialization AS doctor_specialization, d.consultation_fee, " +
                     "a.appointment_date, a.start_time, a.end_time, a.status, " +
                     "a.reason_for_visit, a.notes, a.cancellation_reason, a.created_at, a.updated_at " +
                     "FROM appointments a " +
                     "JOIN patients p ON a.patient_id = p.patient_id " +
                     "JOIN doctors d ON a.doctor_id = d.doctor_id " +
                     "WHERE a.appointment_date >= ? AND a.status IN ('SCHEDULED', 'RESCHEDULED') " +
                     "ORDER BY a.appointment_date ASC, a.start_time ASC LIMIT ?";
        return jdbcTemplate.query(sql, detailRowMapper, Date.valueOf(fromDate), limit);
    }
}
