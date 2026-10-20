import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Select, Card, Typography, Empty, notification } from 'antd';
import { PlusOutlined, DownloadOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import medicalRecordService from '../../services/medicalRecordService';
import profileService from '../../services/profileService';
import { formatVnDate } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;
const { Option } = Select;

export const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedProfile) params.profileId = selectedProfile;
      if (selectedType) params.recordType = selectedType;

      const res = await medicalRecordService.getMedicalRecords(params);
      setRecords(res?.data?.content || []);
    } catch (err) {
      notification.error({
        message: 'Lỗi tải bệnh án',
        description: err.message || 'Không thể tải danh sách bệnh án.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await profileService.getProfiles();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        setProfiles(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedProfile, selectedType]);

  const handleDownloadPdf = async (id, code) => {
    try {
      notification.info({ message: 'Đang chuẩn bị file PDF A4...' });
      await medicalRecordService.downloadPdf(id, code);
      notification.success({ message: 'Tải PDF thành công!' });
    } catch (err) {
      notification.error({ message: 'Lỗi tải PDF', description: err.message });
    }
  };

  const columns = [
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
      render: (name) => <strong>{name || '—'}</strong>,
    },
    {
      title: 'Bác Sĩ Điều Trị',
      dataIndex: 'treatingDoctor',
      key: 'treatingDoctor',
      render: (doc) => doc || '—',
    },
    {
      title: 'Chẩn Đoán Chính',
      dataIndex: 'primaryDiagnosis',
      key: 'primaryDiagnosis',
      render: (diag, row) => (
        <Space orientation="vertical" size={2}>
          <span>{diag || 'Đang theo dõi'}</span>
          {row.primaryIcd10 && <Tag color="geekblue">ICD-10: {row.primaryIcd10}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Ngày Khám',
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
            type="primary"
            ghost
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/medical-records/${row.id}`)}
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
            Xuất PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            Lịch Sử Bệnh Án Điện Tử
          </Title>
          <Text type="secondary">
            Theo dõi tất cả các đợt khám và điều trị nội trú / ngoại trú theo 4 chuyên khoa Bộ Y Tế
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ height: 44, fontWeight: 600 }}
          onClick={() => navigate('/medical-records/create')}
        >
          Tạo Bệnh Án Mới
        </Button>
      </div>

      {/* Filter Bar */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }} bodyStyle={{ padding: '16px 20px' }}>
        <Space size={16} wrap>
          <div>
            <Text style={{ marginRight: 8, fontWeight: 600 }}>Người bệnh:</Text>
            <Select
              placeholder="Tất cả người bệnh"
              allowClear
              style={{ width: 260 }}
              value={selectedProfile}
              onChange={setSelectedProfile}
            >
              {(Array.isArray(profiles) ? profiles : []).map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.fullName} {p.relationship === 'SELF' ? '(Bản thân)' : `(${p.relationship})`}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text style={{ marginRight: 8, fontWeight: 600 }}>Chuyên khoa:</Text>
            <Select
              placeholder="Tất cả chuyên khoa"
              allowClear
              style={{ width: 220 }}
              value={selectedType}
              onChange={setSelectedType}
            >
              <Option value="INTERNAL">Nội Khoa (MS: 01/BV-01)</Option>
              <Option value="SURGICAL">Ngoại Khoa (MS: 10/BV-01)</Option>
              <Option value="PEDIATRIC">Nhi Khoa (MS: 02/BV-01)</Option>
              <Option value="OBSTETRIC">Sản Khoa (Chuẩn Sản)</Option>
              <Option value="GENERAL">Khám Chung</Option>
            </Select>
          </div>
        </Space>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 12 }}>
        <div className="table-responsive-container">
          <Table
            columns={columns}
            dataSource={Array.isArray(records) ? records : []}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: (
                <Empty description="Chưa tìm thấy đợt bệnh án nào phù hợp bộ lọc" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" onClick={() => navigate('/medical-records/create')}>
                    Tạo Bệnh Án Mới
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

export default MedicalRecordsPage;
