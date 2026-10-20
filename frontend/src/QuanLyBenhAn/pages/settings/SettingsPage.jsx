import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Descriptions,
  Tag,
  Typography,
  Row,
  Col,
  message,
  Space,
} from 'antd';
import {
  SettingOutlined,
  KeyOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const { Title, Text } = Typography;

export const SettingsPage = () => {
  const { user } = useAuth();
  const [passwordForm] = Form.useForm();
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleChangePassword = async (values) => {
    setSubmittingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmationPassword: values.confirmationPassword,
      });
      message.success('Đổi mật khẩu thành công! Hãy lưu lại mật khẩu mới.');
      passwordForm.resetFields();
    } catch (err) {
      message.error(err.message || 'Mật khẩu hiện tại không chính xác');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <SettingOutlined style={{ color: '#0284c7', marginRight: 10 }} />
            Cài Đặt Tài Khoản & Bảo Mật
          </Title>
          <Text type="secondary">
            Quản lý thông tin xác thực, phân quyền tài khoản và cập nhật mật khẩu đăng nhập
          </Text>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        {/* Thông tin tài khoản */}
        <Col xs={24} md={12}>
          <Card
            title={
              <span>
                <UserOutlined style={{ color: '#0284c7' }} /> Thông tin tài khoản đăng nhập
              </span>
            }
          >
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Họ và tên">
                <strong>{user?.fullName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ Email">
                {user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phân quyền hệ thống">
                <Space wrap>
                  {(user?.roles || []).map((r) => (
                    <Tag
                      color={
                        r === 'ROLE_ADMIN'
                          ? 'error'
                          : r === 'ROLE_DOCTOR'
                          ? 'processing'
                          : 'success'
                      }
                      key={r}
                    >
                      {r === 'ROLE_ADMIN'
                        ? 'Quản trị viên (ADMIN)'
                        : r === 'ROLE_DOCTOR'
                        ? 'Bác sĩ điều trị (DOCTOR)'
                        : 'Người dùng (USER)'}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái tài khoản">
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Đang hoạt động (Kích hoạt)
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: '#f0fdf4',
                borderRadius: 8,
                border: '1px solid #bbf7d0',
              }}
            >
              <Space align="start">
                <SafetyCertificateOutlined style={{ fontSize: 24, color: '#16a34a' }} />
                <div>
                  <Text strong style={{ color: '#166534' }}>
                    Tài khoản được bảo vệ bởi tiêu chuẩn mã hóa SHA-256
                  </Text>
                  <p style={{ margin: 0, fontSize: 13, color: '#15803d' }}>
                    Mọi phiên truy cập của bạn đều được cấp chứng thực JWT có thời hạn và bảo vệ an toàn.
                  </p>
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Đổi mật khẩu */}
        <Col xs={24} md={12}>
          <Card
            title={
              <span>
                <KeyOutlined style={{ color: '#0284c7' }} /> Đổi mật khẩu
              </span>
            }
          >
            <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới (Tối thiểu 6 ký tự)"
                dependencies={['currentPassword']}
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (value === getFieldValue('currentPassword')) {
                        return Promise.reject(new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại!'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>

              <Form.Item
                name="confirmationPassword"
                label="Xác nhận lại mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
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
                <Input.Password placeholder="••••••••" />
              </Form.Item>

              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={submittingPassword}
                  icon={<KeyOutlined />}
                >
                  Cập nhật mật khẩu mới
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
