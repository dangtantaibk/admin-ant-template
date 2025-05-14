import axios from 'axios';
import { AuthResponse, LoginCredentials, RefreshTokenRequest, UserProfile } from '../types/auth';

// Updated API endpoint
// const API_URL = '/'; 

// Storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// Create a separate axios instance for auth requests
const authClient = axios.create({
  baseURL: 'https://api.yensao24h.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  // Login user and store tokens
  login: async (credentials: LoginCredentials): Promise<UserProfile> => {
    try {
      // Explicitly structure the request body with email and password
      const response = await authClient.post<AuthResponse>('/auth/login', {
        email: credentials.username,
        password: credentials.password
      });
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens and user data
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  // Refresh access token
  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      // Fix URL to use the correct endpoint
      const response = await authClient.post<AuthResponse>('/auth/refresh-token', {
        refreshToken,
      } as RefreshTokenRequest);
      
      // Update stored tokens
      localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      
      return response.data.accessToken;
    } catch (error) {
      // If refresh fails, clear auth data
      console.error('Token refresh failed:', error);
      authService.logout();
      throw new Error('Token refresh failed');
    }
  },
  
  // Logout user and clear storage
  logout: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  // Get current user from storage
  getCurrentUser: (): UserProfile | null => {
    try {
      const userJson = localStorage.getItem(USER_KEY);
      if (userJson && userJson !== 'undefined' && userJson !== 'null') {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // If there's an error parsing, clear the invalid data
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  
  // Get access token
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};

export default authService;
