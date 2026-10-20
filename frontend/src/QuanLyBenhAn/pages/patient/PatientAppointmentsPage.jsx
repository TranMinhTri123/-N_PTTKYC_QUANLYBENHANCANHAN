import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  notification,
  Row,
  Col,
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import appointmentService from '../../services/appointmentService';
import profileService from '../../services/profileService';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const PatientAppointmentsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, profRes] = await Promise.allSettled([
        appointmentService.getUpcomingAppointments(),
        profileService.getProfiles(),
      ]);

      if (appRes.status === 'fulfilled') {
        const list = Array.isArray(appRes.value?.data) ? appRes.value.data : (appRes.value?.data?.content || []);
        setAppointments(list);
      }
      if (profRes.status === 'fulfilled') {
        const list = Array.isArray(profRes.value?.data) ? profRes.value.data : (profRes.value?.data?.content || []);
        setProfiles(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAppointment = async (values) => {
    try {
      await appointmentService.createAppointment({
        profileId: values.profileId,
        title: values.title?.trim() || 'Lịch khám định kỳ',
        hospitalName: values.hospitalName || 'Bệnh Viện Đa Khoa',
        department: values.department || 'Khoa Nội',
        attendingDoctor: values.doctor || 'BS. Chuyên khoa',
        appointmentTime: values.appointmentTime ? values.appointmentTime.format('YYYY-MM-DDTHH:mm:ss') : dayjs().add(2, 'day').format('YYYY-MM-DDTHH:mm:ss'),
        appointmentType: values.appointmentType || 'TAI_KHAM',
        notes: values.notes || 'Nhịn ăn sáng để làm xét nghiệm máu',
      });
      notification.success({ message: 'Đặt lịch khám thành công!' });
      setModalOpen(false);
      form.resetFields();
      loadData();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message || 'Không thể tạo lịch hẹn.' });
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentService.updateAppointmentStatus(id, 'COMPLETED');
      notification.success({
        message: 'Xác Nhận Đã Khám Xong',
        description: 'Bạn có thể bấm nút Tạo Bệnh Án để lưu lại đợt khám này vào sổ!',
      });
      loadData();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message || 'Không thể đổi trạng thái.' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Lịch Hẹn Khám
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ borderRadius: 6, fontWeight: 600, background: '#0284c7' }}
        >
          Đặt Lịch Khám
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={appointments}
          rowKey={(r) => r.id || Math.random()}
          loading={loading}
          pagination={false}
          columns={[
            {
              title: 'Mã Lịch',
              dataIndex: 'id',
              key: 'id',
              render: (id) => <Tag color="blue">#LH-{id}</Tag>,
            },
            {
              title: 'Cơ Sở Khám & Khoa',
              dataIndex: 'hospitalName',
              key: 'hospitalName',
              render: (hosp, record) => (
                <div>
                  <Text strong>{hosp || 'Bệnh Viện'}</Text>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{record.department || 'Khoa khám'}</div>
                </div>
              ),
            },
            {
              title: 'Nội Dung Khám',
              dataIndex: 'title',
              key: 'title',
              render: (t, record) => t || record.notes || 'Khám tổng quát',
            },
            {
              title: 'Thời Gian Hẹn',
              dataIndex: 'appointmentTime',
              key: 'appointmentTime',
              render: (time) => (
                <div>
                  <ClockCircleOutlined style={{ marginRight: 4, color: '#0284c7' }} />
                  <Text strong>{time ? formatDate(time) : 'Sắp tới'}</Text>
                </div>
              ),
            },
            {
              title: 'Lời Dặn',
              dataIndex: 'notes',
              key: 'notes',
              render: (n) => <span style={{ color: '#d97706', fontSize: 12 }}>{n || 'Mang hồ sơ cũ'}</span>,
            },
            {
              title: 'Trạng Thái',
              dataIndex: 'status',
              key: 'status',
              render: (status) =>
                status === 'COMPLETED' ? (
                  <Tag color="success">Đã Khám</Tag>
                ) : (
                  <Tag color="processing">Chờ Khám</Tag>
                ),
            },
            {
              title: 'Thao Tác',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  {record.status !== 'COMPLETED' && (
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleComplete(record.id)}
                    >
                      Đã Khám Xong
                    </Button>
                  )}
                  <Button
                    size="small"
                    icon={<FileAddOutlined />}
                    onClick={() => navigate('/patient/records/create')}
                  >
                    Tạo Bệnh Án
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Đặt Lịch Hẹn */}
      <Modal
        title="Đặt Lịch Hẹn Khám Mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateAppointment} style={{ marginTop: 16 }}>
          <Form.Item name="profileId" label="Người khám" rules={[{ required: true }]}>
            <Select placeholder="Chọn thành viên gia đình...">
              {profiles.map((p) => (
                <Option key={p.id} value={p.id}>{p.fullName} ({p.relationship || 'Bản thân'})</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="hospitalName" label="Bệnh viện / Phòng khám" rules={[{ required: true }]}>
                <Input placeholder="Bệnh viện Bạch Mai, Chợ Rẫy..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Chuyên khoa">
                <Input placeholder="Khoa Tim Mạch, Khoa Tiêu Hóa..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="appointmentTime" label="Ngày giờ hẹn khám" rules={[{ required: true }]}>
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú dặn dò (vd: Nhịn ăn sáng, mang phim cũ)">
            <Input placeholder="Nhịn ăn sáng lấy máu xét nghiệm..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" style={{ background: '#0284c7' }}>
              Xác Nhận Đặt Lịch
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientAppointmentsPage;
