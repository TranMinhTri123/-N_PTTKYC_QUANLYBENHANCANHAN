import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Typography, Tag, Space, Modal, Form, Input, Select, DatePicker, Empty, Popconfirm, notification } from 'antd';
import { PlusOutlined, UserOutlined, IdcardOutlined, MedicineBoxOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import profileService from '../../services/profileService';
import { formatVnDate, maskIdentity } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;
const { Option } = Select;

export const ProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfiles();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setProfiles(list);
    } catch (err) {
      notification.error({
        message: 'Lỗi tải hồ sơ',
        description: err.message || 'Không thể tải danh sách hồ sơ gia đình.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (location.search.includes('create=true')) {
      setModalVisible(true);
    }
  }, [location.search]);

  // Xử lý tạo hồ sơ mới
  const handleCreateProfile = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        gender: values.gender,
        relationship: values.relationship,
        bloodType: values.bloodType,
        cccd: values.cccd,
        bhytNumber: values.bhytNumber,
        addressDetail: values.addressDetail,
      };

      await profileService.createProfile(payload);
      notification.success({
        message: 'Thêm thành công!',
        description: `Hồ sơ ${values.fullName} đã được thêm vào sổ sức khỏe gia đình.`,
      });

      setModalVisible(false);
      form.resetFields();
      fetchProfiles();
    } catch (err) {
      notification.error({
        message: 'Thêm hồ sơ thất bại',
        description: err.message || 'Vui lòng kiểm tra lại thông tin.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa hồ sơ
  const handleDeleteProfile = async (id, name) => {
    try {
      await profileService.deleteProfile(id);
      notification.success({
        message: 'Xóa thành công',
        description: `Đã xóa hồ sơ của ${name}.`,
      });
      fetchProfiles();
    } catch (err) {
      notification.error({
        message: 'Lỗi xóa hồ sơ',
        description: err.message || 'Không thể xóa hồ sơ.',
      });
    }
  };

  const getRelationshipTag = (rel) => {
    const map = {
      SELF: { text: 'Bản Thân', color: 'blue' },
      FATHER: { text: 'Bố / Cha', color: 'cyan' },
      MOTHER: { text: 'Mẹ', color: 'pink' },
      SPOUSE: { text: 'Vợ / Chồng', color: 'purple' },
      CHILD: { text: 'Con Cái', color: 'green' },
      OTHER: { text: 'Người Thân Khác', color: 'default' },
    };
    const item = map[rel] || { text: rel, color: 'default' };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            Hồ Sơ Sức Khỏe (Cá Nhân & Gia Đình)
          </Title>
          <Text type="secondary">
            Quản lý tập trung hồ sơ y tế, dị ứng và bệnh nền của bản thân và các thành viên gia đình
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ height: 44, fontWeight: 600 }}
          onClick={() => setModalVisible(true)}
        >
          Thêm Hồ Sơ Người Bệnh
        </Button>
      </div>

      {/* Profiles Cards Grid */}
      {profiles.length === 0 && !loading ? (
        <Empty
          description="Chưa có hồ sơ sức khỏe nào"
          style={{ padding: '60px 0' }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            Tạo Hồ Sơ Đầu Tiên
          </Button>
        </Empty>
      ) : (
        <Row gutter={[20, 20]}>
          {(Array.isArray(profiles) ? profiles : []).map((p) => (
            <Col xs={24} sm={12} lg={8} key={p.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
                actions={[
                  <Button
                    type="link"
                    key="view"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/profiles/${p.id}`)}
                  >
                    Xem Chi Tiết & Dị Ứng
                  </Button>,
                  <Popconfirm
                    key="del"
                    title="Xác nhận xóa hồ sơ"
                    description={`Bạn có chắc chắn muốn xóa hồ sơ của ${p.fullName}?`}
                    okText="Xóa"
                    cancelText="Hủy"
                    okType="danger"
                    onConfirm={() => handleDeleteProfile(p.id, p.fullName)}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: p.gender === 'FEMALE' ? '#fdf2f8' : '#e0f2fe',
                      color: p.gender === 'FEMALE' ? '#ec4899' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    <UserOutlined />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 17, display: 'block' }}>
                      {p.fullName}
                    </Text>
                    <Space size={6}>
                      {getRelationshipTag(p.relationship)}
                      {p.bloodType && <Tag color="volcano">Nhóm máu: {p.bloodType}</Tag>}
                    </Space>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#475569' }}>
                  <div>
                    <Text type="secondary">Ngày sinh: </Text>
                    <strong>{formatVnDate(p.dateOfBirth)}</strong>
                  </div>
                  <div>
                    <Text type="secondary">Số CCCD: </Text>
                    <span>{maskIdentity(p.cccd, 'CCCD')}</span>
                  </div>
                  <div>
                    <Text type="secondary">Mã BHYT: </Text>
                    <span>{maskIdentity(p.bhytNumber, 'BHYT')}</span>
                  </div>
                  <div>
                    <Text type="secondary">Địa chỉ: </Text>
                    <span>{p.addressDetail || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal Thêm hồ sơ mới */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 18 }}>Thêm Hồ Sơ Thành Viên Mới</span>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={580}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateProfile} size="large" style={{ marginTop: 16 }}>
          <Form.Item
            name="fullName"
            label={<span style={{ fontWeight: 600 }}>Họ và tên thành viên</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên thành viên!' },
              { max: 60, message: 'Họ tên không được vượt quá 60 ký tự!' },
              { whitespace: true, message: 'Họ tên không được chỉ chứa khoảng trắng!' },
            ]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn Bình" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="relationship"
                label={<span style={{ fontWeight: 600 }}>Quan hệ với chủ tài khoản</span>}
                rules={[{ required: true, message: 'Chọn mối quan hệ!' }]}
              >
                <Select placeholder="Chọn quan hệ">
                  <Option value="SELF">Bản Thân (Chủ tài khoản)</Option>
                  <Option value="FATHER">Bố / Cha</Option>
                  <Option value="MOTHER">Mẹ</Option>
                  <Option value="SPOUSE">Vợ / Chồng</Option>
                  <Option value="CHILD">Con Cái</Option>
                  <Option value="OTHER">Người Thân Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={<span style={{ fontWeight: 600 }}>Giới tính</span>}
                rules={[{ required: true, message: 'Chọn giới tính!' }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label={<span style={{ fontWeight: 600 }}>Ngày sinh</span>}
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày sinh!' },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (value.isAfter(dayjs(), 'day')) {
                        return Promise.reject(new Error('Ngày sinh không thể là ngày trong tương lai!'));
                      }
                      if (value.isBefore(dayjs().subtract(120, 'year'))) {
                        return Promise.reject(new Error('Ngày sinh không hợp lệ (vượt quá 120 năm)!'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bloodType"
                label={<span style={{ fontWeight: 600 }}>Nhóm máu (Nếu biết)</span>}
              >
                <Select placeholder="Chọn nhóm máu" allowClear>
                  <Option value="A+">A+</Option>
                  <Option value="A-">A-</Option>
                  <Option value="B+">B+</Option>
                  <Option value="B-">B-</Option>
                  <Option value="AB+">AB+</Option>
                  <Option value="AB-">AB-</Option>
                  <Option value="O+">O+</Option>
                  <Option value="O-">O-</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="cccd"
                label={<span style={{ fontWeight: 600 }}>Số CCCD (12 số)</span>}
                rules={[
                  {
                    pattern: /^[0-9]{9}([0-9]{3})?$/,
                    message: 'Số CCCD/CMND phải là 9 hoặc 12 chữ số!',
                  },
                ]}
              >
                <Input placeholder="079123456789" maxLength={12} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bhytNumber"
                label={<span style={{ fontWeight: 600 }}>Mã thẻ BHYT</span>}
                rules={[
                  {
                    pattern: /^[A-Z0-9]{10,15}$/i,
                    message: 'Mã BHYT gồm 10 đến 15 ký tự chữ và số!',
                  },
                ]}
              >
                <Input placeholder="DN4012345678" maxLength={15} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="addressDetail" label={<span style={{ fontWeight: 600 }}>Địa chỉ cư trú</span>}>
            <Input placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ fontWeight: 600 }}>
              Lưu Hồ Sơ
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilesPage;
