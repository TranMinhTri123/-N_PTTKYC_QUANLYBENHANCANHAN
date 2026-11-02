import axiosClient from './axiosClient';
import dayjs from 'dayjs';

const normalizePrescriptionPayload = (data) => {
  if (!data) return data;
  const payload = { ...data };

  // 1. prescriptionDate
  if (!payload.prescriptionDate) {
    payload.prescriptionDate = dayjs().format('YYYY-MM-DD');
  }

  // 2. diagnosisSummary
  if (!payload.diagnosisSummary && payload.diagnosis) {
    payload.diagnosisSummary = payload.diagnosis;
  }

  // 3. notes
  if (!payload.notes && payload.doctorAdvice) {
    payload.notes = payload.doctorAdvice;
  }

  // 4. items
  if (Array.isArray(payload.items)) {
    payload.items = payload.items.map((item) => {
      const dosageAmount = item.dosageAmount || item.dosage || '1 viên';
      const dosageUnit = item.dosageUnit || item.unit || 'Viên';
      const frequencyPerDay = item.frequencyPerDay || item.frequency || '2 lần/ngày (sáng 1, tối 1)';
      const daysCount = item.daysCount ? Number(item.daysCount) : (item.durationDays ? Number(item.durationDays) : 7);
      const usageInstructions = item.usageInstructions || item.instructions || 'Uống sau ăn no';
      const administrationRoute = item.administrationRoute || 'ORAL';

      return {
        medicineId: item.medicineId || undefined,
        medicineName: item.medicineName?.trim() || 'Thuốc điều trị',
        activeIngredient: item.activeIngredient?.trim() || '',
        dosageAmount,
        dosageUnit,
        frequencyPerDay,
        administrationRoute,
        daysCount,
        usageInstructions,
      };
    });
  }

  return payload;
};

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
    const payload = normalizePrescriptionPayload(data);
    return await axiosClient.post('/prescriptions', payload);
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
    return await axiosClient.get('/catalogs/icd10/search', {
      params: { keyword },
    });
  },
};

export default prescriptionService;
