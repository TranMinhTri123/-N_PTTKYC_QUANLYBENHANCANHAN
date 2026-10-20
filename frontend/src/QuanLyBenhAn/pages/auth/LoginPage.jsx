import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Divider, Alert, Space, Card, Tag } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const userData = await login({
        email: values.email?.trim()?.toLowerCase(),
        password: values.password,
      });

      // Tự động phân luồng thông minh theo vai trò người dùng (RBAC Routing)
      const roles = userData?.roles || [];
      if (roles.includes('ROLE_ADMIN')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (roles.includes('ROLE_DOCTOR')) {
        navigate('/doctor/workspace', { replace: true });
      } else {
        navigate('/patient/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  // Điền nhanh tài khoản kiểm thử
  const fillQuickAccount = (email, pwd) => {
    form.setFieldsValue({ email, password: pwd });
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
          Đăng Nhập Hệ Thống
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Chọn đúng tài khoản để truy cập vào phân hệ tương ứng
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

      <Form
        form={form}
        name="login_form"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600 }}>Địa chỉ Email</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập địa chỉ email!' },
            { type: 'email', message: 'Email không đúng định dạng!' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
            placeholder="example@phr.vn"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>}
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Nhập mật khẩu"
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" style={{ color: '#0284c7', fontWeight: 500 }}>
            Quên mật khẩu?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<LoginOutlined />}
            loading={loading}
            block
            style={{ height: 44, fontSize: 16, fontWeight: 600, borderRadius: 8 }}
          >
            Đăng Nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '18px 0', fontSize: 13, color: '#94a3b8' }}>
        Tài khoản kiểm thử nhanh (Demo)
      </Divider>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
        <Tag
          color="blue"
          style={{ cursor: 'pointer', padding: '4px 8px' }}
          onClick={() => fillQuickAccount('admin@phr.vn', 'Admin@123')}
        >
          Admin (admin@phr.vn)
        </Tag>
        <Tag
          color="cyan"
          style={{ cursor: 'pointer', padding: '4px 8px' }}
          onClick={() => fillQuickAccount('doctor@phr.vn', 'Doctor@123')}
        >
          Bác sĩ (doctor@phr.vn)
        </Tag>
        <Tag
          color="green"
          style={{ cursor: 'pointer', padding: '4px 8px' }}
          onClick={() => fillQuickAccount('minhtri210595@gmail.com', 'Password@123')}
        >
          Bệnh nhân (User)
        </Tag>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Chưa có tài khoản sổ sức khỏe?{' '}
          <Link to="/register" style={{ color: '#0284c7', fontWeight: 600 }}>
            Đăng ký ngay
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default LoginPage;
