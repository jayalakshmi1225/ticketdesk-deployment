package com.ticketdesk.dashboard;

import com.ticketdesk.dashboard.dto.DashboardSummaryDto;
import com.ticketdesk.ticket.Priority;
import com.ticketdesk.ticket.Status;
import com.ticketdesk.ticket.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    private DashboardServiceImpl dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardServiceImpl(ticketRepository);
    }

    @Test
    void getSummary_Success() {
        List<Object[]> statusResults = new ArrayList<>();
        statusResults.add(new Object[]{Status.OPEN, 5L});
        statusResults.add(new Object[]{Status.IN_PROGRESS, 3L});

        List<Object[]> priorityResults = new ArrayList<>();
        priorityResults.add(new Object[]{Priority.HIGH, 4L});
        priorityResults.add(new Object[]{Priority.CRITICAL, 2L});

        when(ticketRepository.countTicketsByStatusGroup()).thenReturn(statusResults);
        when(ticketRepository.countTicketsByPriorityGroup()).thenReturn(priorityResults);
        when(ticketRepository.count()).thenReturn(8L);
        when(ticketRepository.countByStatusAndCreatedAtBefore(eq(Status.OPEN), any(LocalDateTime.class))).thenReturn(2L);

        DashboardSummaryDto result = dashboardService.getSummary();

        assertNotNull(result);
        assertEquals(8L, result.getTotalTickets());
        assertEquals(2L, result.getOpenOlderThan48h());

        assertEquals(5L, result.getCountsByStatus().get(Status.OPEN));
        assertEquals(3L, result.getCountsByStatus().get(Status.IN_PROGRESS));
        assertEquals(0L, result.getCountsByStatus().get(Status.CLOSED));

        assertEquals(4L, result.getCountsByPriority().get(Priority.HIGH));
        assertEquals(2L, result.getCountsByPriority().get(Priority.CRITICAL));
        assertEquals(0L, result.getCountsByPriority().get(Priority.LOW));
    }
}
