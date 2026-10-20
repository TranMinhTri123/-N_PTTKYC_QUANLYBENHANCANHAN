import React from 'react';
import { Tag, Tooltip } from 'antd';
import { AlertOutlined } from '@ant-design/icons';

/**
 * Component hiển thị huy hiệu dị ứng chuẩn y tế
 * Có hiệu ứng nhấp nháy đỏ `allergy-pulse` khi mức độ Nguy Kịch / Nặng để cảnh báo bác sĩ
 */
export const AllergyBadge = ({ allergen, severity = 'MILD', type, reaction }) => {
  const isSevere = severity === 'SEVERE' || severity === 'CRITICAL' || severity === 'HIGH';

  const getSeverityConfig = () => {
    switch (severity) {
      case 'CRITICAL':
      case 'SEVERE':
        return {
          color: 'error',
          label: 'Nguy Kịch / Sốc Phản Vệ',
          className: 'allergy-pulse',
        };
      case 'MODERATE':
        return {
          color: 'warning',
          label: 'Trung Bình',
          className: '',
        };
      case 'MILD':
      default:
        return {
          color: 'default',
          label: 'Nhẹ',
          className: '',
        };
    }
  };

  const config = getSeverityConfig();

  return (
    <Tooltip
      title={
        <div>
          <div><strong>Dị nguyên:</strong> {allergen}</div>
          <div><strong>Mức độ:</strong> {config.label}</div>
          {reaction && <div><strong>Phản ứng:</strong> {reaction}</div>}
          {type && <div><strong>Nhóm:</strong> {type}</div>}
        </div>
      }
    >
      <Tag
        color={config.color}
        className={config.className}
        style={{
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 13,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {isSevere && <AlertOutlined />}
        <span>{allergen}</span>
        <span style={{ fontSize: 11, opacity: 0.85 }}>({config.label})</span>
      </Tag>
    </Tooltip>
  );
};

export default AllergyBadge;
