import axios from 'axios';
import { API_BASE_URL, createApiClient, tokenService } from '../config/api.config';

const apiClient = createApiClient();

// Add a request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    
    console.log('====== token:', token);
    // Only add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } 
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenService.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Call refresh token API
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refreshToken
        });
        
        // Store the new tokens
        tokenService.setTokens(response.data.accessToken, response.data.refreshToken);
        
        // Update the failed request with new token and retry
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed, redirecting to login');
        // Clear tokens
        tokenService.clearTokens();
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

export const apiService = {
  get: <T>(url: string, params?: object) => apiClient.get<T>(url, { params }),
  post: <T>(url: string, data: unknown) => apiClient.post<T>(url, data),
  patch: <T>(url: string, data: unknown) => apiClient.patch<T>(url, data),
  delete: <T>(url: string) => apiClient.delete<T>(url),
  // You can add more specific methods if needed
};

export default apiService;
