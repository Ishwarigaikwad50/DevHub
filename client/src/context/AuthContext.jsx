import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('devhub_token'));
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Session restore failed:', err.message);
        localStorage.removeItem('devhub_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('devhub_token', newToken);
      setToken(newToken);
      setUser(newUser);
      success('Welcome back', `Logged in as ${newUser.name} (${newUser.role})`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      error('Authentication Error', msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('devhub_token', newToken);
      setToken(newToken);
      setUser(newUser);
      success('Account Created', `Welcome to DevHub, ${newUser.name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      error('Registration Error', msg);
      return { success: false, message: msg };
    }
  };

  const demoLogin = async (role = 'ADMIN') => {
    try {
      const res = await api.post('/auth/demo-login', { role });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('devhub_token', newToken);
      setToken(newToken);
      setUser(newUser);
      success('Role Switched', `Active session switched to ${newUser.name} (${role})`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Demo login failed.';
      error('Demo Login Error', msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('devhub_token');
    setToken(null);
    setUser(null);
    success('Logged Out', 'You have been safely signed out of DevHub.');
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isTeamAdmin = user?.role === 'TEAM_ADMIN';
  const isDeveloper = user?.role === 'DEVELOPER';
  const isViewer = user?.role === 'VIEWER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        hasRole,
        isAdmin,
        isTeamAdmin,
        isDeveloper,
        isViewer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
