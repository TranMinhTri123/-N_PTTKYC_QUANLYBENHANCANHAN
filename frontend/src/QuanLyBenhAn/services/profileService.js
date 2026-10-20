import axiosClient from './axiosClient';

export const profileService = {
  // Lấy danh sách tất cả hồ sơ sức khỏe của gia đình (dạng danh sách)
  getProfiles: async () => {
    return await axiosClient.get('/profiles/all');
  },

  // Lấy chi tiết một hồ sơ kèm dị ứng, bệnh nền, tiền sử gia đình
  getProfileById: async (id) => {
    return await axiosClient.get(`/profiles/${id}`);
  },

  getProfile: async (id) => {
    return await axiosClient.get(`/profiles/${id}`);
  },

  // Tạo mới hồ sơ người thân
  createProfile: async (data) => {
    return await axiosClient.post('/profiles', data);
  },

  // Cập nhật hồ sơ
  updateProfile: async (id, data) => {
    return await axiosClient.put(`/profiles/${id}`, data);
  },

  // Xóa mềm hồ sơ
  deleteProfile: async (id) => {
    return await axiosClient.delete(`/profiles/${id}`);
  },

  // Dị ứng
  addAllergy: async (profileId, data) => {
    return await axiosClient.post(`/profiles/${profileId}/allergies`, data);
  },
  getAllergies: async (profileId) => {
    return await axiosClient.get(`/profiles/${profileId}/allergies`);
  },
  deleteAllergy: async (profileId, allergyId) => {
    return await axiosClient.delete(`/profiles/${profileId}/allergies/${allergyId}`);
  },

  // Bệnh mạn tính
  addChronicDisease: async (profileId, data) => {
    return await axiosClient.post(`/profiles/${profileId}/chronic-diseases`, data);
  },
  getChronicDiseases: async (profileId) => {
    return await axiosClient.get(`/profiles/${profileId}/chronic-diseases`);
  },
  deleteChronicDisease: async (profileId, diseaseId) => {
    return await axiosClient.delete(`/profiles/${profileId}/chronic-diseases/${diseaseId}`);
  },

  // Tiền sử gia đình
  addFamilyHistory: async (profileId, data) => {
    return await axiosClient.post(`/profiles/${profileId}/family-histories`, data);
  },
  getFamilyHistories: async (profileId) => {
    return await axiosClient.get(`/profiles/${profileId}/family-histories`);
  },
  deleteFamilyHistory: async (profileId, historyId) => {
    return await axiosClient.delete(`/profiles/${profileId}/family-histories/${historyId}`);
  },
};

export default profileService;
