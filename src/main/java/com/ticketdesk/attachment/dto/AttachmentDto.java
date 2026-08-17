package com.ticketdesk.attachment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ticketdesk.ticket.dto.UserSummaryNestedDto;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttachmentDto {
    private Long id;
    private Long ticketId;
    private String originalFileName;
    private String storageKey;
    private String contentType;
    private Long sizeBytes;
    private UserSummaryNestedDto uploadedBy;
    private LocalDateTime uploadedAt;

    public AttachmentDto() {
    }

    public AttachmentDto(Long id, Long ticketId, String originalFileName, String storageKey, String contentType, Long sizeBytes, UserSummaryNestedDto uploadedBy, LocalDateTime uploadedAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.originalFileName = originalFileName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public UserSummaryNestedDto getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(UserSummaryNestedDto uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long ticketId;
        private String originalFileName;
        private String storageKey;
        private String contentType;
        private Long sizeBytes;
        private UserSummaryNestedDto uploadedBy;
        private LocalDateTime uploadedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder ticketId(Long ticketId) {
            this.ticketId = ticketId;
            return this;
        }

        public Builder originalFileName(String originalFileName) {
            this.originalFileName = originalFileName;
            return this;
        }

        public Builder storageKey(String storageKey) {
            this.storageKey = storageKey;
            return this;
        }

        public Builder contentType(String contentType) {
            this.contentType = contentType;
            return this;
        }

        public Builder sizeBytes(Long sizeBytes) {
            this.sizeBytes = sizeBytes;
            return this;
        }

        public Builder uploadedBy(UserSummaryNestedDto uploadedBy) {
            this.uploadedBy = uploadedBy;
            return this;
        }

        public Builder uploadedAt(LocalDateTime uploadedAt) {
            this.uploadedAt = uploadedAt;
            return this;
        }

        public AttachmentDto build() {
            return new AttachmentDto(id, ticketId, originalFileName, storageKey, contentType, sizeBytes, uploadedBy, uploadedAt);
        }
    }
}
