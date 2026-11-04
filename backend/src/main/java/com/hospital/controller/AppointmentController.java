package com.hospital.controller;

import com.hospital.dto.request.AppointmentCancelRequest;
import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.request.AppointmentRescheduleRequest;
import com.hospital.dto.response.ApiResponse;
import com.hospital.dto.response.AppointmentDetailResponse;
import com.hospital.dto.response.ConflictReportResponse;
import com.hospital.dto.response.QueueItemResponse;
import com.hospital.dto.response.SlotRecommendationResponse;
import com.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentDetailResponse>>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String status) {
        List<AppointmentDetailResponse> list = appointmentService.getAppointments(date, doctorId, patientId, status);
        return ResponseEntity.ok(ApiResponse.ok("Appointments retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> getAppointmentById(@PathVariable Long id) {
        AppointmentDetailResponse detail = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> bookAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentDetailResponse booked = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Appointment booked successfully", booked));
    }

    @GetMapping("/recommend")
    public ResponseEntity<ApiResponse<SlotRecommendationResponse>> recommendSlot(
            @RequestParam Long doctorId,
            @RequestParam Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime preferredStartTime) {
        SlotRecommendationResponse recommendation =
                appointmentService.recommendSlot(doctorId, patientId, date, preferredStartTime);
        return ResponseEntity.ok(ApiResponse.ok("Deterministic slot recommendation generated", recommendation));
    }

    @GetMapping("/recommend/workload")
    public ResponseEntity<ApiResponse<SlotRecommendationResponse>> recommendWorkloadBalancedSlot(
            @RequestParam String specialization,
            @RequestParam Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime preferredStartTime) {
        SlotRecommendationResponse recommendation =
                appointmentService.recommendWorkloadBalancedSlot(specialization, patientId, date, preferredStartTime);
        return ResponseEntity.ok(ApiResponse.ok("Workload-balanced slot recommendation generated", recommendation));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRescheduleRequest request) {
        AppointmentDetailResponse rescheduled = appointmentService.rescheduleAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Appointment rescheduled successfully", rescheduled));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> cancelAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentCancelRequest request) {
        AppointmentDetailResponse cancelled = appointmentService.cancelAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Appointment cancelled successfully", cancelled));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        AppointmentDetailResponse updated = appointmentService.updateStatus(id, status, notes);
        return ResponseEntity.ok(ApiResponse.ok("Appointment status updated successfully", updated));
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> checkInAppointment(@PathVariable Long id) {
        AppointmentDetailResponse checkedIn = appointmentService.checkInAppointment(id);
        return ResponseEntity.ok(ApiResponse.ok("Patient checked in successfully", checkedIn));
    }

    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<List<QueueItemResponse>>> getLiveQueue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<QueueItemResponse> queue = appointmentService.getLiveQueue(targetDate, doctorId);
        return ResponseEntity.ok(ApiResponse.ok("Live patient queue retrieved", queue));
    }

    @GetMapping("/conflicts")
    public ResponseEntity<ApiResponse<ConflictReportResponse>> detectScheduleConflicts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate) {
        LocalDate targetDate = fromDate != null ? fromDate : LocalDate.now();
        ConflictReportResponse report = appointmentService.detectScheduleConflicts(targetDate);
        return ResponseEntity.ok(ApiResponse.ok("Schedule conflict scan complete", report));
    }
}
