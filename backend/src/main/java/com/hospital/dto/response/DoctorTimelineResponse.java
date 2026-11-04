package com.hospital.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class DoctorTimelineResponse {

    public static class TimelineSlotDTO {
        private LocalTime startTime;
        private LocalTime endTime;
        private String slotType; // AVAILABLE, BOOKED, REST_PERIOD, OUTSIDE_HOURS
        private Long appointmentId;
        private String patientName;
        private String label;
        private String reason;
        private boolean canBook;

        public TimelineSlotDTO() {}

        public TimelineSlotDTO(LocalTime startTime, LocalTime endTime, String slotType, Long appointmentId,
                               String patientName, String label, String reason, boolean canBook) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.slotType = slotType;
            this.appointmentId = appointmentId;
            this.patientName = patientName;
            this.label = label;
            this.reason = reason;
            this.canBook = canBook;
        }

        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getSlotType() { return slotType; }
        public void setSlotType(String slotType) { this.slotType = slotType; }
        public Long getAppointmentId() { return appointmentId; }
        public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
        public String getPatientName() { return patientName; }
        public void setPatientName(String patientName) { this.patientName = patientName; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public boolean isCanBook() { return canBook; }
        public void setCanBook(boolean canBook) { this.canBook = canBook; }
    }

    private Long doctorId;
    private String doctorName;
    private String specialization;
    private LocalDate timelineDate;
    private int totalSlots;
    private int availableSlots;
    private int bookedSlots;
    private int restSlots;
    private List<TimelineSlotDTO> slots = new ArrayList<>();

    public DoctorTimelineResponse() {}

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public LocalDate getTimelineDate() { return timelineDate; }
    public void setTimelineDate(LocalDate timelineDate) { this.timelineDate = timelineDate; }
    public int getTotalSlots() { return totalSlots; }
    public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }
    public int getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }
    public int getBookedSlots() { return bookedSlots; }
    public void setBookedSlots(int bookedSlots) { this.bookedSlots = bookedSlots; }
    public int getRestSlots() { return restSlots; }
    public void setRestSlots(int restSlots) { this.restSlots = restSlots; }
    public List<TimelineSlotDTO> getSlots() { return slots; }
    public void setSlots(List<TimelineSlotDTO> slots) { this.slots = slots; }
}
