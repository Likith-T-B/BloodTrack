import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            fetchNotifications();
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to load user session:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.put(`/notifications/${id}`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Error marking notification read:', err.message);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        
        // Reload details and fetch notifications
        const profileRes = await api.get('/auth/me');
        if (profileRes.data.success) {
          localStorage.setItem('user', JSON.stringify(profileRes.data.user));
          setUser(profileRes.data.user);
          fetchNotifications();
          return { success: true, user: profileRes.data.user };
        }
        
        fetchNotifications();
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        
        const profileRes = await api.get('/auth/me');
        if (profileRes.data.success) {
          localStorage.setItem('user', JSON.stringify(profileRes.data.user));
          setUser(profileRes.data.user);
          fetchNotifications();
          return { success: true, user: profileRes.data.user };
        }
        
        fetchNotifications();
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotifications([]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      notifications,
      fetchNotifications,
      markNotificationRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
