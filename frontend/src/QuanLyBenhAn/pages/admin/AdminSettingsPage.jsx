import React, { useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, Typography, notification, Row, Col, Divider, Space } from 'antd';
import { SaveOutlined, SafetyCertificateOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      notification.success({
        message: 'Thành Công',
        description: 'Đã lưu cấu hình thông số vận hành hệ thống!',
      });
    }, 600);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
          Cấu Hình Thông Số Hệ Thống
        </Title>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            otpExpiryMinutes: 15,
            maxUploadFileSizeMb: 10,
            shareTokenExpiryDays: 7,
            allowPublicRegistration: true,
            enableHipaaAuditLog: true,
          }}
          size="middle"
        >
          <Title level={5} style={{ color: '#0f172a', marginBottom: 16 }}>
            Giới Hạn Bảo Mật & Xác Thực
          </Title>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="otpExpiryMinutes"
                label={<span style={{ fontWeight: 600 }}>Thời hạn mã OTP (Phút)</span>}
                rules={[{ required: true, message: 'Vui lòng nhập thời hạn!' }]}
              >
                <InputNumber min={5} max={60} style={{ width: '100%' }} suffix="phút" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="shareTokenExpiryDays"
                label={<span style={{ fontWeight: 600 }}>Thời hạn liên kết chia sẻ (Ngày)</span>}
                rules={[{ required: true, message: 'Vui lòng nhập thời hạn!' }]}
              >
                <InputNumber min={1} max={30} style={{ width: '100%' }} suffix="ngày" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5} style={{ color: '#0f172a', marginBottom: 16 }}>
            Lưu Trữ Dữ Liệu & Tệp Đính Kèm
          </Title>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="maxUploadFileSizeMb"
                label={<span style={{ fontWeight: 600 }}>Dung lượng tệp tối đa (MB)</span>}
                rules={[{ required: true, message: 'Vui lòng nhập dung lượng!' }]}
              >
                <InputNumber min={1} max={50} style={{ width: '100%' }} suffix="MB" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5} style={{ color: '#0f172a', marginBottom: 16 }}>
            Quy Chế Vận Hành
          </Title>

          <Space direction="vertical" size={16} style={{ width: '100%', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Cho phép người dùng tự do đăng ký tài khoản (ROLE_USER)</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Nếu tắt, chỉ quản trị viên mới có thể tạo tài khoản mới trên hệ thống
                </div>
              </div>
              <Form.Item name="allowPublicRegistration" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Bật ghi nhận nhật ký kiểm toán an ninh HIPAA (Audit Logs)</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Tự động lưu vết mọi thao tác thêm/sửa/xóa và phân quyền vào cơ sở dữ liệu
                </div>
              </div>
              <Form.Item name="enableHipaaAuditLog" valuePropName="checked" noStyle>
                <Switch defaultChecked disabled />
              </Form.Item>
            </div>
          </Space>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              style={{ borderRadius: 6, fontWeight: 600 }}
            >
              Lưu Cấu Hình Hệ Thống
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
