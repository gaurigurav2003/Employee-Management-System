import { apiClient } from './client';
import {
  LoginRequestDto,
  RegisterRequestDto,
} from '../types';

export const authApi = {
  login: async (dto: LoginRequestDto) => {
    return apiClient<any>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  register: async (dto: RegisterRequestDto) => {
    return apiClient<any>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};
