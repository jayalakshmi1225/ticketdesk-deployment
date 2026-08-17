package com.ticketdesk.common.exception;

import org.springframework.http.HttpStatus;

public class ValidationException extends TicketDeskException {

    public ValidationException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }

    public static ValidationException withMessage(String message) {
        return new ValidationException(message);
    }
}
