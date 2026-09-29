import { apiClient } from './client';
import {
  LoginRequestDto,
  RegisterRequestDto,
  CreateAccountRequestDto,
  CreateAccountResponseDto,
  ActivateAccountRequestDto,
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

  /**
   * Secure internal account creation.
   * Requires the caller to be authenticated as Admin, HR, or Manager.
   * The backend enforces which roles can be created by which creator role.
   */
  createAccount: async (dto: CreateAccountRequestDto): Promise<CreateAccountResponseDto> => {
    return apiClient<CreateAccountResponseDto>('/api/v1/auth/accounts', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Activate an account using the token from the activation link.
   * Public endpoint – no auth token required.
   */
  activateAccount: async (dto: ActivateAccountRequestDto): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/api/v1/auth/activate', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};
