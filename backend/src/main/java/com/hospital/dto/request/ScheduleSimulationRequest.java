package com.hospital.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class ScheduleSimulationRequest {

    public enum SimulationType {
        ADD_EXTRA_REST_PERIOD,       // What if doctor takes an additional rest/lunch break?
        REDUCE_AVAILABILITY_HOURS,   // What if doctor's shift starts later or ends earlier?
        INSERT_TEST_APPOINTMENT      // What if an emergency / VIP appointment is inserted?
    }

    @NotNull(message = "Simulation type is required")
    private SimulationType simulationType;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Date is required")
    private LocalDate simulationDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String description;

    public ScheduleSimulationRequest() {}

    public SimulationType getSimulationType() { return simulationType; }
    public void setSimulationType(SimulationType simulationType) { this.simulationType = simulationType; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public LocalDate getSimulationDate() { return simulationDate; }
    public void setSimulationDate(LocalDate simulationDate) { this.simulationDate = simulationDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
