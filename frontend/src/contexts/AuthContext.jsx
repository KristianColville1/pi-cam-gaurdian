import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { authAPI } from '../lib/api/auth.js';

// Create the Auth Context
export const AuthContext = createContext();

/**
 * AuthProvider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch {
      // User not authenticated
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
