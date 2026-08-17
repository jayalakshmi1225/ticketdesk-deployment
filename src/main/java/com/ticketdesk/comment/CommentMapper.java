package com.ticketdesk.comment;

import com.ticketdesk.auth.User;
import com.ticketdesk.comment.dto.CommentDto;
import com.ticketdesk.comment.dto.CreateCommentRequest;
import com.ticketdesk.ticket.Ticket;
import com.ticketdesk.ticket.dto.UserSummaryNestedDto;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CommentMapper {

    public Comment toEntity(CreateCommentRequest request, Ticket ticket, User author) {
        if (request == null) {
            return null;
        }
        return Comment.builder()
                .ticket(ticket)
                .author(author)
                .body(request.getBody())
                .build();
    }

    public CommentDto toDto(Comment comment) {
        if (comment == null) {
            return null;
        }

        UserSummaryNestedDto authorSummary = null;
        if (comment.getAuthor() != null) {
            authorSummary = new UserSummaryNestedDto(
                    comment.getAuthor().getId(),
                    comment.getAuthor().getUsername()
            );
        }

        Long ticketId = comment.getTicket() != null ? comment.getTicket().getId() : null;

        return CommentDto.builder()
                .id(comment.getId())
                .ticketId(ticketId)
                .author(authorSummary)
                .body(comment.getBody())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public List<CommentDto> toDtoList(List<Comment> comments) {
        if (comments == null) {
            return Collections.emptyList();
        }
        return comments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
