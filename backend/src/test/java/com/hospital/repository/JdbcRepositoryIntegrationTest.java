package com.hospital.repository;

import com.hospital.dto.response.AppointmentDetailResponse;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.DoctorAvailability;
import com.hospital.model.Patient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class JdbcRepositoryIntegrationTest {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Test
    @DisplayName("Verify end-to-end JDBC persistence with JdbcTemplate and JOIN queries")
    void testEndToEndJdbcFlow() {
        // 1. Insert Patient
        Patient patient = new Patient();
        patient.setFirstName("Arun");
        patient.setLastName("Kumar");
        patient.setEmail("arun.test@example.com");
        patient.setPhone("9876543210");
        patient.setDateOfBirth(LocalDate.of(2001, 5, 15));
        patient.setGender("MALE");
        patient.setBloodGroup("O+");
        patient.setAddress("Chennai");
        patient.setActive(true);

        Long patientId = patientRepository.save(patient);
        assertNotNull(patientId, "Patient ID should be generated via JDBC GeneratedKeyHolder");

        Optional<Patient> retrievedPatient = patientRepository.findById(patientId);
        assertTrue(retrievedPatient.isPresent());
        assertEquals("Arun", retrievedPatient.get().getFirstName());
        assertEquals("Kumar", retrievedPatient.get().getLastName());

        // 2. Insert Doctor
        Doctor doctor = new Doctor();
        doctor.setFirstName("Meena");
        doctor.setLastName("Raj");
        doctor.setSpecialization("Cardiology");
        doctor.setEmail("meena.test@example.com");
        doctor.setPhone("9876500001");
        doctor.setConsultationFee(BigDecimal.valueOf(500.00));
        doctor.setActive(true);

        Long doctorId = doctorRepository.save(doctor);
        assertNotNull(doctorId, "Doctor ID should be generated via JDBC");

        // 3. Insert Doctor Availability
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctorId(doctorId);
        availability.setAvailableDate(tomorrow);
        availability.setStartTime(LocalTime.of(9, 0));
        availability.setEndTime(LocalTime.of(12, 0));

        Long availabilityId = availabilityRepository.save(availability);
        assertNotNull(availabilityId);

        assertTrue(availabilityRepository.isDoctorAvailable(
                doctorId, tomorrow, LocalTime.of(9, 30), LocalTime.of(10, 0)
        ));
        assertFalse(availabilityRepository.isDoctorAvailable(
                doctorId, tomorrow, LocalTime.of(8, 30), LocalTime.of(9, 0)
        ));

        // 4. Insert Appointment
        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(doctorId);
        appointment.setAppointmentDate(tomorrow);
        appointment.setStartTime(LocalTime.of(9, 30));
        appointment.setEndTime(LocalTime.of(10, 0));
        appointment.setStatus("SCHEDULED");
        appointment.setReasonForVisit("General consultation");

        Long appointmentId = appointmentRepository.save(appointment);
        assertNotNull(appointmentId);

        // 5. Test Overlap Detection Query
        boolean hasOverlap = appointmentRepository.hasOverlap(
                doctorId, tomorrow, LocalTime.of(9, 45), LocalTime.of(10, 15), null
        );
        assertTrue(hasOverlap, "Overlap should be detected for 09:45-10:15 against existing 09:30-10:00");

        boolean noOverlap = appointmentRepository.hasOverlap(
                doctorId, tomorrow, LocalTime.of(10, 0), LocalTime.of(10, 30), null
        );
        assertFalse(noOverlap, "No overlap should occur for adjacent slot 10:00-10:30");

        // 6. Test Joined Query (matching user's SQL verification)
        Optional<AppointmentDetailResponse> joinedDetail = appointmentRepository.findDetailById(appointmentId);
        assertTrue(joinedDetail.isPresent());
        assertEquals("Arun Kumar", joinedDetail.get().getPatientName());
        assertEquals("Meena Raj", joinedDetail.get().getDoctorName());
        assertEquals("Cardiology", joinedDetail.get().getDoctorSpecialization());

        List<AppointmentDetailResponse> allJoined = appointmentRepository.findAllDetails(tomorrow, doctorId, null, null);
        assertFalse(allJoined.isEmpty());

        // 7. Test Soft Deactivation of Patient
        patientRepository.deactivate(patientId);
        Optional<Patient> deactivatedPatient = patientRepository.findById(patientId);
        assertTrue(deactivatedPatient.isPresent());
        assertFalse(deactivatedPatient.get().isActive(), "Patient should be marked inactive");

        // Appointment remains intact even after patient is deactivated
        Optional<AppointmentDetailResponse> apptAfterDeactivation = appointmentRepository.findDetailById(appointmentId);
        assertTrue(apptAfterDeactivation.isPresent(), "Appointment history must be preserved after patient deactivation");
    }
}
