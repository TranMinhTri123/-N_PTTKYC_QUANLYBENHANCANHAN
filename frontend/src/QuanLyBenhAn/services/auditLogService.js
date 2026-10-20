import axiosClient from './axiosClient';

export const auditLogService = {
  // Lấy nhật ký kiểm toán (ROLE_ADMIN)
  getLogs: async (page = 0, size = 20) => {
    return await axiosClient.get('/audit-logs', {
      params: { page, size, sort: 'createdAt,desc' },
    });
  },

  // Alias hỗ trợ truyền object { page, size }
  getAuditLogs: async (params = {}) => {
    const page = params?.page !== undefined ? params.page : 0;
    const size = params?.size !== undefined ? params.size : 20;
    return await axiosClient.get('/audit-logs', {
      params: { page, size, sort: 'createdAt,desc' },
    });
  },
};

export default auditLogService;
