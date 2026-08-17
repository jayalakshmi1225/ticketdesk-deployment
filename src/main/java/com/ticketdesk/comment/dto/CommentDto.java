package com.ticketdesk.comment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ticketdesk.ticket.dto.UserSummaryNestedDto;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommentDto {
    private Long id;
    private Long ticketId;
    private UserSummaryNestedDto author;
    private String body;
    private LocalDateTime createdAt;

    public CommentDto() {
    }

    public CommentDto(Long id, Long ticketId, UserSummaryNestedDto author, String body, LocalDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.author = author;
        this.body = body;
        this.createdAt = createdAt;
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

    public UserSummaryNestedDto getAuthor() {
        return author;
    }

    public void setAuthor(UserSummaryNestedDto author) {
        this.author = author;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long ticketId;
        private UserSummaryNestedDto author;
        private String body;
        private LocalDateTime createdAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder ticketId(Long ticketId) {
            this.ticketId = ticketId;
            return this;
        }

        public Builder author(UserSummaryNestedDto author) {
            this.author = author;
            return this;
        }

        public Builder body(String body) {
            this.body = body;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public CommentDto build() {
            return new CommentDto(id, ticketId, author, body, createdAt);
        }
    }
}
