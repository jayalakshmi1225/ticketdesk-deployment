package com.ticketdesk.dashboard;

import com.ticketdesk.common.security.JwtService;
import com.ticketdesk.dashboard.dto.DashboardSummaryDto;
import com.ticketdesk.ticket.Priority;
import com.ticketdesk.ticket.Status;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.EnumMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    @WithMockUser
    void getSummary_Success() throws Exception {
        Map<Status, Long> statusMap = new EnumMap<>(Status.class);
        statusMap.put(Status.OPEN, 5L);

        Map<Priority, Long> priorityMap = new EnumMap<>(Priority.class);
        priorityMap.put(Priority.HIGH, 3L);

        DashboardSummaryDto summary = DashboardSummaryDto.builder()
                .countsByStatus(statusMap)
                .countsByPriority(priorityMap)
                .totalTickets(8L)
                .openOlderThan48h(1L)
                .build();

        when(dashboardService.getSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTickets").value(8L))
                .andExpect(jsonPath("$.openOlderThan48h").value(1L))
                .andExpect(jsonPath("$.countsByStatus.OPEN").value(5L))
                .andExpect(jsonPath("$.countsByPriority.HIGH").value(3L));
    }
}
