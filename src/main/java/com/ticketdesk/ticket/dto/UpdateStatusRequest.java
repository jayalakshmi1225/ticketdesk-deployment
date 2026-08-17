package com.ticketdesk.ticket.dto;

import com.ticketdesk.ticket.Status;
import jakarta.validation.constraints.NotNull;

public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private Status status;

    public UpdateStatusRequest() {
    }

    public UpdateStatusRequest(Status status) {
        this.status = status;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Status status;

        public Builder status(Status status) {
            this.status = status;
            return this;
        }

        public UpdateStatusRequest build() {
            return new UpdateStatusRequest(status);
        }
    }
}
