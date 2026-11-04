package com.hospital.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Domain model representing a patient on the intelligent cancellation waitlist.
 */
public class WaitlistEntry {

    public enum Status {
        WAITING,
        OFFERED,
        ACCEPTED,
        EXPIRED,
        CANCELLED
    }

    private Long waitlistId;
    private Long patientId;
    private Long doctorId;
    private String specialization;
    private LocalDate preferredDate;
    private LocalTime preferredStartTime;
    private LocalTime preferredEndTime;
    private String status;
    private LocalDate offeredAppointmentDate;
    private LocalTime offeredStartTime;
    private LocalTime offeredEndTime;
    private Long offeredDoctorId;
    private LocalDateTime offerExpiresAt;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Joined fields for view convenience
    private String patientName;
    private String doctorName;
    private String offeredDoctorName;

    public WaitlistEntry() {}

    public Long getWaitlistId() { return waitlistId; }
    public void setWaitlistId(Long waitlistId) { this.waitlistId = waitlistId; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public LocalDate getPreferredDate() { return preferredDate; }
    public void setPreferredDate(LocalDate preferredDate) { this.preferredDate = preferredDate; }

    public LocalTime getPreferredStartTime() { return preferredStartTime; }
    public void setPreferredStartTime(LocalTime preferredStartTime) { this.preferredStartTime = preferredStartTime; }

    public LocalTime getPreferredEndTime() { return preferredEndTime; }
    public void setPreferredEndTime(LocalTime preferredEndTime) { this.preferredEndTime = preferredEndTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getOfferedAppointmentDate() { return offeredAppointmentDate; }
    public void setOfferedAppointmentDate(LocalDate offeredAppointmentDate) { this.offeredAppointmentDate = offeredAppointmentDate; }

    public LocalTime getOfferedStartTime() { return offeredStartTime; }
    public void setOfferedStartTime(LocalTime offeredStartTime) { this.offeredStartTime = offeredStartTime; }

    public LocalTime getOfferedEndTime() { return offeredEndTime; }
    public void setOfferedEndTime(LocalTime offeredEndTime) { this.offeredEndTime = offeredEndTime; }

    public Long getOfferedDoctorId() { return offeredDoctorId; }
    public void setOfferedDoctorId(Long offeredDoctorId) { this.offeredDoctorId = offeredDoctorId; }

    public LocalDateTime getOfferExpiresAt() { return offerExpiresAt; }
    public void setOfferExpiresAt(LocalDateTime offerExpiresAt) { this.offerExpiresAt = offerExpiresAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getOfferedDoctorName() { return offeredDoctorName; }
    public void setOfferedDoctorName(String offeredDoctorName) { this.offeredDoctorName = offeredDoctorName; }
}
