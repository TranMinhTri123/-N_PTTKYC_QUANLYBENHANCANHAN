import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LockOutlined, HomeOutlined } from '@ant-design/icons';

export const Error403 = () => {
  const navigate = useNavigate();
  const { user, getDefaultRoute } = useAuth();

  const handleBack = () => {
    if (user) {
      navigate(getDefaultRoute());
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Result
        status="403"
        title="403 - Quyền Truy Cập Bị Từ Chối"
        subTitle="Bạn không có quyền hạn chuyên môn để truy cập vào phân hệ này. Hệ thống đã ghi nhận nhật ký kiểm toán."
        extra={
          <Button type="primary" icon={<HomeOutlined />} onClick={handleBack} size="large">
            Quay Về Phân Hệ Của Bạn
          </Button>
        }
      />
    </div>
  );
};

export default Error403;
