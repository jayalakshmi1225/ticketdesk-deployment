package com.ticketdesk.attachment;

import com.ticketdesk.common.exception.ResourceNotFoundException;
import com.ticketdesk.common.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class LocalDiskStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalDiskStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new LocalDiskStorageService(tempDir.toString());
    }

    @Test
    void store_ValidImage_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "screenshot.png",
                "image/png",
                "dummy image content".getBytes()
        );

        String key = storageService.store(file, "tickets/1");

        assertNotNull(key);
        assertTrue(key.startsWith("tickets/1/"));
        assertTrue(key.endsWith("_screenshot.png"));
    }

    @Test
    void store_InvalidExtension_ThrowsValidationException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "script.sh",
                "text/plain",
                "echo hello".getBytes()
        );

        assertThrows(ValidationException.class, () -> storageService.store(file, "tickets/1"));
    }

    @Test
    void store_FileTooLarge_ThrowsValidationException() {
        byte[] largeBytes = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "bigdoc.pdf",
                "application/pdf",
                largeBytes
        );

        assertThrows(ValidationException.class, () -> storageService.store(file, "tickets/1"));
    }

    @Test
    void loadAndDelete_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "doc.pdf",
                "application/pdf",
                "PDF content".getBytes()
        );

        String key = storageService.store(file, "tickets/1");
        Resource resource = storageService.load(key);

        assertNotNull(resource);
        assertTrue(resource.exists());

        storageService.delete(key);
        assertThrows(ResourceNotFoundException.class, () -> storageService.load(key));
    }
}
