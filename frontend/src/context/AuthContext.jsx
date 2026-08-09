import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edupulse_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setStudentProfile(res.data.studentProfile);
      } catch (err) {
        console.error('[AuthContext] Session verification failed:', err.response?.data?.message || err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, ...userData } = res.data;
    
    localStorage.setItem('edupulse_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);

    // Fetch complete /me to get populated profiles
    const meRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    setUser(meRes.data.user);
    setStudentProfile(meRes.data.studentProfile);

    return meRes.data.user;
  };

  const loginDemo = async (role) => {
    let email = 'admin@demo.local';
    let pass = 'admin123';

    if (role === 'FACULTY') {
      email = 'faculty@demo.local';
      pass = 'faculty123';
    } else if (role === 'STUDENT') {
      email = 'student@demo.local';
      pass = 'student123';
    }

    return await login(email, pass);
  };

  const logout = () => {
    localStorage.removeItem('edupulse_token');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, studentProfile, token, loading, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
