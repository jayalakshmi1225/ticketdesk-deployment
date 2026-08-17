package com.ticketdesk.attachment;

import com.ticketdesk.attachment.dto.AttachmentDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
@Tag(name = "Attachments", description = "Ticket file attachments and direct download endpoints")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload an attachment to a ticket", description = "Uploads a file (max 5MB, PNG/JPG/PDF). Replaces any existing attachment for this ticket.")
    public ResponseEntity<AttachmentDto> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AttachmentDto dto = attachmentService.uploadAttachment(ticketId, file, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    @Operation(summary = "List attachments for a ticket", description = "Retrieves all attachment records for the specified ticket.")
    public ResponseEntity<List<AttachmentDto>> getAttachmentsByTicketId(@PathVariable Long ticketId) {
        List<AttachmentDto> attachments = attachmentService.getAttachmentsByTicketId(ticketId);
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/{attachmentId}/download")
    @Operation(summary = "Download ticket attachment", description = "Downloads the attachment file as binary stream.")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId
    ) {
        Attachment attachment = attachmentService.getAttachmentEntity(ticketId, attachmentId);
        Resource resource = attachmentService.downloadAttachment(ticketId, attachmentId);

        String contentType = attachment.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{attachmentId}")
    @Operation(summary = "Delete attachment", description = "Deletes an attachment file and metadata. Allowed only for uploader or ADMIN.")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        attachmentService.deleteAttachment(ticketId, attachmentId, userDetails.getUsername(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
