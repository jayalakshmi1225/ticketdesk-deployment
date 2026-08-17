package com.ticketdesk.common.config;

import com.ticketdesk.auth.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Public health check endpoint")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    private final UserRepository userRepository;

    public HealthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Application and database health status", description = "Returns application status and verifies database connectivity.")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        boolean dbConnected = false;

        try {
            userRepository.count();
            dbConnected = true;
        } catch (Exception e) {
            log.error("Database health check failed", e);
        }

        response.put("status", dbConnected ? "UP" : "DOWN");
        response.put("dbConnected", dbConnected);

        HttpStatus httpStatus = dbConnected ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(httpStatus).body(response);
    }
}
