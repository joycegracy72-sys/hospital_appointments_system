package com.hospital.service;

import com.hospital.dto.request.PatientRequest;
import com.hospital.exception.BusinessConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Patient;
import com.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Patient> getAllPatients(String search, Boolean activeOnly) {
        return patientRepository.findAll(search, activeOnly);
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
    }

    @Transactional
    public Patient registerPatient(PatientRequest request) {
        patientRepository.findByEmail(request.getEmail().trim()).ifPresent(p -> {
            throw new BusinessConflictException("A patient with email " + request.getEmail() + " already exists");
        });

        Patient patient = new Patient();
        patient.setFirstName(request.getFirstName().trim());
        patient.setLastName(request.getLastName().trim());
        patient.setEmail(request.getEmail().trim().toLowerCase());
        patient.setPhone(request.getPhone().trim());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender().trim().toUpperCase());
        patient.setBloodGroup(request.getBloodGroup() != null ? request.getBloodGroup().trim() : null);
        patient.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        patient.setActive(true);

        Long newId = patientRepository.save(patient);
        return getPatientById(newId);
    }

    @Transactional
    public Patient updatePatient(Long id, PatientRequest request) {
        Patient existing = getPatientById(id);

        // Check if email changed and if new email belongs to someone else
        String newEmail = request.getEmail().trim().toLowerCase();
        if (!existing.getEmail().equalsIgnoreCase(newEmail)) {
            patientRepository.findByEmail(newEmail).ifPresent(p -> {
                if (!p.getPatientId().equals(id)) {
                    throw new BusinessConflictException("Email " + newEmail + " is already in use by another patient");
                }
            });
        }

        existing.setFirstName(request.getFirstName().trim());
        existing.setLastName(request.getLastName().trim());
        existing.setEmail(newEmail);
        existing.setPhone(request.getPhone().trim());
        existing.setDateOfBirth(request.getDateOfBirth());
        existing.setGender(request.getGender().trim().toUpperCase());
        existing.setBloodGroup(request.getBloodGroup() != null ? request.getBloodGroup().trim() : null);
        existing.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);

        patientRepository.update(id, existing);
        return getPatientById(id);
    }

    @Transactional
    public void deactivatePatient(Long id) {
        getPatientById(id); // Ensure exists
        patientRepository.deactivate(id);
    }
}
