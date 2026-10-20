import axiosClient from './axiosClient';

export const shareService = {
  // Lấy danh sách chia sẻ
  getShares: async (profileId = null) => {
    if (profileId) {
      return await axiosClient.get(`/shares/profile/${profileId}`);
    }
    return { data: [] };
  },

  // Lấy danh sách liên kết chia sẻ của một hồ sơ
  getSharesByProfile: async (profileId) => {
    if (!profileId) return { data: [] };
    return await axiosClient.get(`/shares/profile/${profileId}`);
  },

  // Tạo liên kết chia sẻ mới (sinh token 32 ký tự)
  createShare: async (data) => {
    return await axiosClient.post('/shares', data);
  },

  // Thu hồi quyền chia sẻ
  revokeShare: async (id) => {
    return await axiosClient.delete(`/shares/${id}`);
  },

  // Xác minh token công khai dành cho Bác sĩ (Không cần đăng nhập)
  verifyPublicShareToken: async (token) => {
    return await axiosClient.get(`/shares/verify/${token}`);
  },
};

export default shareService;
