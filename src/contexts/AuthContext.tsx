import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, LoginCredentials, UserProfile } from '../types/auth';
import authService from '../services/authService';

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  error: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();
        
        setUser(currentUser);
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        setError('Authentication initialization failed');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const user = await authService.login(credentials);
      setUser(user);
      setIsAuthenticated(true);
      navigate('/admin'); // Redirect to admin dashboard after successful login
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid username or password. Please try again.');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
