package com.ticketdesk.ticket;

import com.ticketdesk.auth.User;
import com.ticketdesk.ticket.dto.CreateTicketRequest;
import com.ticketdesk.ticket.dto.TicketDto;
import com.ticketdesk.ticket.dto.UserSummaryNestedDto;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TicketMapper {

    public Ticket toEntity(CreateTicketRequest request, User user) {
        if (request == null) {
            return null;
        }
        return Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(Status.OPEN)
                .createdBy(user)
                .build();
    }

    public TicketDto toDto(Ticket ticket) {
        if (ticket == null) {
            return null;
        }
        UserSummaryNestedDto userSummary = null;
        if (ticket.getCreatedBy() != null) {
            userSummary = new UserSummaryNestedDto(
                    ticket.getCreatedBy().getId(),
                    ticket.getCreatedBy().getUsername()
            );
        }

        return TicketDto.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdBy(userSummary)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    public List<TicketDto> toDtoList(List<Ticket> tickets) {
        if (tickets == null) {
            return Collections.emptyList();
        }
        return tickets.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
