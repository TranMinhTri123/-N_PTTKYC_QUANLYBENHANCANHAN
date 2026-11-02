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
    const payload = {
      profileId: data.profileId,
      permissionScope: data.permissionScope || data.scope || 'READ_ONLY',
      expireDays: data.expireDays || data.durationDays || 7,
      doctorEmail: data.doctorEmail,
      doctorUserId: data.doctorUserId,
    };
    return await axiosClient.post('/shares', payload);
  },

  // Thu hồi quyền chia sẻ
  revokeShare: async (id) => {
    return await axiosClient.delete(`/shares/${id}`);
  },

  // Xác minh token công khai dành cho Bác sĩ (Không cần đăng nhập)
  verifyPublicShareToken: async (token) => {
    return await axiosClient.get(`/shares/verify/${token}`);
  },

  // Danh sách hồ sơ chia sẻ cho bác sĩ hiện tại
  getSharedWithDoctor: async () => {
    return await axiosClient.get('/shares/doctor');
  },
};

export default shareService;
