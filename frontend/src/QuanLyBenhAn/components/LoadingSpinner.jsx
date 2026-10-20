import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const LoadingSpinner = ({ tip = 'Đang tải dữ liệu y tế...' }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 36, color: '#0284c7' }} spin />;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '280px',
        padding: '32px',
        width: '100%',
      }}
    >
      <Spin indicator={antIcon} />
      <span style={{ marginTop: 16, color: '#64748b', fontSize: 15, fontWeight: 500 }}>
        {tip}
      </span>
    </div>
  );
};

export default LoadingSpinner;
