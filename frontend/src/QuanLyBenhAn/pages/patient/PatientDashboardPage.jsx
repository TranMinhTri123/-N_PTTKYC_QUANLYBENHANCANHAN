import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Table, Tag, Space, Alert, Avatar } from 'antd';
import {
  FileTextOutlined,
  HeartOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import medicalRecordService from '../../services/medicalRecordService';
import profileService from '../../services/profileService';
import metricService from '../../services/metricService';
import appointmentService from '../../services/appointmentService';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

export const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [metricSummary, setMetricSummary] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [recRes, profRes, appRes] = await Promise.allSettled([
          medicalRecordService.getRecords({ page: 0, size: 5 }),
          profileService.getProfiles(),
          appointmentService.getUpcomingAppointments(),
        ]);

        let profList = [];
        if (profRes.status === 'fulfilled') {
          profList = Array.isArray(profRes.value?.data) ? profRes.value.data : (profRes.value?.data?.content || []);
          setProfiles(profList);
        }

        const primaryProf = profList.find((p) => p.relationship === 'SELF') || profList[0];
        if (primaryProf?.id) {
          try {
            const metRes = await metricService.getMetricSummary(primaryProf.id);
            if (metRes?.data) {
              setMetricSummary(metRes.data);
            }
          } catch (e) {
            console.error('Lỗi khi tải tóm tắt sinh hiệu:', e);
          }
        }

        if (recRes.status === 'fulfilled') {
          const list = Array.isArray(recRes.value?.data) ? recRes.value.data : (recRes.value?.data?.content || []);
          setRecords(list);
        }
        if (appRes.status === 'fulfilled') {
          const list = Array.isArray(appRes.value?.data) ? appRes.value.data : (appRes.value?.data?.content || []);
          setUpcomingAppointments(list);
        }
      } catch (err) {
        console.error(err);
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
            Bảng Điều Khiển
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/patient/records/create')}
          style={{ borderRadius: 6, fontWeight: 600, background: '#0284c7' }}
        >
          Tạo Bệnh Án
        </Button>
      </div>

      {/* 4 THẺ CHỈ SỐ KPI SỨC KHỎE */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #0284c7' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Thành Viên Gia Đình</span>}
              value={profiles.length}
              prefix={<UserOutlined style={{ color: '#0284c7' }} />}
              suffix="hồ sơ"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #10b981' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Đợt Khám Bệnh Án</span>}
              value={records.length}
              prefix={<FileTextOutlined style={{ color: '#10b981' }} />}
              suffix="đợt khám"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #f59e0b' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Lịch Khám Sắp Tới</span>}
              value={upcomingAppointments.length}
              prefix={<CalendarOutlined style={{ color: '#f59e0b' }} />}
              suffix="lịch hẹn"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #ef4444' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Huyết Áp Mới Nhất</span>}
              value={
                metricSummary?.bloodPressure
                  ? `${metricSummary.bloodPressure.systolic}/${metricSummary.bloodPressure.diastolic}`
                  : '120/80'
              }
              prefix={<HeartOutlined style={{ color: '#ef4444' }} />}
              suffix="mmHg"
            />
          </Card>
        </Col>
      </Row>

      {/* TÁC VỤ NHANH */}
      <Card style={{ borderRadius: 10, marginBottom: 24, background: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Text strong style={{ color: '#334155' }}>Tác vụ nhanh:</Text>
          <Button icon={<FileTextOutlined />} onClick={() => navigate('/patient/records/create')}>
            Tạo Bệnh Án
          </Button>
          <Button icon={<HeartOutlined />} onClick={() => navigate('/patient/metrics')}>
            Nhập Chỉ Số
          </Button>
          <Button icon={<UserOutlined />} onClick={() => navigate('/patient/profiles')}>
            Thêm Hồ Sơ
          </Button>
          <Button icon={<MedicineBoxOutlined />} onClick={() => navigate('/patient/prescriptions')}>
            Tủ Thuốc
          </Button>
          <Button icon={<CalendarOutlined />} onClick={() => navigate('/patient/appointments')}>
            Đặt Lịch Hẹn
          </Button>
        </div>
      </Card>

      {/* BẢNG ĐỢT KHÁM BỆNH ÁN GẦN NHẤT & NÚT XUẤT PDF A4 */}
      <Card
        title={<span style={{ fontWeight: 600 }}>Các Đợt Khám Gần Đây</span>}
        style={{ borderRadius: 10 }}
        extra={<Button type="link" onClick={() => navigate('/patient/records')}>Xem Tất Cả</Button>}
      >
        <Table
          dataSource={records}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Mã Bệnh Án',
              dataIndex: 'id',
              key: 'id',
              render: (id, record) => <Tag color="blue">{record.medicalRecordCode || `#BA-${id}`}</Tag>,
            },
            {
              title: 'Chuyên Khoa',
              dataIndex: 'recordType',
              key: 'recordType',
              render: (type) => {
                const map = {
                  INTERNAL: { label: 'Nội khoa', color: 'blue' },
                  SURGICAL: { label: 'Ngoại khoa', color: 'orange' },
                  PEDIATRIC: { label: 'Nhi khoa', color: 'green' },
                  OBSTETRIC: { label: 'Sản khoa', color: 'magenta' },
                };
                const t = map[type] || { label: type || 'Khám chung', color: 'cyan' };
                return <Tag color={t.color}>{t.label}</Tag>;
              },
            },
            {
              title: 'Cơ Sở Khám',
              dataIndex: 'hospitalName',
              key: 'hospitalName',
              render: (hosp, record) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{hosp || '-'}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{record.departmentName || record.department || 'Khoa khám'}</div>
                </div>
              ),
            },
            {
              title: 'Chẩn Đoán Xác Định',
              dataIndex: 'primaryDiagnosis',
              key: 'primaryDiagnosis',
              render: (diag, record) => <Text strong>{diag || record.admissionDiagnosis || '-'}</Text>,
            },
            {
              title: 'Ngày Khám',
              dataIndex: 'visitDate',
              key: 'visitDate',
              render: (date, record) => {
                const d = date || record.admissionDateTime || record.admissionDate;
                return d ? formatDate(d) : '-';
              },
            },
            {
              title: 'Hành Động',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/patient/records/${record.id}`)}
                  >
                    Chi Tiết
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<DownloadOutlined />}
                    onClick={() => medicalRecordService.downloadPdf(record.id, record.medicalRecordCode || `BA_${record.id}`)}
                  >
                    Tải PDF
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default PatientDashboardPage;
