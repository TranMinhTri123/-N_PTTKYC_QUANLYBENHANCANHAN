import axiosClient from './axiosClient';

export const metricService = {
  // Nhập số đo chỉ số sức khỏe tại nhà
  recordMetric: async (data) => {
    return await axiosClient.post('/metrics', data);
  },

  // Lấy lịch sử chỉ số sức khỏe
  getMetrics: async (params = {}) => {
    if (params?.profileId) {
      return await axiosClient.get(`/metrics/profile/${params.profileId}`, {
        params: params.type ? { type: params.type } : {},
      });
    }
    return { data: [] };
  },

  // Lấy lịch sử chỉ số sức khỏe theo hồ sơ
  getMetricsByProfile: async (profileId, type = null) => {
    if (!profileId) return { data: [] };
    const params = type ? { type } : {};
    return await axiosClient.get(`/metrics/profile/${profileId}`, { params });
  },

  // Dashboard tóm tắt các chỉ số gần nhất
  getMetricSummary: async (profileId) => {
    if (!profileId) return { data: null };
    return await axiosClient.get(`/metrics/profile/${profileId}/summary`);
  },
};

export default metricService;
