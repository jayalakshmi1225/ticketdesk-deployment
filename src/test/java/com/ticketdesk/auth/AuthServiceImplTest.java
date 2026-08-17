package com.ticketdesk.auth;

import com.ticketdesk.auth.dto.AuthResponse;
import com.ticketdesk.auth.dto.LoginRequest;
import com.ticketdesk.auth.dto.RegisterRequest;
import com.ticketdesk.auth.dto.UserSummaryDto;
import com.ticketdesk.common.exception.ValidationException;
import com.ticketdesk.common.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("john_doe")
                .passwordHash("encoded_password")
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void register_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .username("john_doe")
                .password("Password123")
                .role(Role.USER)
                .build();

        when(userRepository.existsByUsername("john_doe")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        UserSummaryDto response = authService.register(request);

        assertNotNull(response);
        assertEquals("john_doe", response.getUsername());
        assertEquals(Role.USER, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_DuplicateUsername_ThrowsValidationException() {
        RegisterRequest request = RegisterRequest.builder()
                .username("john_doe")
                .password("Password123")
                .build();

        when(userRepository.existsByUsername("john_doe")).thenReturn(true);

        assertThrows(ValidationException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = LoginRequest.builder()
                .username("john_doe")
                .password("Password123")
                .build();

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(anyMap(), any())).thenReturn("mocked_jwt_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked_jwt_token", response.getToken());
        assertEquals("john_doe", response.getUsername());
        assertEquals(Role.USER, response.getRole());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
