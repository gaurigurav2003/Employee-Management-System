import { apiClient } from './client';
import {
  EmployeeResponseDto,
  EmployeeCreateDto,
  EmployeeUpdateDto,
} from '../types';

export const employeeApi = {
  getAll: async () => {
    return apiClient<EmployeeResponseDto[]>('/api/v1/employees', {
      method: 'GET',
    });
  },

  getById: async (employeeId: string) => {
    return apiClient<EmployeeResponseDto>(`/api/v1/employees/${employeeId}`, {
      method: 'GET',
    });
  },

  create: async (dto: EmployeeCreateDto) => {
    return apiClient<EmployeeResponseDto>('/api/v1/employees', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  update: async (employeeId: string, dto: EmployeeUpdateDto) => {
    return apiClient<EmployeeResponseDto>(`/api/v1/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  delete: async (employeeId: string) => {
    return apiClient<void>(`/api/v1/employees/${employeeId}`, {
      method: 'DELETE',
    });
  },

  search: async (searchTerm: string) => {
    const encoded = encodeURIComponent(searchTerm);
    return apiClient<EmployeeResponseDto[]>(`/api/v1/employees/search?searchTerm=${encoded}`, {
      method: 'GET',
    });
  },

  getMe: async () => {
    return apiClient<EmployeeResponseDto>('/api/v1/employees/me', {
      method: 'GET',
    });
  },
};
