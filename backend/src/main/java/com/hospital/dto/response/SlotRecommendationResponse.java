package com.hospital.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Detailed, explainable recommendation response for intelligent slot selection.
 */
public class SlotRecommendationResponse {

    public static class SlotOptionDTO {
        private Long doctorId;
        private String doctorName;
        private LocalTime startTime;
        private LocalTime endTime;
        private String explanation;

        public SlotOptionDTO() {}

        public SlotOptionDTO(Long doctorId, String doctorName, LocalTime startTime, LocalTime endTime, String explanation) {
            this.doctorId = doctorId;
            this.doctorName = doctorName;
            this.startTime = startTime;
            this.endTime = endTime;
            this.explanation = explanation;
        }

        public Long getDoctorId() { return doctorId; }
        public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
        public String getDoctorName() { return doctorName; }
        public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    private Long doctorId;
    private String doctorName;
    private String specialization;
    private Long patientId;
    private String patientName;
    private LocalDate appointmentDate;
    private LocalTime recommendedStart;
    private LocalTime recommendedEnd;
    private String explanation;
    private List<String> rankingFactors = new ArrayList<>();
    private List<String> rejectedReasons = new ArrayList<>();
    private DoctorWorkloadDTO workload;
    private List<SlotOptionDTO> alternativeSlots = new ArrayList<>();

    public SlotRecommendationResponse() {}

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getRecommendedStart() { return recommendedStart; }
    public void setRecommendedStart(LocalTime recommendedStart) { this.recommendedStart = recommendedStart; }

    public LocalTime getRecommendedEnd() { return recommendedEnd; }
    public void setRecommendedEnd(LocalTime recommendedEnd) { this.recommendedEnd = recommendedEnd; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public List<String> getRankingFactors() { return rankingFactors; }
    public void setRankingFactors(List<String> rankingFactors) { this.rankingFactors = rankingFactors; }

    public List<String> getRejectedReasons() { return rejectedReasons; }
    public void setRejectedReasons(List<String> rejectedReasons) { this.rejectedReasons = rejectedReasons; }

    public DoctorWorkloadDTO getWorkload() { return workload; }
    public void setWorkload(DoctorWorkloadDTO workload) { this.workload = workload; }

    public List<SlotOptionDTO> getAlternativeSlots() { return alternativeSlots; }
    public void setAlternativeSlots(List<SlotOptionDTO> alternativeSlots) { this.alternativeSlots = alternativeSlots; }
}
