package com.ticketdesk.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends TicketDeskException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(HttpStatus.NOT_FOUND, String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }

    public static ResourceNotFoundException forResource(String resourceName, String fieldName, Object fieldValue) {
        return new ResourceNotFoundException(resourceName, fieldName, fieldValue);
    }

    public static ResourceNotFoundException forTicket(Object id) {
        return new ResourceNotFoundException("Ticket", "id", id);
    }

    public static ResourceNotFoundException forUser(String username) {
        return new ResourceNotFoundException("User", "username", username);
    }

    public static ResourceNotFoundException forComment(Object id) {
        return new ResourceNotFoundException("Comment", "id", id);
    }

    public static ResourceNotFoundException forAttachment(Object id) {
        return new ResourceNotFoundException("Attachment", "id", id);
    }
}
