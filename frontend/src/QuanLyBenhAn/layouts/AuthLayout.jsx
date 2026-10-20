import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Card, Typography, Space } from 'antd';
import { MedicineBoxFilled, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Space align="center" size={12}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 26,
                boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.35)',
              }}
            >
              <MedicineBoxFilled />
            </div>
            <div style={{ textAlign: 'left' }}>
              <Title level={3} style={{ margin: 0, color: '#0f172a', letterSpacing: '-0.03em' }}>
                PHR VIỆT NAM
              </Title>
              <Text style={{ fontSize: 13, color: '#0284c7', fontWeight: 600 }}>
                Hệ Thống Quản Lý Bệnh Án Cá Nhân
              </Text>
            </div>
          </Space>
        </Link>
      </div>

      {/* Main Auth Form Container Card */}
      <Card
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          border: '1px solid #e2e8f0',
        }}
        styles={{ body: { padding: '32px 28px' } }}
      >
        <Outlet />
      </Card>

      {/* Security & Standard Notice */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Space size={6} style={{ color: '#64748b', fontSize: 13 }}>
          <SafetyCertificateOutlined style={{ color: '#10b981' }} />
          <span>Bảo mật dữ liệu y tế theo chuẩn Bộ Y Tế Việt Nam</span>
        </Space>
      </div>
    </div>
  );
};

export default AuthLayout;
