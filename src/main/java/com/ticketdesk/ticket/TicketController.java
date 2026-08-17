package com.ticketdesk.ticket;

import com.ticketdesk.ticket.dto.CreateTicketRequest;
import com.ticketdesk.ticket.dto.TicketDto;
import com.ticketdesk.ticket.dto.UpdateStatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@Tag(name = "Tickets", description = "Ticket creation, listing, filtering, status transitions, and deletion endpoints")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @Operation(summary = "Create a new ticket", description = "Creates a ticket. The creator user is extracted automatically from the SecurityContext.")
    public ResponseEntity<TicketDto> create(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        TicketDto createdTicket = ticketService.create(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);
    }

    @GetMapping
    @Operation(summary = "List and filter tickets", description = "Retrieves tickets filtered by optional status, priority, and category query parameters.")
    public ResponseEntity<List<TicketDto>> findAll(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Category category
    ) {
        List<TicketDto> tickets = ticketService.findAll(status, priority, category);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket details by ID", description = "Retrieves ticket by its unique identifier.")
    public ResponseEntity<TicketDto> findById(@PathVariable Long id) {
        TicketDto ticket = ticketService.findById(id);
        return ResponseEntity.ok(ticket);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    @Operation(summary = "Update ticket status", description = "Updates ticket status. Allowed only for AGENT or ADMIN roles. Enforces transition rules.")
    public ResponseEntity<TicketDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        TicketDto updatedTicket = ticketService.updateStatus(id, request);
        return ResponseEntity.ok(updatedTicket);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete ticket", description = "Deletes ticket by ID. Allowed only for ADMIN role.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ticketService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
