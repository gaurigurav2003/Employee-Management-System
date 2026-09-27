import { apiClient } from './client';
import { LeaveCreateDto, LeaveResponseDto } from '../types';

export const leaveApi = {
  apply: async (dto: LeaveCreateDto) => {
    return apiClient<LeaveResponseDto>('/api/v1/leaves', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getById: async (leaveId: string) => {
    return apiClient<LeaveResponseDto>(`/api/v1/leaves/${leaveId}`, {
      method: 'GET',
    });
  },

  getByEmployeeId: async (employeeId: string) => {
    return apiClient<LeaveResponseDto[]>(`/api/v1/leaves/employee/${employeeId}`, {
      method: 'GET',
    });
  },

  getHistoryByEmployeeId: async (employeeId: string) => {
    return apiClient<LeaveResponseDto[]>(`/api/v1/leaves/${employeeId}/history`, {
      method: 'GET',
    });
  },


  getAll: async () => {
  return apiClient<LeaveResponseDto[]>('/api/v1/leaves', {
    method: 'GET',
  });
},




  approve: async (leaveId: string, approvedBy: string) => {
    return apiClient<LeaveResponseDto>(`/api/v1/leaves/${leaveId}/approve`, {
      method: 'PUT',
      body: JSON.stringify(approvedBy),
    });
  },

  reject: async (leaveId: string, rejectedBy: string) => {
    return apiClient<LeaveResponseDto>(`/api/v1/leaves/${leaveId}/reject`, {
      method: 'PUT',
      body: JSON.stringify(rejectedBy),
    });
  },
};
