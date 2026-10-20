import React from 'react';
import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

export const StatusTag = ({ status }) => {
  const map = {
    // Lịch hẹn
    SCHEDULED: { color: 'processing', label: 'Đã Lên Lịch', icon: <ClockCircleOutlined /> },
    COMPLETED: { color: 'success', label: 'Đã Khám Xong', icon: <CheckCircleOutlined /> },
    CANCELLED: { color: 'default', label: 'Đã Hủy', icon: <CloseCircleOutlined /> },

    // Trạng thái tài khoản
    ACTIVE: { color: 'success', label: 'Hoạt Động', icon: <CheckCircleOutlined /> },
    LOCKED: { color: 'error', label: 'Đã Khóa', icon: <CloseCircleOutlined /> },

    // Trạng thái chia sẻ
    REVOKED: { color: 'default', label: 'Đã Thu Hồi', icon: <CloseCircleOutlined /> },

    // Bệnh án
    IN_TREATMENT: { color: 'warning', label: 'Đang Điều Trị', icon: <SyncOutlined spin /> },
    DISCHARGED: { color: 'success', label: 'Đã Ra Viện', icon: <CheckCircleOutlined /> },
  };

  const item = map[status] || { color: 'default', label: status || 'Chưa rõ', icon: null };

  return (
    <Tag color={item.color} icon={item.icon} style={{ borderRadius: 4, fontWeight: 500 }}>
      {item.label}
    </Tag>
  );
};

export default StatusTag;
