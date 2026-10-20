import axiosClient from './axiosClient';

export const adminService = {
  // Lấy danh sách toàn bộ người dùng
  getAllUsers: async () => {
    return await axiosClient.get('/admin/users');
  },

  // Cấp / Đổi quyền cho người dùng (ROLE_USER, ROLE_DOCTOR, ROLE_ADMIN) kèm chuyên khoa (nếu là Bác sĩ)
  updateUserRole: async (userId, roleName, department = null) => {
    return await axiosClient.put(`/admin/users/${userId}/role`, { roleName, department });
  },

  // Khóa / Mở khóa tài khoản
  toggleLock: async (userId) => {
    return await axiosClient.put(`/admin/users/${userId}/toggle-lock`);
  },
};

export default adminService;
