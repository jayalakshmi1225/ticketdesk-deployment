package com.ticketdesk.comment;

import com.ticketdesk.auth.User;
import com.ticketdesk.auth.UserRepository;
import com.ticketdesk.comment.dto.CommentDto;
import com.ticketdesk.comment.dto.CreateCommentRequest;
import com.ticketdesk.common.exception.ResourceNotFoundException;
import com.ticketdesk.common.exception.ValidationException;
import com.ticketdesk.ticket.Status;
import com.ticketdesk.ticket.Ticket;
import com.ticketdesk.ticket.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceImplTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    private CommentMapper commentMapper = new CommentMapper();

    private CommentServiceImpl commentService;

    private User authorUser;
    private User otherUser;
    private Ticket openTicket;
    private Ticket closedTicket;
    private Comment sampleComment;

    @BeforeEach
    void setUp() {
        commentService = new CommentServiceImpl(commentRepository, ticketRepository, userRepository, commentMapper);

        authorUser = User.builder().id(1L).username("author_john").passwordHash("pass").build();
        otherUser = User.builder().id(2L).username("other_user").passwordHash("pass").build();

        openTicket = Ticket.builder().id(100L).title("Open Ticket").status(Status.OPEN).build();
        closedTicket = Ticket.builder().id(101L).title("Closed Ticket").status(Status.CLOSED).build();

        sampleComment = Comment.builder()
                .id(50L)
                .ticket(openTicket)
                .author(authorUser)
                .body("Investigating issue now.")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createComment_Success() {
        CreateCommentRequest request = new CreateCommentRequest("Investigating issue now.");

        when(ticketRepository.findById(100L)).thenReturn(Optional.of(openTicket));
        when(userRepository.findByUsername("author_john")).thenReturn(Optional.of(authorUser));
        when(commentRepository.save(any(Comment.class))).thenReturn(sampleComment);

        CommentDto result = commentService.createComment(100L, request, "author_john");

        assertNotNull(result);
        assertEquals(50L, result.getId());
        assertEquals("Investigating issue now.", result.getBody());
        assertEquals("author_john", result.getAuthor().getUsername());
    }

    @Test
    void createComment_ClosedTicket_ThrowsValidationException() {
        CreateCommentRequest request = new CreateCommentRequest("Trying to comment");

        when(ticketRepository.findById(101L)).thenReturn(Optional.of(closedTicket));

        assertThrows(ValidationException.class, () -> commentService.createComment(101L, request, "author_john"));
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    void getCommentsByTicketId_Success() {
        when(ticketRepository.existsById(100L)).thenReturn(true);
        when(commentRepository.findByTicketIdOrderByCreatedAtAsc(100L)).thenReturn(List.of(sampleComment));

        List<CommentDto> results = commentService.getCommentsByTicketId(100L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Investigating issue now.", results.get(0).getBody());
    }

    @Test
    void deleteComment_ByAuthor_Success() {
        when(ticketRepository.existsById(100L)).thenReturn(true);
        when(commentRepository.findById(50L)).thenReturn(Optional.of(sampleComment));

        commentService.deleteComment(100L, 50L, "author_john", false);

        verify(commentRepository, times(1)).delete(sampleComment);
    }

    @Test
    void deleteComment_ByAdmin_Success() {
        when(ticketRepository.existsById(100L)).thenReturn(true);
        when(commentRepository.findById(50L)).thenReturn(Optional.of(sampleComment));

        commentService.deleteComment(100L, 50L, "admin_user", true);

        verify(commentRepository, times(1)).delete(sampleComment);
    }

    @Test
    void deleteComment_UnauthorizedUser_ThrowsAccessDeniedException() {
        when(ticketRepository.existsById(100L)).thenReturn(true);
        when(commentRepository.findById(50L)).thenReturn(Optional.of(sampleComment));

        assertThrows(AccessDeniedException.class, () -> commentService.deleteComment(100L, 50L, "other_user", false));
        verify(commentRepository, never()).delete(any());
    }
}
