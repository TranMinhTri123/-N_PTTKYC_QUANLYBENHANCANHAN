import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Chế độ xem hiện tại của tài khoản (dành cho Doctor khi chuyển sang xem hồ sơ cá nhân)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'default');

  // Khởi tạo: Xác thực lại token với Backend qua /auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch {
          // Token không hợp lệ -> Xóa
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Đăng nhập
  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res && res.data && res.data.token) {
      const { token: jwtToken, refreshToken, userId, email, fullName, roles, department } = res.data;
      const userData = { id: userId, email, fullName, roles, department };

      localStorage.setItem('token', jwtToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error('Đăng nhập không thành công, vui lòng kiểm tra lại thông tin.');
  };

  // Đăng xuất
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('viewMode');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  }, []);

  // Kiểm tra vai trò
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  // Kiểm tra ít nhất 1 trong các vai trò được phép
  const hasAnyRole = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user || !user.roles) return false;
    return allowedRoles.some((role) => user.roles.includes(role));
  };

  const isAdmin = () => hasRole('ROLE_ADMIN');
  const isDoctor = () => hasRole('ROLE_DOCTOR');
  const isPatient = () => hasRole('ROLE_USER') || (!isAdmin() && !isDoctor());

  // Lấy đường dẫn điều hướng mặc định sau đăng nhập
  const getDefaultRoute = () => {
    if (isAdmin()) return '/admin/dashboard';
    if (isDoctor()) return '/doctor/workspace';
    return '/patient/dashboard';
  };

  // Chuyển đổi chế độ xem cho Bác sĩ (giữa Bàn làm việc và Sổ gia đình)
  const switchMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin,
    isDoctor,
    isPatient,
    getDefaultRoute,
    viewMode,
    switchMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};

export default AuthContext;
