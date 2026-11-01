package com.hospital.service;

import com.hospital.dto.request.AppointmentCancelRequest;
import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.request.AppointmentRescheduleRequest;
import com.hospital.dto.response.AppointmentDetailResponse;
import com.hospital.exception.BusinessConflictException;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorAvailabilityRepository;
import com.hospital.repository.DoctorRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private DoctorAvailabilityRepository availabilityRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    private Patient activePatient;
    private Doctor activeDoctor;
    private AppointmentRequest validRequest;

    @BeforeEach
    void setUp() {
        activePatient = new Patient();
        activePatient.setPatientId(1L);
        activePatient.setFirstName("Arun");
        activePatient.setLastName("Kumar");
        activePatient.setEmail("arun@example.com");
        activePatient.setActive(true);

        activeDoctor = new Doctor();
        activeDoctor.setDoctorId(10L);
        activeDoctor.setFirstName("Meena");
        activeDoctor.setLastName("Raj");
        activeDoctor.setSpecialization("Cardiology");
        activeDoctor.setActive(true);

        validRequest = new AppointmentRequest();
        validRequest.setPatientId(1L);
        validRequest.setDoctorId(10L);
        validRequest.setAppointmentDate(LocalDate.now().plusDays(1));
        validRequest.setStartTime(LocalTime.of(10, 0));
        validRequest.setEndTime(LocalTime.of(10, 30));
        validRequest.setReasonForVisit("Routine check-up");
    }

    @Test
    @DisplayName("Should successfully book appointment when doctor has no conflicts")
    void testBookAppointment_Success() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));
        when(doctorRepository.findById(10L)).thenReturn(Optional.of(activeDoctor));
        when(availabilityRepository.hasAnyAvailabilityConfigured(eq(10L), any(LocalDate.class))).thenReturn(false);
        when(appointmentRepository.hasOverlap(eq(10L), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), eq(null)))
                .thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(100L);

        AppointmentDetailResponse detail = new AppointmentDetailResponse();
        detail.setAppointmentId(100L);
        detail.setPatientName("Arun Kumar");
        detail.setDoctorName("Dr. Meena Raj");
        detail.setStatus("SCHEDULED");
        when(appointmentRepository.findDetailById(100L)).thenReturn(Optional.of(detail));

        AppointmentDetailResponse result = appointmentService.bookAppointment(validRequest);

        assertNotNull(result);
        assertEquals(100L, result.getAppointmentId());
        assertEquals("SCHEDULED", result.getStatus());
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Should prevent booking when doctor already has an overlapping appointment")
    void testBookAppointment_OverlapConflict_ThrowsException() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));
        when(doctorRepository.findById(10L)).thenReturn(Optional.of(activeDoctor));
        when(availabilityRepository.hasAnyAvailabilityConfigured(eq(10L), any(LocalDate.class))).thenReturn(false);
        when(appointmentRepository.hasOverlap(eq(10L), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), eq(null)))
                .thenReturn(true);

        BusinessConflictException ex = assertThrows(BusinessConflictException.class, () -> {
            appointmentService.bookAppointment(validRequest);
        });

        assertEquals("Doctor already has an active overlapping appointment during this time slot.", ex.getMessage());
    }

    @Test
    @DisplayName("Should reject booking for a deactivated patient to preserve integrity")
    void testBookAppointment_DeactivatedPatient_ThrowsException() {
        activePatient.setActive(false);
        when(patientRepository.findById(1L)).thenReturn(Optional.of(activePatient));

        BusinessConflictException ex = assertThrows(BusinessConflictException.class, () -> {
            appointmentService.bookAppointment(validRequest);
        });

        assertEquals("Cannot book appointment for a deactivated patient. Please activate patient first.", ex.getMessage());
    }

    @Test
    @DisplayName("Should successfully reschedule appointment when slot is free")
    void testRescheduleAppointment_Success() {
        Appointment existing = new Appointment();
        existing.setAppointmentId(50L);
        existing.setDoctorId(10L);
        existing.setStatus("SCHEDULED");

        when(appointmentRepository.findById(50L)).thenReturn(Optional.of(existing));
        when(availabilityRepository.hasAnyAvailabilityConfigured(eq(10L), any(LocalDate.class))).thenReturn(false);
        when(appointmentRepository.hasOverlap(eq(10L), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), eq(50L)))
                .thenReturn(false);

        AppointmentDetailResponse detail = new AppointmentDetailResponse();
        detail.setAppointmentId(50L);
        detail.setStatus("RESCHEDULED");
        when(appointmentRepository.findDetailById(50L)).thenReturn(Optional.of(detail));

        AppointmentRescheduleRequest rescheduleRequest = new AppointmentRescheduleRequest();
        rescheduleRequest.setAppointmentDate(LocalDate.now().plusDays(2));
        rescheduleRequest.setStartTime(LocalTime.of(11, 0));
        rescheduleRequest.setEndTime(LocalTime.of(11, 30));

        AppointmentDetailResponse result = appointmentService.rescheduleAppointment(50L, rescheduleRequest);

        assertNotNull(result);
        assertEquals("RESCHEDULED", result.getStatus());
        verify(appointmentRepository).reschedule(eq(50L), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class));
    }

    @Test
    @DisplayName("Should successfully cancel appointment with valid reason")
    void testCancelAppointment_Success() {
        Appointment existing = new Appointment();
        existing.setAppointmentId(50L);
        existing.setStatus("SCHEDULED");

        when(appointmentRepository.findById(50L)).thenReturn(Optional.of(existing));

        AppointmentDetailResponse detail = new AppointmentDetailResponse();
        detail.setAppointmentId(50L);
        detail.setStatus("CANCELLED");
        when(appointmentRepository.findDetailById(50L)).thenReturn(Optional.of(detail));

        AppointmentCancelRequest cancelRequest = new AppointmentCancelRequest();
        cancelRequest.setCancellationReason("Patient requested cancellation due to travel");

        AppointmentDetailResponse result = appointmentService.cancelAppointment(50L, cancelRequest);

        assertNotNull(result);
        assertEquals("CANCELLED", result.getStatus());
        verify(appointmentRepository).cancel(50L, "Patient requested cancellation due to travel");
    }
}
