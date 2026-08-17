import api from './index';
import type { AttachmentDto } from '../types';

export const getAttachmentsApi = async (ticketId: number): Promise<AttachmentDto[]> => {
  const response = await api.get<AttachmentDto[]>(`/tickets/${ticketId}/attachments`);
  return response.data;
};

export const uploadAttachmentApi = async (ticketId: number, file: File): Promise<AttachmentDto> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<AttachmentDto>(`/tickets/${ticketId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAttachmentDownloadUrl = (ticketId: number, attachmentId: number): string => {
  return `/api/tickets/${ticketId}/attachments/${attachmentId}/download`;
};

export const deleteAttachmentApi = async (ticketId: number, attachmentId: number): Promise<void> => {
  await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
};
