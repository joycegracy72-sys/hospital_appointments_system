package com.hospital.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AppointmentCancelRequest {

    @NotBlank(message = "Cancellation reason is required")
    @Size(max = 255, message = "Cancellation reason cannot exceed 255 characters")
    private String cancellationReason;

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
}
