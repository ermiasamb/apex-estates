class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
    console.log(`[API Client] Initialized with base URL: ${this.baseUrl}`);
  }

  private getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') {
      return {};
    }
    const token = localStorage.getItem('apex_access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async handleTokenRefresh(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('apex_refresh_token');
        if (!refreshToken) {
          console.warn('[API Client] No refresh token available');
          return false;
        }

        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // Send cookies if they exist
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          console.error('[API Client] Token refresh failed with status', response.status);
          this.clearAuthData();
          return false;
        }

        const data = await response.json();
        if (data.accessToken) {
          localStorage.setItem('apex_access_token', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('apex_refresh_token', data.refreshToken);
          }
          console.log('[API Client] Token refreshed successfully');
          return true;
        }
        return false;
      } catch (error) {
        console.error('[API Client] Token refresh error:', error);
        this.clearAuthData();
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private clearAuthData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('apex_access_token');
    localStorage.removeItem('apex_refresh_token');
    localStorage.removeItem('apex_user');
  }

  private async handleResponse<T>(response: Response, endpoint: string, method: string, retryCount: number = 0, retryFn?: () => Promise<Response>): Promise<T> {
    const contentType = response.headers.get('content-type');
    let responseBody: any;

    try {
      if (contentType?.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
    } catch (e) {
      responseBody = response.statusText;
    }

    console.log(`[API Response] ${method} ${endpoint}`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
    });

    // Handle 401 Unauthorized - attempt token refresh and retry
    if (response.status === 401 && retryCount === 0 && retryFn) {
      console.warn('[API Client] Received 401, attempting token refresh...');
      const refreshed = await this.handleTokenRefresh();
      if (refreshed) {
        try {
          console.log('[API Client] Retrying request after token refresh');
          const retryResponse = await retryFn();
          return this.handleResponse<T>(retryResponse, endpoint, method, retryCount + 1);
        } catch (retryError) {
          console.error('[API Client] Retry failed:', retryError);
          throw retryError;
        }
      } else {
        // Refresh failed, clear auth and throw error
        const errorMessage = responseBody?.message || responseBody?.error || 'Unauthorized';
        throw new Error(errorMessage);
      }
    }

    if (!response.ok) {
      const errorMessage = responseBody?.message || responseBody?.error || response.statusText;
      console.error(`[API Error] ${method} ${endpoint} failed:`, {
        status: response.status,
        message: errorMessage,
        fullResponse: responseBody,
      });
      throw new Error(errorMessage || 'An API error occurred');
    }
    return responseBody;
  }

  private buildFetchOptions(method: string, headers: Record<string, string>, body?: any, isFormData?: boolean): RequestInit {
    const options: RequestInit = {
      method,
      headers,
      credentials: 'include' as RequestCredentials,
    };
    if (body !== undefined && !isFormData) {
      options.body = JSON.stringify(body);
    } else if (body !== undefined) {
      options.body = body;
    }
    return options;
  }

  async get<T>(endpoint: string, options?: { skipAuth?: boolean }): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }

  async post<T>(endpoint: string, data: any, options?: { skipAuth?: boolean }): Promise<T> {
    return this.request<T>(endpoint, 'POST', data, options);
  }

  async postForm<T>(endpoint: string, data: FormData, options?: { skipAuth?: boolean }): Promise<T> {
    return this.requestForm<T>(endpoint, 'POST', data, options);
  }

  async put<T>(endpoint: string, data: any, options?: { skipAuth?: boolean }): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data, options);
  }

  async delete<T>(endpoint: string, options?: { skipAuth?: boolean }): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }

  private async request<T>(endpoint: string, method: string, data?: any, options?: { skipAuth?: boolean }): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`[API Request] ${method} ${endpoint}`, { url });

      const makeRequest = () => {
        const headers: Record<string, string> = {
          'Accept': 'application/json',
        };

        if (!options?.skipAuth) {
          Object.assign(headers, this.getAuthHeaders());
        }

        if (data !== undefined) {
          headers['Content-Type'] = 'application/json';
        }

        const fetchOptions: RequestInit = {
          method,
          headers,
          credentials: 'include' as RequestCredentials,
        };

        if (data !== undefined) {
          fetchOptions.body = JSON.stringify(data);
        }

        return fetch(url, fetchOptions);
      };

      const response = await makeRequest();
      return this.handleResponse<T>(response, endpoint, method, 0, makeRequest);
    } catch (error) {
      console.error(`[API Error] ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  private async requestForm<T>(endpoint: string, method: string, data: FormData, options?: { skipAuth?: boolean }): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      // Log FormData contents
      const formDataLog: Record<string, any> = {};
      data.forEach((value, key) => {
        if (value instanceof File) {
          formDataLog[key] = {
            type: 'File',
            name: value.name,
            size: value.size,
            mimeType: value.type,
          };
        } else {
          formDataLog[key] = value;
        }
      });

      console.log(`[API Request] ${method} ${endpoint} (FormData)`, {
        url,
        formData: formDataLog,
      });

      const makeRequest = () => {
        const headers: Record<string, string> = {
          'Accept': 'application/json',
        };

        if (!options?.skipAuth) {
          Object.assign(headers, this.getAuthHeaders());
        }

        return fetch(url, {
          method,
          headers,
          body: data,
          credentials: 'include' as RequestCredentials,
        });
      };

      const response = await makeRequest();
      return this.handleResponse<T>(response, endpoint, method, 0, makeRequest);
    } catch (error) {
      console.error(`[API Error] ${method} ${endpoint}:`, error);
      throw error;
    }
  }
}

// Automatically resolve base URL pointing to the Nest.js REST API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
export const apiClient = new ApiClient(API_URL);