import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthResponse, Role } from '../types';
import { setAuthToken } from '../api';

// Known limitation: Token is stored in-memory only (context state / module variable) per requirement.
// Refreshing the browser page resets authentication state and clears the token.
interface AuthContextType {
  token: string | null;
  username: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  setAuthData: (authData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const setAuthData = (authData: AuthResponse) => {
    setToken(authData.token);
    setUsername(authData.username);
    setRole(authData.role);
    setAuthToken(authData.token);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setRole(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        role,
        isAuthenticated: Boolean(token),
        setAuthData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
