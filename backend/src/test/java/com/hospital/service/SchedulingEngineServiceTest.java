package com.hospital.service;

import com.hospital.dto.response.DoctorTimelineResponse;
import com.hospital.dto.response.DoctorWorkloadDTO;
import com.hospital.dto.response.SlotRecommendationResponse;
import com.hospital.model.Doctor;
import com.hospital.model.DoctorAvailability;
import com.hospital.model.DoctorRestPeriod;
import com.hospital.model.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorAvailabilityRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.DoctorRestPeriodRepository;
import com.hospital.repository.PatientRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SchedulingEngineServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorAvailabilityRepository availabilityRepository;

    @Mock
    private DoctorRestPeriodRepository restPeriodRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private SchedulingEngineService schedulingEngine;

    private Doctor doctor1;
    private Doctor doctor2;
    private Patient patient;

    @BeforeEach
    void setUp() {
        doctor1 = new Doctor();
        doctor1.setDoctorId(1L);
        doctor1.setFirstName("Meena");
        doctor1.setLastName("Raj");
        doctor1.setSpecialization("Cardiology");
        doctor1.setActive(true);

        doctor2 = new Doctor();
        doctor2.setDoctorId(2L);
        doctor2.setFirstName("Kumar");
        doctor2.setLastName("Vel");
        doctor2.setSpecialization("Cardiology");
        doctor2.setActive(true);

        patient = new Patient();
        patient.setPatientId(5L);
        patient.setFirstName("Arun");
        patient.setLastName("Kumar");
        patient.setActive(true);
    }

    @Test
    @DisplayName("Should detect conflict when slot overlaps custom rest period")
    void testIsRestPeriodConflict_CustomRest() {
        LocalDate date = LocalDate.now().plusDays(1);
        DoctorRestPeriod rest = new DoctorRestPeriod(1L, date, LocalTime.of(12, 0), LocalTime.of(13, 0), "Clinical Rounds");

        when(restPeriodRepository.findByDoctorIdAndDate(1L, date)).thenReturn(List.of(rest));

        boolean conflict = schedulingEngine.isRestPeriodConflict(1L, date, LocalTime.of(12, 10), LocalTime.of(12, 30));
        assertTrue(conflict);

        boolean noConflict = schedulingEngine.isRestPeriodConflict(1L, date, LocalTime.of(10, 0), LocalTime.of(10, 20));
        assertFalse(noConflict);
    }

    @Test
    @DisplayName("Should detect conflict with standard hospital lunch break (13:00-14:00) when no custom rest is set")
    void testIsRestPeriodConflict_DefaultLunch() {
        LocalDate date = LocalDate.now().plusDays(1);
        when(restPeriodRepository.findByDoctorIdAndDate(1L, date)).thenReturn(Collections.emptyList());

        boolean lunchConflict = schedulingEngine.isRestPeriodConflict(1L, date, LocalTime.of(13, 0), LocalTime.of(13, 20));
        assertTrue(lunchConflict);

        boolean morningSlot = schedulingEngine.isRestPeriodConflict(1L, date, LocalTime.of(11, 0), LocalTime.of(11, 20));
        assertFalse(morningSlot);
    }

    @Test
    @DisplayName("Should recommend deterministic 20-minute slot avoiding rest period and existing bookings")
    void testRecommendSlot_Success() {
        LocalDate date = LocalDate.now().plusDays(1);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor1));
        when(patientRepository.findById(5L)).thenReturn(Optional.of(patient));

        DoctorAvailability shift = new DoctorAvailability();
        shift.setDoctorId(1L);
        shift.setAvailableDate(date);
        shift.setStartTime(LocalTime.of(9, 0));
        shift.setEndTime(LocalTime.of(12, 0));

        when(availabilityRepository.findByDoctorIdAndDate(1L, date)).thenReturn(List.of(shift));
        when(restPeriodRepository.findByDoctorIdAndDate(1L, date)).thenReturn(Collections.emptyList());
        when(appointmentRepository.countScheduledByDoctorAndDate(1L, date)).thenReturn(1);

        // Suppose 09:00 - 09:20 is booked, but 09:20 - 09:40 is free
        when(appointmentRepository.hasOverlap(eq(1L), eq(date), eq(LocalTime.of(9, 0)), eq(LocalTime.of(9, 20)), any()))
                .thenReturn(true);
        when(appointmentRepository.hasOverlap(eq(1L), eq(date), eq(LocalTime.of(9, 20)), eq(LocalTime.of(9, 40)), any()))
                .thenReturn(false);
        when(appointmentRepository.hasPatientOverlap(eq(5L), eq(date), eq(LocalTime.of(9, 20)), eq(LocalTime.of(9, 40)), any()))
                .thenReturn(false);

        SlotRecommendationResponse rec = schedulingEngine.recommendSlot(1L, 5L, date, null);

        assertNotNull(rec);
        assertEquals(LocalTime.of(9, 20), rec.getRecommendedStart());
        assertEquals(LocalTime.of(9, 40), rec.getRecommendedEnd());
        assertNotNull(rec.getWorkload());
        assertEquals(1, rec.getWorkload().getScheduledAppointmentsCount());
        assertTrue(rec.getRankingFactors().size() >= 2);
    }

    @Test
    @DisplayName("Should balance doctor workload and recommend the least-loaded doctor in a specialization")
    void testRecommendWorkloadBalancedSlot() {
        LocalDate date = LocalDate.now().plusDays(1);

        when(patientRepository.findById(5L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findAll(null, "Cardiology", true)).thenReturn(List.of(doctor1, doctor2));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor1));
        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor2));

        // Doctor 1 has 4 scheduled appointments (heavy load)
        // Doctor 2 has 1 scheduled appointment (lighter load)
        when(appointmentRepository.countScheduledByDoctorAndDate(1L, date)).thenReturn(4);
        when(appointmentRepository.countScheduledByDoctorAndDate(2L, date)).thenReturn(1);

        DoctorAvailability shift = new DoctorAvailability();
        shift.setAvailableDate(date);
        shift.setStartTime(LocalTime.of(10, 0));
        shift.setEndTime(LocalTime.of(12, 0));

        when(availabilityRepository.findByDoctorIdAndDate(anyLong(), eq(date))).thenReturn(List.of(shift));
        when(restPeriodRepository.findByDoctorIdAndDate(anyLong(), eq(date))).thenReturn(Collections.emptyList());
        when(appointmentRepository.hasOverlap(anyLong(), eq(date), any(), any(), any())).thenReturn(false);
        when(appointmentRepository.hasPatientOverlap(anyLong(), eq(date), any(), any(), any())).thenReturn(false);

        SlotRecommendationResponse rec = schedulingEngine.recommendWorkloadBalancedSlot("Cardiology", 5L, date, null);

        assertNotNull(rec);
        // Doctor 2 should be chosen because Doctor 2 has only 1 appointment vs Doctor 1's 4
        assertEquals(2L, rec.getDoctorId());
        assertEquals("Dr. Kumar Vel", rec.getDoctorName());
        assertTrue(rec.getExplanation().contains("Workload-Balanced Recommendation"));
    }

    @Test
    @DisplayName("Should generate timeline grid for doctor's daily shift")
    void testGetDoctorTimeline() {
        LocalDate date = LocalDate.now().plusDays(1);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor1));
        when(availabilityRepository.findByDoctorIdAndDate(1L, date)).thenReturn(Collections.emptyList());
        when(availabilityRepository.hasAnyAvailabilityConfigured(1L, date)).thenReturn(false);
        when(appointmentRepository.findScheduledByDoctorAndDate(1L, date)).thenReturn(Collections.emptyList());

        DoctorTimelineResponse timeline = schedulingEngine.getDoctorTimeline(1L, date);

        assertNotNull(timeline);
        assertEquals(1L, timeline.getDoctorId());
        assertFalse(timeline.getSlots().isEmpty());
        // All 20-min slots should have slotType populated (AVAILABLE, REST_PERIOD, or OUTSIDE_HOURS)
        assertTrue(timeline.getSlots().stream().allMatch(s -> s.getSlotType() != null));
    }
}
