import api, { setAuthToken } from './index';
import type { AuthResponse, LoginRequest, RegisterRequest, UserSummaryDto } from '../types';

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  if (response.data && response.data.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const registerApi = async (data: RegisterRequest): Promise<UserSummaryDto> => {
  const response = await api.post<UserSummaryDto>('/auth/register', data);
  return response.data;
};

export const getCurrentUserApi = async (): Promise<UserSummaryDto> => {
  const response = await api.get<UserSummaryDto>('/auth/me');
  return response.data;
};
