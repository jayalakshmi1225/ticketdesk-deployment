package com.ticketdesk.attachment;

import com.ticketdesk.attachment.dto.AttachmentDto;
import com.ticketdesk.ticket.dto.UserSummaryNestedDto;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AttachmentMapper {

    public AttachmentDto toDto(Attachment attachment) {
        if (attachment == null) {
            return null;
        }

        UserSummaryNestedDto uploaderSummary = null;
        if (attachment.getUploadedBy() != null) {
            uploaderSummary = new UserSummaryNestedDto(
                    attachment.getUploadedBy().getId(),
                    attachment.getUploadedBy().getUsername()
            );
        }

        Long ticketId = attachment.getTicket() != null ? attachment.getTicket().getId() : null;

        return AttachmentDto.builder()
                .id(attachment.getId())
                .ticketId(ticketId)
                .originalFileName(attachment.getOriginalFileName())
                .storageKey(attachment.getStorageKey())
                .contentType(attachment.getContentType())
                .sizeBytes(attachment.getSizeBytes())
                .uploadedBy(uploaderSummary)
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }

    public List<AttachmentDto> toDtoList(List<Attachment> attachments) {
        if (attachments == null) {
            return Collections.emptyList();
        }
        return attachments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
