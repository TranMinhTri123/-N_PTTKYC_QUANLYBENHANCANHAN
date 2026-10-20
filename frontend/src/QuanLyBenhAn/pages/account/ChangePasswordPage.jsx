import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, notification } from 'antd';
import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import authService from '../../services/authService';

const { Title, Text } = Typography;

export const ChangePasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmationPassword: values.confirmPassword,
      });

      notification.success({
        message: 'Thành công',
        description: 'Đổi mật khẩu thành công! Mật khẩu mới có hiệu lực ngay lập tức.',
      });
      form.resetFields();
    } catch (err) {
      setErrorMsg(err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <Title level={4} style={{ marginBottom: 4 }}>
        Đổi Mật Khẩu
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        Nên đặt mật khẩu có ít nhất 6 ký tự kết hợp chữ cái và số để đảm bảo an toàn
      </Text>

      {errorMsg && (
        <Alert
          type="error"
          showIcon
          closable
          description={errorMsg}
          style={{ marginBottom: 16 }}
          onClose={() => setErrorMsg('')}
        />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          name="currentPassword"
          label={<span style={{ fontWeight: 600 }}>Mật khẩu hiện tại</span>}
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Nhập mật khẩu đang dùng"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={<span style={{ fontWeight: 600 }}>Mật khẩu mới</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tối thiểu 6 ký tự"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span style={{ fontWeight: 600 }}>Xác nhận mật khẩu mới</span>}
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
          <Input.Password
            prefix={<KeyOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Nhập lại mật khẩu mới"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ borderRadius: 6, fontWeight: 600 }}
          >
            Lưu & Cập Nhật Mật Khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePasswordPage;
