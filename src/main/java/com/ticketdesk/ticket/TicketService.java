package com.ticketdesk.ticket;

import com.ticketdesk.ticket.dto.CreateTicketRequest;
import com.ticketdesk.ticket.dto.TicketDto;
import com.ticketdesk.ticket.dto.UpdateStatusRequest;

import java.util.List;

public interface TicketService {
    TicketDto create(CreateTicketRequest request, String username);
    List<TicketDto> findAll(Status status, Priority priority, Category category);
    TicketDto findById(Long id);
    TicketDto updateStatus(Long id, UpdateStatusRequest request);
    void delete(Long id);
}
