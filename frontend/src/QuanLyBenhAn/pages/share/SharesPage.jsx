import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  ShareAltOutlined,
  PlusOutlined,
  CopyOutlined,
  StopOutlined,
  CheckCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import shareService from '../../services/shareService';
import profileService from '../../services/profileService';
import { formatVnDate } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;

export const SharesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdShareLink, setCreatedShareLink] = useState(null);
  const [form] = Form.useForm();

  // Load profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await profileService.getProfiles();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        setProfiles(list);
        if (list.length > 0) {
          setSelectedProfileId(list[0].id);
        }
      } catch (err) {
        message.error('Không thể tải danh sách hồ sơ');
      }
    };
    fetchProfiles();
  }, []);

  // Load shares for selected profile
  const loadShares = async (pId) => {
    if (!pId) return;
    setLoading(true);
    try {
      const res = await shareService.getSharesByProfile(pId);
      setShares(res.data || []);
    } catch (err) {
      message.error('Không thể tải danh sách liên kết chia sẻ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProfileId) {
      loadShares(selectedProfileId);
    }
  }, [selectedProfileId]);

  const handleCreateShare = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        profileId: selectedProfileId,
        recipientEmail: values.recipientEmail,
        recipientDoctorName: values.recipientDoctorName,
        purpose: values.purpose,
        accessLevel: values.accessLevel || 'READ_ONLY',
        expiresAt: values.expiresAt ? values.expiresAt.format('YYYY-MM-DDTHH:mm:ss') : dayjs().add(7, 'day').format('YYYY-MM-DDTHH:mm:ss'),
      };
      const res = await shareService.createShare(payload);
      message.success('Tạo liên kết chia sẻ thành công!');
      const fullUrl = `${window.location.origin}/share/view/${res.data.shareToken}`;
      setCreatedShareLink(fullUrl);
      loadShares(selectedProfileId);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tạo liên kết chia sẻ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await shareService.revokeShare(id);
      message.success('Đã thu hồi quyền chia sẻ');
      loadShares(selectedProfileId);
    } catch (err) {
      message.error('Không thể thu hồi liên kết');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép liên kết vào bộ nhớ tạm!');
  };

  const columns = [
    {
      title: 'Bác sĩ / Người nhận',
      key: 'recipient',
      render: (_, r) => (
        <div>
          <strong>{r.recipientDoctorName || 'Bác sĩ chuyên khoa'}</strong>
          {r.recipientEmail && (
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>{r.recipientEmail}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Mục đích chia sẻ',
      dataIndex: 'purpose',
      key: 'purpose',
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      render: (lvl) => (
        <Tag color={lvl === 'FULL_ACCESS' ? 'purple' : 'blue'}>
          {lvl === 'FULL_ACCESS' ? 'Toàn quyền xem' : 'Chỉ đọc'}
        </Tag>
      ),
    },
    {
      title: 'Thời hạn đến',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => (
        <Space direction="vertical" size={2}>
          <span>{dayjs(date).format('HH:mm - DD/MM/YYYY')}</span>
          {dayjs(date).isBefore(dayjs()) && <Tag color="error">Đã hết hạn</Tag>}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, r) => {
        if (r.revoked) {
          return <Tag color="default">Đã thu hồi</Tag>;
        }
        if (dayjs(r.expiresAt).isBefore(dayjs())) {
          return <Tag color="error">Hết hạn</Tag>;
        }
        return <Tag color="success">Đang hiệu lực</Tag>;
      },
    },
    {
      title: 'Liên kết',
      key: 'link',
      render: (_, r) => {
        const link = `${window.location.origin}/share/view/${r.shareToken}`;
        return (
          <Space>
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => copyToClipboard(link)}
            >
              Sao chép
            </Button>
            <Button
              icon={<LinkOutlined />}
              size="small"
              type="link"
              onClick={() => window.open(link, '_blank')}
            >
              Mở
            </Button>
          </Space>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        !r.revoked && (
          <Popconfirm
            title="Xác nhận thu hồi quyền truy cập?"
            description="Bác sĩ sẽ không thể xem hồ sơ này nữa."
            onConfirm={() => handleRevoke(r.id)}
            okText="Thu hồi ngay"
            cancelText="Hủy"
          >
            <Button danger size="small" icon={<StopOutlined />}>
              Thu hồi
            </Button>
          </Popconfirm>
        )
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <ShareAltOutlined style={{ color: '#0284c7', marginRight: 10 }} />
            Chia Sẻ Hồ Sơ Y Tế Cho Bác Sĩ
          </Title>
          <Text type="secondary">
            Cấp quyền xem hồ sơ an toàn bằng mã token bảo mật có thời hạn cho bác sĩ thăm khám
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setCreatedShareLink(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            disabled={!selectedProfileId}
          >
            Tạo liên kết chia sẻ mới
          </Button>
        </Col>
      </Row>

      {/* Bộ chọn hồ sơ */}
      <Card style={{ marginBottom: 20 }}>
        <Row align="middle" gutter={16}>
          <Col xs={24} md={6}>
            <Text strong>Chọn thành viên cần chia sẻ:</Text>
          </Col>
          <Col xs={24} md={18}>
            <Select
              style={{ width: '100%' }}
              value={selectedProfileId}
              onChange={(val) => setSelectedProfileId(val)}
              placeholder="Chọn hồ sơ thành viên"
            >
              {(Array.isArray(profiles) ? profiles : []).map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.fullName} ({p.relationshipToOwner || 'Chủ tài khoản'}) - Ngày sinh: {formatVnDate(p.dateOfBirth)}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <div className="table-responsive-container">
          <Table
            columns={columns}
            dataSource={Array.isArray(shares) ? shares : []}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Chưa có liên kết chia sẻ nào cho hồ sơ này' }}
          />
        </div>
      </Card>

      {/* Modal tạo chia sẻ */}
      <Modal
        title="Tạo liên kết chia sẻ hồ sơ bệnh án"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {createdShareLink ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#16a34a', marginBottom: 16 }} />
            <Title level={4}>Liên kết chia sẻ đã sẵn sàng!</Title>
            <Text type="secondary">
              Gửi liên kết này cho bác sĩ của bạn. Bác sĩ không cần đăng nhập vẫn có thể xem được hồ sơ trong thời hạn quy định.
            </Text>
            <div style={{ marginTop: 20, marginBottom: 20, padding: 12, background: '#f8fafc', borderRadius: 8, wordBreak: 'break-all' }}>
              <code>{createdShareLink}</code>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(createdShareLink)}
              >
                Sao chép liên kết
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
            </Space>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              accessLevel: 'READ_ONLY',
              expiresAt: dayjs().add(7, 'day'),
            }}
            onFinish={handleCreateShare}
          >
            <Form.Item
              name="recipientDoctorName"
              label="Tên Bác sĩ tiếp nhận (Tùy chọn)"
            >
              <Input placeholder="Ví dụ: BS. Trần Thị Mai" />
            </Form.Item>

            <Form.Item
              name="recipientEmail"
              label="Email Bác sĩ tiếp nhận (Tùy chọn)"
            >
              <Input type="email" placeholder="doctor@hospital.vn" />
            </Form.Item>

            <Form.Item
              name="purpose"
              label="Mục đích chia sẻ"
              rules={[{ required: true, message: 'Nhập mục đích chia sẻ' }]}
            >
              <Input placeholder="Ví dụ: Khám bệnh tim mạch tại Bệnh viện Bạch Mai" />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="accessLevel" label="Phạm vi truy cập">
                  <Select>
                    <Select.Option value="READ_ONLY">Chỉ đọc bệnh án</Select.Option>
                    <Select.Option value="FULL_ACCESS">Xem đầy đủ & Cận lâm sàng</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expiresAt"
                  label="Thời hạn hiệu lực"
                  rules={[
                    { required: true, message: 'Vui lòng chọn thời hạn hiệu lực!' },
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        if (value.isBefore(dayjs())) {
                          return Promise.reject(new Error('Thời hạn hiệu lực phải ở thời điểm tương lai!'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Tạo mã chia sẻ
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default SharesPage;
