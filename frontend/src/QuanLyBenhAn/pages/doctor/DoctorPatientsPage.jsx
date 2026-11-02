import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Row, Col, Avatar } from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  FileAddOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import { formatDate, formatPhoneNumber } from '../../utils/formatters';

const { Title, Text } = Typography;

export const DoctorPatientsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const res = await profileService.getProfiles();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        setPatients(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  const filtered = patients.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.fullName && p.fullName.toLowerCase().includes(term)) ||
      (p.phoneNumber && p.phoneNumber.includes(term)) ||
      (p.identityCardNumber && p.identityCardNumber.includes(term))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Danh Sách Bệnh Nhân
          </Title>
        </div>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm kiếm bệnh nhân theo Họ tên, Số điện thoại hoặc CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 400 }}
            size="large"
          />
        </div>

        <Table
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: 14 }}>
                  👨‍⚕️ Bác sĩ chưa có bệnh nhân nào đặt lịch hoặc được phân công tiếp nhận.
                </p>
                <p style={{ color: '#94a3b8', fontSize: 12 }}>
                  Dữ liệu bệnh nhân chỉ hiển thị khi có lịch hẹn khám trực tiếp hoặc chia sẻ hồ sơ.
                </p>
              </div>
            ),
          }}
          columns={[
            {
              title: 'Mã BN',
              dataIndex: 'id',
              key: 'id',
              render: (id) => <Tag color="blue">#BN-{id}</Tag>,
            },
            {
              title: 'Họ Và Tên',
              dataIndex: 'fullName',
              key: 'fullName',
              render: (name, record) => (
                <Space>
                  <Avatar style={{ backgroundColor: record.gender === 'FEMALE' ? '#ec4899' : '#0284c7' }}>
                    {name?.charAt(0) || 'BN'}
                  </Avatar>
                  <div>
                    <Text strong>{name}</Text>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {record.gender === 'FEMALE' ? 'Nữ' : 'Nam'} • {record.dateOfBirth ? formatDate(record.dateOfBirth) : '-'}
                    </div>
                  </div>
                </Space>
              ),
            },
            {
              title: 'Nhóm Máu',
              dataIndex: 'bloodType',
              key: 'bloodType',
              render: (blood) => (blood ? <Tag color="red">{blood}</Tag> : <Text type="secondary">-</Text>),
            },
            {
              title: 'Liên Hệ',
              dataIndex: 'phoneNumber',
              key: 'phoneNumber',
              render: (phone) => {
                if (!phone) return <Text type="secondary">-</Text>;
                const masked = phone.replace(/(\d{4})\d{3}(\d{3})/, '$1***$2');
                return (
                  <span>
                    <PhoneOutlined style={{ marginRight: 4, color: '#64748b' }} />
                    {masked}
                  </span>
                );
              },
            },
            {
              title: 'Tình Trạng Theo Dõi',
              key: 'status',
              render: () => <Tag color="cyan">Đang Theo Dõi</Tag>,
            },
            {
              title: 'Tác Vụ Y Khoa',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    icon={<FileAddOutlined />}
                    onClick={() => navigate('/doctor/records/create', { state: { profileId: record.id } })}
                    style={{ background: '#0f766e', borderColor: '#0f766e' }}
                  >
                    Khám Bệnh
                  </Button>
                  <Button
                    size="small"
                    icon={<MedicineBoxOutlined />}
                    onClick={() => navigate('/doctor/prescriptions/create', { state: { profileId: record.id } })}
                  >
                    Kê Đơn
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

export default DoctorPatientsPage;
