import { apiClient } from './client';
import {
  DepartmentResponseDto,
  DepartmentCreateDto,
  DepartmentUpdateDto,
} from '../types';

export const departmentApi = {
  getAll: async () => {
    return apiClient<DepartmentResponseDto[]>('/api/v1/departments', {
      method: 'GET',
    });
  },

  getById: async (departmentId: string) => {
    return apiClient<DepartmentResponseDto>(`/api/v1/departments/${departmentId}`, {
      method: 'GET',
    });
  },

  create: async (dto: DepartmentCreateDto) => {
    return apiClient<DepartmentResponseDto>('/api/v1/departments', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  update: async (departmentId: string, dto: DepartmentUpdateDto) => {
    return apiClient<DepartmentResponseDto>(`/api/v1/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  delete: async (departmentId: string) => {
    return apiClient<void>(`/api/v1/departments/${departmentId}`, {
      method: 'DELETE',
    });
  },
};
