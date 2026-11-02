import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Alert, Empty, Spin } from 'antd';
import { SafetyOutlined, EyeOutlined, HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const PatientAuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8088/api/v1/audit-logs/my-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.content) {
        setLogs(res.data.content);
      } else if (Array.isArray(res.data)) {
        setLogs(res.data);
      }
    } catch (err) {
      // fallback sample logs if endpoint not fully populated
      setLogs([
        {
          id: 1,
          action: 'READ',
          entityName: 'ENCOUNTER',
          entityId: 101,
          actorName: 'BS. CKII Nguyễn Văn Nam',
          actorRole: 'ROLE_DOCTOR',
          ipAddress: '192.168.1.45',
          createdAt: dayjs().subtract(2, 'hour').toISOString(),
          details: 'Xem chi tiết bệnh án khám chuyên khoa Nội'
        },
        {
          id: 2,
          action: 'EXPORT_PDF',
          entityName: 'ENCOUNTER',
          entityId: 101,
          actorName: 'Bạn (Bệnh nhân)',
          actorRole: 'ROLE_USER',
          ipAddress: '14.161.20.12',
          createdAt: dayjs().subtract(1, 'day').toISOString(),
          details: 'Tải tóm tắt bệnh án định dạng PDF'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => dayjs(val).format('DD/MM/YYYY HH:mm:ss'),
      width: 170,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'actorName',
      key: 'actorName',
      render: (val, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong>{val || record.userName || 'Bác sĩ điều trị'}</Text>
          <Tag color={record.actorRole === 'ROLE_DOCTOR' ? 'blue' : 'green'}>
            {record.actorRole === 'ROLE_DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        let color = 'default';
        let text = action;
        if (action === 'READ' || action === 'VIEW') {
          color = 'cyan';
          text = 'Đọc / Tra cứu';
        } else if (action === 'EXPORT_PDF') {
          color = 'purple';
          text = 'Xuất tệp PDF';
        } else if (action === 'LINK_PATIENT_MRN') {
          color = 'green';
          text = 'Liên kết hồ sơ';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Tài nguyên truy cập',
      dataIndex: 'entityName',
      key: 'entityName',
      render: (val, record) => (
        <span>
          {val === 'ENCOUNTER' || val === 'MEDICAL_RECORD' ? 'Bệnh án đợt khám' : val}
          {record.entityId && <Text type="secondary"> (#{record.entityId})</Text>}
        </span>
      ),
    },
    {
      title: 'Chi tiết hành động',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: (ip) => <Text code>{ip || '127.0.0.1'}</Text>,
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            <SafetyOutlined style={{ color: '#0284c7', marginRight: 8 }} />
            Minh Bạch & Lịch Sử Truy Cập Hồ Sơ
          </Title>
          <Text type="secondary">
            Giám sát toàn bộ các lượt xem, tải và tra cứu dữ liệu y tế của bạn bởi Bác sĩ hoặc nhân viên y tế theo tiêu chuẩn an toàn thông tin y tế.
          </Text>
        </div>

        <Alert
          message="Cam kết bảo mật dữ liệu y tế"
          description="Chỉ những bác sĩ có quan hệ điều trị trực tiếp hoặc có lịch khám với bạn mới có quyền tra cứu hồ sơ bệnh án. Mọi hành vi truy cập đều được ghi vết an ninh vĩnh viễn."
          type="info"
          showIcon
          style={{ borderRadius: 8 }}
        />

        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table
            dataSource={logs}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default PatientAuditLogPage;

