import { USER_KEY, createApiClient, tokenService } from '../config/api.config';
import { AuthResponse, LoginCredentials, RefreshTokenRequest, UserProfile } from '../types/auth';

// Create a separate axios instance for auth requests
const authClient = createApiClient();

export const authService = {
  // Login user and store tokens
  login: async (credentials: LoginCredentials): Promise<UserProfile> => {
    try {
      // Explicitly structure the request body with email and password
      const response = await authClient.post<AuthResponse>('/auth/login', {
        email: credentials.username,
        password: credentials.password
      });

      const { access_token: accessToken, refresh_token: refreshToken, user } = response.data;
      // Store tokens and user data
      tokenService.setTokens(accessToken, refreshToken);
      let userData = user;
      // If user data is null, fetch it from the /users/me endpoint
      if (userData == null) {
        try {
          console.log('User data is null, fetching from /users/me endpoint');
          const userResponse = await authClient.get<UserProfile>('/users/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          userData = userResponse.data;
          console.log('Fetched user data:', userData);
        } catch (userError) {
          console.error('Failed to fetch user data:', userError);
        }
      }
      // Store user data
      if (userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      } else {
        console.warn('No user data available to store');
      }


      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async (): Promise<string> => {
    const refreshToken = tokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authClient.post<AuthResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      } as RefreshTokenRequest);

      console.log('======== Token refresh response:', response.data);
      // Update stored tokens
      tokenService.setTokens(response.data.access_token, response.data.refresh_token);

      return response.data.access_token;
    } catch (error) {
      // If refresh fails, clear auth data
      console.error('Token refresh failed:', error);
      authService.logout();
      throw new Error('Token refresh failed');
    }
  },

  // Logout user and clear storage
  logout: (): void => {
    tokenService.clearTokens();
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
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return tokenService.isAuthenticated();
  },

  // Get access token
  getAccessToken: (): string | null => {
    return tokenService.getAccessToken();
  },
};

export default authService;
