/**
 * Standard API response envelope from the backend.
 * Every endpoint returns this shape.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Paginated API response from list endpoints.
 * Backend returns { success, data: [...], pagination: { ... } }
 */
export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API error response shape.
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Auth login response — nested inside ApiResponse<data>
 */
export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'member' | 'admin' | 'front_desk' | 'bar' | 'shop';
    tier: string | null;
    status: string;
  };
}
