import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Assuming backend is served under /api proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor (optional, e.g., for adding auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('authToken'); // Example: Get token
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor (optional, e.g., for global error handling)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally (e.g., redirect on 401)
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  get: <T>(url: string, params?: object) => apiClient.get<T>(url, { params }),
  post: <T>(url: string, data: unknown) => apiClient.post<T>(url, data), // Change any to unknown
  patch: <T>(url: string, data: unknown) => apiClient.patch<T>(url, data), // Change any to unknown
  delete: <T>(url: string) => apiClient.delete<T>(url),
  // You can add more specific methods if needed
};

export default apiService;
