import axiosClient from './axiosClient';

export const catalogService = {
  // Tra cứu ICD-10
  searchIcd10: async (keyword = '', page = 0, size = 20) => {
    return await axiosClient.get('/catalogs/icd10/search', {
      params: { keyword, page, size },
    });
  },

  getAllIcd10: async () => {
    return await axiosClient.get('/catalogs/icd10/all');
  },

  createIcd10: async (data) => {
    return await axiosClient.post('/catalogs/icd10', data);
  },

  // Danh mục thuốc
  searchMedicines: async (keyword = '') => {
    return await axiosClient.get('/catalogs/medicines/search', {
      params: { keyword },
    });
  },

  createMedicine: async (data) => {
    return await axiosClient.post('/catalogs/medicines', data);
  },

  // Danh mục Bác sĩ (Lấy từ tài khoản thật trong database)
  getDoctors: async (params = {}) => {
    return await axiosClient.get('/catalogs/doctors', { params });
  },

  // Tra cứu thuốc mở rộng (openFDA & NIH RxTerms)
  searchExternalDrugs: async (keyword = '', source = 'ALL') => {
    return await axiosClient.get('/catalogs/external/drugs/search', {
      params: { keyword, source },
    });
  },

  // Tra cứu chi tiết an toàn dược lý, chỉ định, chống chỉ định, liều dùng và tương tác từ openFDA
  getDrugSafetyDetails: async (drugName) => {
    return await axiosClient.get('/catalogs/external/drugs/safety-details', {
      params: { drugName },
    });
  },

  // Tra cứu bệnh và mã chẩn đoán từ WHO ICD-11 & ICD-10
  searchExternalDiseases: async (keyword = '') => {
    return await axiosClient.get('/catalogs/external/diseases/search', {
      params: { keyword },
    });
  },
};

export default catalogService;
