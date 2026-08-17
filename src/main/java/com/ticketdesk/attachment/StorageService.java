package com.ticketdesk.attachment;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String keyPrefix);
    Resource load(String storageKey);
    void delete(String storageKey);
}
