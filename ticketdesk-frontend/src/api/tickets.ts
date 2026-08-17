import api from './index';
import type { TicketDto, CreateTicketRequest, UpdateStatusRequest, Category, Priority, Status } from '../types';

export const getTicketsApi = async (params?: { status?: Status; priority?: Priority; category?: Category }): Promise<TicketDto[]> => {
  const response = await api.get<TicketDto[]>('/tickets', { params });
  return response.data;
};

export const getTicketByIdApi = async (id: number): Promise<TicketDto> => {
  const response = await api.get<TicketDto>(`/tickets/${id}`);
  return response.data;
};

export const createTicketApi = async (data: CreateTicketRequest): Promise<TicketDto> => {
  const response = await api.post<TicketDto>('/tickets', data);
  return response.data;
};

export const updateTicketStatusApi = async (id: number, data: UpdateStatusRequest): Promise<TicketDto> => {
  const response = await api.patch<TicketDto>(`/tickets/${id}/status`, data);
  return response.data;
};

export const deleteTicketApi = async (id: number): Promise<void> => {
  await api.delete(`/tickets/${id}`);
};
