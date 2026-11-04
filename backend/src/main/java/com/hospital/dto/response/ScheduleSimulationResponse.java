package com.hospital.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class ScheduleSimulationResponse {

    public static class ImpactedAppointmentDTO {
        private Long appointmentId;
        private String patientName;
        private LocalTime startTime;
        private LocalTime endTime;
        private String status;
        private String conflictReason;

        public ImpactedAppointmentDTO() {}

        public ImpactedAppointmentDTO(Long appointmentId, String patientName, LocalTime startTime, LocalTime endTime, String status, String conflictReason) {
            this.appointmentId = appointmentId;
            this.patientName = patientName;
            this.startTime = startTime;
            this.endTime = endTime;
            this.status = status;
            this.conflictReason = conflictReason;
        }

        public Long getAppointmentId() { return appointmentId; }
        public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
        public String getPatientName() { return patientName; }
        public void setPatientName(String patientName) { this.patientName = patientName; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getConflictReason() { return conflictReason; }
        public void setConflictReason(String conflictReason) { this.conflictReason = conflictReason; }
    }

    public static class AffectedSlotDTO {
        private LocalTime startTime;
        private LocalTime endTime;
        private String stateBefore;
        private String stateAfter;
        private String explanation;

        public AffectedSlotDTO() {}

        public AffectedSlotDTO(LocalTime startTime, LocalTime endTime, String stateBefore, String stateAfter, String explanation) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.stateBefore = stateBefore;
            this.stateAfter = stateAfter;
            this.explanation = explanation;
        }

        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getStateBefore() { return stateBefore; }
        public void setStateBefore(String stateBefore) { this.stateBefore = stateBefore; }
        public String getStateAfter() { return stateAfter; }
        public void setStateAfter(String stateAfter) { this.stateAfter = stateAfter; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    private String simulationType;
    private Long doctorId;
    private String doctorName;
    private LocalDate simulationDate;
    private String scenarioDescription;

    private int validSlotsBefore;
    private int validSlotsAfter;
    private int slotDelta; // after - before

    private int conflictingAppointmentsCount;
    private List<ImpactedAppointmentDTO> conflictingAppointments = new ArrayList<>();
    private List<AffectedSlotDTO> affectedSlots = new ArrayList<>();

    private String riskLevel; // SAFE, CAUTION, HIGH_CONFLICT
    private String explanation;
    private boolean canApplySafely;

    public ScheduleSimulationResponse() {}

    public String getSimulationType() { return simulationType; }
    public void setSimulationType(String simulationType) { this.simulationType = simulationType; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public LocalDate getSimulationDate() { return simulationDate; }
    public void setSimulationDate(LocalDate simulationDate) { this.simulationDate = simulationDate; }
    public String getScenarioDescription() { return scenarioDescription; }
    public void setScenarioDescription(String scenarioDescription) { this.scenarioDescription = scenarioDescription; }
    public int getValidSlotsBefore() { return validSlotsBefore; }
    public void setValidSlotsBefore(int validSlotsBefore) { this.validSlotsBefore = validSlotsBefore; }
    public int getValidSlotsAfter() { return validSlotsAfter; }
    public void setValidSlotsAfter(int validSlotsAfter) { this.validSlotsAfter = validSlotsAfter; }
    public int getSlotDelta() { return slotDelta; }
    public void setSlotDelta(int slotDelta) { this.slotDelta = slotDelta; }
    public int getConflictingAppointmentsCount() { return conflictingAppointmentsCount; }
    public void setConflictingAppointmentsCount(int conflictingAppointmentsCount) { this.conflictingAppointmentsCount = conflictingAppointmentsCount; }
    public List<ImpactedAppointmentDTO> getConflictingAppointments() { return conflictingAppointments; }
    public void setConflictingAppointments(List<ImpactedAppointmentDTO> conflictingAppointments) { this.conflictingAppointments = conflictingAppointments; }
    public List<AffectedSlotDTO> getAffectedSlots() { return affectedSlots; }
    public void setAffectedSlots(List<AffectedSlotDTO> affectedSlots) { this.affectedSlots = affectedSlots; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public boolean isCanApplySafely() { return canApplySafely; }
    public void setCanApplySafely(boolean canApplySafely) { this.canApplySafely = canApplySafely; }
}
