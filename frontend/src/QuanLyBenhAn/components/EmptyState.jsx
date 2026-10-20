import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined, FileAddOutlined } from '@ant-design/icons';

export const EmptyState = ({
  description = 'Chưa có dữ liệu nào được ghi nhận',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span style={{ color: '#64748b', fontSize: 14 }}>{description}</span>}
      >
        {actionText && onAction && (
          <Button
            type="primary"
            icon={icon || <PlusOutlined />}
            onClick={onAction}
            style={{ marginTop: 12, borderRadius: 6 }}
          >
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
