package com.ticketdesk.dashboard;

import com.ticketdesk.dashboard.dto.DashboardSummaryDto;
import com.ticketdesk.ticket.Priority;
import com.ticketdesk.ticket.Status;
import com.ticketdesk.ticket.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final TicketRepository ticketRepository;

    public DashboardServiceImpl(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary() {
        Map<Status, Long> countsByStatus = new EnumMap<>(Status.class);
        for (Status s : Status.values()) {
            countsByStatus.put(s, 0L);
        }

        List<Object[]> statusResults = ticketRepository.countTicketsByStatusGroup();
        for (Object[] row : statusResults) {
            if (row != null && row.length == 2 && row[0] instanceof Status) {
                Status status = (Status) row[0];
                Long count = (Long) row[1];
                countsByStatus.put(status, count);
            }
        }

        Map<Priority, Long> countsByPriority = new EnumMap<>(Priority.class);
        for (Priority p : Priority.values()) {
            countsByPriority.put(p, 0L);
        }

        List<Object[]> priorityResults = ticketRepository.countTicketsByPriorityGroup();
        for (Object[] row : priorityResults) {
            if (row != null && row.length == 2 && row[0] instanceof Priority) {
                Priority priority = (Priority) row[0];
                Long count = (Long) row[1];
                countsByPriority.put(priority, count);
            }
        }

        long totalTickets = ticketRepository.count();

        LocalDateTime cutoff = LocalDateTime.now().minusHours(48);
        long openOlderThan48h = ticketRepository.countByStatusAndCreatedAtBefore(Status.OPEN, cutoff);

        return DashboardSummaryDto.builder()
                .countsByStatus(countsByStatus)
                .countsByPriority(countsByPriority)
                .totalTickets(totalTickets)
                .openOlderThan48h(openOlderThan48h)
                .build();
    }
}
