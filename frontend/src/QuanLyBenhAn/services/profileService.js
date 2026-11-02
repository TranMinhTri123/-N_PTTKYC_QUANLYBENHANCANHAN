import axiosClient from './axiosClient';

// Chuẩn hóa payload hồ sơ người thân khớp với DTO Backend Spring Boot
const normalizeProfilePayload = (data) => {
  if (!data) return data;
  const payload = { ...data };

  // 1. Map relationship enum (SELF, CHILD, PARENT, SPOUSE, OTHER)
  if (payload.relationship === 'FATHER' || payload.relationship === 'MOTHER' || payload.relationship === 'BO' || payload.relationship === 'ME') {
    payload.relationship = 'PARENT';
  } else if (payload.relationship === 'VO' || payload.relationship === 'CHONG') {
    payload.relationship = 'SPOUSE';
  } else if (payload.relationship === 'CON') {
    payload.relationship = 'CHILD';
  } else if (payload.relationship === 'BAN_THAN') {
    payload.relationship = 'SELF';
  } else if (!payload.relationship) {
    payload.relationship = 'OTHER';
  }

  // 2. Map CCCD / identityCardNumber
  if (!payload.cccd && payload.identityCardNumber) {
    payload.cccd = payload.identityCardNumber.trim();
  }
  if (!payload.identityCardNumber && payload.cccd) {
    payload.identityCardNumber = payload.cccd;
  }

  // 3. Map BHYT / healthInsuranceNumber
  if (!payload.bhytNumber && payload.healthInsuranceNumber) {
    payload.bhytNumber = payload.healthInsuranceNumber.trim();
  }
  if (!payload.healthInsuranceNumber && payload.bhytNumber) {
    payload.healthInsuranceNumber = payload.bhytNumber;
  }

  // 4. Map address / addressDetail
  if (!payload.addressDetail && payload.address) {
    payload.addressDetail = payload.address.trim();
  }
  if (!payload.address && payload.addressDetail) {
    payload.address = payload.addressDetail;
  }

  // 5. Gender uppercase
  if (payload.gender) {
    payload.gender = payload.gender.toUpperCase();
  }

  // 6. Insurance type default
  if (!payload.insuranceType) {
    payload.insuranceType = 'BHYT';
  }

  // 7. Map Phone & Emergency Contact
  if (!payload.phone && payload.phoneNumber) {
    payload.phone = payload.phoneNumber.trim();
  }
  if (!payload.phoneNumber && payload.phone) {
    payload.phoneNumber = payload.phone;
  }
  if (payload.emergencyContactPhone) {
    payload.emergencyContactPhone = payload.emergencyContactPhone.trim();
  }
  if (payload.emergencyContactName) {
    payload.emergencyContactName = payload.emergencyContactName.trim();
  }

  return payload;
};

export const profileService = {
  normalizeProfilePayload,

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
    const payload = normalizeProfilePayload(data);
    return await axiosClient.post('/profiles', payload);
  },

  // Cập nhật hồ sơ
  updateProfile: async (id, data) => {
    const payload = normalizeProfilePayload(data);
    return await axiosClient.put(`/profiles/${id}`, payload);
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
