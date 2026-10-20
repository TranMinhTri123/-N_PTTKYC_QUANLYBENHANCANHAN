import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Tag, Modal, Badge } from 'antd';
import {
  HeartFilled,
  DashboardOutlined,
  FileAddOutlined,
  BookOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  ShareAltOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  PhoneFilled,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

export const PatientLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/patient/dashboard',
      icon: <DashboardOutlined />,
      label: 'Bảng Điều Khiển',
    },
    {
      key: '/patient/records/create',
      icon: <FileAddOutlined />,
      label: 'Tạo Bệnh Án',
    },
    {
      key: '/patient/records',
      icon: <BookOutlined />,
      label: 'Sổ Bệnh Án',
    },
    {
      key: '/patient/profiles',
      icon: <TeamOutlined />,
      label: 'Hồ Sơ Người Thân',
    },
    {
      key: '/patient/prescriptions',
      icon: <MedicineBoxOutlined />,
      label: 'Tủ Thuốc Gia Đình',
    },
    {
      key: '/patient/metrics',
      icon: <HeartOutlined />,
      label: 'Chỉ Số Sức Khỏe',
    },
    {
      key: '/patient/appointments',
      icon: <CalendarOutlined />,
      label: 'Lịch Hẹn Khám',
    },
    {
      key: '/patient/clinical',
      icon: <ExperimentOutlined />,
      label: 'Xét Nghiệm & CĐHA',
    },
    {
      key: '/patient/shares',
      icon: <ShareAltOutlined />,
      label: 'Chia Sẻ Hồ Sơ',
    },
  ];

  const handleLogoutConfirm = () => {
    Modal.confirm({
      title: 'Đăng xuất khỏi Sổ Sức Khỏe Gia Đình?',
      icon: <ExclamationCircleOutlined style={{ color: '#ef4444' }} />,
      content: 'Bạn sẽ cần đăng nhập lại để tiếp tục quản lý hồ sơ.',
      okText: 'Đăng Xuất',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => logout(),
    });
  };

  const userMenu = {
    items: [
      ...(isDoctor()
        ? [
            {
              key: 'back_doctor',
              icon: <MedicineBoxOutlined style={{ color: '#0f766e' }} />,
              label: 'Về Bàn Làm Việc Bác Sĩ',
              onClick: () => navigate('/doctor/workspace'),
            },
            { type: 'divider' },
          ]
        : []),
      ...(isAdmin()
        ? [
            {
              key: 'back_admin',
              icon: <DashboardOutlined style={{ color: '#1e293b' }} />,
              label: 'Về Bàn Quản Trị Admin',
              onClick: () => navigate('/admin/dashboard'),
            },
            { type: 'divider' },
          ]
        : []),
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/account/profile">Hồ sơ cá nhân</Link>,
      },
      {
        key: 'notifications',
        icon: <BellOutlined />,
        label: <Link to="/notifications">Thông báo sức khỏe</Link>,
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        danger: true,
        label: 'Đăng xuất',
        onClick: handleLogoutConfirm,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider Sidebar Bệnh Nhân */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        theme="light"
        style={{
          boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.04)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          borderRight: '1px solid #f1f5f9',
        }}
      >
        {/* Brand Bệnh Nhân */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            gap: 12,
          }}
        >
          <HeartFilled style={{ fontSize: 26, color: '#0284c7' }} />
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ color: '#0284c7', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
                PHR GIA ĐÌNH
              </div>
              <div style={{ color: '#64748b', fontSize: 11 }}>Sổ Sức Khỏe Điện Tử</div>
            </div>
          )}
        </div>

        {/* Menu Navigation */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 8, borderRight: 0 }}
        />

        {/* Nút Tạo Nhanh Bệnh Án ở Sidebar */}
        {!collapsed && (
          <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
            <Button
              block
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => navigate('/patient/records/create')}
              style={{ borderRadius: 8, fontWeight: 600, height: 40, background: '#0284c7', borderColor: '#0284c7' }}
            >
              Tạo Bệnh Án
            </Button>
          </div>
        )}
      </Sider>

      <Layout>
        {/* Header Header Bệnh Nhân */}
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
            zIndex: 10,
          }}
        >
          <Space size={16}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <Button
              type="primary"
              danger
              icon={<PhoneFilled />}
              size="small"
              style={{ borderRadius: 6, fontWeight: 600 }}
              onClick={() => window.open('tel:115')}
            >
              Cấp Cứu 115
            </Button>
          </Space>

          <Space size={20}>
            {/* Nếu là Bác sĩ đang xem mode Bệnh nhân, hiển thị nút quay về */}
            {isDoctor() && (
              <Button
                type="dashed"
                size="small"
                onClick={() => navigate('/doctor/workspace')}
                style={{ color: '#0f766e', borderColor: '#0f766e', fontWeight: 600 }}
              >
                👨‍⚕️ Quay Lại Bàn Khám Bác Sĩ
              </Button>
            )}

            <Badge count={1} size="small">
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ fontSize: 18, color: '#64748b' }} />}
                onClick={() => navigate('/notifications')}
              />
            </Badge>

            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#0284c7' }}>
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ color: '#0f172a', fontWeight: 600, fontSize: 13 }}>
                    {user?.fullName || 'Người Dùng'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>Sổ sức khỏe cá nhân</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Body Patient */}
        <Content
          style={{
            margin: '24px',
            padding: 0,
            minHeight: 'calc(100vh - 150px)',
          }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Content>

        <Footer style={{ textAlign: 'center', color: '#64748b', fontSize: 12, padding: '16px' }}>
          Hệ Thống Quản Lý Bệnh Án Cá Nhân & Sức Khỏe Gia Đình (PHR Việt Nam) © 2026
        </Footer>
      </Layout>
    </Layout>
  );
};

export default PatientLayout;
