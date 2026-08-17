package com.ticketdesk.comment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketdesk.comment.dto.CommentDto;
import com.ticketdesk.comment.dto.CreateCommentRequest;
import com.ticketdesk.common.security.JwtService;
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

@WebMvcTest(CommentController.class)
@AutoConfigureMockMvc(addFilters = false)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    @WithMockUser(username = "author_john")
    void createComment_Success() throws Exception {
        CreateCommentRequest request = new CreateCommentRequest("Checking on status.");
        CommentDto responseDto = CommentDto.builder()
                .id(1L)
                .ticketId(100L)
                .author(new UserSummaryNestedDto(1L, "author_john"))
                .body("Checking on status.")
                .createdAt(LocalDateTime.now())
                .build();

        when(commentService.createComment(eq(100L), any(CreateCommentRequest.class), eq("author_john"))).thenReturn(responseDto);

        mockMvc.perform(post("/api/tickets/100/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.body").value("Checking on status."))
                .andExpect(jsonPath("$.author.username").value("author_john"));
    }

    @Test
    void getCommentsByTicketId_Success() throws Exception {
        CommentDto comment1 = CommentDto.builder().id(1L).ticketId(100L).body("First comment").build();
        when(commentService.getCommentsByTicketId(100L)).thenReturn(List.of(comment1));

        mockMvc.perform(get("/api/tickets/100/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].body").value("First comment"));
    }

    @Test
    @WithMockUser(username = "author_john")
    void deleteComment_Success() throws Exception {
        mockMvc.perform(delete("/api/tickets/100/comments/1"))
                .andExpect(status().isNoContent());
    }
}
