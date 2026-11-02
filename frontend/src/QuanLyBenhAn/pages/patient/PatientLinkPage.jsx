import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Alert, message, Space, Descriptions, Tag, Modal, Popconfirm, Divider, DatePicker } from 'antd';
import { IdcardOutlined, LinkOutlined, DisconnectOutlined, CheckCircleOutlined, SafetyCertificateOutlined, UserOutlined, CalendarOutlined, KeyOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

export const PatientLinkPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [linkedPatient, setLinkedPatient] = useState(null);
  const [fetching, setFetching] = useState(true);

  const fetchLinkedPatient = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8088/api/v1/patients/my-record', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 200 && res.data) {
        setLinkedPatient(res.data);
      } else {
        setLinkedPatient(null);
      }
    } catch (err) {
      // 204 or 404 means no linked patient yet
      setLinkedPatient(null);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLinkedPatient();
  }, []);

  const handleLink = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        mrn: values.mrn.trim().toUpperCase(),
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        verificationLast4: values.verificationLast4.trim(),
      };
      const res = await axios.post(
        'http://localhost:8088/api/v1/patients/link',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Liên kết hồ sơ bệnh nhân thành công!');
      setLinkedPatient(res.data);
      form.resetFields();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Thông tin xác thực hoặc Mã bệnh nhân không chính xác.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8088/api/v1/patients/unlink',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Đã gỡ liên kết hồ sơ bệnh nhân.');
      setLinkedPatient(null);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể gỡ liên kết.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            <IdcardOutlined style={{ color: '#0284c7', marginRight: 8 }} />
            Định Danh & Liên Kết Hồ Sơ Bệnh Viện
          </Title>
          <Text type="secondary">
            Liên kết tài khoản của bạn với Mã Bệnh Nhân (MRN) do Bệnh viện cấp để tra cứu bệnh án chính thống.
          </Text>
        </div>

        {linkedPatient ? (
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #bae6fd' }}
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#10b981' }} />
                <span>Hồ Sơ Đã Được Xác Thực Liên Kết</span>
                <Tag color="success">CHÍNH CHỦ</Tag>
              </Space>
            }
            extra={
              <Popconfirm
                title="Gỡ liên kết hồ sơ bệnh án?"
                description="Bạn sẽ không thể tiếp tục xem bệnh án nếu gỡ liên kết này."
                onConfirm={handleUnlink}
                okText="Đồng ý gỡ"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DisconnectOutlined />} loading={loading}>
                  Gỡ Liên Kết
                </Button>
              </Popconfirm>
            }
          >
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Mã Bệnh Nhân (MRN)">
                <Text strong copyable style={{ color: '#0284c7', fontSize: 16 }}>
                  {linkedPatient.mrn}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Họ và Tên">
                <Text strong style={{ textTransform: 'uppercase' }}>
                  {linkedPatient.fullName}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {linkedPatient.dateOfBirth}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {linkedPatient.gender === 'MALE' ? 'Nam' : 'Nữ'}
              </Descriptions.Item>
              <Descriptions.Item label="Số CCCD / Định danh">
                {linkedPatient.nationalId || '---'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại đăng ký">
                {linkedPatient.phone || '---'}
              </Descriptions.Item>
              <Descriptions.Item label="Nhóm máu">
                <Tag color="red">{linkedPatient.bloodType || 'Chưa xác định'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tiền sử dị ứng" span={2}>
                {linkedPatient.allergies ? (
                  <Tag color="error">{linkedPatient.allergies}</Tag>
                ) : (
                  <Text type="secondary">Chưa ghi nhận dị ứng</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={3}>
                {linkedPatient.address || '---'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : (
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Alert
              message="Tài khoản chưa được liên kết với Bệnh án"
              description="Để bảo mật thông tin y tế, bạn cần nhập đúng Mã Bệnh Nhân (MRN) được in trên Thẻ khám bệnh, Phiếu khám hoặc Đơn thuốc do Bệnh viện cấp."
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              style={{ marginBottom: 24, borderRadius: 8 }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleLink}
              style={{ maxWidth: 500 }}
            >
              <Form.Item
                name="mrn"
                label={<Text strong>Mã Bệnh Nhân (MRN / Patient ID)</Text>}
                rules={[
                  { required: true, message: 'Vui lòng nhập Mã Bệnh Nhân của bạn' },
                  { min: 3, message: 'Mã bệnh nhân tối thiểu 3 ký tự' }
                ]}
                extra="Ví dụ: BN-2026-001 hoặc mã in ở góc trên bên phải phiếu khám bệnh"
              >
                <Input
                  size="large"
                  placeholder="Nhập mã MRN (VD: BN-2026-001)"
                  prefix={<IdcardOutlined style={{ color: '#0284c7' }} />}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>

              <Form.Item
                name="dateOfBirth"
                label={<Text strong>Ngày Sinh Bệnh Nhân</Text>}
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh để đối chiếu xác thực' }]}
              >
                <DatePicker
                  size="large"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh trên giấy tờ"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="verificationLast4"
                label={<Text strong>4 Số Cuối CCCD hoặc Số Điện Thoại Đăng Ký</Text>}
                rules={[
                  { required: true, message: 'Vui lòng nhập 4 số cuối để xác minh chính chủ' },
                  { len: 4, message: 'Phải đúng 4 chữ số' }
                ]}
                extra="Dùng để đối chiếu bảo mật 2 lớp, chống dò quét trái phép"
              >
                <Input
                  size="large"
                  maxLength={4}
                  placeholder="VD: 5432"
                  prefix={<KeyOutlined style={{ color: '#0284c7' }} />}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<LinkOutlined />}
                  loading={loading}
                  style={{ background: '#0284c7', borderRadius: 8 }}
                >
                  Xác Thực & Liên Kết Hồ Sơ
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            <div>
              <Title level={5}>Làm thế nào để lấy Mã Bệnh Nhân (MRN)?</Title>
              <Paragraph type="secondary">
                1. <strong>Trên Đơn thuốc / Phiếu khám</strong>: Mã bệnh nhân được in rõ ràng ở góc trên cùng (kèm mã vạch).<br />
                2. <strong>Tại Quầy tiếp đón</strong>: Bạn có thể xuất trình Căn cước công dân tại Bàn tiếp đón bệnh viện để được nhân viên y tế cấp mã MRN.<br />
                3. Mỗi tài khoản người dùng chỉ được liên kết với một hồ sơ bệnh nhân chính chủ duy nhất.
              </Paragraph>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default PatientLinkPage;

