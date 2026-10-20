import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Tag, Modal } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  HeartOutlined,
  CalendarOutlined,
  ShareAltOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SolutionOutlined,
  BookOutlined,
  AuditOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tạo danh sách menu theo chuẩn phân quyền RBAC
  const getMenuItems = () => {
    const items = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Bảng Điều Khiển',
      },
      {
        key: '/profiles',
        icon: <TeamOutlined />,
        label: 'Hồ Sơ Sức Khỏe',
      },
      {
        key: '/records',
        icon: <FileTextOutlined />,
        label: 'Bệnh Án Điện Tử',
      },
      {
        key: '/prescriptions',
        icon: <MedicineBoxOutlined />,
        label: 'Đơn Thuốc & Tủ Thuốc',
      },
      {
        key: '/clinical',
        icon: <ExperimentOutlined />,
        label: 'Cận Lâm Sàng & Tệp',
      },
      {
        key: '/metrics',
        icon: <HeartOutlined />,
        label: 'Chỉ Số Sức Khỏe',
      },
      {
        key: '/appointments',
        icon: <CalendarOutlined />,
        label: 'Lịch Hẹn & Tái Khám',
      },
      {
        key: '/shares',
        icon: <ShareAltOutlined />,
        label: 'Chia Sẻ Hồ Sơ',
      },
    ];

    // Menu dành riêng cho Bác sĩ (ROLE_DOCTOR hoặc ROLE_ADMIN)
    if (hasRole('ROLE_DOCTOR') || hasRole('ROLE_ADMIN')) {
      items.push({
        key: 'sub-doctor',
        icon: <SolutionOutlined />,
        label: 'Bàn Làm Việc Bác Sĩ',
        children: [
          {
            key: '/doctor/workspace',
            label: 'Đánh Giá & Nhận Xét Bác Sĩ',
          },
        ],
      });
    }

    // Menu dành riêng cho Quản trị viên (ROLE_ADMIN)
    if (hasRole('ROLE_ADMIN')) {
      items.push({
        key: 'sub-admin',
        icon: <AuditOutlined />,
        label: 'Quản Trị Hệ Thống',
        children: [
          {
            key: '/admin/users',
            icon: <TeamOutlined />,
            label: 'Quản Lý Người Dùng & Cấp Quyền',
          },
          {
            key: '/admin/catalogs',
            icon: <BookOutlined />,
            label: 'Danh Mục ICD-10 & Thuốc',
          },
          {
            key: '/admin/audit-logs',
            icon: <AuditOutlined />,
            label: 'Nhật Ký Kiểm Toán (Audit)',
          },
        ],
      });
    }

    return items;
  };

  // Xác nhận đăng xuất an toàn (Rule 2)
  const handleConfirmLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      icon: <ExclamationCircleOutlined style={{ color: '#ef4444' }} />,
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản lý bệnh án?',
      okText: 'Đăng xuất',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => logout(),
    });
  };

  // Menu Dropdown người dùng
  const userDropdownItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài Đặt & Đổi Mật Khẩu',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ef4444' }} />,
      label: <span style={{ color: '#ef4444' }}>Đăng Xuất</span>,
      onClick: handleConfirmLogout,
    },
  ];

  // Tag hiển thị vai trò người dùng
  const renderRoleBadge = () => {
    if (hasRole('ROLE_ADMIN')) {
      return <Tag color="purple">Quản Trị Viên</Tag>;
    }
    if (hasRole('ROLE_DOCTOR')) {
      return <Tag color="cyan">Bác Sĩ</Tag>;
    }
    return <Tag color="blue">Bệnh Nhân</Tag>;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={270}
        theme="light"
        style={{
          boxShadow: '1px 0 12px 0 rgba(15, 23, 42, 0.06)',
          zIndex: 20,
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        {/* Brand Logo in Sidebar */}
        <div
          style={{
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 22,
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
              }}
            >
              <MedicineBoxOutlined />
            </div>
            {!collapsed && (
              <div>
                <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2 }}>
                  PHR VIỆT NAM
                </span>
                <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 600, letterSpacing: '0.04em' }}>
                  HỒ SƠ BỆNH ÁN ĐIỆN TỬ
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Dynamic RBAC Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            onClick={({ key }) => {
              if (!key.startsWith('sub-')) {
                navigate(key);
              }
            }}
            style={{ borderRight: 0, fontWeight: 500 }}
          />
        </div>

        {/* Emergency Hotline mini card at bottom of Sider */}
        {!collapsed && (
          <div style={{ padding: '12px 16px', margin: '8px 12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MedicineBoxOutlined style={{ fontSize: 18, color: '#dc2626' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>CẤP CỨU Y TẾ: 115</div>
                <div style={{ fontSize: 11, color: '#7f1d1d' }}>Hỗ trợ y tế 24/7 toàn quốc</div>
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout style={{ background: '#f8fafc' }}>
        {/* Top Header */}
        <Header
          style={{
            padding: '0 28px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 15,
            height: 70,
          }}
        >
          {/* Toggle Sidebar Button & Status */}
          <Space size={16} align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, width: 40, height: 40, color: '#475569' }}
              aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
            />
            <Tag color="success" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600, fontSize: 12 }}>
              Máy chủ y tế: Trực tuyến
            </Tag>
          </Space>

          {/* User Account Controls */}
          <Space size={18} align="center">
            {renderRoleBadge()}

            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: 10, background: '#f1f5f9' }} align="center">
                <Avatar
                  style={{ backgroundColor: '#0284c7', verticalAlign: 'middle', fontWeight: 700 }}
                  icon={<UserOutlined />}
                >
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
                    {user?.fullName || 'Người Dùng'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11, color: '#64748b' }}>
                    {user?.email || ''}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Main View Area */}
        <Content
          style={{
            margin: '24px 28px 0',
            minHeight: 'calc(100vh - 180px)',
          }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>

          {/* Medical Disclaimer Box (Rule 10) */}
          <div className="medical-disclaimer-box" style={{ marginTop: 32, marginBottom: 16 }}>
            <strong>LƯU Ý PHÁP LÝ & Y KHOA:</strong> Ứng dụng Quản Lý Bệnh Án Cá Nhân (PHR) tuân thủ quy chuẩn quản lý hồ sơ sức khỏe điện tử theo <strong>Thông tư 46/2018/TT-BYT</strong> của Bộ Y Tế. Mọi thông tin chỉ có giá trị tra cứu, lưu trữ và hỗ trợ theo dõi sức khỏe gia đình; không thay thế cho quyết định chẩn đoán hoặc chỉ định điều trị trực tiếp của Bác sĩ chuyên khoa tại cơ sở khám chữa bệnh.
          </div>
        </Content>

        {/* Professional Footer */}
        <Footer style={{ textAlign: 'center', color: '#64748b', fontSize: 13, padding: '24px 28px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Hệ Thống Quản Lý Bệnh Án Cá Nhân & Sổ Sức Khỏe Gia Đình (PHR Việt Nam) © 2026
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Hệ thống tuân thủ tiêu chuẩn mã hóa bảo mật dữ liệu y tế quốc gia và khuyến nghị an toàn Bộ Y Tế
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
