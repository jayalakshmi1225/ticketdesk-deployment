package com.ticketdesk.attachment;

import com.ticketdesk.attachment.dto.AttachmentDto;
import com.ticketdesk.auth.User;
import com.ticketdesk.auth.UserRepository;
import com.ticketdesk.common.exception.ValidationException;
import com.ticketdesk.ticket.Status;
import com.ticketdesk.ticket.Ticket;
import com.ticketdesk.ticket.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttachmentServiceImplTest {

    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StorageService storageService;

    private AttachmentMapper attachmentMapper = new AttachmentMapper();

    private AttachmentServiceImpl attachmentService;

    private User uploaderUser;
    private User otherUser;
    private Ticket openTicket;
    private Ticket closedTicket;
    private Attachment oldAttachment;
    private Attachment newAttachment;

    @BeforeEach
    void setUp() {
        attachmentService = new AttachmentServiceImpl(
                attachmentRepository, ticketRepository, userRepository, storageService, attachmentMapper
        );

        uploaderUser = User.builder().id(1L).username("uploader_jane").passwordHash("pass").build();
        otherUser = User.builder().id(2L).username("other_user").passwordHash("pass").build();

        openTicket = Ticket.builder().id(100L).title("Open Ticket").status(Status.OPEN).build();
        closedTicket = Ticket.builder().id(101L).title("Closed Ticket").status(Status.CLOSED).build();

        oldAttachment = Attachment.builder()
                .id(10L)
                .ticket(openTicket)
                .uploadedBy(uploaderUser)
                .originalFileName("old.png")
                .storageKey("tickets/100/old.png")
                .contentType("image/png")
                .sizeBytes(1024L)
                .uploadedAt(LocalDateTime.now())
                .build();

        newAttachment = Attachment.builder()
                .id(11L)
                .ticket(openTicket)
                .uploadedBy(uploaderUser)
                .originalFileName("new.png")
                .storageKey("tickets/100/new.png")
                .contentType("image/png")
                .sizeBytes(2048L)
                .uploadedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void uploadAttachment_ReplacesOldAttachment_Success() {
        MockMultipartFile file = new MockMultipartFile("file", "new.png", "image/png", "data".getBytes());

        when(ticketRepository.findById(100L)).thenReturn(Optional.of(openTicket));
        when(userRepository.findByUsername("uploader_jane")).thenReturn(Optional.of(uploaderUser));

        List<Attachment> existing = new ArrayList<>();
        existing.add(oldAttachment);
        when(attachmentRepository.findByTicketId(100L)).thenReturn(existing);

        when(storageService.store(eq(file), eq("tickets/100"))).thenReturn("tickets/100/new.png");
        when(attachmentRepository.save(any(Attachment.class))).thenReturn(newAttachment);

        AttachmentDto result = attachmentService.uploadAttachment(100L, file, "uploader_jane");

        assertNotNull(result);
        assertEquals(11L, result.getId());
        assertEquals("new.png", result.getOriginalFileName());

        // Verify old attachment was deleted first
        verify(storageService, times(1)).delete("tickets/100/old.png");
        verify(attachmentRepository, times(1)).delete(oldAttachment);
    }

    @Test
    void uploadAttachment_ClosedTicket_ThrowsValidationException() {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "data".getBytes());

        when(ticketRepository.findById(101L)).thenReturn(Optional.of(closedTicket));

        assertThrows(ValidationException.class, () -> attachmentService.uploadAttachment(101L, file, "uploader_jane"));
        verify(storageService, never()).store(any(), any());
    }

    @Test
    void deleteAttachment_UnauthorizedUser_ThrowsAccessDeniedException() {
        when(ticketRepository.existsById(100L)).thenReturn(true);
        when(attachmentRepository.findByTicketIdAndId(100L, 10L)).thenReturn(Optional.of(oldAttachment));

        assertThrows(AccessDeniedException.class, () -> attachmentService.deleteAttachment(100L, 10L, "other_user", false));
        verify(storageService, never()).delete(any());
    }
}
