import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  QRCode,
  notification,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import {
  ShareAltOutlined,
  PlusOutlined,
  QrcodeOutlined,
  StopOutlined,
  CopyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import shareService from '../../services/shareService';
import profileService from '../../services/profileService';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const PatientSharesPage = () => {
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [shareRes, profRes] = await Promise.allSettled([
        shareService.getShares(),
        profileService.getProfiles(),
      ]);

      if (shareRes.status === 'fulfilled') {
        const list = Array.isArray(shareRes.value?.data) ? shareRes.value.data : (shareRes.value?.data?.content || []);
        setShares(list);
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

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateShare = async (values) => {
    try {
      const res = await shareService.createShare({
        profileId: values.profileId,
        scope: values.scope || 'READ_ONLY',
        durationHours: (values.durationDays || 7) * 24,
      });

      notification.success({ message: 'Tạo liên kết chia sẻ thành công!' });
      setCreateModalOpen(false);
      form.resetFields();
      loadData();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message || 'Không thể tạo chia sẻ.' });
    }
  };

  const handleRevokeShare = async (id) => {
    try {
      await shareService.revokeShare(id);
      notification.success({ message: 'Đã thu hồi quyền chia sẻ tức thì!' });
      loadData();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message || 'Không thể thu hồi.' });
    }
  };

  const openQrModal = (record) => {
    setSelectedShare(record);
    setQrModalOpen(true);
  };

  const getShareUrl = (token) => {
    return `${window.location.origin}/share/view/${token}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Chia Sẻ Hồ Sơ & Mã QR
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
          style={{ borderRadius: 6, fontWeight: 600, background: '#0284c7' }}
        >
          Tạo Mã Chia Sẻ
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={shares}
          rowKey={(r) => r.id || r.shareToken}
          loading={loading}
          pagination={false}
          columns={[
            {
              title: 'Mã Token Bảo Mật',
              dataIndex: 'shareToken',
              key: 'shareToken',
              render: (token) => (
                <Text code copyable={{ text: getShareUrl(token) }}>
                  {token ? `${token.slice(0, 10)}...${token.slice(-6)}` : '-'}
                </Text>
              ),
            },
            {
              title: 'Phạm Vi Cấp Quyền',
              dataIndex: 'permissionScope',
              key: 'permissionScope',
              render: (scope) => (
                <Tag color={scope === 'FULL_ACCESS' ? 'purple' : 'blue'}>
                  {scope === 'FULL_ACCESS' ? 'Toàn Quyền Xem' : 'Chỉ Xem Cơ Bản'}
                </Tag>
              ),
            },
            {
              title: 'Hết Hạn Lúc',
              dataIndex: 'expiresAt',
              key: 'expiresAt',
              render: (exp) => (
                <span>
                  <ClockCircleOutlined style={{ marginRight: 4, color: '#64748b' }} />
                  {exp ? formatDate(exp) : '7 ngày'}
                </span>
              ),
            },
            {
              title: 'Trạng Thái',
              dataIndex: 'status',
              key: 'status',
              render: (st) => (
                <Tag color={st === 'ACTIVE' ? 'success' : 'default'}>
                  {st === 'ACTIVE' ? 'Đang Hiệu Lực' : 'Đã Thu Hồi'}
                </Tag>
              ),
            },
            {
              title: 'Thao Tác',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    size="small"
                    icon={<QrcodeOutlined />}
                    onClick={() => openQrModal(record)}
                  >
                    Mã QR
                  </Button>
                  {record.status === 'ACTIVE' && (
                    <Popconfirm
                      title="Thu hồi quyền chia sẻ này?"
                      description="Bác sĩ sẽ không thể truy cập vào hồ sơ qua liên kết này nữa."
                      onConfirm={() => handleRevokeShare(record.id)}
                    >
                      <Button size="small" danger icon={<StopOutlined />}>
                        Thu Hồi
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Tạo Chia Sẻ Mới */}
      <Modal
        title="Tạo Liên Kết Chia Sẻ Hồ Sơ"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateShare} style={{ marginTop: 16 }}>
          <Form.Item name="profileId" label="Chọn hồ sơ thành viên cần chia sẻ" rules={[{ required: true }]}>
            <Select placeholder="Chọn hồ sơ...">
              {profiles.map((p) => (
                <Option key={p.id} value={p.id}>{p.fullName} ({p.relationship || 'Bản thân'})</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="scope" label="Phạm vi cấp quyền" initialValue="READ_ONLY">
                <Select>
                  <Option value="READ_ONLY">Chỉ xem đợt khám & dị ứng</Option>
                  <Option value="FULL_ACCESS">Toàn quyền (kèm xét nghiệm, CĐHA)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="durationDays" label="Thời hạn hiệu lực (Ngày)" initialValue={7}>
                <InputNumber min={1} max={30} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" style={{ background: '#0284c7' }}>
              Sinh Mã Token Chia Sẻ
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Quét Mã QR */}
      <Modal
        title="Mã QR Cho Bác Sĩ Quét Bằng Điện Thoại"
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedShare && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ display: 'inline-block', padding: 12, background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <QRCode value={getShareUrl(selectedShare.shareToken)} size={200} />
            </div>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Bác sĩ có thể dùng camera điện thoại hoặc Zalo để quét xem hồ sơ mà không cần đăng nhập.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientSharesPage;
