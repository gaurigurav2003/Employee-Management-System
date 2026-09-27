import { apiClient } from './client';
import {
  SupportTicketCreateDto,
  SupportTicketUpdateDto,
  SupportTicketResponseDto,
} from '../types';

export const supportApi = {
  create: async (dto: SupportTicketCreateDto) => {
    return apiClient<SupportTicketResponseDto>('/api/v1/support-tickets', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getAll: async () => {
    return apiClient<SupportTicketResponseDto[]>('/api/v1/support-tickets', {
      method: 'GET',
    });
  },

  getById: async (ticketId: string) => {
    return apiClient<SupportTicketResponseDto>(`/api/v1/support-tickets/${ticketId}`, {
      method: 'GET',
    });
  },

  update: async (ticketId: string, dto: SupportTicketUpdateDto) => {
    return apiClient<SupportTicketResponseDto>(`/api/v1/support-tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  getByEmployeeId: async (employeeId: string) => {
    return apiClient<SupportTicketResponseDto[]>(`/api/v1/support-tickets/employee/${employeeId}`, {
      method: 'GET',
    });
  },
};
