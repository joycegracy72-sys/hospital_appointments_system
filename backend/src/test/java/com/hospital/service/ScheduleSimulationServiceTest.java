package com.hospital.service;

import com.hospital.dto.request.ScheduleSimulationRequest;
import com.hospital.dto.response.ScheduleSimulationResponse;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleSimulationServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private SchedulingEngineService schedulingEngine;

    @Mock
    private DoctorRestPeriodService restPeriodService;

    @InjectMocks
    private ScheduleSimulationService simulationService;

    private Doctor doctor;

    @BeforeEach
    void setUp() {
        doctor = new Doctor();
        doctor.setDoctorId(1L);
        doctor.setFirstName("Meena");
        doctor.setLastName("Raj");
        doctor.setActive(true);
    }

    @Test
    @DisplayName("Should simulate extra rest break without conflicts and report SAFE status")
    void testPreviewSimulation_SafeBreak() {
        LocalDate date = LocalDate.now().plusDays(1);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findScheduledByDoctorAndDate(1L, date)).thenReturn(Collections.emptyList());
        when(schedulingEngine.getDoctorWorkingWindows(1L, date)).thenReturn(List.of(
                new SchedulingEngineService.TimeWindow(LocalTime.of(9, 0), LocalTime.of(17, 0))
        ));

        ScheduleSimulationRequest request = new ScheduleSimulationRequest();
        request.setSimulationType(ScheduleSimulationRequest.SimulationType.ADD_EXTRA_REST_PERIOD);
        request.setDoctorId(1L);
        request.setSimulationDate(date);
        request.setStartTime(LocalTime.of(14, 0));
        request.setEndTime(LocalTime.of(15, 0));
        request.setDescription("Special Department Meeting");

        ScheduleSimulationResponse response = simulationService.previewSimulation(request);

        assertNotNull(response);
        assertEquals("SAFE", response.getRiskLevel());
        assertTrue(response.isCanApplySafely());
        assertEquals(0, response.getConflictingAppointmentsCount());
        assertTrue(response.getValidSlotsAfter() < response.getValidSlotsBefore());
    }

    @Test
    @DisplayName("Should simulate extra rest break that impacts existing appointment and report CAUTION/HIGH_CONFLICT")
    void testPreviewSimulation_WithConflict() {
        LocalDate date = LocalDate.now().plusDays(1);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

        Appointment existingAppt = new Appointment();
        existingAppt.setAppointmentId(99L);
        existingAppt.setDoctorId(1L);
        existingAppt.setPatientId(5L);
        existingAppt.setAppointmentDate(date);
        existingAppt.setStartTime(LocalTime.of(14, 0));
        existingAppt.setEndTime(LocalTime.of(14, 20));
        existingAppt.setStatus("SCHEDULED");

        when(appointmentRepository.findScheduledByDoctorAndDate(1L, date)).thenReturn(List.of(existingAppt));
        when(schedulingEngine.getDoctorWorkingWindows(1L, date)).thenReturn(List.of(
                new SchedulingEngineService.TimeWindow(LocalTime.of(9, 0), LocalTime.of(17, 0))
        ));

        ScheduleSimulationRequest request = new ScheduleSimulationRequest();
        request.setSimulationType(ScheduleSimulationRequest.SimulationType.ADD_EXTRA_REST_PERIOD);
        request.setDoctorId(1L);
        request.setSimulationDate(date);
        request.setStartTime(LocalTime.of(14, 0));
        request.setEndTime(LocalTime.of(15, 0));
        request.setDescription("Urgent Maintenance Break");

        ScheduleSimulationResponse response = simulationService.previewSimulation(request);

        assertNotNull(response);
        assertFalse(response.isCanApplySafely());
        assertEquals(1, response.getConflictingAppointmentsCount());
        assertEquals(99L, response.getConflictingAppointments().get(0).getAppointmentId());
    }
}
