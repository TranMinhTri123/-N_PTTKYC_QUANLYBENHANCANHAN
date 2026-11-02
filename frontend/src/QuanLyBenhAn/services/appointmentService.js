import axiosClient from './axiosClient';

const normalizeAppointmentPayload = (data) => {
  if (!data) return data;
  const payload = { ...data };

  // Map hospitalName -> facilityName
  if (!payload.facilityName && payload.hospitalName) {
    payload.facilityName = payload.hospitalName;
  }

  // Map doctor / attendingDoctor -> doctorName
  if (!payload.doctorName) {
    payload.doctorName = payload.doctor || payload.attendingDoctor || 'BS. Chuyên khoa';
  }

  // Map appointmentType to backend Enum: FOLLOW_UP, VACCINE, PRENATAL, MEDICATION, OTHER
  const typeMap = {
    TAI_KHAM: 'FOLLOW_UP',
    FOLLOW_UP: 'FOLLOW_UP',
    TIEM_CHUNG: 'VACCINE',
    VACCINE: 'VACCINE',
    KHAM_THAI: 'PRENATAL',
    PRENATAL: 'PRENATAL',
    NHAN_THUOC: 'MEDICATION',
    MEDICATION: 'MEDICATION',
    OTHER: 'OTHER',
  };
  payload.appointmentType = typeMap[payload.appointmentType] || 'FOLLOW_UP';

  return payload;
};

export const appointmentService = {
  // Lấy danh sách lịch hẹn
  getAppointments: async (profileId = null) => {
    const params = profileId ? { profileId } : {};
    return await axiosClient.get('/appointments', { params });
  },

  // Danh sách lịch hẹn sắp tới
  getUpcoming: async () => {
    return await axiosClient.get('/appointments/upcoming');
  },

  getUpcomingAppointments: async () => {
    return await axiosClient.get('/appointments/upcoming');
  },

  // Đặt lịch khám mới
  createAppointment: async (data) => {
    const payload = normalizeAppointmentPayload(data);
    return await axiosClient.post('/appointments', payload);
  },

  // Cập nhật trạng thái lịch hẹn (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED)
  updateStatus: async (id, status) => {
    return await axiosClient.put(`/appointments/${id}/status`, null, {
      params: { status },
    });
  },

  updateAppointmentStatus: async (id, status) => {
    return await axiosClient.put(`/appointments/${id}/status`, null, {
      params: { status },
    });
  },

  deleteAppointment: async (id) => {
    return await axiosClient.delete(`/appointments/${id}`);
  },

  // Bác sĩ xử lý xếp lịch: CONFIRM, RESCHEDULE, REJECT
  doctorAction: async (id, data) => {
    return await axiosClient.post(`/appointments/${id}/doctor-action`, data);
  },
};

export default appointmentService;
