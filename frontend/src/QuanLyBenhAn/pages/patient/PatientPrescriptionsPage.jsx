import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Badge,
  Select,
  Spin,
  Empty,
  Avatar,
} from 'antd';
import {
  MedicineBoxOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import prescriptionService from '../../services/prescriptionService';
import profileService from '../../services/profileService';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;

export const PatientPrescriptionsPage = () => {
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [activeMedications, setActiveMedications] = useState([]);

  // Nạp danh sách hồ sơ gia đình
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await profileService.getProfiles();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        setProfiles(list);
        if (list.length > 0) {
          const selfProf = list.find((p) => p.relationship === 'SELF') || list[0];
          setSelectedProfileId(selfProf.id);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách hồ sơ:', err);
      }
    };
    fetchProfiles();
  }, []);

  // Nạp danh sách thuốc đang dùng khi đổi thành viên
  useEffect(() => {
    const loadActiveMeds = async () => {
      if (!selectedProfileId) return;
      setLoading(true);
      try {
        const res = await prescriptionService.getActiveMedications(selectedProfileId);
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        setActiveMedications(list);
      } catch (err) {
        console.error('Lỗi khi tải tủ thuốc:', err);
      } finally {
        setLoading(false);
      }
    };
    loadActiveMeds();
  }, [selectedProfileId]);

  const currentProfile = profiles.find((p) => p.id === selectedProfileId);

  const renderRelationshipTag = (rel) => {
    const map = {
      SELF: { label: 'Bản thân', color: 'blue' },
      SPOUSE: { label: 'Vợ/Chồng', color: 'pink' },
      CHILD: { label: 'Con', color: 'green' },
      PARENT: { label: 'Bố/Mẹ', color: 'orange' },
      OTHER: { label: 'Người thân', color: 'purple' },
    };
    const t = map[rel] || { label: 'Gia đình', color: 'default' };
    return <Tag color={t.color} style={{ fontSize: 11 }}>{t.label}</Tag>;
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Tủ Thuốc Gia Đình
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Theo dõi các loại thuốc đang sử dụng, liều dùng và hướng dẫn uống thuốc hàng ngày
          </Text>
        </div>

        {/* BỘ CHỌN THÀNH VIÊN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Text strong style={{ color: '#334155' }}>
            <UserOutlined style={{ color: '#0284c7', marginRight: 6 }} />
            Tủ thuốc của:
          </Text>
          <Select
            value={selectedProfileId}
            onChange={(val) => setSelectedProfileId(val)}
            style={{ width: 260 }}
            size="large"
          >
            {profiles.map((p) => (
              <Option key={p.id} value={p.id}>
                <Space>
                  <span>{p.fullName}</span>
                  {renderRelationshipTag(p.relationship)}
                </Space>
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* TỦ THUỐC ĐANG DÙNG TẠI NHÀ */}
      <Card
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#0284c7' }} />
            <span style={{ color: '#0284c7', fontWeight: 600 }}>
              Thuốc Đang Duy Trì Hàng Ngày {currentProfile ? `- ${currentProfile.fullName}` : ''}
            </span>
            <Badge count={activeMedications.length} style={{ backgroundColor: '#0284c7' }} />
          </Space>
        }
        style={{ borderRadius: 12, marginBottom: 24 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="Đang tải dữ liệu đơn thuốc..." />
          </div>
        ) : activeMedications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <MedicineBoxOutlined style={{ fontSize: 42, color: '#cbd5e1', marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 500 }}>
              Hiện tại không có loại thuốc nào cần duy trì hàng ngày trong tủ thuốc của {currentProfile?.fullName || 'thành viên này'}.
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              Các đơn thuốc sau khi bác sĩ kê trong đợt khám sẽ tự động cập nhật vào đây.
            </div>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {activeMedications.map((med, idx) => (
              <Col xs={24} sm={12} lg={8} key={idx}>
                <Card
                  size="small"
                  className="medical-card"
                  style={{
                    borderRadius: 10,
                    borderLeft: '4px solid #0284c7',
                    background: '#f8fafc',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                    <Text strong style={{ fontSize: 15, color: '#0f172a' }}>
                      {med.medicineName || 'Thuốc điều trị'}
                    </Text>
                    <Tag color="blue">{med.dosageUnit || med.dosageForm || 'Viên'}</Tag>
                  </div>

                  <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
                    <strong>Hoạt chất:</strong> {med.activeIngredient || '-'}
                  </div>

                  <div style={{ fontSize: 12, color: '#334155', background: '#ffffff', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: 4 }}>
                      ⏰ <strong>Liều dùng:</strong> {med.dosageAmount ? `${med.dosageAmount} ${med.dosageUnit || ''}` : '1 viên'} • {med.frequencyPerDay || '1 lần/ngày'}
                    </div>
                    <div>
                      📝 <strong>Cách dùng:</strong> {med.usageInstructions || 'Uống theo chỉ định của bác sĩ'}
                    </div>
                    {med.daysCount && (
                      <div style={{ marginTop: 4, color: '#64748b', fontSize: 11 }}>
                        📅 Liệu trình: {med.daysCount} ngày
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
};

export default PatientPrescriptionsPage;
