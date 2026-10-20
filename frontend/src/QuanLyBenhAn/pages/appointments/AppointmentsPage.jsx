import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import appointmentService from '../../services/appointmentService';
import profileService from '../../services/profileService';
import { formatVnDate } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [resApp, resProf] = await Promise.all([
        appointmentService.getAppointments(),
        profileService.getProfiles(),
      ]);
      const apptData = resApp?.data?.content || (Array.isArray(resApp?.data) ? resApp.data : []);
      const profData = resProf?.data?.content || (Array.isArray(resProf?.data) ? resProf.data : []);
      setAppointments(apptData);
      setProfiles(profData);
    } catch (err) {
      message.error(err.message || 'Không thể tải danh sách lịch khám');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        profileId: values.profileId,
        hospitalName: values.hospitalName,
        department: values.department,
        doctorName: values.doctorName,
        appointmentDate: values.appointmentDate.format('YYYY-MM-DDTHH:mm:ss'),
        reason: values.reason,
        notes: values.notes,
      };
      await appointmentService.createAppointment(payload);
      message.success('Đặt lịch khám thành công!');
      setIsModalOpen(false);
      form.resetFields();
      loadData();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra khi đặt lịch khám');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      message.success('Cập nhật trạng thái lịch khám thành công!');
      loadData();
    } catch (err) {
      message.error(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const columns = [
    {
      title: 'Họ tên bệnh nhân',
      dataIndex: 'profileFullName',
      key: 'profileFullName',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Thời gian khám',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => (
        <Space direction="vertical" size={2}>
          <span>{dayjs(date).format('HH:mm - DD/MM/YYYY')}</span>
          {dayjs(date).isAfter(dayjs()) && (
            <Tag color="processing">Sắp tới</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Cơ sở / Chuyên khoa',
      key: 'hospitalDepartment',
      render: (_, r) => (
        <div>
          <div>{r.hospitalName}</div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Khoa: {r.department || 'Đa khoa'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Bác sĩ phụ trách',
      dataIndex: 'doctorName',
      key: 'doctorName',
      render: (doc) => doc || <Text type="secondary">Chưa chỉ định</Text>,
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'SCHEDULED') {
          return <Tag color="blue" icon={<ClockCircleOutlined />}>Đã lên lịch</Tag>;
        }
        if (status === 'COMPLETED') {
          return <Tag color="success" icon={<CheckCircleOutlined />}>Đã khám xong</Tag>;
        }
        return <Tag color="default" icon={<CloseCircleOutlined />}>Đã hủy</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, r) => (
        <Space>
          {r.status === 'SCHEDULED' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
              >
                Đã khám
              </Button>
              <Popconfirm
                title="Xác nhận hủy lịch khám?"
                description="Bạn có chắc chắn muốn hủy lịch khám này?"
                onConfirm={() => handleUpdateStatus(r.id, 'CANCELLED')}
                okText="Đồng ý"
                cancelText="Quay lại"
              >
                <Button type="link" danger size="small">
                  Hủy lịch
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <CalendarOutlined style={{ color: '#0284c7', marginRight: 10 }} />
            Quản Lý Lịch Khám & Tái Khám
          </Title>
          <Text type="secondary">
            Theo dõi, nhắc nhở và quản lý các cuộc hẹn khám chữa bệnh của cả gia đình
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
          >
            Đặt lịch khám mới
          </Button>
        </Col>
      </Row>

      <Card>
        <div className="table-responsive-container">
          <Table
            columns={columns}
            dataSource={Array.isArray(appointments) ? appointments : []}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Chưa có lịch hẹn khám nào được tạo' }}
          />
        </div>
      </Card>

      {/* Modal đặt lịch khám */}
      <Modal
        title="Đặt lịch khám bệnh mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="profileId"
            label="Chọn thành viên khám"
            rules={[{ required: true, message: 'Vui lòng chọn hồ sơ bệnh nhân' }]}
          >
            <Select placeholder="Chọn hồ sơ bệnh nhân">
              {(Array.isArray(profiles) ? profiles : []).map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.fullName} ({p.relationshipToOwner || 'Chủ tài khoản'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="hospitalName"
                label="Bệnh viện / Phòng khám"
                rules={[{ required: true, message: 'Nhập tên bệnh viện' }]}
              >
                <Input placeholder="Ví dụ: Bệnh viện Bạch Mai" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Chuyên khoa">
                <Input placeholder="Ví dụ: Khoa Tim mạch" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="doctorName" label="Bác sĩ phụ trách">
                <Input placeholder="Ví dụ: BS. Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="appointmentDate"
                label="Ngày và giờ hẹn"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày giờ khám!' },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (value.isBefore(dayjs())) {
                        return Promise.reject(new Error('Thời gian hẹn khám phải từ thời điểm hiện tại trở đi!'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  placeholder="Chọn thời gian khám tương lai"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reason"
            label="Lý do khám / Triệu chứng"
            rules={[{ required: true, message: 'Nhập lý do khám' }]}
          >
            <Input placeholder="Ví dụ: Tái khám huyết áp định kỳ, đau đầu kéo dài..." />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú dặn dò (Nhịn ăn sáng, mang hồ sơ cũ...)">
            <TextArea rows={3} placeholder="Ghi chú thêm trước khi đi khám..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Lưu lịch hẹn
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AppointmentsPage;
