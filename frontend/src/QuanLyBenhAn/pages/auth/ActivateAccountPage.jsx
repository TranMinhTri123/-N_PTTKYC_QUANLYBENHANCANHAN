import React, { useState, useEffect } from 'react';
import { Result, Button, Spin, Typography, Input, Form, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';

const { Title, Text, Paragraph } = Typography;

export const ActivateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(tokenFromUrl ? 'PENDING' : 'MANUAL'); // PENDING | SUCCESS | ERROR | MANUAL
  const [message, setMessage] = useState('');

  const activateToken = async (tokenToVerify) => {
    if (!tokenToVerify) return;
    setLoading(true);
    setStatus('PENDING');
    try {
      await authService.activateAccount(tokenToVerify);
      setStatus('SUCCESS');
      setMessage('Tài khoản của bạn đã được kích hoạt thành công! Bạn có thể đăng nhập ngay bây giờ.');
    } catch (err) {
      setStatus('ERROR');
      setMessage(err.message || 'Mã kích hoạt không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      activateToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const onManualSubmit = (values) => {
    activateToken(values.token?.trim());
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      {loading && (
        <div style={{ padding: '40px 0' }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 20 }}>
            Đang kích hoạt tài khoản...
          </Title>
          <Text type="secondary">Vui lòng đợi trong giây lát</Text>
        </div>
      )}

      {!loading && status === 'SUCCESS' && (
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#10b981' }} />}
          title="Kích Hoạt Tài Khoản Thành Công!"
          subTitle={message}
          extra={[
            <Button
              type="primary"
              key="login"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate('/login')}
              style={{ background: '#0284c7', borderColor: '#0284c7', borderRadius: 8 }}
            >
              Đăng Nhập Ngay
            </Button>,
          ]}
        />
      )}

      {!loading && status === 'ERROR' && (
        <Result
          status="error"
          icon={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
          title="Kích Hoạt Thất Bại"
          subTitle={message}
          extra={[
            <Button
              type="primary"
              key="try"
              onClick={() => setStatus('MANUAL')}
              style={{ background: '#0284c7', borderColor: '#0284c7', borderRadius: 8 }}
            >
              Nhập Lại Mã Khác
            </Button>,
            <Button key="login" onClick={() => navigate('/login')}>
              Về Trang Đăng Nhập
            </Button>,
          ]}
        />
      )}

      {!loading && status === 'MANUAL' && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <SafetyCertificateOutlined style={{ fontSize: 48, color: '#0284c7', marginBottom: 12 }} />
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
              Kích Hoạt Tài Khoản
            </Title>
            <Text type="secondary">
              Nhập mã kích hoạt được gửi đến hộp thư email của bạn
            </Text>
          </div>

          <Form layout="vertical" onFinish={onManualSubmit}>
            <Form.Item
              name="token"
              rules={[{ required: true, message: 'Vui lòng nhập mã kích hoạt từ email' }]}
            >
              <Input
                size="large"
                placeholder="Dán mã kích hoạt (Token) vào đây..."
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                style={{ background: '#0284c7', borderColor: '#0284c7', borderRadius: 8 }}
              >
                Xác Nhận Kích Hoạt
              </Button>
            </Form.Item>
          </Form>

          <div style={{ marginTop: 16 }}>
            <Link to="/login" style={{ color: '#0284c7', fontWeight: 500 }}>
              ← Đã kích hoạt? Quay lại đăng nhập
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivateAccountPage;
