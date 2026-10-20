import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Button,
  message,
} from 'antd';
import {
  HistoryOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import auditLogService from '../../services/auditLogService';

const { Title, Text } = Typography;

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const loadLogs = async (page = 0, size = 20) => {
    setLoading(true);
    try {
      const res = await auditLogService.getLogs(page, size);
      const data = res.data || {};
      setLogs(data.content || []);
      setPagination({
        current: (data.pageable?.pageNumber || page) + 1,
        pageSize: data.pageable?.pageSize || size,
        total: data.totalElements || 0,
      });
    } catch (err) {
      message.error('Không thể tải dữ liệu nhật ký kiểm toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(0, 20);
  }, []);

  const handleTableChange = (pag) => {
    loadLogs(pag.current - 1, pag.pageSize);
  };

  const getActionColor = (act) => {
    if (!act) return 'default';
    if (act.includes('DELETE') || act.includes('REMOVE')) return 'error';
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('REGISTER')) return 'success';
    if (act.includes('UPDATE') || act.includes('EDIT')) return 'warning';
    return 'blue';
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date) => (
        <span style={{ fontSize: 13 }}>
          {dayjs(date).format('HH:mm:ss - DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'username',
      key: 'username',
      render: (u) => <strong>{u || 'Hệ thống'}</strong>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (act) => <Tag color={getActionColor(act)}>{act}</Tag>,
    },
    {
      title: 'Đối tượng tác động',
      key: 'entity',
      render: (_, r) => (
        <span>
          <Tag color="geekblue">{r.entityName}</Tag>
          {r.entityId && <code style={{ fontSize: 12 }}>#{r.entityId}</code>}
        </span>
      ),
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip) => <code style={{ fontSize: 12 }}>{ip || '127.0.0.1'}</code>,
    },
    {
      title: 'Chi tiết thao tác',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (d) => <Text style={{ fontSize: 13 }}>{d || 'Thành công'}</Text>,
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Nhật Ký Kiểm Toán Hệ Thống
          </Title>
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadLogs(pagination.current - 1, pagination.pageSize)}
          >
            Làm Mới
          </Button>
        </Col>
      </Row>

      <Card>
        <div className="table-responsive-container">
          <Table
            columns={columns}
            dataSource={Array.isArray(logs) ? logs : []}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            locale={{ emptyText: 'Chưa có nhật ký ghi nhận' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminAuditLogsPage;
