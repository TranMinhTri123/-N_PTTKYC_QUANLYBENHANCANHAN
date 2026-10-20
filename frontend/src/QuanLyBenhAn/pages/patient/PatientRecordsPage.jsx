import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Typography,
  Tag,
  Space,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import medicalRecordService from '../../services/medicalRecordService';
import profileService from '../../services/profileService';
import { formatDate } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';

const { Title, Text } = Typography;
const { Option } = Select;

export const PatientRecordsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('ALL');
  const [selectedRecordType, setSelectedRecordType] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [recRes, profRes] = await Promise.allSettled([
          medicalRecordService.getRecords({ size: 100 }),
          profileService.getProfiles(),
        ]);

        if (recRes.status === 'fulfilled') {
          const list = Array.isArray(recRes.value?.data) ? recRes.value.data : (recRes.value?.data?.content || []);
          setRecords(list);
        }
        if (profRes.status === 'fulfilled') {
          const profList = Array.isArray(profRes.value?.data) ? profRes.value.data : (profRes.value?.data?.content || []);
          setProfiles(profList);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRecords = records.filter((r) => {
    if (selectedProfileId !== 'ALL' && r.profileId !== selectedProfileId) return false;
    if (selectedRecordType !== 'ALL' && r.recordType !== selectedRecordType) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Sổ Bệnh Án Gia Đình
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

      {records.length === 0 && !loading ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '30px 0' }}>
          <EmptyState
            description="Bạn chưa lưu trữ đợt khám bệnh án nào trong sổ sức khỏe gia đình."
            actionText="Tạo Bệnh Án Đầu Tiên Chuẩn Bộ Y Tế"
            onAction={() => navigate('/patient/records/create')}
          />
        </Card>
      ) : (
        <Card style={{ borderRadius: 12 }}>
          {/* BỘ LỌC ĐA TIÊU CHÍ */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Select
                value={selectedProfileId}
                onChange={setSelectedProfileId}
                style={{ width: '100%' }}
                placeholder="Lọc theo người bệnh..."
              >
                <Option value="ALL">Tất cả người bệnh trong gia đình</Option>
                {profiles.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.fullName} ({p.relationship || 'Bản thân'})
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Select
                value={selectedRecordType}
                onChange={setSelectedRecordType}
                style={{ width: '100%' }}
                placeholder="Lọc theo chuyên khoa..."
              >
                <Option value="ALL">Tất cả chuyên khoa</Option>
                <Option value="SURGICAL">Ngoại Khoa (MS: 10/BV-01)</Option>
                <Option value="INTERNAL">Nội Khoa (MS: 01/BV-01)</Option>
                <Option value="PEDIATRIC">Nhi Khoa (MS: 02/BV-01)</Option>
                <Option value="OBSTETRIC">Sản Khoa</Option>
                <Option value="GENERAL">Khám Bệnh Chung</Option>
              </Select>
            </Col>

            <Col xs={24} sm={24} md={12} style={{ textAlign: 'right' }}>
              <Text type="secondary">
                Tìm thấy <strong>{filteredRecords.length}</strong> đợt khám
              </Text>
            </Col>
          </Row>

          <Table
            dataSource={filteredRecords}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Mã BA',
                dataIndex: 'id',
                key: 'id',
                render: (id, record) => (
                  <div>
                    <Tag color="blue">{record.medicalRecordCode || `#BA-${id}`}</Tag>
                  </div>
                ),
              },
              {
                title: 'Người Bệnh',
                dataIndex: 'patientName',
                key: 'patientName',
                render: (name, record) => {
                  const prof = profiles.find((p) => p.id === record.profileId);
                  return <Text strong>{record.profileFullName || name || prof?.fullName || 'Người bệnh'}</Text>;
                },
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
                title: 'Cơ Sở Khám & Khoa',
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
                render: (diag, record) => (
                  <div>
                    <Text strong>{diag || record.admissionDiagnosis || '-'}</Text>
                    {record.primaryIcd10 && <Tag color="geekblue" style={{ marginLeft: 6, fontSize: 11 }}>{record.primaryIcd10}</Tag>}
                  </div>
                ),
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
                title: 'Thao Tác',
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
                      Tải PDF A4
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
};

export default PatientRecordsPage;
