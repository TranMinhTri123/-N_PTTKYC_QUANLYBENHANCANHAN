import axiosClient from './axiosClient';

export const doctorScheduleService = {
  // Lấy cấu hình ca trực tuần của bác sĩ hiện tại
  getMySchedules: async () => {
    return await axiosClient.get('/doctor-schedules/me');
  },

  // Cập nhật ca trực tuần
  updateMySchedules: async (schedules) => {
    return await axiosClient.put('/doctor-schedules/me', schedules);
  },

  // Lấy danh sách ngày nghỉ của bác sĩ hiện tại
  getMyLeaves: async () => {
    return await axiosClient.get('/doctor-leaves/me');
  },

  // Đăng ký ngày nghỉ mới
  createLeave: async (data) => {
    return await axiosClient.post('/doctor-leaves', data);
  },

  // Xóa ngày nghỉ
  deleteLeave: async (id) => {
    return await axiosClient.delete(`/doctor-leaves/${id}`);
  },

  // Lấy danh sách ngày nghỉ của 1 bác sĩ (Bệnh nhân gọi khi đặt lịch)
  getDoctorOffDates: async (doctorId) => {
    return await axiosClient.get(`/doctor-leaves/doctor/${doctorId}`);
  },

  // Lấy cấu hình ca trực tuần của 1 bác sĩ (Bệnh nhân gọi khi đặt lịch để đồng bộ ca sáng/chiều)
  getDoctorSchedules: async (doctorId) => {
    return await axiosClient.get(`/doctor-schedules/doctor/${doctorId}`);
  },
};

export default doctorScheduleService;

