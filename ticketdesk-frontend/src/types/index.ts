export * from './ticket';

export type Role = 'ADMIN' | 'AGENT' | 'USER';

export interface UserSummaryDto {
  id: number | string;
  username: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: Role;
}

export interface CreateCommentRequest {
  body: string;
}

export interface DashboardSummaryDto {
  countsByStatus: Record<string, number>;
  countsByPriority: Record<string, number>;
  totalTickets: number;
  openOlderThan48h: number;
}
