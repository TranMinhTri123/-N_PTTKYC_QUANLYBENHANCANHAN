import axiosClient from './axiosClient';

export const clinicalService = {
  // 1. Xét nghiệm
  addLabTest: async (data) => {
    return await axiosClient.post('/clinical/lab-tests', data);
  },
  getLabTestsByRecord: async (medicalRecordId) => {
    return await axiosClient.get(`/clinical/lab-tests/record/${medicalRecordId}`);
  },
  deleteLabTest: async (id) => {
    return await axiosClient.delete(`/clinical/lab-tests/${id}`);
  },

  // 2. Chẩn đoán hình ảnh
  addImaging: async (data) => {
    return await axiosClient.post('/clinical/imaging', data);
  },
  getImagingByRecord: async (medicalRecordId) => {
    return await axiosClient.get(`/clinical/imaging/record/${medicalRecordId}`);
  },
  deleteImaging: async (id) => {
    return await axiosClient.delete(`/clinical/imaging/${id}`);
  },

  // 3. Tệp đính kèm
  addAttachment: async (data) => {
    return await axiosClient.post('/clinical/attachments', data);
  },
  getAttachmentsByRecord: async (medicalRecordId) => {
    return await axiosClient.get(`/clinical/attachments/record/${medicalRecordId}`);
  },
  deleteAttachment: async (id) => {
    return await axiosClient.delete(`/clinical/attachments/${id}`);
  },
};

export default clinicalService;
