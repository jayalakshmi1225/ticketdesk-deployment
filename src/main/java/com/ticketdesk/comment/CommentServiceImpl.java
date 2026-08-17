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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    private static final Logger log = LoggerFactory.getLogger(CommentServiceImpl.class);

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    public CommentServiceImpl(CommentRepository commentRepository, TicketRepository ticketRepository, UserRepository userRepository, CommentMapper commentMapper) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.commentMapper = commentMapper;
    }

    @Override
    @Transactional
    public CommentDto createComment(Long ticketId, CreateCommentRequest request, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> ResourceNotFoundException.forTicket(ticketId));

        if (ticket.getStatus() == Status.CLOSED) {
            throw ValidationException.withMessage("Cannot add comments to a closed ticket");
        }

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> ResourceNotFoundException.forUser(username));

        Comment comment = commentMapper.toEntity(request, ticket, author);
        Comment savedComment = commentRepository.save(comment);
        log.info("Created comment ID: {} on ticket ID: {} by author: {}", savedComment.getId(), ticketId, username);

        return commentMapper.toDto(savedComment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentDto> getCommentsByTicketId(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw ResourceNotFoundException.forTicket(ticketId);
        }
        List<Comment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return commentMapper.toDtoList(comments);
    }

    @Override
    @Transactional
    public void deleteComment(Long ticketId, Long commentId, String username, boolean isAdmin) {
        if (!ticketRepository.existsById(ticketId)) {
            throw ResourceNotFoundException.forTicket(ticketId);
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ResourceNotFoundException.forComment(commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw ResourceNotFoundException.forComment(commentId);
        }

        boolean isAuthor = comment.getAuthor() != null && comment.getAuthor().getUsername().equals(username);
        if (!isAuthor && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this comment");
        }

        commentRepository.delete(comment);
        log.info("Deleted comment ID: {} from ticket ID: {} by user: {}", commentId, ticketId, username);
    }
}
