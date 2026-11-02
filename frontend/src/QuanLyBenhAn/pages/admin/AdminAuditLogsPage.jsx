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
  Input,
  Select,
  Statistic,
  Modal,
  Descriptions,
  Badge,
  Tooltip,
  message,
} from 'antd';
import {
  HistoryOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import auditLogService from '../../services/auditLogService';

const { Title, Text } = Typography;
const { Option } = Select;

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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
      const content = Array.isArray(data.content) ? data.content : [];
      setLogs(content);

      const currentPage =
        data.pageNumber !== undefined
          ? data.pageNumber
          : data.pageable?.pageNumber !== undefined
          ? data.pageable.pageNumber
          : page;

      const pageSize = data.pageSize || data.pageable?.pageSize || size;
      const total = data.totalElements !== undefined ? data.totalElements : content.length;

      setPagination({
        current: currentPage + 1,
        pageSize: pageSize,
        total: total,
      });
    } catch {
      message.error('Không thể tải dữ liệu nhật ký kiểm toán hệ thống');
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
    const a = act.toUpperCase();
    if (a.includes('DELETE') || a.includes('REMOVE') || a.includes('LOCK')) return 'error';
    if (a.includes('CREATE') || a.includes('ADD') || a.includes('REGISTER') || a.includes('INITIALIZE')) return 'success';
    if (a.includes('UPDATE') || a.includes('EDIT') || a.includes('ROLE')) return 'warning';
    if (a.includes('LOGIN') || a.includes('AUTH') || a.includes('SECURITY')) return 'blue';
    return 'cyan';
  };

  // Lọc dữ liệu client-side theo từ khóa và nhóm hành động
  const filteredLogs = logs.filter((item) => {
    // 1. Lọc theo nhóm hành động
    if (actionFilter !== 'ALL') {
      const act = (item.action || '').toUpperCase();
      if (actionFilter === 'CREATE' && !act.includes('CREATE') && !act.includes('ADD') && !act.includes('INITIALIZE')) return false;
      if (actionFilter === 'UPDATE' && !act.includes('UPDATE') && !act.includes('EDIT') && !act.includes('ROLE')) return false;
      if (actionFilter === 'DELETE' && !act.includes('DELETE') && !act.includes('REMOVE') && !act.includes('LOCK')) return false;
      if (actionFilter === 'AUTH' && !act.includes('LOGIN') && !act.includes('AUTH') && !act.includes('TOKEN')) return false;
    }

    // 2. Tìm kiếm theo từ khóa
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const act = (item.action || '').toLowerCase();
    const entity = (item.entityName || '').toLowerCase();
    const ip = (item.ipAddress || '').toLowerCase();
    const details = (item.details || '').toLowerCase();
    const user = (item.username || item.userFullName || item.userEmail || '').toLowerCase();

    return act.includes(term) || entity.includes(term) || ip.includes(term) || details.includes(term) || user.includes(term);
  });

  // Thống kê nhanh
  const stats = {
    total: pagination.total || logs.length,
    creates: logs.filter((l) => (l.action || '').match(/CREATE|ADD|INITIALIZE/i)).length,
    updates: logs.filter((l) => (l.action || '').match(/UPDATE|EDIT|ROLE/i)).length,
    security: logs.filter((l) => (l.action || '').match(/LOGIN|AUTH|VERIF|LOCK/i)).length,
  };

  const openDetail = (record) => {
    setSelectedLog(record);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <Tag color="default">#{id || 'LOG'}</Tag>,
    },
    {
      title: 'Thời Gian Thao Tác',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 175,
      render: (date) => (
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          {date ? dayjs(date).format('HH:mm:ss - DD/MM/YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Người Thực Hiện',
      key: 'user',
      width: 220,
      render: (_, r) => {
        const displayName = r.username || r.userFullName || (r.userEmail ? r.userEmail.split('@')[0] : 'Hệ thống');
        return (
          <div>
            <Text strong style={{ color: '#0f172a' }}>{displayName}</Text>
            {r.userEmail && (
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {r.userEmail}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Hành Động',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (act) => (
        <Tag color={getActionColor(act)} style={{ fontWeight: 600 }}>
          {act}
        </Tag>
      ),
    },
    {
      title: 'Đối Tượng Tác Động',
      key: 'entity',
      width: 180,
      render: (_, r) => (
        <span>
          <Tag color="geekblue" style={{ fontWeight: 500 }}>
            {r.entityName || 'HỆ THỐNG'}
          </Tag>
          {r.entityId ? <code style={{ fontSize: 12 }}>#{r.entityId}</code> : null}
        </span>
      ),
    },
    {
      title: 'Địa Chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: (ip) => <code style={{ fontSize: 12, color: '#475569' }}>{ip || '127.0.0.1'}</code>,
    },
    {
      title: 'Chi Tiết Thao Tác',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (d) => <Text style={{ fontSize: 13 }}>{d || 'Thực thi thành công'}</Text>,
    },
    {
      title: 'Xem',
      key: 'actions',
      width: 70,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết nhật ký">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {/* 1. Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            <SafetyCertificateOutlined style={{ color: '#0284c7', marginRight: 8 }} />
            Nhật Ký Kiểm Toán Hệ Thống (Audit Logs)
          </Title>
          <Text type="secondary">
            Giám sát toàn bộ lịch sử thao tác, truy vết dữ liệu và tuân thủ an toàn an ninh y tế (HIPAA / Bộ Y Tế)
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadLogs(pagination.current - 1, pagination.pageSize)}
          >
            Làm Mới
          </Button>
        </Space>
      </div>

      {/* 2. Thống kê KPI tóm tắt */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #0284c7' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#64748b' }}>Tổng Số Nhật Ký</span>}
              value={stats.total}
              prefix={<HistoryOutlined style={{ color: '#0284c7' }} />}
              valueStyle={{ fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #10b981' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#64748b' }}>Thao Tác Thêm Mới</span>}
              value={stats.creates}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ fontWeight: 700, color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #f59e0b' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#64748b' }}>Thao Tác Cập Nhật</span>}
              value={stats.updates}
              prefix={<ThunderboltOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ fontWeight: 700, color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, borderLeft: '4px solid #3b82f6' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#64748b' }}>Xác Thực & An Ninh</span>}
              value={stats.security}
              prefix={<SafetyCertificateOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ fontWeight: 700, color: '#3b82f6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 3. Bộ lọc và Tìm kiếm */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Tìm kiếm theo Người thực hiện, Email, Hành động, Đối tượng, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              size="middle"
            />
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <FilterOutlined style={{ color: '#64748b' }} />
              <Select
                value={actionFilter}
                onChange={setActionFilter}
                style={{ width: 220 }}
              >
                <Option value="ALL">Tất cả hành động</Option>
                <Option value="CREATE">🟢 Thêm mới / Khởi tạo</Option>
                <Option value="UPDATE">🟡 Cập nhật / Phân quyền</Option>
                <Option value="DELETE">🔴 Xóa / Khóa tài khoản</Option>
                <Option value="AUTH">🔵 Đăng nhập / Xác thực</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Hiển thị: <strong>{filteredLogs.length}</strong> bản ghi
            </Text>
          </Col>
        </Row>
      </Card>

      {/* 4. Bảng dữ liệu kiểm toán */}
      <Card style={{ borderRadius: 12 }}>
        <div className="table-responsive-container">
          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            locale={{ emptyText: 'Chưa có nhật ký ghi nhận' }}
            size="middle"
          />
        </div>
      </Card>

      {/* 5. Modal xem chi tiết nhật ký */}
      <Modal
        title={
          <Space>
            <HistoryOutlined style={{ color: '#0284c7' }} />
            <span>Chi Tiết Nhật Ký Kiểm Toán #{selectedLog?.id}</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={650}
      >
        {selectedLog && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Thời gian thực thi">
              {dayjs(selectedLog.createdAt).format('HH:mm:ss.SSS - DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">
              <strong>{selectedLog.username || selectedLog.userFullName || 'Hệ thống'}</strong>
              {selectedLog.userEmail && <span> ({selectedLog.userEmail})</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Mã User ID">
              {selectedLog.userId ? `#${selectedLog.userId}` : 'System Agent'}
            </Descriptions.Item>
            <Descriptions.Item label="Hành động">
              <Tag color={getActionColor(selectedLog.action)}>{selectedLog.action}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đối tượng tác động">
              <Tag color="geekblue">{selectedLog.entityName}</Tag>
              {selectedLog.entityId && <code>ID: {selectedLog.entityId}</code>}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ IP nguồn">
              <code>{selectedLog.ipAddress || '127.0.0.1'}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Chi tiết diễn giải">
              {selectedLog.details || 'Thao tác thực thi thành công'}
            </Descriptions.Item>
            <Descriptions.Item label="Tiêu chuẩn an toàn">
              <Badge status="processing" text="HIPAA Security Rule / Nhật ký bất biến" />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminAuditLogsPage;
