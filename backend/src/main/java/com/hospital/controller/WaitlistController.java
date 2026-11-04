package com.hospital.controller;

import com.hospital.dto.request.WaitlistRequest;
import com.hospital.dto.response.ApiResponse;
import com.hospital.dto.response.AppointmentDetailResponse;
import com.hospital.dto.response.WaitlistResponse;
import com.hospital.service.WaitlistService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WaitlistResponse>>> getWaitlist(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<WaitlistResponse> list = waitlistService.getWaitlist(status, date);
        return ResponseEntity.ok(ApiResponse.ok("Waitlist entries retrieved successfully", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WaitlistResponse>> addToWaitlist(
            @Valid @RequestBody WaitlistRequest request) {
        WaitlistResponse created = waitlistService.addToWaitlist(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Added to waitlist successfully", created));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> acceptOffer(@PathVariable Long id) {
        AppointmentDetailResponse booked = waitlistService.acceptOffer(id);
        return ResponseEntity.ok(ApiResponse.ok("Waitlist offer accepted and appointment booked successfully", booked));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectOffer(@PathVariable Long id) {
        waitlistService.rejectOffer(id);
        return ResponseEntity.ok(ApiResponse.ok("Waitlist offer rejected. Slot passed to next candidate.", null));
    }
}
