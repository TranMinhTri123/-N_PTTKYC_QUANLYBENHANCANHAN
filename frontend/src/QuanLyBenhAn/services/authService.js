import axiosClient from './axiosClient';

export const authService = {
  // Đăng nhập
  login: async (credentials) => {
    return await axiosClient.post('/auth/authenticate', credentials);
  },

  // Đăng ký tài khoản
  register: async (userData) => {
    return await axiosClient.post('/auth/register', userData);
  },

  // Kích hoạt tài khoản qua Token email
  activateAccount: async (token) => {
    return await axiosClient.get('/auth/activate-account', {
      params: { token },
    });
  },

  // Lấy thông tin tài khoản đang đăng nhập
  getMe: async () => {
    return await axiosClient.get('/auth/me');
  },

  // Cập nhật thông tin tài khoản
  updateProfile: async (profileData) => {
    return await axiosClient.put('/auth/profile', profileData);
  },

  // Đổi mật khẩu chủ động
  changePassword: async (passwordData) => {
    return await axiosClient.post('/auth/change-password', passwordData);
  },

  // Quên mật khẩu - Bước 1: Gửi email xin mã OTP 6 số
  forgotPassword: async (email) => {
    return await axiosClient.post('/auth/forgot-password', { email });
  },

  // Quên mật khẩu - Bước 2: Xác minh tính hợp lệ của mã OTP
  verifyResetCode: async (email, code) => {
    return await axiosClient.post('/auth/verify-reset-code', { email, code });
  },

  // Quên mật khẩu - Bước 3: Thiết lập mật khẩu mới
  resetPassword: async (email, code, newPassword) => {
    return await axiosClient.post('/auth/reset-password', {
      email,
      code,
      newPassword,
    });
  },
};

export default authService;
