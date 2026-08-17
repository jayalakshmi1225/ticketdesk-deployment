package com.ticketdesk.ticket;

import com.ticketdesk.auth.User;
import com.ticketdesk.auth.UserRepository;
import com.ticketdesk.common.exception.ResourceNotFoundException;
import com.ticketdesk.common.exception.ValidationException;
import com.ticketdesk.ticket.dto.CreateTicketRequest;
import com.ticketdesk.ticket.dto.TicketDto;
import com.ticketdesk.ticket.dto.UpdateStatusRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TicketServiceImpl implements TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketServiceImpl.class);

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketMapper ticketMapper;

    public TicketServiceImpl(TicketRepository ticketRepository, UserRepository userRepository, TicketMapper ticketMapper) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketMapper = ticketMapper;
    }

    @Override
    @Transactional
    public TicketDto create(CreateTicketRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> ResourceNotFoundException.forUser(username));

        Ticket ticket = ticketMapper.toEntity(request, user);
        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Created ticket ID: {} by user: {}", savedTicket.getId(), username);

        return ticketMapper.toDto(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketDto> findAll(Status status, Priority priority, Category category) {
        List<Ticket> tickets = ticketRepository.findByFilters(status, priority, category);
        return ticketMapper.toDtoList(tickets);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketDto findById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forTicket(id));
        return ticketMapper.toDto(ticket);
    }

    @Override
    @Transactional
    public TicketDto updateStatus(Long id, UpdateStatusRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forTicket(id));

        Status currentStatus = ticket.getStatus();
        Status newStatus = request.getStatus();

        validateStatusTransition(currentStatus, newStatus);

        ticket.setStatus(newStatus);
        Ticket updatedTicket = ticketRepository.save(ticket);
        log.info("Updated status for ticket ID: {} from {} to {}", id, currentStatus, newStatus);

        return ticketMapper.toDto(updatedTicket);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw ResourceNotFoundException.forTicket(id);
        }
        ticketRepository.deleteById(id);
        log.info("Deleted ticket ID: {}", id);
    }

    private void validateStatusTransition(Status current, Status next) {
        if (current == next) {
            return;
        }

        boolean isValid = false;

        switch (current) {
            case OPEN:
                isValid = (next == Status.IN_PROGRESS);
                break;
            case IN_PROGRESS:
                isValid = (next == Status.RESOLVED);
                break;
            case RESOLVED:
                isValid = (next == Status.CLOSED || next == Status.IN_PROGRESS);
                break;
            case CLOSED:
                isValid = false;
                break;
        }

        if (!isValid) {
            throw ValidationException.withMessage("Invalid status transition from " + current + " to " + next);
        }
    }
}
