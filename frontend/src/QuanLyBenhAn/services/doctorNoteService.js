import axiosClient from './axiosClient';

export const doctorNoteService = {
  // Thêm ghi chú bác sĩ (ROLE_DOCTOR hoặc ROLE_ADMIN)
  addNote: async (data) => {
    return await axiosClient.post('/doctor-notes', data);
  },

  // Lấy danh sách ghi chú theo bệnh án
  getNotesByRecord: async (medicalRecordId) => {
    return await axiosClient.get(`/doctor-notes/record/${medicalRecordId}`);
  },
};

export default doctorNoteService;
