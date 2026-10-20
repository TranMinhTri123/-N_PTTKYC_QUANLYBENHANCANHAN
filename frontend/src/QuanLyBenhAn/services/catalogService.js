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
};

export default catalogService;
