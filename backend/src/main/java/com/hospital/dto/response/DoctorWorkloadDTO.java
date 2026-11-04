package com.hospital.dto.response;

import java.time.LocalDate;

public class DoctorWorkloadDTO {

    private Long doctorId;
    private String doctorName;
    private String specialization;
    private LocalDate date;
    private int scheduledAppointmentsCount;
    private int scheduledMinutes;
    private int totalAvailableSlots;
    private double workloadPercentage;

    public DoctorWorkloadDTO() {}

    public DoctorWorkloadDTO(Long doctorId, String doctorName, String specialization, LocalDate date,
                             int scheduledAppointmentsCount, int scheduledMinutes, int totalAvailableSlots) {
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialization = specialization;
        this.date = date;
        this.scheduledAppointmentsCount = scheduledAppointmentsCount;
        this.scheduledMinutes = scheduledMinutes;
        this.totalAvailableSlots = totalAvailableSlots;
        this.workloadPercentage = totalAvailableSlots > 0
                ? Math.min(100.0, ((double) scheduledAppointmentsCount / totalAvailableSlots) * 100.0)
                : 0.0;
    }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public int getScheduledAppointmentsCount() { return scheduledAppointmentsCount; }
    public void setScheduledAppointmentsCount(int scheduledAppointmentsCount) { this.scheduledAppointmentsCount = scheduledAppointmentsCount; }

    public int getScheduledMinutes() { return scheduledMinutes; }
    public void setScheduledMinutes(int scheduledMinutes) { this.scheduledMinutes = scheduledMinutes; }

    public int getTotalAvailableSlots() { return totalAvailableSlots; }
    public void setTotalAvailableSlots(int totalAvailableSlots) { this.totalAvailableSlots = totalAvailableSlots; }

    public double getWorkloadPercentage() { return workloadPercentage; }
    public void setWorkloadPercentage(double workloadPercentage) { this.workloadPercentage = workloadPercentage; }
}
