import React, { useMemo } from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useLocation } from 'react-router-dom';
import { themeTokens } from './themeTokens';

export const ThemeProvider = ({ children }) => {
  const location = useLocation();

  // Xác định Portal đang sử dụng dựa trên pathname
  const activePortal = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) {
      return 'admin';
    }
    if (path.startsWith('/doctor')) {
      return 'doctor';
    }
    if (path.startsWith('/patient')) {
      return 'patient';
    }
    // Mặc định cho Auth hoặc các trang chung
    return 'shared';
  }, [location.pathname]);

  const currentTheme = themeTokens[activePortal] || themeTokens.shared;

  return (
    <ConfigProvider locale={viVN} theme={currentTheme}>
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
