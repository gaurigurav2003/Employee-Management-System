import { apiClient } from './client';
import {
  AttendanceCreateDto,
  AttendanceUpdateDto,
  AttendanceResponseDto,
} from '../types';

export const attendanceApi = {
  checkIn: async (dto: AttendanceCreateDto) => {
    return apiClient<AttendanceResponseDto>('/api/v1/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getById: async (attendanceId: string) => {
    return apiClient<AttendanceResponseDto>(`/api/v1/attendance/${attendanceId}`, {
      method: 'GET',
    });
  },

  getByEmployeeId: async (employeeId: string) => {
    return apiClient<AttendanceResponseDto[]>(`/api/v1/attendance/employee/${employeeId}`, {
      method: 'GET',
    });
  },

  getAll: async () => {
    return apiClient<AttendanceResponseDto[]>('/api/v1/attendance', {
      method: 'GET',
    });
  },

  checkOut: async (attendanceId: string, dto: AttendanceUpdateDto) => {
    return apiClient<AttendanceResponseDto>(`/api/v1/attendance/${attendanceId}/check-out`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },
};
