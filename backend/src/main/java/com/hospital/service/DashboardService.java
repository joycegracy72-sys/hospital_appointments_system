package com.hospital.service;

import com.hospital.dto.response.DashboardStatsResponse;
import com.hospital.model.Appointment;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DashboardService(PatientRepository patientRepository,
                            DoctorRepository doctorRepository,
                            AppointmentRepository appointmentRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public DashboardStatsResponse getStats() {
        LocalDate today = LocalDate.now();

        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalPatients(patientRepository.countActive());
        stats.setTotalDoctors(doctorRepository.countActive());
        stats.setTotalAppointments(appointmentRepository.countTotal());
        stats.setUpcomingAppointmentsCount(appointmentRepository.countUpcoming(today));
        stats.setCompletedAppointmentsCount(appointmentRepository.countByStatus(Appointment.Status.COMPLETED.name()));
        stats.setCancelledAppointmentsCount(appointmentRepository.countByStatus(Appointment.Status.CANCELLED.name()));
        stats.setTodayAppointmentsCount(appointmentRepository.countToday(today));
        stats.setUpcomingAppointments(appointmentRepository.findUpcomingLimit(today, 6));

        return stats;
    }
}
