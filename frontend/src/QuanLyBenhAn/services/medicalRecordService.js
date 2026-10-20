import axiosClient from './axiosClient';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api/v1';

export const medicalRecordService = {
  // Lấy danh sách bệnh án phân trang & bộ lọc
  getMedicalRecords: async (params = {}) => {
    return await axiosClient.get('/medical-records', { params });
  },

  getRecords: async (params = {}) => {
    return await axiosClient.get('/medical-records', { params });
  },

  // Chi tiết một đợt bệnh án
  getMedicalRecordById: async (id) => {
    return await axiosClient.get(`/medical-records/${id}`);
  },

  getRecord: async (id) => {
    return await axiosClient.get(`/medical-records/${id}`);
  },

  // Tạo bệnh án mới (Nội, Ngoại, Nhi, Sản)
  createMedicalRecord: async (data) => {
    return await axiosClient.post('/medical-records', data);
  },

  // Cập nhật bệnh án
  updateMedicalRecord: async (id, data) => {
    return await axiosClient.put(`/medical-records/${id}`, data);
  },

  // Thêm chỉ số sinh hiệu đo đạc
  addVitalSigns: async (recordId, data) => {
    return await axiosClient.post(`/medical-records/${recordId}/vital-signs`, data);
  },

  // Thêm luân chuyển khoa điều trị nội trú
  addDepartmentTransfer: async (recordId, data) => {
    return await axiosClient.post(`/medical-records/${recordId}/transfers`, data);
  },

  // Dòng thời gian Timeline điều trị
  getTimeline: async (recordId) => {
    return await axiosClient.get(`/medical-records/${recordId}/timeline`);
  },

  // Tải file PDF Bệnh án chuẩn A4 Bộ Y Tế (Download Blob)
  downloadPdf: async (recordId, recordCode = 'BENH_AN') => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/medical-records/${recordId}/export-pdf`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Tạo link tải file ảo
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${recordCode}_TomTatBenhAn.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportPdf: async (recordId, recordCode = 'BENH_AN') => {
    return await medicalRecordService.downloadPdf(recordId, recordCode);
  },
};

export default medicalRecordService;
