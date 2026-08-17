package com.ticketdesk.comment;

import com.ticketdesk.comment.dto.CommentDto;
import com.ticketdesk.comment.dto.CreateCommentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@Tag(name = "Comments", description = "Threaded discussion notes on tickets endpoints")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    @Operation(summary = "Add a comment to a ticket", description = "Adds a threaded note. Cannot comment on CLOSED tickets. Author is derived from SecurityContext.")
    public ResponseEntity<CommentDto> createComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        CommentDto createdComment = commentService.createComment(ticketId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    @GetMapping
    @Operation(summary = "List comments for a ticket", description = "Retrieves all comments for the specified ticket ordered by creation time ascending.")
    public ResponseEntity<List<CommentDto>> getCommentsByTicketId(@PathVariable Long ticketId) {
        List<CommentDto> comments = commentService.getCommentsByTicketId(ticketId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Delete a comment", description = "Deletes a comment. Allowed only for the comment's author or users with ADMIN role.")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        commentService.deleteComment(ticketId, commentId, userDetails.getUsername(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
