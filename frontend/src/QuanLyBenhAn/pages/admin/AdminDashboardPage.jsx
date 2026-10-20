import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Space, Button, Progress, Alert } from 'antd';
import {
  TeamOutlined,
  MedicineBoxOutlined,
  BookOutlined,
  AuditOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import auditLogService from '../../services/auditLogService';
import catalogService from '../../services/catalogService';
import { formatDate, formatDateTime } from '../../utils/formatters';

const { Title, Text } = Typography;

export const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.allSettled([
        adminService.getAllUsers(),
        auditLogService.getLogs(0, 5),
      ]);

      if (usersRes.status === 'fulfilled') {
        const val = usersRes.value;
        const rawUsers = val?.data ?? val;
        const usersList = Array.isArray(rawUsers) ? rawUsers : (rawUsers?.content || []);
        setUsers(usersList);
      } else {
        console.error('Lỗi khi tải danh sách tài khoản:', usersRes.reason);
      }

      if (logsRes.status === 'fulfilled') {
        const val = logsRes.value;
        const rawLogs = val?.data ?? val;
        const logContent = rawLogs?.content || (Array.isArray(rawLogs) ? rawLogs : []);
        setAuditLogs(Array.isArray(logContent) ? logContent.slice(0, 5) : []);
      } else {
        console.error('Lỗi khi tải nhật ký kiểm toán:', logsRes.reason);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu dashboard admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalUsers = users.length;
  const totalDoctors = users.filter((u) => u.roles?.includes('ROLE_DOCTOR')).length;
  const totalAdmins = users.filter((u) => u.roles?.includes('ROLE_ADMIN')).length;
  const lockedUsers = users.filter((u) => u.accountLocked).length;

  // Thống kê bác sĩ theo khoa
  const departmentCounts = users
    .filter((u) => u.roles?.includes('ROLE_DOCTOR'))
    .reduce((acc, curr) => {
      const dept = curr.department || 'Chưa phân khoa';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Bảng Điều Khiển Quản Trị
          </Title>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
          Làm Mới
        </Button>
      </div>

      {/* 4 KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #3b82f6' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Tổng Số Tài Khoản</span>}
              value={totalUsers}
              prefix={<TeamOutlined style={{ color: '#3b82f6' }} />}
              suffix="người dùng"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #0f766e' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Bác Sĩ Điều Trị</span>}
              value={totalDoctors}
              prefix={<MedicineBoxOutlined style={{ color: '#0f766e' }} />}
              suffix="bác sĩ"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #10b981' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Quản Trị Viên</span>}
              value={totalAdmins}
              prefix={<SafetyCertificateOutlined style={{ color: '#10b981' }} />}
              suffix="tài khoản"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #ef4444' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Tài Khoản Bị Khóa</span>}
              value={lockedUsers}
              prefix={<AuditOutlined style={{ color: '#ef4444' }} />}
              suffix="tài khoản"
            />
          </Card>
        </Col>
      </Row>

      {/* Phân bổ khoa phòng & Nhật ký an ninh */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 600 }}>Phân Bổ Bác Sĩ Theo Khoa Phòng</span>}
            style={{ borderRadius: 10 }}
            extra={<Button type="link" onClick={() => navigate('/admin/users')}>Cấp Quyền Bác Sĩ</Button>}
          >
            {Object.keys(departmentCounts).length === 0 ? (
              <Alert message="Chưa có bác sĩ nào được phân bổ khoa phòng." type="info" showIcon />
            ) : (
              Object.entries(departmentCounts).map(([dept, count]) => {
                const percent = totalDoctors > 0 ? Math.round((count / totalDoctors) * 100) : 0;
                return (
                  <div key={dept} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text strong>{dept}</Text>
                      <Text type="secondary">{count} bác sĩ ({percent}%)</Text>
                    </div>
                    <Progress percent={percent} strokeColor="#0f766e" />
                  </div>
                );
              })
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 600 }}>Lịch Sử Kiểm Toán An Ninh Mới Nhất</span>}
            style={{ borderRadius: 10 }}
            extra={<Button type="link" onClick={() => navigate('/admin/audit-logs')}>Xem Toàn Bộ</Button>}
          >
            <Table
              size="small"
              dataSource={auditLogs}
              rowKey={(r) => r.id || Math.random()}
              pagination={false}
              columns={[
                {
                  title: 'Hành động',
                  dataIndex: 'action',
                  key: 'action',
                  render: (act) => {
                    let color = 'blue';
                    if (act?.includes('DELETE') || act?.includes('LOCK') || act?.includes('BLOCK')) color = 'error';
                    else if (act?.includes('CREATE') || act?.includes('ADD') || act?.includes('UNLOCK')) color = 'success';
                    else if (act?.includes('UPDATE') || act?.includes('ROLE') || act?.includes('EDIT')) color = 'warning';
                    return <Tag color={color}>{act || 'THAO_TAC'}</Tag>;
                  },
                },
                {
                  title: 'Thực thể',
                  dataIndex: 'entityName',
                  key: 'entityName',
                  render: (entityName, r) => entityName || r.tableName || 'SYSTEM',
                },
                {
                  title: 'Địa chỉ IP',
                  dataIndex: 'ipAddress',
                  key: 'ipAddress',
                  render: (ip) => ip || '127.0.0.1',
                },
                {
                  title: 'Thời gian',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (createdAt, r) => {
                    const time = createdAt || r.timestamp;
                    return time ? formatDateTime(time) : 'Vừa xong';
                  },
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;
