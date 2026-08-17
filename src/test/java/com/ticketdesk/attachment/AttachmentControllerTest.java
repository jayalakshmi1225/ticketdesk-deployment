package com.ticketdesk.attachment;

import com.ticketdesk.attachment.dto.AttachmentDto;
import com.ticketdesk.common.security.JwtService;
import com.ticketdesk.ticket.dto.UserSummaryNestedDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AttachmentController.class)
@AutoConfigureMockMvc(addFilters = false)
class AttachmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AttachmentService attachmentService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    @WithMockUser(username = "uploader_jane")
    void uploadAttachment_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "png data".getBytes());

        AttachmentDto responseDto = AttachmentDto.builder()
                .id(1L)
                .ticketId(100L)
                .originalFileName("test.png")
                .storageKey("tickets/100/test.png")
                .contentType("image/png")
                .sizeBytes(8L)
                .uploadedBy(new UserSummaryNestedDto(1L, "uploader_jane"))
                .uploadedAt(LocalDateTime.now())
                .build();

        when(attachmentService.uploadAttachment(eq(100L), any(), eq("uploader_jane"))).thenReturn(responseDto);

        mockMvc.perform(multipart("/api/tickets/100/attachments").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.originalFileName").value("test.png"));
    }

    @Test
    void getAttachmentsByTicketId_Success() throws Exception {
        AttachmentDto attachment = AttachmentDto.builder().id(1L).originalFileName("file.pdf").build();
        when(attachmentService.getAttachmentsByTicketId(100L)).thenReturn(List.of(attachment));

        mockMvc.perform(get("/api/tickets/100/attachments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].originalFileName").value("file.pdf"));
    }

    @Test
    void downloadAttachment_Success() throws Exception {
        Attachment attachmentEntity = Attachment.builder()
                .id(1L)
                .originalFileName("file.pdf")
                .contentType("application/pdf")
                .storageKey("tickets/100/file.pdf")
                .build();

        Resource resource = new ByteArrayResource("PDF content".getBytes());

        when(attachmentService.getAttachmentEntity(100L, 1L)).thenReturn(attachmentEntity);
        when(attachmentService.downloadAttachment(100L, 1L)).thenReturn(resource);

        mockMvc.perform(get("/api/tickets/100/attachments/1/download"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"file.pdf\""))
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    @WithMockUser(username = "uploader_jane")
    void deleteAttachment_Success() throws Exception {
        mockMvc.perform(delete("/api/tickets/100/attachments/1"))
                .andExpect(status().isNoContent());
    }
}
