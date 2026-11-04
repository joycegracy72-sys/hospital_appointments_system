package com.hospital.repository;

import com.hospital.model.WaitlistEntry;
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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class WaitlistRepository {

    private final JdbcTemplate jdbcTemplate;

    public WaitlistRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<WaitlistEntry> waitlistRowMapper = (rs, rowNum) -> {
        WaitlistEntry entry = new WaitlistEntry();
        entry.setWaitlistId(rs.getLong("waitlist_id"));
        entry.setPatientId(rs.getLong("patient_id"));

        long docId = rs.getLong("doctor_id");
        entry.setDoctorId(rs.wasNull() ? null : docId);

        entry.setSpecialization(rs.getString("specialization"));
        entry.setPreferredDate(rs.getDate("preferred_date").toLocalDate());

        Time prefStart = rs.getTime("preferred_start_time");
        entry.setPreferredStartTime(prefStart != null ? prefStart.toLocalTime() : null);

        Time prefEnd = rs.getTime("preferred_end_time");
        entry.setPreferredEndTime(prefEnd != null ? prefEnd.toLocalTime() : null);

        entry.setStatus(rs.getString("status"));

        Date offDate = rs.getDate("offered_appointment_date");
        entry.setOfferedAppointmentDate(offDate != null ? offDate.toLocalDate() : null);

        Time offStart = rs.getTime("offered_start_time");
        entry.setOfferedStartTime(offStart != null ? offStart.toLocalTime() : null);

        Time offEnd = rs.getTime("offered_end_time");
        entry.setOfferedEndTime(offEnd != null ? offEnd.toLocalTime() : null);

        long offDocId = rs.getLong("offered_doctor_id");
        entry.setOfferedDoctorId(rs.wasNull() ? null : offDocId);

        Timestamp expAt = rs.getTimestamp("offer_expires_at");
        entry.setOfferExpiresAt(expAt != null ? expAt.toLocalDateTime() : null);

        entry.setNotes(rs.getString("notes"));
        entry.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        Timestamp updAt = rs.getTimestamp("updated_at");
        entry.setUpdatedAt(updAt != null ? updAt.toLocalDateTime() : null);

        // Optional joined columns
        try {
            entry.setPatientName(rs.getString("patient_name"));
        } catch (Exception ignored) {}
        try {
            entry.setDoctorName(rs.getString("doctor_name"));
        } catch (Exception ignored) {}
        try {
            entry.setOfferedDoctorName(rs.getString("offered_doctor_name"));
        } catch (Exception ignored) {}

        return entry;
    };

    public Long save(WaitlistEntry entry) {
        String sql = "INSERT INTO appointment_waitlist (patient_id, doctor_id, specialization, preferred_date, " +
                     "preferred_start_time, preferred_end_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, entry.getPatientId());
            if (entry.getDoctorId() != null) ps.setLong(2, entry.getDoctorId()); else ps.setNull(2, java.sql.Types.INTEGER);
            ps.setString(3, entry.getSpecialization());
            ps.setDate(4, Date.valueOf(entry.getPreferredDate()));
            if (entry.getPreferredStartTime() != null) ps.setTime(5, Time.valueOf(entry.getPreferredStartTime())); else ps.setNull(5, java.sql.Types.TIME);
            if (entry.getPreferredEndTime() != null) ps.setTime(6, Time.valueOf(entry.getPreferredEndTime())); else ps.setNull(6, java.sql.Types.TIME);
            ps.setString(7, entry.getStatus() != null ? entry.getStatus() : WaitlistEntry.Status.WAITING.name());
            ps.setString(8, entry.getNotes());
            return ps;
        }, keyHolder);

        return extractGeneratedId(keyHolder, "waitlist_id");
    }

    public Optional<WaitlistEntry> findById(Long waitlistId) {
        String sql = "SELECT w.*, " +
                     "CONCAT(p.first_name, ' ', p.last_name) AS patient_name, " +
                     "CONCAT('Dr. ', d.first_name, ' ', d.last_name) AS doctor_name, " +
                     "CONCAT('Dr. ', od.first_name, ' ', od.last_name) AS offered_doctor_name " +
                     "FROM appointment_waitlist w " +
                     "JOIN patients p ON w.patient_id = p.patient_id " +
                     "LEFT JOIN doctors d ON w.doctor_id = d.doctor_id " +
                     "LEFT JOIN doctors od ON w.offered_doctor_id = od.doctor_id " +
                     "WHERE w.waitlist_id = ?";
        List<WaitlistEntry> list = jdbcTemplate.query(sql, waitlistRowMapper, waitlistId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<WaitlistEntry> findAll(String status, LocalDate date) {
        StringBuilder sql = new StringBuilder(
                "SELECT w.*, " +
                "CONCAT(p.first_name, ' ', p.last_name) AS patient_name, " +
                "CONCAT('Dr. ', d.first_name, ' ', d.last_name) AS doctor_name, " +
                "CONCAT('Dr. ', od.first_name, ' ', od.last_name) AS offered_doctor_name " +
                "FROM appointment_waitlist w " +
                "JOIN patients p ON w.patient_id = p.patient_id " +
                "LEFT JOIN doctors d ON w.doctor_id = d.doctor_id " +
                "LEFT JOIN doctors od ON w.offered_doctor_id = od.doctor_id " +
                "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();
        if (status != null && !status.isBlank()) {
            sql.append("AND w.status = ? ");
            params.add(status.toUpperCase());
        }
        if (date != null) {
            sql.append("AND w.preferred_date = ? ");
            params.add(Date.valueOf(date));
        }
        sql.append("ORDER BY w.created_at ASC");
        return jdbcTemplate.query(sql.toString(), waitlistRowMapper, params.toArray());
    }

    public List<WaitlistEntry> findMatchingEntries(String specialization, Long doctorId, LocalDate date, LocalTime start, LocalTime end) {
        String sql = "SELECT w.*, " +
                     "CONCAT(p.first_name, ' ', p.last_name) AS patient_name, " +
                     "CONCAT('Dr. ', d.first_name, ' ', d.last_name) AS doctor_name, " +
                     "NULL AS offered_doctor_name " +
                     "FROM appointment_waitlist w " +
                     "JOIN patients p ON w.patient_id = p.patient_id " +
                     "LEFT JOIN doctors d ON w.doctor_id = d.doctor_id " +
                     "WHERE w.status = 'WAITING' " +
                     "AND w.preferred_date = ? " +
                     "AND (w.doctor_id = ? OR w.doctor_id IS NULL) " +
                     "AND (w.specialization = ? OR w.specialization IS NULL OR w.doctor_id = ?) " +
                     "AND (w.preferred_start_time IS NULL OR w.preferred_start_time <= ?) " +
                     "AND (w.preferred_end_time IS NULL OR w.preferred_end_time >= ?) " +
                     "ORDER BY w.created_at ASC";
        return jdbcTemplate.query(sql, waitlistRowMapper, Date.valueOf(date), doctorId, specialization, doctorId, Time.valueOf(start), Time.valueOf(end));
    }

    public int updateOffer(Long waitlistId, Long offeredDoctorId, LocalDate offeredDate, LocalTime start, LocalTime end, LocalDateTime expiresAt) {
        String sql = "UPDATE appointment_waitlist SET status = 'OFFERED', offered_doctor_id = ?, " +
                     "offered_appointment_date = ?, offered_start_time = ?, offered_end_time = ?, " +
                     "offer_expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE waitlist_id = ? AND status = 'WAITING'";
        return jdbcTemplate.update(sql, offeredDoctorId, Date.valueOf(offeredDate), Time.valueOf(start), Time.valueOf(end), Timestamp.valueOf(expiresAt), waitlistId);
    }

    public int updateStatus(Long waitlistId, String status) {
        String sql = "UPDATE appointment_waitlist SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE waitlist_id = ?";
        return jdbcTemplate.update(sql, status, waitlistId);
    }

    public int expireStaleOffers(LocalDateTime now) {
        String sql = "UPDATE appointment_waitlist SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP " +
                     "WHERE status = 'OFFERED' AND offer_expires_at <= ?";
        return jdbcTemplate.update(sql, Timestamp.valueOf(now));
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
        if (singleKey != null) return singleKey.longValue();
        throw new IllegalStateException("Failed to retrieve generated ID for " + idColumnName);
    }
}
