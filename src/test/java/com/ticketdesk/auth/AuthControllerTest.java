package com.ticketdesk.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketdesk.auth.dto.AuthResponse;
import com.ticketdesk.auth.dto.LoginRequest;
import com.ticketdesk.auth.dto.RegisterRequest;
import com.ticketdesk.auth.dto.UserSummaryDto;
import com.ticketdesk.common.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void register_Success() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("new_user")
                .password("Password123")
                .build();

        UserSummaryDto responseDto = UserSummaryDto.builder()
                .id(1L)
                .username("new_user")
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("new_user"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void login_Success() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .username("john_doe")
                .password("Password123")
                .build();

        AuthResponse response = AuthResponse.builder()
                .token("valid_jwt_token")
                .username("john_doe")
                .role(Role.USER)
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("valid_jwt_token"))
                .andExpect(jsonPath("$.username").value("john_doe"));
    }

    @Test
    @WithMockUser(username = "john_doe")
    void getCurrentUser_Success() throws Exception {
        UserSummaryDto responseDto = UserSummaryDto.builder()
                .id(1L)
                .username("john_doe")
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        when(authService.getCurrentUser("john_doe")).thenReturn(responseDto);

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("john_doe"));
    }
}
