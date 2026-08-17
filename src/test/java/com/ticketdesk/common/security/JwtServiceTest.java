package com.ticketdesk.common.security;

import com.ticketdesk.auth.Role;
import com.ticketdesk.auth.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtServiceImpl jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtServiceImpl();
        ReflectionTestUtils.setField(jwtService, "secretKey", "404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 3600000L); // 1 hour
    }

    @Test
    void generateAndValidateToken_Success() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .passwordHash("hashedpass")
                .role(Role.USER)
                .build();
        SecurityUser securityUser = new SecurityUser(user);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(claims, securityUser);

        assertNotNull(token);
        assertEquals("testuser", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, securityUser));
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void isTokenValid_InvalidUsername_ReturnsFalse() {
        User user1 = User.builder().id(1L).username("user1").passwordHash("pass").role(Role.USER).build();
        User user2 = User.builder().id(2L).username("user2").passwordHash("pass").role(Role.USER).build();

        SecurityUser securityUser1 = new SecurityUser(user1);
        SecurityUser securityUser2 = new SecurityUser(user2);

        String token = jwtService.generateToken(securityUser1);

        assertFalse(jwtService.isTokenValid(token, securityUser2));
    }
}
