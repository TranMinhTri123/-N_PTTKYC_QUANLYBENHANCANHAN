import React from 'react';
import { Typography, Descriptions, Tag, Card, Avatar, Space, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, SafetyCertificateOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

export const ProfileSettingsPage = () => {
  const { user } = useAuth();

  return (
    <div>
      <Title level={4} style={{ marginBottom: 4 }}>
        Hồ Sơ Định Danh Cá Nhân
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        Thông tin tài khoản đăng nhập trên hệ thống Quản lý bệnh án cá nhân (PHR)
      </Text>

      <Card style={{ borderRadius: 12, marginBottom: 20, background: '#f8fafc' }}>
        <Space size={16} align="center">
          <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#0284c7' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user?.fullName || 'Người Dùng'}
            </Title>
            <Text type="secondary">{user?.email}</Text>
            <div style={{ marginTop: 6 }}>
              {user?.roles?.map((r) => {
                const color = r === 'ROLE_ADMIN' ? 'red' : r === 'ROLE_DOCTOR' ? 'cyan' : 'blue';
                const label = r === 'ROLE_ADMIN' ? 'Quản Trị Viên' : r === 'ROLE_DOCTOR' ? 'Bác Sĩ Điều Trị' : 'Bệnh Nhân';
                return (
                  <Tag color={color} key={r} style={{ fontWeight: 600 }}>
                    {label}
                  </Tag>
                );
              })}
            </div>
          </div>
        </Space>
      </Card>

      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
        <Descriptions.Item label={<span><MailOutlined /> Địa chỉ Email</span>}>
          {user?.email || '-'}
        </Descriptions.Item>
        <Descriptions.Item label={<span><PhoneOutlined /> Số điện thoại</span>}>
          {user?.phone || 'Chưa cập nhật'}
        </Descriptions.Item>
        <Descriptions.Item label={<span><CalendarOutlined /> Ngày sinh</span>}>
          {user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Chưa cập nhật'}
        </Descriptions.Item>
        <Descriptions.Item label={<span><SafetyCertificateOutlined /> Trạng thái tài khoản</span>}>
          <Tag color="success">Đang hoạt động</Tag>
        </Descriptions.Item>

        {user?.department && (
          <Descriptions.Item label={<span><MedicineBoxOutlined /> Khoa công tác chuyên môn</span>} span={2}>
            <Tag color="cyan" style={{ fontSize: 13, padding: '4px 10px' }}>
              👨‍⚕️ {user.department}
            </Tag>
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );
};

export default ProfileSettingsPage;
