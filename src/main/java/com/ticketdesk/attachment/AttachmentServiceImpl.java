package com.ticketdesk.attachment;

import com.ticketdesk.attachment.dto.AttachmentDto;
import com.ticketdesk.auth.User;
import com.ticketdesk.auth.UserRepository;
import com.ticketdesk.common.exception.ResourceNotFoundException;
import com.ticketdesk.common.exception.ValidationException;
import com.ticketdesk.ticket.Status;
import com.ticketdesk.ticket.Ticket;
import com.ticketdesk.ticket.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class AttachmentServiceImpl implements AttachmentService {

    private static final Logger log = LoggerFactory.getLogger(AttachmentServiceImpl.class);

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final AttachmentMapper attachmentMapper;

    public AttachmentServiceImpl(AttachmentRepository attachmentRepository, TicketRepository ticketRepository, UserRepository userRepository, StorageService storageService, AttachmentMapper attachmentMapper) {
        this.attachmentRepository = attachmentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.attachmentMapper = attachmentMapper;
    }

    @Override
    @Transactional
    public AttachmentDto uploadAttachment(Long ticketId, MultipartFile file, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> ResourceNotFoundException.forTicket(ticketId));

        if (ticket.getStatus() == Status.CLOSED) {
            throw ValidationException.withMessage("Cannot upload attachments to a closed ticket");
        }

        User uploader = userRepository.findByUsername(username)
                .orElseThrow(() -> ResourceNotFoundException.forUser(username));

        // Enforce exactly one active attachment per ticket - remove old attachment if present
        List<Attachment> existingAttachments = attachmentRepository.findByTicketId(ticketId);
        for (Attachment oldAttachment : existingAttachments) {
            log.info("Replacing existing attachment ID: {} for ticket ID: {}", oldAttachment.getId(), ticketId);
            storageService.delete(oldAttachment.getStorageKey());
            attachmentRepository.delete(oldAttachment);
        }
        attachmentRepository.flush();

        String storageKey = storageService.store(file, "tickets/" + ticketId);

        Attachment attachment = Attachment.builder()
                .ticket(ticket)
                .uploadedBy(uploader)
                .originalFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment")
                .storageKey(storageKey)
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .sizeBytes(file.getSize())
                .build();

        Attachment savedAttachment = attachmentRepository.save(attachment);
        log.info("Saved attachment ID: {} for ticket ID: {} by user: {}", savedAttachment.getId(), ticketId, username);

        return attachmentMapper.toDto(savedAttachment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentDto> getAttachmentsByTicketId(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw ResourceNotFoundException.forTicket(ticketId);
        }
        List<Attachment> attachments = attachmentRepository.findByTicketId(ticketId);
        return attachmentMapper.toDtoList(attachments);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadAttachment(Long ticketId, Long attachmentId) {
        Attachment attachment = getAttachmentEntity(ticketId, attachmentId);
        return storageService.load(attachment.getStorageKey());
    }

    @Override
    @Transactional(readOnly = true)
    public Attachment getAttachmentEntity(Long ticketId, Long attachmentId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw ResourceNotFoundException.forTicket(ticketId);
        }
        return attachmentRepository.findByTicketIdAndId(ticketId, attachmentId)
                .orElseThrow(() -> ResourceNotFoundException.forAttachment(attachmentId));
    }

    @Override
    @Transactional
    public void deleteAttachment(Long ticketId, Long attachmentId, String username, boolean isAdmin) {
        Attachment attachment = getAttachmentEntity(ticketId, attachmentId);

        boolean isUploader = attachment.getUploadedBy() != null && attachment.getUploadedBy().getUsername().equals(username);
        if (!isUploader && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this attachment");
        }

        storageService.delete(attachment.getStorageKey());
        attachmentRepository.delete(attachment);
        log.info("Deleted attachment ID: {} for ticket ID: {} by user: {}", attachmentId, ticketId, username);
    }
}
