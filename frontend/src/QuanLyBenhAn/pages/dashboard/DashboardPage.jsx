import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, Table, Tag, Space, Typography, Empty, notification } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  HeartOutlined,
  CalendarOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import metricService from '../../services/metricService';
import profileService from '../../services/profileService';
import medicalRecordService from '../../services/medicalRecordService';
import appointmentService from '../../services/appointmentService';
import { formatVnDate } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [latestBp, setLatestBp] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Lấy danh sách hồ sơ gia đình
        const profilesRes = await profileService.getProfiles();
        const profileList = Array.isArray(profilesRes?.data) ? profilesRes.data : [];
        setProfiles(profileList);

        // 2. Lấy bệnh án gần nhất
        const recordsRes = await medicalRecordService.getMedicalRecords({ page: 0, size: 5 });
        const recordList = recordsRes?.data?.content || (Array.isArray(recordsRes?.data) ? recordsRes.data : []);
        setRecentRecords(recordList);

        // 3. Lấy lịch hẹn sắp tới
        const apptRes = await appointmentService.getUpcoming();
        const apptList = apptRes?.data?.content || (Array.isArray(apptRes?.data) ? apptRes.data : []);
        setUpcomingAppointments(apptList);

        // 4. Lấy chỉ số huyết áp gần nhất thực tế (nếu có)
        if (profileList.length > 0) {
          try {
            const metricRes = await metricService.getMetricSummary(profileList[0].id);
            const bpData = metricRes?.data?.latestBloodPressure;
            if (bpData && bpData.systolicValue && bpData.diastolicValue) {
              setLatestBp({
                value: `${bpData.systolicValue}/${bpData.diastolicValue}`,
                classification: bpData.classification || 'Chuẩn AHA',
              });
            } else {
              setLatestBp(null);
            }
          } catch {
            setLatestBp(null);
          }
        } else {
          setLatestBp(null);
        }
      } catch (err) {
        notification.error({
          message: 'Lỗi tải dữ liệu',
          description: err.message || 'Không thể tải dữ liệu bảng điều khiển.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Xử lý tải PDF bệnh án chuẩn Bộ Y Tế (Rule 10)
  const handleDownloadPdf = async (recordId, recordCode) => {
    try {
      notification.info({
        message: 'Đang tạo tài liệu PDF...',
        description: 'Hệ thống đang xuất bản tóm tắt bệnh án chuẩn A4 Bộ Y Tế.',
      });
      await medicalRecordService.downloadPdf(recordId, recordCode);
      notification.success({
        message: 'Tải thành công!',
        description: `Bệnh án ${recordCode} đã được xuất thành công.`,
      });
    } catch (err) {
      notification.error({
        message: 'Lỗi tải PDF',
        description: err.message || 'Không thể tạo file PDF bệnh án.',
      });
    }
  };

  // Cột bảng bệnh án gần đây
  const recordColumns = [
    {
      title: 'Mã Bệnh Án',
      dataIndex: 'medicalRecordCode',
      key: 'medicalRecordCode',
      render: (code) => <Text strong style={{ color: '#0284c7' }}>{code}</Text>,
    },
    {
      title: 'Chuyên Khoa',
      dataIndex: 'recordType',
      key: 'recordType',
      render: (type) => {
        const typeMap = {
          INTERNAL: { text: 'Nội Khoa (MS:01)', color: 'blue' },
          SURGICAL: { text: 'Ngoại Khoa (MS:10)', color: 'orange' },
          PEDIATRIC: { text: 'Nhi Khoa (MS:02)', color: 'green' },
          OBSTETRIC: { text: 'Sản Khoa', color: 'magenta' },
          GENERAL: { text: 'Khám Chung', color: 'cyan' },
        };
        const item = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: 'Bệnh Nhân',
      dataIndex: 'profileName',
      key: 'profileName',
      render: (text) => text || '—',
    },
    {
      title: 'Chẩn Đoán Chính',
      dataIndex: 'primaryDiagnosis',
      key: 'primaryDiagnosis',
      render: (text, row) => (
        <Space orientation="vertical" size={2}>
          <span>{text || 'Đang theo dõi'}</span>
          {row.primaryIcd10 && <Tag color="geekblue" style={{ fontSize: 11 }}>ICD-10: {row.primaryIcd10}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Ngày Vào Viện',
      dataIndex: 'visitDate',
      key: 'visitDate',
      render: (date) => formatVnDate(date),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, row) => (
        <Space size={8}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/records/${row.id}`)}
          >
            Chi tiết
          </Button>
          <Button
            type="dashed"
            icon={<DownloadOutlined />}
            size="small"
            style={{ color: '#0284c7', borderColor: '#38bdf8' }}
            onClick={() => handleDownloadPdf(row.id, row.medicalRecordCode)}
          >
            PDF A4
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Xin chào, {user?.fullName || 'Người Dùng'}!
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Tổng quan tình trạng sức khỏe gia đình và hoạt động y tế gần nhất
        </Text>
      </div>

      {/* 4 Top Metric Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#64748b' }}>Hồ Sơ Thành Viên</span>}
              value={profiles.length}
              prefix={<TeamOutlined style={{ color: '#0284c7', marginRight: 8 }} />}
              suffix="hồ sơ"
              valueStyle={{ fontWeight: 700 }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8, fontSize: 13 }}
              onClick={() => navigate('/profiles')}
            >
              Quản lý gia đình <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#64748b' }}>Đợt Bệnh Án</span>}
              value={recentRecords.length}
              prefix={<FileTextOutlined style={{ color: '#10b981', marginRight: 8 }} />}
              suffix="lần khám"
              valueStyle={{ fontWeight: 700 }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8, fontSize: 13 }}
              onClick={() => navigate('/records')}
            >
              Lịch sử điều trị <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#64748b' }}>Lịch Hẹn Sắp Tới</span>}
              value={upcomingAppointments.length}
              prefix={<CalendarOutlined style={{ color: '#f59e0b', marginRight: 8 }} />}
              suffix="lịch"
              valueStyle={{ fontWeight: 700 }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8, fontSize: 13 }}
              onClick={() => navigate('/appointments')}
            >
              Xem lịch khám <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#64748b' }}>Đo Huyết Áp Gần Nhất</span>}
              value={latestBp ? latestBp.value : 'Chưa có số đo'}
              prefix={<HeartOutlined style={{ color: '#ef4444', marginRight: 8 }} />}
              suffix={latestBp ? 'mmHg' : ''}
              valueStyle={{
                fontWeight: 700,
                fontSize: latestBp ? 24 : 17,
                color: latestBp ? '#0f172a' : '#94a3b8',
              }}
            />
            {latestBp ? (
              <Tag color="success" style={{ marginTop: 8, fontWeight: 600 }}>
                {latestBp.classification}
              </Tag>
            ) : (
              <Button
                type="link"
                style={{ padding: 0, marginTop: 8, fontSize: 13 }}
                onClick={() => navigate('/metrics')}
              >
                + Ghi nhận số đo mới <ArrowRightOutlined />
              </Button>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Action Buttons */}
      <Card
        title={<span style={{ fontWeight: 700, fontSize: 16 }}>Tác Vụ Y Tế Nhanh</span>}
        style={{ marginBottom: 24, borderRadius: 12 }}
      >
        <Space size={12} wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/records/create')}
          >
            Tạo Bệnh Án Mới
          </Button>
          <Button
            icon={<HeartOutlined style={{ color: '#ef4444' }} />}
            size="large"
            onClick={() => navigate('/metrics')}
          >
            Nhập Số Đo Sức Khỏe
          </Button>
          <Button
            icon={<TeamOutlined style={{ color: '#0284c7' }} />}
            size="large"
            onClick={() => navigate('/profiles?create=true')}
          >
            Thêm Hồ Sơ Người Thân
          </Button>
          <Button
            icon={<CalendarOutlined style={{ color: '#f59e0b' }} />}
            size="large"
            onClick={() => navigate('/appointments')}
          >
            Đặt Lịch Hẹn Khám
          </Button>
          <Button
            icon={<MedicineBoxOutlined style={{ color: '#10b981' }} />}
            size="large"
            onClick={() => navigate('/prescriptions')}
          >
            Xem Tủ Thuốc Đang Dùng
          </Button>
        </Space>
      </Card>

      {/* Recent Medical Records Table */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Lịch Sử Bệnh Án Gần Đây</span>
            <Button type="link" onClick={() => navigate('/records')}>
              Xem tất cả <ArrowRightOutlined />
            </Button>
          </div>
        }
        style={{ borderRadius: 12 }}
      >
        <div className="table-responsive-container">
          <Table
            columns={recordColumns}
            dataSource={Array.isArray(recentRecords) ? recentRecords : []}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  description="Chưa có đợt bệnh án nào được ghi nhận"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" onClick={() => navigate('/records/create')}>
                    Tạo Bệnh Án Đầu Tiên
                  </Button>
                </Empty>
              ),
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
