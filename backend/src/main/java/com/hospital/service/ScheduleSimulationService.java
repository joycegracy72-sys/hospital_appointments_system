package com.hospital.service;

import com.hospital.dto.request.RestPeriodRequest;
import com.hospital.dto.request.ScheduleSimulationRequest;
import com.hospital.dto.response.ScheduleSimulationResponse;
import com.hospital.dto.response.ScheduleSimulationResponse.AffectedSlotDTO;
import com.hospital.dto.response.ScheduleSimulationResponse.ImpactedAppointmentDTO;
import com.hospital.exception.BusinessConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Hospital Schedule Digital Twin / What-If Simulator.
 * Simulates schedule alterations purely in-memory without mutating database state.
 */
@Service
public class ScheduleSimulationService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final SchedulingEngineService schedulingEngine;
    private final DoctorRestPeriodService restPeriodService;

    public ScheduleSimulationService(DoctorRepository doctorRepository,
                                     AppointmentRepository appointmentRepository,
                                     SchedulingEngineService schedulingEngine,
                                     DoctorRestPeriodService restPeriodService) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.schedulingEngine = schedulingEngine;
        this.restPeriodService = restPeriodService;
    }

    /**
     * Previews schedule modifications without modifying the database.
     */
    public ScheduleSimulationResponse previewSimulation(ScheduleSimulationRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        ScheduleSimulationResponse response = new ScheduleSimulationResponse();
        response.setSimulationType(request.getSimulationType().name());
        response.setDoctorId(request.getDoctorId());
        response.setDoctorName(doctor.getFullName());
        response.setSimulationDate(request.getSimulationDate());

        List<Appointment> existingAppts = appointmentRepository.findScheduledByDoctorAndDate(
                request.getDoctorId(), request.getSimulationDate()
        );

        LocalTime dayStart = LocalTime.of(8, 0);
        LocalTime dayEnd = LocalTime.of(18, 0);

        List<SchedulingEngineService.TimeWindow> baselineWindows =
                schedulingEngine.getDoctorWorkingWindows(request.getDoctorId(), request.getSimulationDate());

        // Count baseline valid slots
        int beforeSlots = 0;
        LocalTime cursor = dayStart;
        while (!cursor.plusMinutes(SchedulingEngineService.APPOINTMENT_MINUTES).isAfter(dayEnd)) {
            LocalTime slotEnd = cursor.plusMinutes(SchedulingEngineService.APPOINTMENT_MINUTES);
            boolean insideBaseline = isInsideWindows(cursor, slotEnd, baselineWindows);
            boolean rest = schedulingEngine.isRestPeriodConflict(request.getDoctorId(), request.getSimulationDate(), cursor, slotEnd);
            boolean booked = isBooked(cursor, slotEnd, existingAppts);

            if (insideBaseline && !rest && !booked) {
                beforeSlots++;
            }
            cursor = cursor.plusMinutes(SchedulingEngineService.APPOINTMENT_MINUTES);
        }
        response.setValidSlotsBefore(beforeSlots);

        // Simulate Scenario
        int afterSlots = 0;
        List<ImpactedAppointmentDTO> conflicts = new ArrayList<>();
        List<AffectedSlotDTO> affectedSlots = new ArrayList<>();

        if (request.getSimulationType() == ScheduleSimulationRequest.SimulationType.ADD_EXTRA_REST_PERIOD) {
            response.setScenarioDescription("Simulating proposed rest period from " + request.getStartTime() +
                    " to " + request.getEndTime() + " (" + (request.getDescription() != null ? request.getDescription() : "Rest Break") + ")");

            // Check existing appointments that would collide
            for (Appointment appt : existingAppts) {
                if (appt.getStartTime().isBefore(request.getEndTime()) && appt.getEndTime().isAfter(request.getStartTime())) {
                    conflicts.add(new ImpactedAppointmentDTO(
                            appt.getAppointmentId(),
                            "Patient ID #" + appt.getPatientId(),
                            appt.getStartTime(),
                            appt.getEndTime(),
                            appt.getStatus(),
                            "Appointment directly overlaps proposed simulated rest break"
                    ));
                }
            }

            // Recalculate slots
            cursor = dayStart;
            while (!cursor.plusMinutes(SchedulingEngineService.APPOINTMENT_MINUTES).isAfter(dayEnd)) {
                LocalTime slotEnd = cursor.plusMinutes(SchedulingEngineService.APPOINTMENT_MINUTES);
                boolean insideBaseline = isInsideWindows(cursor, slotEnd, baselineWindows);
                boolean inExistingRest = schedulingEngine.isRestPeriodConflict(request.getDoctorId(), request.getSimulationDate(), cursor, slotEnd);
                boolean inSimulatedRest = cursor.isBefore(request.getEndTime()) && slotEnd.isAfter(request.getStartTime());
                boolean booked = isBooked(cursor, slotEnd, existingAppts);

                boolean validBefore = insideBaseline && !inExistingRest && !booked;
                boolean validAfter = insideBaseline && !inExistingRest && !inSimulatedRest && !booked;

                if (validAfter) afterSlots++;

                if (validBefore != validAfter) {
                    affectedSlots.add(new AffectedSlotDTO(
                            cursor, slotEnd,
                            validBefore ? "AVAILABLE" : "UNAVAILABLE",
                            validAfter ? "AVAILABLE" : "REST_PERIOD",
                            "Slot lost due to simulated break"
                    ));
                }
                cursor = cursor.plusMinutes(SchedulingEngineService.APPOINTMENT_MINUTES);
            }

        } else if (request.getSimulationType() == ScheduleSimulationRequest.SimulationType.REDUCE_AVAILABILITY_HOURS) {
            response.setScenarioDescription("Simulating reduced working shift hours to " + request.getStartTime() + " - " + request.getEndTime());

            for (Appointment appt : existingAppts) {
                if (appt.getStartTime().isBefore(request.getStartTime()) || appt.getEndTime().isAfter(request.getEndTime())) {
                    conflicts.add(new ImpactedAppointmentDTO(
                            appt.getAppointmentId(),
                            "Patient ID #" + appt.getPatientId(),
                            appt.getStartTime(),
                            appt.getEndTime(),
                            appt.getStatus(),
                            "Appointment falls outside simulated reduced working hours"
                    ));
                }
            }

            cursor = dayStart;
            while (!cursor.plusMinutes(SchedulingEngineService.APPOINTMENT_MINUTES).isAfter(dayEnd)) {
                LocalTime slotEnd = cursor.plusMinutes(SchedulingEngineService.APPOINTMENT_MINUTES);
                boolean inSimulatedHours = !cursor.isBefore(request.getStartTime()) && !slotEnd.isAfter(request.getEndTime());
                boolean inExistingRest = schedulingEngine.isRestPeriodConflict(request.getDoctorId(), request.getSimulationDate(), cursor, slotEnd);
                boolean booked = isBooked(cursor, slotEnd, existingAppts);

                boolean validBefore = isInsideWindows(cursor, slotEnd, baselineWindows) && !inExistingRest && !booked;
                boolean validAfter = inSimulatedHours && !inExistingRest && !booked;

                if (validAfter) afterSlots++;

                if (validBefore != validAfter) {
                    affectedSlots.add(new AffectedSlotDTO(
                            cursor, slotEnd,
                            validBefore ? "AVAILABLE" : "UNAVAILABLE",
                            validAfter ? "AVAILABLE" : "OFF_DUTY",
                            "Shift boundary shifted outside slot"
                    ));
                }
                cursor = cursor.plusMinutes(SchedulingEngineService.APPOINTMENT_MINUTES);
            }

        } else { // INSERT_TEST_APPOINTMENT
            response.setScenarioDescription("Simulating insertion of test/emergency appointment at " + request.getStartTime() + " - " + request.getEndTime());

            for (Appointment appt : existingAppts) {
                if (appt.getStartTime().isBefore(request.getEndTime()) && appt.getEndTime().isAfter(request.getStartTime())) {
                    conflicts.add(new ImpactedAppointmentDTO(
                            appt.getAppointmentId(),
                            "Patient ID #" + appt.getPatientId(),
                            appt.getStartTime(),
                            appt.getEndTime(),
                            appt.getStatus(),
                            "Collides directly with proposed test appointment"
                    ));
                }
            }

            boolean restConflict = schedulingEngine.isRestPeriodConflict(request.getDoctorId(), request.getSimulationDate(), request.getStartTime(), request.getEndTime());
            if (restConflict) {
                conflicts.add(new ImpactedAppointmentDTO(
                        0L, "Doctor Rest Boundary", request.getStartTime(), request.getEndTime(), "PROPOSED",
                        "Proposed test appointment breaches a protected rest period"
                ));
            }

            afterSlots = Math.max(0, beforeSlots - 1);
        }

        response.setValidSlotsAfter(afterSlots);
        response.setSlotDelta(afterSlots - beforeSlots);
        response.setConflictingAppointmentsCount(conflicts.size());
        response.setConflictingAppointments(conflicts);
        response.setAffectedSlots(affectedSlots);

        // Evaluation & Risk Assessment
        if (conflicts.isEmpty()) {
            response.setRiskLevel("SAFE");
            response.setCanApplySafely(true);
            response.setExplanation("Simulation complete: Proposed change causes zero schedule collisions. " +
                    "Capacity adjusts from " + beforeSlots + " to " + afterSlots + " valid slots (" + response.getSlotDelta() + " slots). Safe to apply.");
        } else if (conflicts.size() <= 2) {
            response.setRiskLevel("CAUTION");
            response.setCanApplySafely(false);
            response.setExplanation("Simulation alert: Proposed change impacts " + conflicts.size() +
                    " existing active appointment(s). Requires manual rescheduling before this change can be confirmed.");
        } else {
            response.setRiskLevel("HIGH_CONFLICT");
            response.setCanApplySafely(false);
            response.setExplanation("Simulation critical: Proposed change disrupts " + conflicts.size() +
                    " scheduled appointments and reduces capacity severely. Not recommended without administrative override.");
        }

        return response;
    }

    /**
     * Explicitly commits a validated simulation after administrator review.
     */
    @Transactional
    public void applySimulation(ScheduleSimulationRequest request) {
        ScheduleSimulationResponse preview = previewSimulation(request);
        if (!preview.isCanApplySafely()) {
            throw new BusinessConflictException("Cannot apply simulated schedule change: " +
                    preview.getConflictingAppointmentsCount() + " active appointments conflict. " +
                    "Resolve existing appointment conflicts first.");
        }

        if (request.getSimulationType() == ScheduleSimulationRequest.SimulationType.ADD_EXTRA_REST_PERIOD) {
            RestPeriodRequest restReq = new RestPeriodRequest();
            restReq.setDoctorId(request.getDoctorId());
            restReq.setRestDate(request.getSimulationDate());
            restReq.setStartTime(request.getStartTime());
            restReq.setEndTime(request.getEndTime());
            restReq.setReason(request.getDescription() != null ? request.getDescription() : "Simulated Rest Period");
            restPeriodService.addRestPeriod(restReq);
        } else {
            throw new UnsupportedOperationException("Application of " + request.getSimulationType() + " requires availability schedule editor.");
        }
    }

    private boolean isInsideWindows(LocalTime start, LocalTime end, List<SchedulingEngineService.TimeWindow> windows) {
        for (SchedulingEngineService.TimeWindow w : windows) {
            if (!start.isBefore(w.start) && !end.isAfter(w.end)) return true;
        }
        return false;
    }

    private boolean isBooked(LocalTime start, LocalTime end, List<Appointment> appts) {
        for (Appointment a : appts) {
            if (start.isBefore(a.getEndTime()) && end.isAfter(a.getStartTime())) return true;
        }
        return false;
    }
}
