import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';

import { AuthProvider } from './QuanLyBenhAn/context/AuthContext';
import { ThemeProvider } from './QuanLyBenhAn/theme/ThemeProvider';
import AppRoutes from './QuanLyBenhAn/routes/AppRoutes';
import ErrorBoundary from './QuanLyBenhAn/components/ErrorBoundary';

// Cấu hình ngôn ngữ tiếng Việt mặc định cho dayjs
dayjs.locale('vi');

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
