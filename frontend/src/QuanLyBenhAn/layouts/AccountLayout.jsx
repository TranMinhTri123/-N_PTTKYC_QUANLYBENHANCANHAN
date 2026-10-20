import React from 'react';
import { Layout, Menu, Typography, Button, Space, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  KeyOutlined,
  BellOutlined,
  ArrowLeftOutlined,
  MedicineBoxFilled,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export const AccountLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getDefaultRoute } = useAuth();

  const menuItems = [
    {
      key: '/account/profile',
      icon: <UserOutlined />,
      label: 'Hồ Sơ Tài Khoản',
    },
    {
      key: '/account/change-password',
      icon: <KeyOutlined />,
      label: 'Đổi Mật Khẩu',
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: 'Trung Tâm Thông Báo',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Header
        style={{
          background: '#ffffff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <Space size={12}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(getDefaultRoute())}
          >
            Quay Về Trang Chính
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MedicineBoxFilled style={{ color: '#0284c7', fontSize: 22 }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
              Cài Đặt Tài Khoản & Bảo Mật
            </span>
          </div>
        </Space>

        <Space size={10}>
          <Avatar style={{ backgroundColor: '#0284c7' }}>
            {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Avatar>
          <Text strong>{user?.fullName || user?.email}</Text>
        </Space>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <Layout style={{ background: '#ffffff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
          <Sider width={220} style={{ background: '#ffffff', borderRight: '1px solid #f1f5f9' }}>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ borderRight: 0 }}
            />
          </Sider>
          <Content style={{ padding: '0 24px', minHeight: 480 }}>
            <Outlet />
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};

export default AccountLayout;
