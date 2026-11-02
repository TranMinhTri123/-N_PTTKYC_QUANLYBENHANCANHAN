import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Table, Tag, Space, Alert, Descriptions } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import medicalRecordService from '../../services/medicalRecordService';
import appointmentService from '../../services/appointmentService';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [linkedPatient, setLinkedPatient] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [recRes, appRes, patRes] = await Promise.allSettled([
          medicalRecordService.getRecords({ page: 0, size: 5 }),
          appointmentService.getUpcomingAppointments(),
          axios.get('http://localhost:8088/api/v1/patients/my-record', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (patRes.status === 'fulfilled' && patRes.value?.data) {
          setLinkedPatient(patRes.value.data);
        }

        if (recRes.status === 'fulfilled') {
          const list = Array.isArray(recRes.value?.data)
            ? recRes.value.data
            : recRes.value?.data?.content || [];
          setRecords(list);
        }

        if (appRes.status === 'fulfilled') {
          const list = Array.isArray(appRes.value?.data)
            ? appRes.value.data
            : appRes.value?.data?.content || [];
          setUpcomingAppointments(list);
        }
      } catch (err) {
        console.error('Lỗi khi tải bảng điều khiển:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Cổng Thông Tin Bệnh Nhân
          </Title>
          <Text type="secondary">
            Bệnh viện phát hành chính thống – Tra cứu bệnh án, đơn thuốc và đặt lịch khám bệnh
          </Text>
        </div>
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          onClick={() => navigate('/patient/appointments')}
          style={{ borderRadius: 6, fontWeight: 600, background: '#0284c7' }}
        >
          Đặt Lịch Khám Bệnh
        </Button>
      </div>

      {/* CẢNH BÁO NẾU CHƯA LIÊN KẾT MRN */}
      {!linkedPatient && (
        <Alert
          message="Bạn chưa liên kết Mã Bệnh Nhân (MRN)"
          description="Để xem được lịch sử khám bệnh, đơn thuốc và kết quả cận lâm sàng của bệnh viện, vui lòng nhập Mã Bệnh Nhân được cấp trên sổ khám hoặc đơn thuốc."
          type="warning"
          showIcon
          action={
            <Button
              type="primary"
              size="small"
              icon={<LinkOutlined />}
              onClick={() => navigate('/patient/link')}
              style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              Liên Kết Ngay
            </Button>
          }
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      {/* THÔNG TIN HỒ SƠ CHÍNH CHỦ ĐÃ LIÊN KẾT */}
      {linkedPatient && (
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 10,
            borderLeft: '4px solid #0284c7',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
          title={
            <Space>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              <span style={{ fontWeight: 600 }}>Hồ Sơ Y Tế Bệnh Nhân (MRN: {linkedPatient.mrn})</span>
              <Tag color="success">ĐÃ XÁC THỰC</Tag>
            </Space>
          }
          extra={
            <Button type="link" onClick={() => navigate('/patient/link')}>
              Chi Tiết Hồ Sơ
            </Button>
          }
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 4 }} size="small">
            <Descriptions.Item label="Họ và Tên">
              <Text strong style={{ textTransform: 'uppercase', color: '#0284c7' }}>
                {linkedPatient.fullName}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {formatDate(linkedPatient.dateOfBirth)}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm máu">
              <Tag color="red">{linkedPatient.bloodType || 'Chưa xác định'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Dị ứng thuốc">
              {linkedPatient.allergies ? (
                <Tag color="error">{linkedPatient.allergies}</Tag>
              ) : (
                <Text type="secondary">Chưa ghi nhận</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* 4 THẺ CHỈ SỐ KPI */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #0284c7' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Mã Bệnh Nhân (MRN)</span>}
              value={linkedPatient?.mrn || 'Chưa liên kết'}
              prefix={<IdcardOutlined style={{ color: '#0284c7' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #10b981' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Đợt Khám Đã Phát Hành</span>}
              value={records.length}
              prefix={<FileTextOutlined style={{ color: '#10b981' }} />}
              suffix="đợt khám"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #f59e0b' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Lịch Hẹn Khám Sắp Tới</span>}
              value={upcomingAppointments.length}
              prefix={<CalendarOutlined style={{ color: '#f59e0b' }} />}
              suffix="lịch hẹn"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #8b5cf6' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Bảo Mật Quyền Xem</span>}
              value="Chính Chủ"
              prefix={<SafetyCertificateOutlined style={{ color: '#8b5cf6' }} />}
              suffix="Read-Only"
            />
          </Card>
        </Col>
      </Row>

      {/* TÁC VỤ NHANH */}
      <Card style={{ borderRadius: 10, marginBottom: 24, background: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Text strong style={{ color: '#334155' }}>Tác vụ chính:</Text>
          <Button icon={<CalendarOutlined />} type="primary" onClick={() => navigate('/patient/appointments')}>
            Đặt Lịch Khám
          </Button>
          <Button icon={<FileTextOutlined />} onClick={() => navigate('/patient/records')}>
            Lịch Sử Bệnh Án
          </Button>
          <Button icon={<MedicineBoxOutlined />} onClick={() => navigate('/patient/prescriptions')}>
            Đơn Thuốc
          </Button>
          <Button icon={<ExperimentOutlined />} onClick={() => navigate('/patient/clinical')}>
            Kết Quả Xét Nghiệm / CĐHA
          </Button>
          <Button icon={<SafetyCertificateOutlined />} onClick={() => navigate('/patient/audit-logs')}>
            Nhật Ký Truy Cập
          </Button>
        </div>
      </Card>

      {/* BẢNG ĐỢT KHÁM GẦN NHẤT */}
      <Card
        title={<span style={{ fontWeight: 600 }}>Các Đợt Khám Gần Đây (Đã Phát Hành)</span>}
        style={{ borderRadius: 10 }}
        extra={<Button type="link" onClick={() => navigate('/patient/records')}>Xem Tất Cả</Button>}
      >
        <Table
          dataSource={records}
          rowKey="id"
          pagination={false}
          loading={loading}
          columns={[
            {
              title: 'Mã Bệnh Án',
              dataIndex: 'medicalRecordCode',
              key: 'medicalRecordCode',
              render: (code, r) => code || `BA-${r.id}`,
            },
            {
              title: 'Ngày Khám',
              dataIndex: 'visitDate',
              key: 'visitDate',
              render: (d) => formatDate(d),
            },
            {
              title: 'Khoa / Bác Sĩ',
              key: 'dept',
              render: (_, r) => (
                <div>
                  <Text strong>{r.departmentName || 'Khoa Khám Bệnh'}</Text>
                  {r.attendingDoctor && (
                    <div style={{ fontSize: 12, color: '#64748b' }}>BS: {r.attendingDoctor}</div>
                  )}
                </div>
              ),
            },
            {
              title: 'Chẩn Đoán Chính',
              dataIndex: 'primaryDiagnosis',
              key: 'primaryDiagnosis',
              render: (diag, r) => diag || r.referralDiagnosis || 'Đang cập nhật',
            },
            {
              title: 'Trạng Thái',
              key: 'status',
              render: () => <Tag color="green">ĐÃ PHÁT HÀNH</Tag>,
            },
            {
              title: 'Thao Tác',
              key: 'action',
              render: (_, r) => (
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/patient/records/${r.id}`)}
                >
                  Xem Chi Tiết
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default PatientDashboardPage;
