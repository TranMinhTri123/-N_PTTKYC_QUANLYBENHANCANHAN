import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Tag, Modal, Badge } from 'antd';
import {
  MedicineBoxFilled,
  SolutionOutlined,
  FileAddOutlined,
  FormOutlined,
  ExperimentOutlined,
  TeamOutlined,
  CommentOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import ErrorBoundary from '../components/ErrorBoundary';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

export const DoctorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, switchMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationItems, setNotificationItems] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await appointmentService.getAppointments();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        const today = dayjs().startOf('day');

        const pending = list.filter((a) => a.status === 'PENDING');
        const todayAppts = list.filter(
          (a) =>
            (a.status === 'CONFIRMED' || a.status === 'SCHEDULED') &&
            a.appointmentTime &&
            dayjs(a.appointmentTime).isSame(today, 'day')
        );
        const cancelled = list.filter((a) => a.status === 'CANCELLED');

        const items = [];
        if (pending.length > 0) {
          items.push({
            key: 'pending',
            label: (
              <div onClick={() => navigate('/doctor/appointments')} style={{ padding: '4px 0' }}>
                <Badge status="warning" /> <strong>{pending.length} yêu cầu lịch mới</strong> chờ tiếp nhận
              </div>
            ),
          });
        }
        if (todayAppts.length > 0) {
          items.push({
            key: 'today',
            label: (
              <div onClick={() => navigate('/doctor/appointments')} style={{ padding: '4px 0' }}>
                <Badge status="processing" /> <strong>{todayAppts.length} ca khám hôm nay</strong> cần thực hiện
              </div>
            ),
          });
        }
        if (cancelled.length > 0) {
          items.push({
            key: 'cancelled',
            label: (
              <div onClick={() => navigate('/doctor/appointments')} style={{ padding: '4px 0' }}>
                <Badge status="error" /> {cancelled.length} lịch khám đã từ chối / hủy
              </div>
            ),
          });
        }

        if (items.length === 0) {
          items.push({
            key: 'empty',
            label: <div style={{ color: '#64748b', padding: '6px 0' }}>Không có thông báo mới</div>,
          });
        }

        items.push({ type: 'divider' });
        items.push({
          key: 'all',
          label: (
            <div
              onClick={() => navigate('/doctor/appointments')}
              style={{ textAlign: 'center', color: '#0f766e', fontWeight: 600, padding: '4px 0' }}
            >
              Mở Danh Sách Lịch Hẹn Khám →
            </div>
          ),
        });

        setNotificationItems(items);
        setNotificationCount(pending.length + todayAppts.length);
      } catch (err) {
        console.warn('Lỗi tải thông báo lịch:', err);
      }
    };
    loadAlerts();
  }, [location.pathname]);

  const menuItems = [
    {
      key: '/doctor/workspace',
      icon: <SolutionOutlined />,
      label: 'Bàn Khám Bệnh',
    },
    {
      key: '/doctor/appointments',
      icon: <CalendarOutlined />,
      label: 'Lịch Hẹn Khám',
    },
    {
      key: '/doctor/schedule',
      icon: <ScheduleOutlined />,
      label: 'Lịch & Ca Làm Việc',
    },
    {
      key: '/doctor/dashboard',
      icon: <MedicineBoxFilled />,
      label: 'Tổng Quan Ca Trực',
    },
    {
      key: '/doctor/records/create',
      icon: <FileAddOutlined />,
      label: 'Lập Bệnh Án',
    },
    {
      key: '/doctor/prescriptions/create',
      icon: <FormOutlined />,
      label: 'Kê Đơn Thuốc',
    },
    {
      key: '/doctor/clinical/review',
      icon: <ExperimentOutlined />,
      label: 'Duyệt Cận Lâm Sàng',
    },
    {
      key: '/doctor/patients',
      icon: <TeamOutlined />,
      label: 'Danh Sách Bệnh Nhân',
    },
    {
      key: '/doctor/profile',
      icon: <UserOutlined />,
      label: 'Hồ Sơ Bác Sĩ',
    },
    {
      key: '/doctor/notes',
      icon: <CommentOutlined />,
      label: 'Ghi Chú Chuyên Môn',
    },
  ];

  const handleLogoutConfirm = () => {
    Modal.confirm({
      title: 'Đăng xuất khỏi Bàn Làm Việc Bác Sĩ?',
      icon: <ExclamationCircleOutlined style={{ color: '#ef4444' }} />,
      content: 'Hãy lưu lại toàn bộ y lệnh trước khi rời khỏi ca trực.',
      okText: 'Đăng Xuất',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => logout(),
    });
  };

  const handleSwitchToPatientMode = () => {
    switchMode('patient');
    navigate('/patient/dashboard');
  };

  const userMenu = {
    items: [
      {
        key: 'switch_patient',
        icon: <HomeOutlined />,
        label: 'Xem Sổ Sức Khỏe Gia Đình Của Tôi',
        onClick: handleSwitchToPatientMode,
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/doctor/profile">Hồ sơ bác sĩ</Link>,
      },
      {
        key: 'notifications',
        icon: <BellOutlined />,
        label: <Link to="/notifications">Thông báo y tế</Link>,
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        danger: true,
        label: 'Đăng xuất ca trực',
        onClick: handleLogoutConfirm,
      },
    ],
  };

  const doctorDepartment = user?.department || 'Khoa Nội Tổng Hợp';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider Sidebar Bác Sĩ */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        theme="light"
        style={{
          boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          borderRight: '1px solid #e2e8f0',
        }}
      >
        {/* Brand Bác Sĩ */}
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
          <MedicineBoxFilled style={{ fontSize: 26, color: '#0f766e' }} />
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ color: '#0f766e', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>
                DOCTOR WORKSPACE
              </div>
              <div style={{ color: '#64748b', fontSize: 11 }}>Bàn Làm Việc Bác Sĩ</div>
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

        {/* Nút chuyển sang chế độ Sức Khỏe Gia Đình (Theo Quyết định đã duyệt) */}
        {!collapsed && (
          <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
            <Button
              block
              type="primary"
              ghost
              icon={<HomeOutlined />}
              onClick={handleSwitchToPatientMode}
              style={{ borderColor: '#0284c7', color: '#0284c7', borderRadius: 8 }}
            >
              Sổ Sức Khỏe Cá Nhân
            </Button>
          </div>
        )}
      </Sider>

      <Layout>
        {/* Header Bác Sĩ */}
        <Header
          style={{
            padding: '0 24px',
            background: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color="cyan" style={{ fontWeight: 600, fontSize: 12, padding: '2px 8px' }}>
                👨‍⚕️ BÁC SĨ ĐIỀU TRỊ
              </Tag>
              <span style={{ color: '#ffffff', fontWeight: 600, fontSize: 14 }}>
                {doctorDepartment}
              </span>
            </div>
          </Space>

          <Space size={20}>
            {/* Nút chuyển đổi nhanh trên header */}
            <Button
              type="default"
              size="small"
              icon={<HomeOutlined />}
              onClick={handleSwitchToPatientMode}
              style={{
                borderRadius: 6,
                fontWeight: 600,
                color: '#0f766e',
                background: '#ffffff',
                border: 'none',
              }}
            >
              Chuyển Sang Sổ Cá Nhân
            </Button>

            <Dropdown menu={{ items: notificationItems }} placement="bottomRight" arrow>
              <Badge count={notificationCount} size="small" offset={[-2, 4]}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ color: '#ffffff', fontSize: 18 }} />}
                />
              </Badge>
            </Dropdown>

            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#ffffff', color: '#0f766e', fontWeight: 700 }}>
                  BS
                </Avatar>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: 13 }}>
                    {user?.fullName || 'Bác sĩ điều trị'}
                  </div>
                  <div style={{ color: '#ccfbf1', fontSize: 11 }}>Trạng thái: Sẵn sàng khám</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Body Doctor */}
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
          Hệ Thống Quản Lý Bệnh Án Cá Nhân (PHR Việt Nam) © 2026 - Phân Hệ Bác Sĩ Điều Trị Chuẩn Y Khoa
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DoctorLayout;
