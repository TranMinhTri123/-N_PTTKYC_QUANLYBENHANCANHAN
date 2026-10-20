import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  notification,
  Avatar,
  Divider,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  IdcardOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import profileService from '../../services/profileService';
import { formatDate, maskPii, formatRelationship } from '../../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;

export const PatientProfilesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [form] = Form.useForm();

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfiles();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setProfiles(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleOpenCreate = () => {
    setEditingProfile(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (prof) => {
    setEditingProfile(prof);
    form.setFieldsValue({
      fullName: prof.fullName,
      gender: prof.gender,
      relationship: prof.relationship,
      dateOfBirth: prof.dateOfBirth ? dayjs(prof.dateOfBirth) : null,
      identityCardNumber: prof.identityCardNumber,
      healthInsuranceNumber: prof.healthInsuranceNumber,
      bloodType: prof.bloodType || 'O_POSITIVE',
      phoneNumber: prof.phoneNumber,
      address: prof.address,
    });
    setModalOpen(true);
  };

  const handleSubmitProfile = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        fullName: values.fullName?.trim(),
        gender: values.gender,
        relationship: values.relationship,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        identityCardNumber: values.identityCardNumber?.trim(),
        healthInsuranceNumber: values.healthInsuranceNumber?.trim(),
        bloodType: values.bloodType,
        phoneNumber: values.phoneNumber?.trim(),
        address: values.address?.trim(),
      };

      if (editingProfile) {
        await profileService.updateProfile(editingProfile.id, payload);
        notification.success({ message: 'Cập nhật hồ sơ thành công!' });
      } else {
        await profileService.createProfile(payload);
        notification.success({ message: 'Thêm mới hồ sơ thành viên thành công!' });
      }
      setModalOpen(false);
      loadProfiles();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message || 'Thao tác thất bại.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Hồ Sơ Sức Khỏe Gia Đình
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          style={{ borderRadius: 6, fontWeight: 600, background: '#0284c7' }}
        >
          Thêm Hồ Sơ
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {profiles.map((p) => (
          <Col xs={24} sm={12} lg={8} key={p.id}>
            <Card
              className="medical-card"
              style={{ borderRadius: 12, borderTop: p.relationship === 'SELF' ? '4px solid #0284c7' : '4px solid #10b981' }}
              actions={[
                <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/patient/profiles/${p.id}`)}>
                  Chi Tiết
                </Button>,
                <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEdit(p)}>
                  Sửa
                </Button>,
              ]}
            >
              <Space size={14} align="start" style={{ marginBottom: 12 }}>
                <Avatar
                  size={52}
                  style={{
                    backgroundColor: p.gender === 'FEMALE' ? '#ec4899' : '#0284c7',
                    fontWeight: 700,
                  }}
                >
                  {p.fullName?.charAt(0) || 'U'}
                </Avatar>
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {p.fullName}
                  </Title>
                  <Space style={{ marginTop: 4 }}>
                    <Tag color="blue">{formatRelationship(p.relationship)}</Tag>
                    {p.bloodType && <Tag color="red">Nhóm {p.bloodType.replace('_', ' ')}</Tag>}
                  </Space>
                </div>
              </Space>

              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8 }}>
                <div><strong>Ngày sinh:</strong> {p.dateOfBirth ? formatDate(p.dateOfBirth) : '-'}</div>
                <div><strong>Giới tính:</strong> {p.gender === 'FEMALE' ? 'Nữ' : 'Nam'}</div>
                <div><strong>Số CCCD:</strong> {p.identityCardNumber ? maskPii(p.identityCardNumber) : '-'}</div>
                <div><strong>Thẻ BHYT:</strong> {p.healthInsuranceNumber ? maskPii(p.healthInsuranceNumber) : '-'}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal Thêm/Sửa Hồ Sơ */}
      <Modal
        title={editingProfile ? 'Chỉnh Sửa Hồ Sơ Người Thân' : 'Thêm Hồ Sơ Thành Viên Mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitProfile} style={{ marginTop: 16 }}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="relationship" label="Quan hệ gia đình" rules={[{ required: true }]}>
                <Select>
                  <Option value="SELF">Bản thân</Option>
                  <Option value="FATHER">Bố</Option>
                  <Option value="MOTHER">Mẹ</Option>
                  <Option value="SPOUSE">Vợ / Chồng</Option>
                  <Option value="CHILD">Con</Option>
                  <Option value="OTHER">Người thân khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                <Select>
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bloodType" label="Nhóm máu">
                <Select placeholder="Chọn nhóm máu">
                  <Option value="A_POSITIVE">A+</Option>
                  <Option value="A_NEGATIVE">A-</Option>
                  <Option value="B_POSITIVE">B+</Option>
                  <Option value="B_NEGATIVE">B-</Option>
                  <Option value="O_POSITIVE">O+</Option>
                  <Option value="O_NEGATIVE">O-</Option>
                  <Option value="AB_POSITIVE">AB+</Option>
                  <Option value="AB_NEGATIVE">AB-</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="identityCardNumber" label="Số CCCD">
                <Input placeholder="12 số..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="healthInsuranceNumber" label="Mã thẻ BHYT">
                <Input placeholder="15 ký tự..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 16, marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting} style={{ background: '#0284c7' }}>
                Lưu Hồ Sơ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientProfilesPage;
