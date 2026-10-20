import axiosClient from './axiosClient';

export const prescriptionService = {
  // Lấy danh sách đơn thuốc theo bệnh án
  getByMedicalRecordId: async (recordId) => {
    if (!recordId) return { data: [] };
    return await axiosClient.get(`/prescriptions/record/${recordId}`);
  },

  // Chi tiết đơn thuốc
  getById: async (id) => {
    return await axiosClient.get(`/prescriptions/${id}`);
  },

  // Kê đơn thuốc mới (hệ thống tự động kiểm tra cảnh báo dị ứng chéo)
  createPrescription: async (data) => {
    return await axiosClient.post('/prescriptions', data);
  },

  // Tủ thuốc đang dùng của bệnh nhân
  getActiveMedications: async (profileId) => {
    if (!profileId || profileId === 'undefined') {
      return { data: [] };
    }
    return await axiosClient.get(`/prescriptions/profile/${profileId}/active-medications`);
  },

  // Tra cứu danh mục thuốc quốc gia
  searchMedicines: async (keyword) => {
    return await axiosClient.get('/medicines/search', {
      params: { query: keyword },
    });
  },

  // Tra cứu danh mục ICD-10
  searchIcd10: async (keyword) => {
    return await axiosClient.get('/catalogs/icd10', {
      params: { keyword },
    });
  },
};

export default prescriptionService;
