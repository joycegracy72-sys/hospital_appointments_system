package com.hospital.service;

import com.hospital.dto.request.WaitlistRequest;
import com.hospital.dto.response.AppointmentDetailResponse;
import com.hospital.dto.response.WaitlistResponse;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.model.WaitlistEntry;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.WaitlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WaitlistServiceTest {

    @Mock
    private WaitlistRepository waitlistRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private SchedulingEngineService schedulingEngine;

    @InjectMocks
    private WaitlistService waitlistService;

    private Patient patient;
    private Doctor doctor;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setPatientId(5L);
        patient.setFirstName("Arun");
        patient.setLastName("Kumar");
        patient.setActive(true);

        doctor = new Doctor();
        doctor.setDoctorId(1L);
        doctor.setFirstName("Meena");
        doctor.setLastName("Raj");
        doctor.setSpecialization("Cardiology");
        doctor.setActive(true);
    }

    @Test
    @DisplayName("Should successfully register a patient to the waitlist")
    void testAddToWaitlist_Success() {
        LocalDate preferredDate = LocalDate.now().plusDays(2);

        when(patientRepository.findById(5L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

        WaitlistEntry saved = new WaitlistEntry();
        saved.setWaitlistId(10L);
        saved.setPatientId(5L);
        saved.setDoctorId(1L);
        saved.setSpecialization("Cardiology");
        saved.setPreferredDate(preferredDate);
        saved.setStatus("WAITING");

        when(waitlistRepository.save(any(WaitlistEntry.class))).thenReturn(10L);
        when(waitlistRepository.findById(10L)).thenReturn(Optional.of(saved));

        WaitlistRequest req = new WaitlistRequest();
        req.setPatientId(5L);
        req.setDoctorId(1L);
        req.setPreferredDate(preferredDate);
        req.setPreferredStartTime(LocalTime.of(9, 0));
        req.setPreferredEndTime(LocalTime.of(12, 0));
        req.setNotes("First available morning slot");

        WaitlistResponse resp = waitlistService.addToWaitlist(req);

        assertNotNull(resp);
        assertEquals(10L, resp.getWaitlistId());
        assertEquals("WAITING", resp.getStatus());
        verify(waitlistRepository).save(any(WaitlistEntry.class));
    }

    @Test
    @DisplayName("Should cascade cancelled appointment to waiting patient and update offer")
    void testProcessCancelledSlot_MatchesCandidate() {
        LocalDate date = LocalDate.now().plusDays(1);
        Appointment cancelled = new Appointment();
        cancelled.setAppointmentId(20L);
        cancelled.setDoctorId(1L);
        cancelled.setAppointmentDate(date);
        cancelled.setStartTime(LocalTime.of(10, 0));
        cancelled.setEndTime(LocalTime.of(10, 20));

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

        WaitlistEntry waitingPatient = new WaitlistEntry();
        waitingPatient.setWaitlistId(55L);
        waitingPatient.setPatientId(5L);
        waitingPatient.setStatus("WAITING");

        when(waitlistRepository.findMatchingEntries(eq("Cardiology"), eq(1L), eq(date), eq(LocalTime.of(10, 0)), eq(LocalTime.of(10, 20))))
                .thenReturn(List.of(waitingPatient));
        when(appointmentRepository.hasPatientOverlap(eq(5L), eq(date), eq(LocalTime.of(10, 0)), eq(LocalTime.of(10, 20)), eq(null)))
                .thenReturn(false);
        when(waitlistRepository.updateOffer(eq(55L), eq(1L), eq(date), eq(LocalTime.of(10, 0)), eq(LocalTime.of(10, 20)), any(LocalDateTime.class)))
                .thenReturn(1);

        waitlistService.processCancelledSlot(cancelled);

        verify(waitlistRepository).updateOffer(eq(55L), eq(1L), eq(date), eq(LocalTime.of(10, 0)), eq(LocalTime.of(10, 20)), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Should atomically accept offer and book appointment")
    void testAcceptOffer_Success() {
        LocalDate date = LocalDate.now().plusDays(1);
        WaitlistEntry offered = new WaitlistEntry();
        offered.setWaitlistId(77L);
        offered.setPatientId(5L);
        offered.setOfferedDoctorId(1L);
        offered.setOfferedAppointmentDate(date);
        offered.setOfferedStartTime(LocalTime.of(10, 0));
        offered.setOfferedEndTime(LocalTime.of(10, 20));
        offered.setStatus("OFFERED");
        offered.setOfferExpiresAt(LocalDateTime.now().plusHours(4));

        when(waitlistRepository.findById(77L)).thenReturn(Optional.of(offered));
        when(schedulingEngine.isRestPeriodConflict(1L, date, LocalTime.of(10, 0), LocalTime.of(10, 20))).thenReturn(false);
        when(appointmentRepository.hasOverlap(1L, date, LocalTime.of(10, 0), LocalTime.of(10, 20), null)).thenReturn(false);
        when(appointmentRepository.hasPatientOverlap(5L, date, LocalTime.of(10, 0), LocalTime.of(10, 20), null)).thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(300L);

        AppointmentDetailResponse detail = new AppointmentDetailResponse();
        detail.setAppointmentId(300L);
        detail.setStatus("SCHEDULED");
        when(appointmentRepository.findDetailById(300L)).thenReturn(Optional.of(detail));

        AppointmentDetailResponse booked = waitlistService.acceptOffer(77L);

        assertNotNull(booked);
        assertEquals(300L, booked.getAppointmentId());
        verify(waitlistRepository).updateStatus(77L, "ACCEPTED");
    }
}
