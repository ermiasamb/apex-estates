class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    // In a real app, you would use a proper base URL from environment variables
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An API error occurred');
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In a real app, you might add an Authorization header here
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API Error on POST ${endpoint}:`, error);
      throw error;
    }
  }
}

// For the purpose of this demo, we are using a placeholder URL.
// Replace https://app.apex.com with your actual API backend URL.
export const apiClient = new ApiClient('https://app.apex.com');
