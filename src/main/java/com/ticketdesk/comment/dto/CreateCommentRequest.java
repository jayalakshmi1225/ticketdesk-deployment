package com.ticketdesk.comment.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCommentRequest {

    @NotBlank(message = "Comment body is required")
    private String body;

    public CreateCommentRequest() {
    }

    public CreateCommentRequest(String body) {
        this.body = body;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String body;

        public Builder body(String body) {
            this.body = body;
            return this;
        }

        public CreateCommentRequest build() {
            return new CreateCommentRequest(body);
        }
    }
}
