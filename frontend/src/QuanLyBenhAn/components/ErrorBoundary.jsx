import React from 'react';
import { Result, Button, Card, Typography } from 'antd';
import { ReloadOutlined, HomeOutlined, WarningOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '32px 20px', display: 'flex', justifyContent: 'center' }}>
          <Card
            style={{
              maxWidth: 680,
              width: '100%',
              borderRadius: 14,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              border: '1px solid #fee2e2',
            }}
          >
            <Result
              status="warning"
              icon={<WarningOutlined style={{ color: '#f59e0b', fontSize: 56 }} />}
              title={<span style={{ fontWeight: 700, fontSize: 20 }}>Đã xảy ra sự cố khi tải giao diện</span>}
              subTitle="Hệ thống đã bảo vệ dữ liệu và ngăn chặn màn hình trắng. Bạn có thể thử tải lại trang hoặc quay về trang chủ."
              extra={[
                <Button
                  type="primary"
                  key="reload"
                  icon={<ReloadOutlined />}
                  onClick={() => window.location.reload()}
                  style={{ height: 40, fontWeight: 600 }}
                >
                  Tải lại trang
                </Button>,
                <Button
                  key="reset"
                  onClick={this.handleReset}
                  style={{ height: 40, fontWeight: 600 }}
                >
                  Thử lại
                </Button>,
                <Button
                  key="home"
                  icon={<HomeOutlined />}
                  onClick={() => (window.location.href = '/dashboard')}
                  style={{ height: 40 }}
                >
                  Về Bảng Điều Khiển
                </Button>,
              ]}
            >
              {this.state.error && (
                <div style={{ textAlign: 'left', background: '#fef2f2', padding: '12px 16px', borderRadius: 8, marginTop: 16 }}>
                  <Text type="danger" strong>
                    Chi tiết lỗi: {this.state.error.message || String(this.state.error)}
                  </Text>
                </div>
              )}
            </Result>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
