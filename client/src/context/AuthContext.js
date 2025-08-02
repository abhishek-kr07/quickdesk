import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login with:', { email, password: '***' });
      const response = await authService.login(email, password);
      console.log('AuthContext: Login response:', response);
      
      const { user: userData, token: authToken } = response;
      
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      
      console.log('AuthContext: Login successful, user set:', userData);
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      console.error('AuthContext: Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { user: newUser, token: authToken } = response;
      
      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Update user function
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent' || user?.role === 'admin',
    isUser: user?.role === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 