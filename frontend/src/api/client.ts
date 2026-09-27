import { ApiErrorResponse } from '../types';

export const DEFAULT_GATEWAY_URL = 'http://localhost:5000';

export function getGatewayUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('ems_gateway_url');
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  return (import.meta.env.VITE_API_GATEWAY_URL as string) || DEFAULT_GATEWAY_URL;
}

export function setGatewayUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === DEFAULT_GATEWAY_URL) {
      localStorage.removeItem('ems_gateway_url');
    } else {
      localStorage.setItem('ems_gateway_url', url.trim().replace(/\/+$/, ''));
    }
  }
}

export class ApiError extends Error {
  status: number;
  code?: string;
  traceId?: string;
  errors?: Array<{ field?: string; message: string }>;
  raw?: unknown;

  constructor(status: number, message: string, code?: string, traceId?: string, errors?: Array<{ field?: string; message: string }>, raw?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.traceId = traceId;
    this.errors = errors;
    this.raw = raw;
  }
}

type AuthCallback = () => void;
let unauthorizedListener: AuthCallback | null = null;
let forbiddenListener: ((message?: string) => void) | null = null;

export function setOnUnauthorized(callback: AuthCallback) {
  unauthorizedListener = callback;
}

export function setOnForbidden(callback: (message?: string) => void) {
  forbiddenListener = callback;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ems_auth_token') || sessionStorage.getItem('ems_auth_token');
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getGatewayUrl();
  // Ensure endpoint starts with leading slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Also include a trace correlation ID if not present
  if (!headers.has('X-Correlation-ID')) {
    headers.set('X-Correlation-ID', crypto.randomUUID ? crypto.randomUUID() : `trace-${Date.now()}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const errorMsg = (err instanceof Error) ? err.message : 'Network error';
    throw new ApiError(
      0,
      `Cannot connect to API Gateway at ${baseUrl}. Ensure backend and gateway are running at http://localhost:5000. Details: ${errorMsg}`,
      'NETWORK_ERROR'
    );
  }

  // Handle No Content
  if (response.status === 204) {
    return {} as T;
  }

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      // Try to parse json from text
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const status = response.status;
    let message = 'An unexpected server error occurred.';
    let code: string | undefined = undefined;
    let traceId: string | undefined = undefined;
    let errors: Array<{ field?: string; message: string }> | undefined = undefined;

    if (data && typeof data === 'object') {
      const errObj = data as ApiErrorResponse & Record<string, any>;
      message = errObj.message || errObj.title || errObj.detail || message;
      code = errObj.code || (errObj.status ? `HTTP_${errObj.status}` : undefined);
      traceId = errObj.traceId;
      if (Array.isArray(errObj.errors)) {
        errors = errObj.errors;
      } else if (errObj.errors && typeof errObj.errors === 'object') {
        // ASP.NET ModelState validation dictionary { [field]: string[] }
        errors = Object.entries(errObj.errors).flatMap(([field, msgs]) => {
          if (Array.isArray(msgs)) {
            return msgs.map((m) => ({ field, message: String(m) }));
          }
          return [{ field, message: String(msgs) }];
        });
      }
    } else if (typeof data === 'string' && data.length > 0) {
      message = data;
    }

    if (status === 401) {
      if (unauthorizedListener) {
        unauthorizedListener();
      }
      throw new ApiError(401, message || 'Session expired or unauthenticated. Please log in again.', 'UNAUTHENTICATED', traceId, errors, data);
    }

    if (status === 403) {
      if (forbiddenListener) {
        forbiddenListener(message);
      }
      throw new ApiError(403, message || 'Access Denied: You do not have permission to perform this action.', 'FORBIDDEN', traceId, errors, data);
    }

    if (status === 400) {
      throw new ApiError(400, message || 'Bad Request: Please check the input fields.', 'VALIDATION_ERROR', traceId, errors, data);
    }

    if (status === 404) {
      throw new ApiError(404, message || 'The requested resource was not found.', 'NOT_FOUND', traceId, errors, data);
    }

    if (status === 409) {
      throw new ApiError(409, message || 'Conflict: The request could not be completed due to a data conflict.', 'CONFLICT', traceId, errors, data);
    }

    if (status === 503) {
      throw new ApiError(503, message || 'Target microservice is temporarily unavailable (503).', 'DEPENDENCY_UNAVAILABLE', traceId, errors, data);
    }

    throw new ApiError(status, message, code || `ERROR_${status}`, traceId, errors, data);
  }

  return data as T;
}
