import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  Avatar,
  Space,
  Tag,
  Divider,
  InputNumber,
  message,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  SaveOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  BookOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PHR_DEPARTMENTS = [
  'Khoa Khám Bệnh',
  'Khoa Nội Tổng Hợp',
  'Khoa Ngoại Tổng Hợp',
  'Khoa Sản Phụ Khoa',
  'Khoa Nhi',
  'Khoa Tim Mạch - Lồng Ngực',
  'Khoa Mắt',
  'Khoa Tai Mũi Họng',
  'Khoa Răng Hàm Mặt',
  'Khoa Chẩn Đoán Hình Ảnh & Thăm Dò Chức Năng',
];

const ACADEMIC_TITLES = [
  'Bác sĩ (BS)',
  'Bác sĩ Chuyên khoa 1 (BS. CKI)',
  'Bác sĩ Chuyên khoa 2 (BS. CKII)',
  'Thạc sĩ, Bác sĩ (ThS. BS)',
  'Tiến sĩ, Bác sĩ (TS. BS)',
  'Phó Giáo sư, Tiến sĩ (PGS. TS)',
  'Giáo sư, Tiến sĩ (GS. TS)',
];

export const DoctorProfilePage = () => {
  const { user } = useAuth();
  const profileKey = `phr_doctor_profile_${user?.id || 'current'}`;

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  // Initial values from localStorage or user state
  const initialProfile = (() => {
    const saved = localStorage.getItem(profileKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      fullName: user?.fullName || 'BS. CK1 Nguyễn Văn An',
      phone: user?.phone || '0912345678',
      email: user?.email || 'doctor@phr.vn',
      hospitalName: 'Bệnh viện Đa khoa PHR',
      department: user?.department || 'Khoa Nội Tổng Hợp',
      title: 'Bác sĩ Chuyên khoa 1 (BS. CKI)',
      experienceYears: 12,
      licenseNumber: `CCHN-${String(user?.id || 10).padStart(5, '0')}/BYT`,
      bio: 'Bác sĩ có hơn 12 năm kinh nghiệm trong chẩn đoán và điều trị các bệnh lý nội khoa, tim mạch và rối loạn chuyển hóa.',
    };
  })();

  const handleSaveProfile = async (values) => {
    setSaving(true);
    try {
      localStorage.setItem(profileKey, JSON.stringify(values));
      try {
        await authService.updateProfile({
          firstName: values.fullName?.split(' ').slice(0, -1).join(' ') || values.fullName,
          lastName: values.fullName?.split(' ').slice(-1).join(' ') || '',
          phone: values.phone,
          department: values.department,
        });
      } catch (err) {
        console.warn('Lỗi đồng bộ backend profile:', err);
      }
      message.success('Cập nhật thông tin hồ sơ bác sĩ thành công!');
    } catch (err) {
      message.error('Lỗi khi lưu hồ sơ: ' + (err.message || 'Lỗi'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values) => {
    setChangingPass(true);
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmationPassword: values.confirmationPassword,
      });
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div style={{ padding: '0 4px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#0f766e' }}>
          Hồ Sơ & Tài Khoản Bác Sĩ
        </Title>
        <Text type="secondary">
          Quản lý thông tin định danh chuyên môn, học vị, chuyên khoa công tác và bảo mật tài khoản
        </Text>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          color: '#ffffff',
          marginBottom: 20,
        }}
      >
        <Space size={20} align="center">
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#ffffff', color: '#0f766e', fontWeight: 700, fontSize: 32 }}
          />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
              {initialProfile.title} {initialProfile.fullName}
            </div>
            <div style={{ color: '#ccfbf1', marginTop: 4, fontSize: 14 }}>
              🏥 {initialProfile.hospitalName} • 👨‍⚕️ {initialProfile.department}
            </div>
            <div style={{ marginTop: 8 }}>
              <Tag color="cyan" style={{ fontWeight: 600 }}>
                {initialProfile.licenseNumber}
              </Tag>
              <Tag color="geekblue" style={{ fontWeight: 600 }}>
                {initialProfile.experienceYears} năm kinh nghiệm
              </Tag>
              <Tag color="green" style={{ fontWeight: 600 }}>
                Tài khoản cấp bởi Ban Giám Đốc
              </Tag>
            </div>
          </div>
        </Space>
      </Card>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: (
              <span>
                <IdcardOutlined /> Thông Tin Chuyên Môn
              </span>
            ),
            children: (
              <Card
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={initialProfile}
                  onFinish={handleSaveProfile}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="fullName"
                        label="Họ và tên bác sĩ"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Ví dụ: BS. CK1 Nguyễn Văn An" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="title"
                        label="Học vị / Học hàm"
                        rules={[{ required: true, message: 'Vui lòng chọn học vị!' }]}
                      >
                        <Select placeholder="Chọn học vị y khoa">
                          {ACADEMIC_TITLES.map((t) => (
                            <Option key={t} value={t}>
                              {t}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hospitalName"
                        label="Bệnh viện công tác (Cố định theo tài khoản)"
                      >
                        <Input
                          prefix={<MedicineBoxOutlined />}
                          disabled
                          style={{ background: '#f8fafc', fontWeight: 600, color: '#0f766e' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="department"
                        label="Chuyên khoa công tác (Thuộc BV Đa khoa PHR)"
                        rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa!' }]}
                      >
                        <Select placeholder="Chọn chuyên khoa">
                          {PHR_DEPARTMENTS.map((dept) => (
                            <Option key={dept} value={dept}>
                              {dept}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="experienceYears"
                        label="Số năm kinh nghiệm"
                        rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm!' }]}
                      >
                        <InputNumber min={1} max={60} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại liên hệ"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                      >
                        <Input prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="licenseNumber"
                        label="Số chứng chỉ hành nghề (CCHN)"
                      >
                        <Input prefix={<SafetyCertificateOutlined />} disabled style={{ background: '#f8fafc' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="bio"
                    label="Giới thiệu tóm tắt quá trình công tác y khoa & thế mạnh chuyên môn"
                  >
                    <TextArea rows={4} placeholder="Ví dụ: Tốt nghiệp Đại học Y Dược... có kinh nghiệm khám và điều trị..." />
                  </Form.Item>

                  <Divider />

                  <div style={{ textAlign: 'right' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={saving}
                      style={{ background: '#0f766e', borderColor: '#0f766e', minWidth: 140 }}
                    >
                      Lưu Hồ Sơ
                    </Button>
                  </div>
                </Form>
              </Card>
            ),
          },
          {
            key: '2',
            label: (
              <span>
                <KeyOutlined /> Đổi Mật Khẩu
              </span>
            ),
            children: (
              <Card
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', maxWidth: 600 }}
              >
                <Title level={5}>Thay Đổi Mật Khẩu Đăng Nhập</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                  Để bảo mật thông tin bệnh án y khoa, mật khẩu mới nên có tối thiểu 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                </Text>

                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                  <Form.Item
                    name="currentPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                      { min: 6, message: 'Mật khẩu phải có tối thiểu 6 ký tự!' },
                    ]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                  </Form.Item>

                  <Form.Item
                    name="confirmationPassword"
                    label="Xác nhận mật khẩu mới"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Nhập lại mật khẩu mới" />
                  </Form.Item>

                  <div style={{ textAlign: 'right', marginTop: 20 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={changingPass}
                      style={{ background: '#0f766e', borderColor: '#0f766e' }}
                    >
                      Đổi Mật Khẩu
                    </Button>
                  </div>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default DoctorProfilePage;
