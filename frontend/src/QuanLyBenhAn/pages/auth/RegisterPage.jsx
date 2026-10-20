import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Typography, Alert, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { vietnamesePhoneRule, birthDateRule, emailRule, passwordRule } from '../../utils/validators';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await authService.register({
        firstname: values.firstname?.trim(),
        lastname: values.lastname?.trim(),
        email: values.email?.trim()?.toLowerCase(),
        password: values.password,
        phone: values.phone?.trim(),
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      });

      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
          Đăng Ký Tài Khoản
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Tạo sổ theo dõi sức khỏe điện tử cá nhân & gia đình
        </Text>
      </div>

      {errorMsg && (
        <Alert
          description={errorMsg}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 20 }}
          onClose={() => setErrorMsg('')}
        />
      )}

      {successMsg && (
        <Alert
          description={successMsg}
          type="success"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Form
        form={form}
        name="register_form"
        layout="vertical"
        onFinish={onFinish}
        size="large"
      >
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="lastname"
              label={<span style={{ fontWeight: 600 }}>Họ và tên đệm</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
            >
              <Input placeholder="Nguyễn Văn" prefix={<UserOutlined style={{ color: '#94a3b8' }} />} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="firstname"
              label={<span style={{ fontWeight: 600 }}>Tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
            >
              <Input placeholder="An" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600 }}>Địa chỉ Email</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            emailRule,
          ]}
        >
          <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="example@gmail.com" />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập SĐT!' },
                vietnamesePhoneRule,
              ]}
            >
              <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0912345678" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="dateOfBirth"
              label={<span style={{ fontWeight: 600 }}>Ngày sinh</span>}
              rules={[
                { required: true, message: 'Vui lòng chọn ngày sinh!' },
                birthDateRule,
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            passwordRule,
          ]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Tối thiểu 6 ký tự" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span style={{ fontWeight: 600 }}>Xác nhận mật khẩu</span>}
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Hai mật khẩu đã nhập không khớp nhau!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Nhập lại mật khẩu" />
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<UserAddOutlined />}
            loading={loading}
            block
            style={{ height: 44, fontSize: 16, fontWeight: 600, borderRadius: 8 }}
          >
            Đăng Ký Tài Khoản
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#0284c7', fontWeight: 600 }}>
            Đăng nhập ngay
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default RegisterPage;
