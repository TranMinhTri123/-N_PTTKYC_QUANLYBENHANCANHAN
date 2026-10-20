import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Input, Button, Select, Table, Tag, Typography, Alert, notification, Space } from 'antd';
import { HeartOutlined, PlusOutlined, AlertOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import metricService from '../../services/metricService';
import profileService from '../../services/profileService';
import { formatVnDateTime } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;
const { Option } = Select;

export const MetricsPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [metricType, setMetricType] = useState('BLOOD_PRESSURE');
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await profileService.getProfiles();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        setProfiles(list);
        if (list.length > 0) {
          setSelectedProfileId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfiles();
  }, []);

  const fetchMetrics = async () => {
    if (!selectedProfileId) return;
    setLoading(true);
    try {
      const res = await metricService.getMetricsByProfile(selectedProfileId);
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setMetrics(list);
    } catch (err) {
      console.error(err);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [selectedProfileId]);

  const onFinish = async (values) => {
    if (!selectedProfileId) {
      notification.warning({ message: 'Vui lòng chọn hồ sơ người cần đo!' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        profileId: selectedProfileId,
        metricType: values.metricType,
        valuePrimary: Number(values.valuePrimary),
        valueSecondary: values.valueSecondary ? Number(values.valueSecondary) : null,
        notes: values.notes,
      };

      const res = await metricService.recordMetric(payload);
      notification.success({
        message: 'Ghi nhận số đo thành công!',
        description: res?.data?.evaluationMessage || 'Số đo đã được lưu vào hệ thống.',
      });

      form.resetFields();
      form.setFieldsValue({ metricType: 'BLOOD_PRESSURE' });
      setMetricType('BLOOD_PRESSURE');
      fetchMetrics();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Chuẩn bị dữ liệu cho biểu đồ Huyết áp Recharts
  const chartData = metrics
    .filter((m) => m.metricType === 'BLOOD_PRESSURE' && m.valuePrimary && m.valueSecondary)
    .slice(0, 15)
    .reverse()
    .map((m) => ({
      time: m.recordedAt ? m.recordedAt.slice(11, 16) : '',
      systolic: m.valuePrimary,
      diastolic: m.valueSecondary,
    }));

  const columns = [
    {
      title: 'Thời Điểm Đo',
      dataIndex: 'recordedAt',
      key: 'recordedAt',
      render: (d) => formatVnDateTime(d),
    },
    {
      title: 'Loại Chỉ Số',
      dataIndex: 'metricType',
      key: 'metricType',
      render: (type) => {
        const map = {
          BLOOD_PRESSURE: { text: 'Huyết Áp', color: 'blue' },
          BLOOD_SUGAR: { text: 'Đường Huyết', color: 'orange' },
          SPO2: { text: 'Nồng Độ Oxy SpO2', color: 'cyan' },
          HEART_RATE: { text: 'Nhịp Tim', color: 'volcano' },
          WEIGHT: { text: 'Cân Nặng', color: 'purple' },
        };
        const item = map[type] || { text: type, color: 'default' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: 'Kết Quả Đo',
      key: 'value',
      render: (_, r) => {
        if (r.metricType === 'BLOOD_PRESSURE') {
          return <strong>{r.valuePrimary} / {r.valueSecondary} mmHg</strong>;
        }
        return <strong>{r.valuePrimary} {r.unit}</strong>;
      },
    },
    {
      title: 'Đánh Giá Phân Loại Y Khoa (AHA / ADA)',
      dataIndex: 'evaluationMessage',
      key: 'evaluationMessage',
      render: (msg, r) => {
        if (!msg) return '—';
        const isDanger = r.evaluationStatus === 'DANGER';
        const isWarning = r.evaluationStatus === 'WARNING';
        return (
          <Tag color={isDanger ? 'error' : isWarning ? 'warning' : 'success'}>
            {msg}
          </Tag>
        );
      },
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (t) => t || '—',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Theo Dõi Chỉ Số Sức Khỏe Tự Đo Tại Nhà
        </Title>
        <Text type="secondary">
          Phân loại huyết áp theo chuẩn Hiệp hội Tim mạch Hoa Kỳ (AHA) và cảnh báo nguy cơ tức thì
        </Text>
      </div>

      {profiles.length > 0 && (
        <Card style={{ marginBottom: 20, borderRadius: 12 }} bodyStyle={{ padding: '14px 20px' }}>
          <Space wrap align="center">
            <Text strong>Chọn thành viên theo dõi:</Text>
            {(Array.isArray(profiles) ? profiles : []).map((p) => (
              <Button
                key={p.id}
                type={selectedProfileId === p.id ? 'primary' : 'default'}
                onClick={() => setSelectedProfileId(p.id)}
              >
                {p.fullName} ({p.relationship})
              </Button>
            ))}
          </Space>
        </Card>
      )}

      <Row gutter={[20, 20]}>
        {/* Form nhập chỉ số */}
        <Col xs={24} lg={8}>
          <Card title="Ghi Nhận Số Đo Mới" style={{ borderRadius: 12 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
              initialValues={{ metricType: 'BLOOD_PRESSURE' }}
            >
              <Form.Item name="metricType" label="Loại chỉ số" rules={[{ required: true }]}>
                <Select onChange={(val) => setMetricType(val)}>
                  <Option value="BLOOD_PRESSURE">Huyết Áp (mmHg)</Option>
                  <Option value="BLOOD_SUGAR">Đường Huyết (mg/dL)</Option>
                  <Option value="SPO2">Nồng Độ Oxy SpO2 (%)</Option>
                  <Option value="HEART_RATE">Nhịp Tim (lần/phút)</Option>
                  <Option value="WEIGHT">Cân Nặng (kg)</Option>
                </Select>
              </Form.Item>

              {metricType === 'BLOOD_PRESSURE' ? (
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      name="valuePrimary"
                      label="Huyết áp tâm thu"
                      rules={[
                        { required: true, message: 'Nhập huyết áp tâm thu!' },
                        () => ({
                          validator(_, value) {
                            if (!value) return Promise.resolve();
                            const val = Number(value);
                            if (val < 50 || val > 260) {
                              return Promise.reject(new Error('Huyết áp tâm thu phải từ 50 đến 260 mmHg!'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input placeholder="120" type="number" suffix="mmHg" min={50} max={260} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="valueSecondary"
                      label="Tâm trương"
                      dependencies={['valuePrimary']}
                      rules={[
                        { required: true, message: 'Nhập tâm trương!' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value) return Promise.resolve();
                            const dia = Number(value);
                            const sys = Number(getFieldValue('valuePrimary'));
                            if (dia < 30 || dia > 160) {
                              return Promise.reject(new Error('Huyết áp tâm trương phải từ 30 đến 160 mmHg!'));
                            }
                            if (sys && dia >= sys) {
                              return Promise.reject(new Error('Huyết áp tâm thu phải lớn hơn tâm trương!'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input placeholder="80" type="number" suffix="mmHg" min={30} max={160} />
                    </Form.Item>
                  </Col>
                </Row>
              ) : (
                <Form.Item
                  name="valuePrimary"
                  label={`Giá trị đo (${metricType === 'SPO2' ? '%' : metricType === 'HEART_RATE' ? 'bpm' : metricType === 'WEIGHT' ? 'kg' : 'mmol/L'})`}
                  rules={[
                    { required: true, message: 'Nhập giá trị số đo!' },
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const val = Number(value);
                        if (metricType === 'SPO2') {
                          if (val < 50 || val > 100) return Promise.reject(new Error('Nồng độ SpO2 phải từ 50% đến 100%!'));
                        } else if (metricType === 'HEART_RATE') {
                          if (val < 30 || val > 220) return Promise.reject(new Error('Nhịp tim phải từ 30 đến 220 bpm!'));
                        } else if (metricType === 'WEIGHT') {
                          if (val < 1 || val > 350) return Promise.reject(new Error('Cân nặng phải từ 1 đến 350 kg!'));
                        } else if (metricType === 'BLOOD_SUGAR') {
                          if (val <= 0 || val > 45) return Promise.reject(new Error('Đường huyết phải từ 1.0 đến 45.0 mmol/L!'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="Nhập số đo" type="number" step="0.1" />
                </Form.Item>
              )}

              <Form.Item name="notes" label="Ghi chú hoàn cảnh lúc đo">
                <Input placeholder="Đo lúc sáng sớm trước khi ăn..." />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={submitting}
                block
                style={{ height: 44, fontWeight: 600 }}
              >
                Lưu Số Đo Sức Khỏe
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Biểu đồ biến thiên Recharts */}
        <Col xs={24} lg={16}>
          <Card title="Biểu Đồ Diễn Tiến Huyết Áp (AHA Chart)" style={{ borderRadius: 12, height: '100%' }}>
            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[50, 180]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" name="Tâm thu (mmHg)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="diastolic" name="Tâm trương (mmHg)" stroke="#0284c7" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                <HeartOutlined style={{ fontSize: 36, marginBottom: 12 }} />
                <p>Chưa đủ dữ liệu để vẽ biểu đồ diễn tiến huyết áp</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Lịch sử đo */}
      <Card title="Lịch Sử Các Lần Đo Gần Đây" style={{ marginTop: 20, borderRadius: 12 }}>
        <div className="table-responsive-container">
          <Table
            columns={columns}
            dataSource={Array.isArray(metrics) ? metrics : []}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: 'Chưa có bản ghi số đo sức khỏe nào' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default MetricsPage;
