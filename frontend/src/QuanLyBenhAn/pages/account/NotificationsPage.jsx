import React from 'react';
import { List, Typography, Tag, Avatar, Badge, Card, Space, Button } from 'antd';
import {
  BellOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export const NotificationsPage = () => {
  const { user, isDoctor, isAdmin } = useAuth();

  // Dữ liệu thông báo giả lập sinh động theo vai trò người dùng
  const notifications = [
    {
      id: 1,
      type: 'APPOINTMENT',
      title: 'Nhắc Lịch Khám & Tái Khám',
      desc: 'Bạn có lịch tái khám chuyên khoa tại Bệnh viện Bạch Mai vào lúc 08:30 sáng mai. Vui lòng nhịn ăn sáng để làm xét nghiệm máu.',
      time: '1 giờ trước',
      read: false,
      icon: <CalendarOutlined style={{ color: '#0284c7' }} />,
    },
    {
      id: 2,
      type: 'ALLERGY',
      title: 'Cảnh Báo An Toàn Dược Lý',
      desc: 'Hồ sơ của bạn đã ghi nhận tiền sử phản ứng dị ứng mức độ nặng với nhóm kháng sinh Beta-lactam (Penicillin). Hãy chú ý thông báo cho bác sĩ điều trị.',
      time: 'Hôm qua',
      read: false,
      icon: <AlertOutlined style={{ color: '#ef4444' }} />,
    },
    {
      id: 3,
      type: 'SYSTEM',
      title: 'Cập Nhật Hệ Thống PHR 2026',
      desc: 'Hệ thống đã nâng cấp toàn diện giao diện 3 Phân hệ: Quản trị viên, Bác sĩ điều trị và Bệnh nhân theo chuẩn Bộ Y Tế.',
      time: '3 ngày trước',
      read: true,
      icon: <MedicineBoxOutlined style={{ color: '#10b981' }} />,
    },
  ];

  if (isDoctor()) {
    notifications.unshift({
      id: 10,
      type: 'CLINICAL',
      title: 'Bệnh Nhân Mới Cần Tiếp Nhận',
      desc: 'Bệnh nhân Trần Thị B (Mã BA: BA-2026-0042) đã được chỉ định vào bàn khám của bạn tại Khoa Ngoại.',
      time: '15 phút trước',
      read: false,
      icon: <MedicineBoxOutlined style={{ color: '#0f766e' }} />,
    });
  }

  if (isAdmin()) {
    notifications.unshift({
      id: 20,
      type: 'AUDIT',
      title: 'Giám Sát Kiểm Toán Hệ Thống (HIPAA)',
      desc: 'Phát hiện thao tác cấp quyền ROLE_DOCTOR thành công cho tài khoản doctor@phr.vn. Đã ghi nhận vết IP 127.0.0.1.',
      time: '30 phút trước',
      read: false,
      icon: <CheckCircleOutlined style={{ color: '#3b82f6' }} />,
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Trung Tâm Thông Báo Y Tế
          </Title>
          <Text type="secondary">Cập nhật lịch khám, cảnh báo dược lý và sự kiện hệ thống</Text>
        </div>
        <Button size="small">Đánh dấu tất cả đã đọc</Button>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <Card
            size="small"
            style={{
              marginBottom: 10,
              borderRadius: 8,
              borderLeft: !item.read ? '4px solid #0284c7' : '1px solid #e2e8f0',
              background: !item.read ? '#f8fafc' : '#ffffff',
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar style={{ backgroundColor: '#e2e8f0' }} icon={item.icon} />
              }
              title={
                <Space>
                  <Text strong={!item.read}>{item.title}</Text>
                  {!item.read && <Badge status="processing" />}
                </Space>
              }
              description={
                <div>
                  <div style={{ color: '#475569', fontSize: 13, marginBottom: 4 }}>
                    {item.desc}
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {item.time}
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      />
    </div>
  );
};

export default NotificationsPage;
