package com.ticketdesk.comment;

import com.ticketdesk.comment.dto.CommentDto;
import com.ticketdesk.comment.dto.CreateCommentRequest;

import java.util.List;

public interface CommentService {
    CommentDto createComment(Long ticketId, CreateCommentRequest request, String username);
    List<CommentDto> getCommentsByTicketId(Long ticketId);
    void deleteComment(Long ticketId, Long commentId, String username, boolean isAdmin);
}
