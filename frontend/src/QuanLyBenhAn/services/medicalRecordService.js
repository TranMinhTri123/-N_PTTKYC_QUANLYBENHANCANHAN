import axiosClient from './axiosClient';
import axios from 'axios';
import dayjs from 'dayjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api/v1';

// Chuẩn hóa payload bệnh án từ các form frontend sang chuẩn DTO Backend Spring Boot
const normalizeRecordPayload = (data) => {
  if (!data) return data;
  const payload = { ...data };

  // 1. visitDate (bắt buộc @NotNull @PastOrPresent)
  if (!payload.visitDate) {
    if (payload.admissionDate) {
      payload.visitDate = typeof payload.admissionDate === 'string'
        ? payload.admissionDate.split('T')[0]
        : dayjs(payload.admissionDate).format('YYYY-MM-DD');
    } else {
      payload.visitDate = dayjs().format('YYYY-MM-DD');
    }
  }

  // 2. departmentName
  if (!payload.departmentName && payload.department) {
    payload.departmentName = payload.department;
  }

  // 3. admissionType (@NotNull: INPATIENT | OUTPATIENT)
  if (!payload.admissionType || payload.admissionType === 'KHAM_BENH' || payload.admissionType === 'NGOAI_TRU') {
    payload.admissionType = 'OUTPATIENT';
  } else if (payload.admissionType === 'NOI_TRU') {
    payload.admissionType = 'INPATIENT';
  }

  // 4. admissionGate (EMERGENCY | EXAM_DEPT | TREATMENT_DEPT)
  if (!payload.admissionGate || payload.admissionGate === 'KHAM_BENH') {
    payload.admissionGate = 'EXAM_DEPT';
  } else if (payload.admissionGate === 'CAP_CUU') {
    payload.admissionGate = 'EMERGENCY';
  }

  // 5. chiefComplaint / lý do khám
  if (!payload.chiefComplaint && payload.reasonForAdmission) {
    payload.chiefComplaint = payload.reasonForAdmission;
  }

  // 6. primaryDiagnosis & primaryIcd10
  if (!payload.primaryDiagnosis && payload.admissionDiagnosis) {
    payload.primaryDiagnosis = payload.admissionDiagnosis;
  }
  if (!payload.primaryIcd10 && payload.icd10Code) {
    payload.primaryIcd10 = payload.icd10Code;
  }
  if (!payload.admissionIcd10 && payload.icd10Code) {
    payload.admissionIcd10 = payload.icd10Code;
  }

  // 7. Sinh hiệu vitalSigns
  if (payload.vitalSigns) {
    const vs = payload.vitalSigns;
    const w = (vs.weightKg !== undefined && vs.weightKg !== null) ? Number(vs.weightKg) : (vs.weight !== undefined && vs.weight !== null ? Number(vs.weight) : undefined);
    const h = (vs.heightCm !== undefined && vs.heightCm !== null) ? Number(vs.heightCm) : (vs.height !== undefined && vs.height !== null ? Number(vs.height) : undefined);
    
    let bmiVal = undefined;
    if (w && h && h > 0) {
      const hM = h / 100;
      bmiVal = Number((w / (hM * hM)).toFixed(1));
    }

    payload.vitalSigns = {
      pulse: vs.pulse ? Number(vs.pulse) : undefined,
      temperature: vs.temperature ? Number(vs.temperature) : undefined,
      systolicBp: (vs.systolicBp || vs.bloodPressureSystolic) ? Number(vs.systolicBp || vs.bloodPressureSystolic) : undefined,
      diastolicBp: (vs.diastolicBp || vs.bloodPressureDiastolic) ? Number(vs.diastolicBp || vs.bloodPressureDiastolic) : undefined,
      spo2: (vs.spo2 || vs.spO2) ? Number(vs.spo2 || vs.spO2) : undefined,
      weightKg: w,
      heightCm: h,
      bmi: bmiVal,
    };
  }

  return payload;
};

export const medicalRecordService = {
  normalizeRecordPayload,

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

  // Tạo bệnh án mới (Hỗ trợ cả createRecord và createMedicalRecord kèm chuẩn hóa dữ liệu)
  createRecord: async (data) => {
    const payload = normalizeRecordPayload(data);
    return await axiosClient.post('/medical-records', payload);
  },

  createMedicalRecord: async (data) => {
    const payload = normalizeRecordPayload(data);
    return await axiosClient.post('/medical-records', payload);
  },

  // Cập nhật bệnh án
  updateMedicalRecord: async (id, data) => {
    const payload = normalizeRecordPayload(data);
    return await axiosClient.put(`/medical-records/${id}`, payload);
  },

  updateRecord: async (id, data) => {
    const payload = normalizeRecordPayload(data);
    return await axiosClient.put(`/medical-records/${id}`, payload);
  },

  // Xóa mềm bệnh án
  deleteMedicalRecord: async (id) => {
    return await axiosClient.delete(`/medical-records/${id}`);
  },

  deleteRecord: async (id) => {
    return await axiosClient.delete(`/medical-records/${id}`);
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
