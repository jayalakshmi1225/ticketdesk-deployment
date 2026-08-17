export type Category = 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'ACCESS' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface UserSummaryNestedDto {
  id: number | string;
  username: string;
}

export interface TicketDto {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  createdBy: UserSummaryNestedDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}

export interface UpdateStatusRequest {
  status: Status;
}

export interface CommentDto {
  id: number;
  ticketId?: number;
  author: UserSummaryNestedDto;
  body: string;
  createdAt: string;
}

export interface AttachmentDto {
  id: number;
  ticketId?: number;
  originalFileName: string;
  storageKey?: string;
  contentType?: string;
  sizeBytes: number;
  uploadedBy: UserSummaryNestedDto;
  uploadedAt: string;
}

export interface DashboardSummaryDto {
  countsByStatus: Record<string, number>;
  countsByPriority: Record<string, number>;
  totalTickets: number;
  openOlderThan48h: number;
}
