package com.hospital.dto.request;

import jakarta.validation.constraints.NotNull;

public class WaitlistActionRequest {

    public enum Action {
        ACCEPT,
        REJECT
    }

    @NotNull(message = "Action is required (ACCEPT or REJECT)")
    private Action action;

    public WaitlistActionRequest() {}

    public WaitlistActionRequest(Action action) {
        this.action = action;
    }

    public Action getAction() { return action; }
    public void setAction(Action action) { this.action = action; }
}
