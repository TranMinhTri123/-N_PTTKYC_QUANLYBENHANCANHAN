import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Typography,
  Tag,
  Radio,
  Table,
  notification,
  Select,
} from 'antd';
import {
  HeartOutlined,
  SaveOutlined,
  LineChartOutlined,
  PlusOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import metricService from '../../services/metricService';
import profileService from '../../services/profileService';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;

export const PatientMetricsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedType, setSelectedType] = useState('BLOOD_PRESSURE');

  const loadData = async (profId) => {
    try {
      const res = await metricService.getMetrics({ profileId: profId, type: selectedType });
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setMetrics(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const profRes = await profileService.getProfiles();
        const list = Array.isArray(profRes?.data) ? profRes.data : (profRes?.data?.content || []);
        setProfiles(list);
        if (list.length > 0) {
          setSelectedProfileId(list[0].id);
          loadData(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [selectedType]);

  const onFinishMetric = async (values) => {
    setLoading(true);
    try {
      const payload = {
        profileId: selectedProfileId,
        metricType: selectedType,
        value1: parseFloat(values.value1),
        value2: values.value2 ? parseFloat(values.value2) : null,
        unit: selectedType === 'BLOOD_PRESSURE' ? 'mmHg' : selectedType === 'BLOOD_SUGAR' ? 'mmol/L' : '%',
        notes: values.notes || 'Đo tại nhà lúc nghỉ ngơi',
      };
      await metricService.recordMetric(payload);
      notification.success({ message: 'Đã lưu chỉ số đo sức khỏe!' });
      form.resetFields();
      loadData(selectedProfileId);
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message || 'Không thể lưu.' });
    } finally {
      setLoading(false);
    }
  };

  // Chuẩn bị dữ liệu vẽ đồ thị
  const chartData = metrics
    .slice()
    .reverse()
    .map((m, idx) => ({
      time: m.measurementTime ? formatDate(m.measurementTime) : `Đo ${idx + 1}`,
      systolic: m.value1,
      diastolic: m.value2,
    }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Theo Dõi Chỉ Số Sức Khỏe
          </Title>
        </div>
        {profiles.length > 0 && (
          <Select
            value={selectedProfileId}
            onChange={(val) => {
              setSelectedProfileId(val);
              loadData(val);
            }}
            style={{ width: 220 }}
          >
            {profiles.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.fullName} ({p.relationship || 'Bản thân'})
              </Option>
            ))}
          </Select>
        )}
      </div>

      <Row gutter={[16, 16]}>
        {/* Form Nhập Số Đo Nhanh */}
        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontWeight: 600 }}>Nhập Chỉ Số Mới</span>} style={{ borderRadius: 12 }}>
            <div style={{ marginBottom: 16 }}>
              <Radio.Group
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                buttonStyle="solid"
                style={{ width: '100%', textAlign: 'center' }}
              >
                <Radio.Button value="BLOOD_PRESSURE" style={{ width: '50%' }}>Huyết Áp</Radio.Button>
                <Radio.Button value="BLOOD_SUGAR" style={{ width: '50%' }}>Đường Huyết</Radio.Button>
              </Radio.Group>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinishMetric}>
              {selectedType === 'BLOOD_PRESSURE' ? (
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="value1" label="Tâm Thu (mmHg)" rules={[{ required: true, message: 'Nhập số đo!' }]}>
                      <Input placeholder="120" type="number" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="value2" label="Tâm Trương (mmHg)" rules={[{ required: true, message: 'Nhập số đo!' }]}>
                      <Input placeholder="80" type="number" />
                    </Form.Item>
                  </Col>
                </Row>
              ) : (
                <Form.Item name="value1" label="Đường Huyết (mmol/L)" rules={[{ required: true }]}>
                  <Input placeholder="5.6" type="number" step="0.1" />
                </Form.Item>
              )}

              <Form.Item name="notes" label="Ghi chú">
                <Input placeholder="Ghi chú hoàn cảnh đo..." />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                  style={{ background: '#0284c7', borderRadius: 6, fontWeight: 600 }}
                >
                  Lưu Chỉ Số
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Biểu Đồ Recharts Biến Thiên */}
        <Col xs={24} lg={16}>
          <Card title={<span style={{ fontWeight: 600 }}>Biểu Đồ Xu Hướng Huyết Áp</span>} style={{ borderRadius: 12 }}>
            {chartData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                Chưa có dữ liệu đo để vẽ biểu đồ
              </div>
            ) : (
              <div style={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[50, 180]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" name="Huyết áp Tâm Thu" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="diastolic" name="Huyết áp Tâm Trương" stroke="#0284c7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PatientMetricsPage;
