import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Error403 from '../components/Error403';

/**
 * Component bảo vệ đường dẫn theo vai trò (Role-Based Access Control Guard)
 * Chặn truy cập chéo phân hệ, bảo vệ an toàn dữ liệu y tế
 */
export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, hasAnyRole, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner tip="Đang kiểm tra quyền truy cập y tế..." />;
  }

  // Chưa đăng nhập -> Điều hướng về Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu là route Bệnh nhân (/patient/*), Bác sĩ hoặc Admin vẫn có quyền truy cập để quản lý sức khỏe cá nhân
  const isPatientRoute = location.pathname.startsWith('/patient');
  if (isPatientRoute && (hasRole('ROLE_DOCTOR') || hasRole('ROLE_ADMIN') || hasRole('ROLE_USER'))) {
    return children ? children : <Outlet />;
  }

  // Kiểm tra danh sách quyền được phép
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Error403 />;
  }

  return children ? children : <Outlet />;
};

export default RoleRoute;
