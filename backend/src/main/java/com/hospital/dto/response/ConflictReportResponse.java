package com.hospital.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class ConflictReportResponse {

    public static class ConflictItemDTO {
        private String conflictType; // DOCTOR_OVERLAP, PATIENT_OVERLAP, REST_PERIOD_VIOLATION, AVAILABILITY_BREACH
        private Long appointmentId;
        private Long secondaryAppointmentId;
        private Long doctorId;
        private String doctorName;
        private Long patientId;
        private String patientName;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private String description;
        private String recommendation;

        public ConflictItemDTO() {}

        public String getConflictType() { return conflictType; }
        public void setConflictType(String conflictType) { this.conflictType = conflictType; }
        public Long getAppointmentId() { return appointmentId; }
        public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
        public Long getSecondaryAppointmentId() { return secondaryAppointmentId; }
        public void setSecondaryAppointmentId(Long secondaryAppointmentId) { this.secondaryAppointmentId = secondaryAppointmentId; }
        public Long getDoctorId() { return doctorId; }
        public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
        public String getDoctorName() { return doctorName; }
        public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
        public Long getPatientId() { return patientId; }
        public void setPatientId(Long patientId) { this.patientId = patientId; }
        public String getPatientName() { return patientName; }
        public void setPatientName(String patientName) { this.patientName = patientName; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }

    private int totalConflicts;
    private int doctorOverlapConflicts;
    private int patientOverlapConflicts;
    private int restPeriodConflicts;
    private List<ConflictItemDTO> conflicts = new ArrayList<>();
    private String systemIntegrityStatus; // "HEALTHY" or "ATTENTION_REQUIRED"

    public ConflictReportResponse() {}

    public int getTotalConflicts() { return totalConflicts; }
    public void setTotalConflicts(int totalConflicts) { this.totalConflicts = totalConflicts; }
    public int getDoctorOverlapConflicts() { return doctorOverlapConflicts; }
    public void setDoctorOverlapConflicts(int doctorOverlapConflicts) { this.doctorOverlapConflicts = doctorOverlapConflicts; }
    public int getPatientOverlapConflicts() { return patientOverlapConflicts; }
    public void setPatientOverlapConflicts(int patientOverlapConflicts) { this.patientOverlapConflicts = patientOverlapConflicts; }
    public int getRestPeriodConflicts() { return restPeriodConflicts; }
    public void setRestPeriodConflicts(int restPeriodConflicts) { this.restPeriodConflicts = restPeriodConflicts; }
    public List<ConflictItemDTO> getConflicts() { return conflicts; }
    public void setConflicts(List<ConflictItemDTO> conflicts) { this.conflicts = conflicts; }
    public String getSystemIntegrityStatus() { return systemIntegrityStatus; }
    public void setSystemIntegrityStatus(String systemIntegrityStatus) { this.systemIntegrityStatus = systemIntegrityStatus; }
}
