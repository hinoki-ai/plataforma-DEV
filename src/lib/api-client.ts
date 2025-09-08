/**
 * API Client Utility
 * Provides consistent API request handling with role-aware headers and error handling
 * Part of Stage 3: Route & Logic Consolidation
 */

import { UserRole } from '@prisma/client';

export type ExtendedUserRole = UserRole;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  userRole?: ExtendedUserRole;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * Enhanced fetch with consistent error handling and role-aware headers
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    userRole,
    timeout = 10000,
  } = options;

  try {
    // Prepare headers with role information
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add role-aware headers
    if (userRole) {
      requestHeaders['X-User-Role'] = userRole;
    }

    // Prepare request
    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Make request
    const response = await fetch(url, requestInit);

    // Handle response
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    // Parse JSON response
    const data = await response.json();

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (error) {
    console.error('API Request failed:', { url, method, error });

    if (error instanceof ApiError) {
      return {
        success: false,
        error: `${error.status}: ${error.statusText}`,
        message: error.message,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.name,
        message: error.message,
      };
    }

    return {
      success: false,
      error: 'Unknown Error',
      message: 'An unexpected error occurred',
    };
  }
}

/**
 * GET request wrapper
 */
export async function apiGet<T = any>(
  url: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request wrapper
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  options?: Omit<ApiRequestOptions, 'method'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'POST', body });
}

/**
 * PUT request wrapper
 */
export async function apiPut<T = any>(
  url: string,
  body?: any,
  options?: Omit<ApiRequestOptions, 'method'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'PUT', body });
}

/**
 * DELETE request wrapper
 */
export async function apiDelete<T = any>(
  url: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}

/**
 * PATCH request wrapper
 */
export async function apiPatch<T = any>(
  url: string,
  body?: any,
  options?: Omit<ApiRequestOptions, 'method'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'PATCH', body });
}

/**
 * Upload file with progress tracking
 */
export async function apiUpload<T = any>(
  url: string,
  file: File,
  options?: {
    userRole?: ExtendedUserRole;
    onProgress?: (progress: number) => void;
    additionalData?: Record<string, any>;
  }
): Promise<ApiResponse<T>> {
  const { userRole, onProgress, additionalData = {} } = options || {};

  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    });

    // Prepare headers (don't set Content-Type, let browser set it with boundary)
    const headers: Record<string, string> = {};
    if (userRole) {
      headers['X-User-Role'] = userRole;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (error) {
    console.error('Upload failed:', { url, file: file.name, error });

    if (error instanceof ApiError) {
      return {
        success: false,
        error: `${error.status}: ${error.statusText}`,
        message: error.message,
      };
    }

    return {
      success: false,
      error: 'Upload Failed',
      message: error instanceof Error ? error.message : 'File upload failed',
    };
  }
}

/**
 * Batch requests with proper error handling
 */
export async function apiBatch<T = any>(
  requests: Array<{ url: string; options?: ApiRequestOptions }>
): Promise<Array<ApiResponse<T>>> {
  const results = await Promise.allSettled(
    requests.map(({ url, options }) => apiRequest<T>(url, options))
  );

  return results.map(result =>
    result.status === 'fulfilled'
      ? result.value
      : {
          success: false,
          error: 'Request Failed',
          message: result.reason?.message || 'Batch request failed',
        }
  );
}

/**
 * Retry logic for failed requests
 */
export async function apiWithRetry<T = any>(
  url: string,
  options: ApiRequestOptions = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiRequest<T>(url, options);

      if (result.success) {
        return result;
      }

      lastError = result;

      // Don't retry on client errors (4xx)
      if (result.error?.startsWith('4')) {
        break;
      }
    } catch (error) {
      lastError = error;
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      await new Promise(resolve =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
    }
  }

  return (
    lastError || {
      success: false,
      error: 'Max Retries Exceeded',
      message: 'Request failed after maximum retry attempts',
    }
  );
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await apiGet('/api/health');
    return response.success;
  } catch {
    return false;
  }
}
