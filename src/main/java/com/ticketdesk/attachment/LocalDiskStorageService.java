package com.ticketdesk.attachment;

import com.ticketdesk.common.exception.ResourceNotFoundException;
import com.ticketdesk.common.exception.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class LocalDiskStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalDiskStorageService.class);

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "application/pdf"
    );
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "png", "jpg", "jpeg", "pdf"
    );

    private final Path rootLocation;

    public LocalDiskStorageService(@Value("${attachment.storage.path:${ATTACHMENT_STORAGE_PATH:./uploads}}") String storagePath) {
        this.rootLocation = Paths.get(storagePath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage directory at {}", this.rootLocation, e);
        }
    }

    @Override
    public String store(MultipartFile file, String keyPrefix) {
        if (file == null || file.isEmpty()) {
            throw ValidationException.withMessage("Uploaded file cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw ValidationException.withMessage("File size exceeds maximum limit of 5MB");
        }

        String rawFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment");
        String extension = getFileExtension(rawFilename);

        String contentType = file.getContentType();
        if ((contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) &&
            (extension.isEmpty() || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase()))) {
            throw ValidationException.withMessage("Invalid file type. Allowed types: PNG, JPEG, JPG, PDF");
        }

        String uniqueFileName = UUID.randomUUID() + "_" + rawFilename;
        String storageKey = (keyPrefix != null && !keyPrefix.isBlank()) ? keyPrefix + "/" + uniqueFileName : uniqueFileName;

        Path destinationFile = this.rootLocation.resolve(storageKey).normalize();

        try {
            Files.createDirectories(destinationFile.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("Stored file successfully at {}", destinationFile);
            return storageKey;
        } catch (IOException e) {
            log.error("Failed to store file {}", storageKey, e);
            throw new RuntimeException("Failed to store file " + rawFilename, e);
        }
    }

    @Override
    public Resource load(String storageKey) {
        try {
            Path file = this.rootLocation.resolve(storageKey).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw ResourceNotFoundException.forResource("File", "storageKey", storageKey);
            }
        } catch (MalformedURLException e) {
            throw ResourceNotFoundException.forResource("File", "storageKey", storageKey);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Path file = this.rootLocation.resolve(storageKey).normalize();
            boolean deleted = Files.deleteIfExists(file);
            if (deleted) {
                log.info("Deleted storage file {}", storageKey);
            }
        } catch (IOException e) {
            log.warn("Could not delete storage file {}", storageKey, e);
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
