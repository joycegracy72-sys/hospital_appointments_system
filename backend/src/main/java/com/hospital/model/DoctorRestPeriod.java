package com.hospital.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Domain model representing a doctor's protected rest period or lunch break.
 * Rest periods are hard scheduling constraints that prohibit appointment bookings.
 */
public class DoctorRestPeriod {

    private Long restId;
    private Long doctorId;
    private LocalDate restDate; // NULL implies recurring daily; specific date if one-off
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
    private LocalDateTime createdAt;

    public DoctorRestPeriod() {}

    public DoctorRestPeriod(Long doctorId, LocalDate restDate, LocalTime startTime, LocalTime endTime, String reason) {
        this.doctorId = doctorId;
        this.restDate = restDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.reason = reason;
    }

    public Long getRestId() { return restId; }
    public void setRestId(Long restId) { this.restId = restId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public LocalDate getRestDate() { return restDate; }
    public void setRestDate(LocalDate restDate) { this.restDate = restDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
