import React, { useState } from 'react';
import { Steps, Form, Input, Button, Typography, Alert, Result } from 'antd';
import { MailOutlined, NumberOutlined, LockOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const { Title, Text } = Typography;

export const ForgotPasswordPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Bước 0: Gửi yêu cầu cấp mã OTP qua Email
  const handleRequestOtp = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await authService.forgotPassword(values.email);
      setEmail(values.email);
      setCurrentStep(1);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể gửi mã xác nhận. Vui lòng kiểm tra lại email.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 1: Xác thực mã OTP 6 số
  const handleVerifyOtp = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await authService.verifyResetCode(email, values.code);
      setResetCode(values.code);
      setCurrentStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Mã xác nhận OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Thiết lập mật khẩu mới
  const handleResetPassword = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await authService.resetPassword(email, resetCode, values.newPassword);
      setCurrentStep(3);
    } catch (err) {
      setErrorMsg(err.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Khôi Phục Mật Khẩu
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Xác thực mã bảo mật 6 số gửi qua hòm thư điện tử
        </Text>
      </div>

      <Steps
        current={currentStep}
        size="small"
        style={{ marginBottom: 24 }}
        items={[
          { title: 'Email' },
          { title: 'Nhập OTP' },
          { title: 'Mật khẩu mới' },
        ]}
      />

      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setErrorMsg('')}
        />
      )}

      {/* Bước 0: Form nhập Email */}
      {currentStep === 0 && (
        <Form layout="vertical" onFinish={handleRequestOtp} size="large">
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 600 }}>Địa chỉ Email đã đăng ký</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="example@phr.vn" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ height: 44, fontWeight: 600, marginTop: 8 }}
          >
            Gửi Mã Xác Thực OTP
          </Button>
        </Form>
      )}

      {/* Bước 1: Form nhập mã OTP 6 số */}
      {currentStep === 1 && (
        <Form layout="vertical" onFinish={handleVerifyOtp} size="large">
          <Alert
            type="info"
            message={`Mã xác thực 6 số đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư (hiệu lực trong 15 phút).`}
            style={{ marginBottom: 16 }}
            showIcon
          />

          <Form.Item
            name="code"
            label={<span style={{ fontWeight: 600 }}>Mã OTP 6 chữ số</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mã OTP!' },
              { len: 6, message: 'Mã OTP bao gồm đúng 6 chữ số!' },
            ]}
          >
            <Input
              prefix={<NumberOutlined style={{ color: '#94a3b8' }} />}
              placeholder="VD: 123456"
              maxLength={6}
              style={{ letterSpacing: '4px', fontSize: 18, textAlign: 'center', fontWeight: 700 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ height: 44, fontWeight: 600, marginTop: 8 }}
          >
            Xác Minh Mã OTP
          </Button>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Button type="link" onClick={() => setCurrentStep(0)} style={{ fontSize: 13 }}>
              Gửi lại mã hoặc đổi email
            </Button>
          </div>
        </Form>
      )}

      {/* Bước 2: Form thiết lập mật khẩu mới */}
      {currentStep === 2 && (
        <Form layout="vertical" onFinish={handleResetPassword} size="large">
          <Form.Item
            name="newPassword"
            label={<span style={{ fontWeight: 600 }}>Mật khẩu mới</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Tối thiểu 6 ký tự!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span style={{ fontWeight: 600 }}>Xác nhận mật khẩu mới</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Xác nhận lại mật khẩu mới!' },
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
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ height: 44, fontWeight: 600, marginTop: 8 }}
          >
            Lưu Mật Khẩu Mới
          </Button>
        </Form>
      )}

      {/* Bước 3: Đặt lại mật khẩu thành công */}
      {currentStep === 3 && (
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#10b981' }} />}
          title="Đổi Mật Khẩu Thành Công!"
          subTitle="Mật khẩu của bạn đã được cập nhật thành công trên hệ thống. Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ."
          extra={[
            <Button
              type="primary"
              key="login"
              block
              style={{ height: 44, fontWeight: 600 }}
              onClick={() => navigate('/login')}
            >
              Về Trang Đăng Nhập
            </Button>,
          ]}
        />
      )}

      {currentStep < 3 && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#64748b', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeftOutlined /> Quay lại đăng nhập
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
