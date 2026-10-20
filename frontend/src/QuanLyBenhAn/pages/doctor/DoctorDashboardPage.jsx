import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Table, Tag, Space, Alert, Badge } from 'antd';
import {
  SolutionOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  UserOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

export const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getUpcomingAppointments();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setAppointments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const doctorDepartment = user?.department || 'Khoa Nội Tổng Hợp';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Tổng Quan Ca Trực
          </Title>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUpcoming} loading={loading}>
            Làm Mới
          </Button>
          <Button type="primary" onClick={() => navigate('/doctor/workspace')} style={{ background: '#0f766e', borderColor: '#0f766e' }}>
            Bàn Khám Bệnh
          </Button>
        </Space>
      </div>

      {/* KPI Cards Ca Trực */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #0f766e' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Bệnh Nhân Chờ Khám</span>}
              value={appointments.length || 3}
              prefix={<ClockCircleOutlined style={{ color: '#0f766e' }} />}
              suffix="ca"
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #0284c7' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Đã Khám Hôm Nay</span>}
              value={12}
              prefix={<CheckCircleOutlined style={{ color: '#0284c7' }} />}
              suffix="ca"
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #ef4444' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Cần Duyệt Cận Lâm Sàng</span>}
              value={4}
              prefix={<AlertOutlined style={{ color: '#ef4444' }} />}
              suffix="kết quả"
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng Danh Sách Bệnh Nhân Chờ Khám */}
      <Card
        title={<span style={{ fontWeight: 600 }}>📋 Danh Sách Bệnh Nhân Đang Chờ Khám Tại Khoa</span>}
        style={{ borderRadius: 10 }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/doctor/records/create')}>
            Tạo Bệnh Án Khám Mới
          </Button>
        }
      >
        <Table
          dataSource={appointments}
          rowKey={(r) => r.id || Math.random()}
          pagination={false}
          columns={[
            {
              title: 'Mã Lịch Hẹn',
              dataIndex: 'id',
              key: 'id',
              render: (id) => <Text strong>#LH-{id}</Text>,
            },
            {
              title: 'Bệnh Nhân',
              dataIndex: 'patientName',
              key: 'patientName',
              render: (name, record) => (
                <Space>
                  <UserOutlined />
                  <Text strong>{name || record.title || 'Bệnh nhân'}</Text>
                </Space>
              ),
            },
            {
              title: 'Lý Do Khám',
              dataIndex: 'notes',
              key: 'notes',
              render: (notes, record) => notes || record.hospitalName || 'Khám tổng quát',
            },
            {
              title: 'Giờ Hẹn',
              dataIndex: 'appointmentTime',
              key: 'appointmentTime',
              render: (time) => (time ? formatDate(time) : 'Hôm nay'),
            },
            {
              title: 'Trạng Thái',
              dataIndex: 'status',
              key: 'status',
              render: () => <Tag color="processing">Chờ Khám</Tag>,
            },
            {
              title: 'Hành Động',
              key: 'action',
              render: (_, record) => (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => navigate('/doctor/workspace')}
                >
                  Tiếp Nhận
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default DoctorDashboardPage;
