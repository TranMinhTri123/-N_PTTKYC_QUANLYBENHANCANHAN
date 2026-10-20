import axiosClient from './axiosClient';

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
    return await axiosClient.post('/appointments', data);
  },

  // Cập nhật trạng thái lịch hẹn (SCHEDULED, COMPLETED, CANCELLED)
  updateStatus: async (id, status) => {
    return await axiosClient.put(`/appointments/${id}/status`, null, {
      params: { status },
    });
  },
};

export default appointmentService;
