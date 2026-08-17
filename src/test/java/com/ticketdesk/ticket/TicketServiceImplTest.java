package com.ticketdesk.ticket;

import com.ticketdesk.auth.User;
import com.ticketdesk.auth.UserRepository;
import com.ticketdesk.common.exception.ResourceNotFoundException;
import com.ticketdesk.common.exception.ValidationException;
import com.ticketdesk.ticket.dto.CreateTicketRequest;
import com.ticketdesk.ticket.dto.TicketDto;
import com.ticketdesk.ticket.dto.UpdateStatusRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    private TicketMapper ticketMapper = new TicketMapper();

    private TicketServiceImpl ticketService;

    private User sampleUser;
    private Ticket sampleTicket;

    @BeforeEach
    void setUp() {
        ticketService = new TicketServiceImpl(ticketRepository, userRepository, ticketMapper);

        sampleUser = User.builder()
                .id(10L)
                .username("jane_agent")
                .passwordHash("hashedpass")
                .build();

        sampleTicket = Ticket.builder()
                .id(1L)
                .title("Printer network error")
                .description("Cannot print from 2nd floor")
                .category(Category.HARDWARE)
                .priority(Priority.HIGH)
                .status(Status.OPEN)
                .createdBy(sampleUser)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void create_Success() {
        CreateTicketRequest request = CreateTicketRequest.builder()
                .title("Printer network error")
                .description("Cannot print from 2nd floor")
                .category(Category.HARDWARE)
                .priority(Priority.HIGH)
                .build();

        when(userRepository.findByUsername("jane_agent")).thenReturn(Optional.of(sampleUser));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(sampleTicket);

        TicketDto result = ticketService.create(request, "jane_agent");

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Printer network error", result.getTitle());
        assertEquals(Status.OPEN, result.getStatus());
        assertEquals("jane_agent", result.getCreatedBy().getUsername());
    }

    @Test
    void findById_Success() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));

        TicketDto result = ticketService.findById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Printer network error", result.getTitle());
    }

    @Test
    void findById_NotFound_ThrowsResourceNotFoundException() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> ticketService.findById(99L));
    }

    @Test
    void updateStatus_ValidTransitions_Success() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // OPEN -> IN_PROGRESS
        TicketDto step1 = ticketService.updateStatus(1L, new UpdateStatusRequest(Status.IN_PROGRESS));
        assertEquals(Status.IN_PROGRESS, step1.getStatus());

        // IN_PROGRESS -> RESOLVED
        TicketDto step2 = ticketService.updateStatus(1L, new UpdateStatusRequest(Status.RESOLVED));
        assertEquals(Status.RESOLVED, step2.getStatus());

        // RESOLVED -> CLOSED
        TicketDto step3 = ticketService.updateStatus(1L, new UpdateStatusRequest(Status.CLOSED));
        assertEquals(Status.CLOSED, step3.getStatus());
    }

    @Test
    void updateStatus_InvalidTransition_ThrowsValidationException() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));

        // OPEN -> CLOSED directly is invalid
        UpdateStatusRequest invalidRequest = new UpdateStatusRequest(Status.CLOSED);

        assertThrows(ValidationException.class, () -> ticketService.updateStatus(1L, invalidRequest));
    }

    @Test
    void delete_Success() {
        when(ticketRepository.existsById(1L)).thenReturn(true);

        ticketService.delete(1L);

        verify(ticketRepository, times(1)).deleteById(1L);
    }
}
