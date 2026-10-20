import axios from 'axios';
import { notification } from 'antd';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api/v1';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Gắn Bearer JWT Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý 401 (Refresh Token), 403 (Forbidden), 500
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về thẳng object ApiResponse { success, message, data, ... }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (res.data && res.data.data && res.data.data.token) {
            const newToken = res.data.data.token;
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshErr) {
          // Refresh token cũng hết hạn -> Đăng xuất
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login?session_expired=true';
          return Promise.reject(refreshErr);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      notification.warning({
        message: 'Từ chối quyền truy cập (403)',
        description: 'Tài khoản của bạn không có đủ quyền hạn để thực hiện thao tác này.',
        placement: 'topRight',
      });
    }

    // Format error message thân thiện tiếng Việt
    let errorMessage = 'Không thể kết nối đến máy chủ y tế. Vui lòng thử lại sau.';
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (Array.isArray(data.validationErrors) && data.validationErrors.length > 0) {
        errorMessage = data.validationErrors.join(', ');
      } else if (data.validationErrors && typeof data.validationErrors === 'object') {
        errorMessage = Object.values(data.validationErrors).join(', ');
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.errorDescription) {
        errorMessage = data.errorDescription;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else if (error.message && !error.message.includes('Network Error')) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;
