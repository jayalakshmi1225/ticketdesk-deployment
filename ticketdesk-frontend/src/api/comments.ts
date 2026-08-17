import api from './index';
import type { CommentDto, CreateCommentRequest } from '../types';

export const getCommentsApi = async (ticketId: number): Promise<CommentDto[]> => {
  const response = await api.get<CommentDto[]>(`/tickets/${ticketId}/comments`);
  return response.data;
};

export const createCommentApi = async (ticketId: number, data: CreateCommentRequest): Promise<CommentDto> => {
  const response = await api.post<CommentDto>(`/tickets/${ticketId}/comments`, data);
  return response.data;
};

export const deleteCommentApi = async (ticketId: number, commentId: number): Promise<void> => {
  await api.delete(`/tickets/${ticketId}/comments/${commentId}`);
};
