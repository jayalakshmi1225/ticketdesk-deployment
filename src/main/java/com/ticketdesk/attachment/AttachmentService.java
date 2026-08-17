package com.ticketdesk.attachment;

import com.ticketdesk.attachment.dto.AttachmentDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttachmentService {
    AttachmentDto uploadAttachment(Long ticketId, MultipartFile file, String username);
    List<AttachmentDto> getAttachmentsByTicketId(Long ticketId);
    Resource downloadAttachment(Long ticketId, Long attachmentId);
    Attachment getAttachmentEntity(Long ticketId, Long attachmentId);
    void deleteAttachment(Long ticketId, Long attachmentId, String username, boolean isAdmin);
}
