import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Tag, Modal, Badge } from 'antd';
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  BookOutlined,
  AuditOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateFilled,
  BellOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Bảng Điều Khiển',
    },
    {
      key: '/admin/users',
      icon: <UsergroupAddOutlined />,
      label: 'Quản Lý Người Dùng',
    },
    {
      key: '/admin/catalogs',
      icon: <BookOutlined />,
      label: 'Danh Mục Y Tế',
    },
    {
      key: '/admin/audit-logs',
      icon: <AuditOutlined />,
      label: 'Nhật Ký Kiểm Toán',
    },
    {
      key: '/admin/system-settings',
      icon: <SettingOutlined />,
      label: 'Cấu Hình Hệ Thống',
    },
  ];

  const handleLogoutConfirm = () => {
    Modal.confirm({
      title: 'Đăng xuất khỏi Trung Tâm Quản Trị?',
      icon: <ExclamationCircleOutlined style={{ color: '#ef4444' }} />,
      content: 'Bạn sẽ cần đăng nhập lại với quyền Quản trị viên để truy cập.',
      okText: 'Đăng Xuất',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => logout(),
    });
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/account/profile">Hồ sơ cá nhân</Link>,
      },
      {
        key: 'notifications',
        icon: <BellOutlined />,
        label: <Link to="/notifications">Thông báo hệ thống</Link>,
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
      {/* Sider Sidebar Admin */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        theme="dark"
        style={{
          background: '#0f172a',
          boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.15)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
        }}
      >
        {/* Brand Admin */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            background: '#1e293b',
            borderBottom: '1px solid #334155',
            gap: 12,
          }}
        >
          <SafetyCertificateFilled style={{ fontSize: 24, color: '#38bdf8' }} />
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>
                ADMIN CONSOLE
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>Trung Tâm Quản Trị PHR</div>
            </div>
          )}
        </div>

        {/* Menu Navigation */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: '#0f172a',
            marginTop: 8,
            borderRight: 0,
          }}
        />

        {/* Quick Back to Patient Portal if needed */}
        {!collapsed && (
          <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
            <Button
              block
              type="dashed"
              style={{ color: '#94a3b8', borderColor: '#334155' }}
              onClick={() => navigate('/patient/dashboard')}
            >
              👁️ Xem Giao Diện Bệnh Nhân
            </Button>
          </div>
        )}
      </Sider>

      <Layout>
        {/* Header Header Admin */}
        <Header
          style={{
            padding: '0 24px',
            background: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
            zIndex: 10,
          }}
        >
          <Space size={16}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: '#ffffff', fontSize: 16 }}
            />
            <Tag color="red" style={{ fontWeight: 600, padding: '2px 8px' }}>
              🛡️ QUẢN TRỊ VIÊN HỆ THỐNG
            </Tag>
          </Space>

          <Space size={20}>
            <Badge count={2} size="small">
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ color: '#ffffff', fontSize: 18 }} />}
                onClick={() => navigate('/notifications')}
              />
            </Badge>

            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#ef4444' }}>AD</Avatar>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: 13 }}>
                    {user?.fullName || 'Super Administrator'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>{user?.email || 'admin@phr.vn'}</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Body Admin */}
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
          Hệ Thống Quản Lý Bệnh Án Cá Nhân (PHR Việt Nam) © 2026 - Phân Hệ Quản Trị An Ninh & Phân Quyền
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
