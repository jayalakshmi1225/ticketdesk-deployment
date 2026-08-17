package com.ticketdesk.ticket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketdesk.common.security.JwtService;
import com.ticketdesk.ticket.dto.CreateTicketRequest;
import com.ticketdesk.ticket.dto.TicketDto;
import com.ticketdesk.ticket.dto.UpdateStatusRequest;
import com.ticketdesk.ticket.dto.UserSummaryNestedDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TicketController.class)
@AutoConfigureMockMvc(addFilters = false)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TicketService ticketService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    @WithMockUser(username = "john_doe")
    void create_Success() throws Exception {
        CreateTicketRequest request = CreateTicketRequest.builder()
                .title("Cannot access VPN")
                .description("VPN client fails to connect")
                .category(Category.NETWORK)
                .priority(Priority.HIGH)
                .build();

        TicketDto responseDto = TicketDto.builder()
                .id(1L)
                .title("Cannot access VPN")
                .description("VPN client fails to connect")
                .category(Category.NETWORK)
                .priority(Priority.HIGH)
                .status(Status.OPEN)
                .createdBy(new UserSummaryNestedDto(1L, "john_doe"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(ticketService.create(any(CreateTicketRequest.class), eq("john_doe"))).thenReturn(responseDto);

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Cannot access VPN"))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void findAll_Success() throws Exception {
        TicketDto ticket1 = TicketDto.builder().id(1L).title("Issue 1").status(Status.OPEN).build();
        when(ticketService.findAll(null, null, null)).thenReturn(List.of(ticket1));

        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Issue 1"));
    }

    @Test
    void findById_Success() throws Exception {
        TicketDto ticket = TicketDto.builder().id(1L).title("Issue 1").status(Status.OPEN).build();
        when(ticketService.findById(1L)).thenReturn(ticket);

        mockMvc.perform(get("/api/tickets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Issue 1"));
    }

    @Test
    @WithMockUser(roles = "AGENT")
    void updateStatus_Success() throws Exception {
        UpdateStatusRequest request = new UpdateStatusRequest(Status.IN_PROGRESS);
        TicketDto ticket = TicketDto.builder().id(1L).title("Issue 1").status(Status.IN_PROGRESS).build();

        when(ticketService.updateStatus(eq(1L), any(UpdateStatusRequest.class))).thenReturn(ticket);

        mockMvc.perform(patch("/api/tickets/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void delete_Success() throws Exception {
        mockMvc.perform(delete("/api/tickets/1"))
                .andExpect(status().isNoContent());
    }
}
