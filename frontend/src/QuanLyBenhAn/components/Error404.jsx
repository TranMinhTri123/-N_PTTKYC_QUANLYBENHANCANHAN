import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeOutlined } from '@ant-design/icons';

export const Error404 = () => {
  const navigate = useNavigate();
  const { user, getDefaultRoute } = useAuth();

  const handleBack = () => {
    if (user) {
      navigate(getDefaultRoute());
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Result
        status="404"
        title="404 - Không Tìm Thấy Trang"
        subTitle="Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ mới."
        extra={
          <Button type="primary" icon={<HomeOutlined />} onClick={handleBack} size="large">
            Trở Về Trang Chủ
          </Button>
        }
      />
    </div>
  );
};

export default Error404;
