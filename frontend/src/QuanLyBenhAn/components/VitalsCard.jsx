import React from 'react';
import { Card, Row, Col, Typography, Tag } from 'antd';
import {
  HeartOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export const VitalsCard = ({ vitals = {} }) => {
  const {
    bloodPressureSystolic,
    bloodPressureDiastolic,
    pulse,
    temperature,
    spO2,
    weight,
    height,
    bmi,
  } = vitals;

  // Đánh giá BMI chuẩn WHO Châu Á
  const getBmiBadge = (val) => {
    if (!val) return null;
    const num = parseFloat(val);
    if (num < 18.5) return <Tag color="blue">Gầy</Tag>;
    if (num < 23) return <Tag color="green">Bình Thường</Tag>;
    if (num < 25) return <Tag color="orange">Thừa Cân</Tag>;
    return <Tag color="red">Béo Phì</Tag>;
  };

  return (
    <Card
      size="small"
      title={<span style={{ fontWeight: 600 }}>📊 Chỉ Số Sinh Hiệu & Thể Trạng</span>}
      className="medical-card"
      style={{ borderRadius: 10, background: '#fafafa' }}
    >
      <Row gutter={[16, 12]}>
        <Col xs={12} sm={8} md={6}>
          <div style={{ color: '#64748b', fontSize: 12 }}>
            <DashboardOutlined /> Huyết Áp
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            {bloodPressureSystolic && bloodPressureDiastolic
              ? `${bloodPressureSystolic}/${bloodPressureDiastolic} mmHg`
              : '-'}
          </div>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <div style={{ color: '#64748b', fontSize: 12 }}>
            <HeartOutlined style={{ color: '#ef4444' }} /> Mạch
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            {pulse ? `${pulse} lần/phút` : '-'}
          </div>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <div style={{ color: '#64748b', fontSize: 12 }}>
            <ThunderboltOutlined style={{ color: '#f59e0b' }} /> Thân Nhiệt
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            {temperature ? `${temperature} °C` : '-'}
          </div>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <div style={{ color: '#64748b', fontSize: 12 }}>
            <ExperimentOutlined style={{ color: '#0284c7' }} /> Nồng Độ SpO2
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: spO2 && spO2 < 95 ? '#ef4444' : '#0f172a' }}>
            {spO2 ? `${spO2} %` : '-'}
          </div>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <div style={{ color: '#64748b', fontSize: 12 }}>Chiều Cao / Cân Nặng</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {height ? `${height} cm` : '-'} / {weight ? `${weight} kg` : '-'}
          </div>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <div style={{ color: '#64748b', fontSize: 12 }}>Chỉ Số BMI</div>
          <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{bmi ? parseFloat(bmi).toFixed(1) : '-'}</span>
            {bmi && getBmiBadge(bmi)}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default VitalsCard;
