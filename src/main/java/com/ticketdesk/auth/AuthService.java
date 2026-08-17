package com.ticketdesk.auth;

import com.ticketdesk.auth.dto.AuthResponse;
import com.ticketdesk.auth.dto.LoginRequest;
import com.ticketdesk.auth.dto.RegisterRequest;
import com.ticketdesk.auth.dto.UserSummaryDto;

public interface AuthService {
    UserSummaryDto register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserSummaryDto getCurrentUser(String username);
}
