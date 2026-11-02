import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Popconfirm,
  message,
  Empty,
  Tooltip,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  UserOutlined,
  PlusOutlined,
  ReloadOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);

  // Modal hẹn lại ngày giờ
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleForm] = Form.useForm();
  const [submittingAction, setSubmittingAction] = useState(false);

  // Modal từ chối
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectForm] = Form.useForm();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setAppointments(list);
    } catch (err) {
      console.error(err);
      message.error('Không thể tải danh sách lịch hẹn: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Xử lý Đồng ý xếp lịch
  const handleConfirm = async (record) => {
    try {
      setSubmittingAction(true);
      await appointmentService.doctorAction(record.id, {
        action: 'CONFIRM',
        doctorNote: 'Bác sĩ đã tiếp nhận và đồng ý xếp lịch khám.',
      });
      message.success(`Đã đồng ý xếp lịch cho bệnh nhân ${record.patientName || 'này'}!`);
      fetchAppointments();
    } catch (err) {
      message.error('Không thể xếp lịch: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingAction(false);
    }
  };

  // Mở modal Hẹn lại ngày giờ
  const openRescheduleModal = (record) => {
    setSelectedAppointment(record);
    rescheduleForm.resetFields();
    if (record.appointmentTime) {
      rescheduleForm.setFieldsValue({
        newTime: dayjs(record.appointmentTime).add(1, 'day'),
        doctorNote: 'Bác sĩ bận ca phẫu thuật / phòng khám quá tải, xin phép hẹn lại bệnh nhân vào khung giờ này.',
      });
    }
    setRescheduleModalOpen(true);
  };

  // Submit hẹn lại ngày giờ
  const handleRescheduleSubmit = async (values) => {
    if (!selectedAppointment) return;
    try {
      setSubmittingAction(true);
      await appointmentService.doctorAction(selectedAppointment.id, {
        action: 'RESCHEDULE',
        rescheduledTime: values.newTime.format('YYYY-MM-DDTHH:mm:ss'),
        doctorNote: values.doctorNote,
      });
      message.success('Đã gửi phản hồi hẹn lại ngày giờ đến bệnh nhân!');
      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err) {
      message.error('Lỗi khi hẹn lại ngày giờ: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingAction(false);
    }
  };

  // Mở modal từ chối
  const openRejectModal = (record) => {
    setSelectedAppointment(record);
    rejectForm.resetFields();
    rejectForm.setFieldsValue({
      reason: 'Bác sĩ có lịch công tác đột xuất / Không phù hợp chuyên khoa, vui lòng chọn bác sĩ khác.',
    });
    setRejectModalOpen(true);
  };

  // Submit từ chối
  const handleRejectSubmit = async (values) => {
    if (!selectedAppointment) return;
    try {
      setSubmittingAction(true);
      await appointmentService.doctorAction(selectedAppointment.id, {
        action: 'REJECT',
        doctorNote: values.reason,
      });
      message.info('Đã từ chối đơn đặt lịch khám.');
      setRejectModalOpen(false);
      fetchAppointments();
    } catch (err) {
      message.error('Lỗi khi từ chối: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingAction(false);
    }
  };

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const confirmedCount = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'SCHEDULED' || a.status === 'RESCHEDULED'
  ).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Tổng Quan Ca Trực & Tiếp Nhận Khám
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Bác sĩ phụ trách: <Text strong style={{ color: '#0f766e' }}>{user?.fullName || 'Bác sĩ điều trị'}</Text>
            {user?.department && ` • ${user.department}`}
            {user?.hospitalName && ` • ${user.hospitalName}`}
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAppointments} loading={loading}>
            Làm Mới
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/doctor/workspace')}
            style={{ background: '#0f766e', borderColor: '#0f766e' }}
          >
            Bàn Khám Bệnh
          </Button>
        </Space>
      </div>

      {/* KPI Cards Ca Trực */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #f59e0b' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Chờ Bác Sĩ Tiếp Nhận</span>}
              value={pendingCount}
              prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
              suffix="ca"
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #0f766e' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Đã Xếp Lịch / Sẵn Sàng Khám</span>}
              value={confirmedCount}
              prefix={<CheckCircleOutlined style={{ color: '#0f766e' }} />}
              suffix="ca"
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="medical-card" style={{ borderRadius: 10, borderLeft: '4px solid #0284c7' }}>
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Tổng Hồ Sơ Phụ Trách</span>}
              value={appointments.length}
              prefix={<UserOutlined style={{ color: '#0284c7' }} />}
              suffix="lịch"
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng Danh Sách Bệnh Nhân Chờ Tiếp Nhận & Khám */}
      <Card
        title={
          <span style={{ fontWeight: 600 }}>
            📋 Danh Sách Bệnh Nhân Đang Chờ Khám Tại Khoa ({appointments.length})
          </span>
        }
        style={{ borderRadius: 10 }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/doctor/records/create')}>
            Tạo Bệnh Án Khám Mới
          </Button>
        }
      >
        <Table
          dataSource={appointments}
          rowKey={(r) => r.id || Math.random()}
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có bệnh nhân nào đặt lịch khám với Bác sĩ."
              />
            ),
          }}
          columns={[
            {
              title: 'Mã Lịch',
              dataIndex: 'id',
              key: 'id',
              width: 90,
              render: (id) => <Text strong code>#LH-{id}</Text>,
            },
            {
              title: 'Bệnh Nhân',
              key: 'patientInfo',
              render: (_, record) => (
                <div>
                  <Space>
                    <UserOutlined style={{ color: '#0284c7' }} />
                    <Text strong style={{ fontSize: 14 }}>{record.patientName || record.title || 'Bệnh nhân'}</Text>
                  </Space>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {record.patientGender && <Tag color="blue" style={{ fontSize: 11, padding: '0 4px' }}>{record.patientGender === 'MALE' ? 'Nam' : 'Nữ'}</Tag>}
                    {record.patientDob && <span>Sinh: {formatDate(record.patientDob)} • </span>}
                    {record.patientPhone ? (
                      <span><PhoneOutlined /> {record.patientPhone}</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Chưa có SĐT</span>
                    )}
                  </div>
                </div>
              ),
            },
            {
              title: 'Nội Dung & Triệu Chứng',
              key: 'notes',
              render: (_, record) => (
                <div>
                  <Text strong>{record.title || 'Khám chuyên khoa'}</Text>
                  {record.notes && (
                    <Paragraph
                      ellipsis={{ rows: 2, expandable: true, symbol: 'xem thêm' }}
                      style={{ fontSize: 12, color: '#475569', margin: '4px 0 0' }}
                    >
                      {record.notes}
                    </Paragraph>
                  )}
                  {record.doctorNote && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#0f766e', background: '#f0fdf4', padding: '2px 6px', borderRadius: 4 }}>
                      👨‍⚕️ <i>Lời dặn: {record.doctorNote}</i>
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: 'Thời Gian Khám',
              key: 'appointmentTime',
              width: 170,
              render: (_, record) => (
                <div>
                  <div style={{ color: '#334155' }}>
                    <ClockCircleOutlined style={{ marginRight: 4, color: '#0284c7' }} />
                    <Text strong>{record.appointmentTime ? formatDate(record.appointmentTime) : 'Hôm nay'}</Text>
                  </div>
                  {record.rescheduledTime && (
                    <div style={{ fontSize: 11, color: '#d97706', marginTop: 2 }}>
                      <CalendarOutlined style={{ marginRight: 2 }} />
                      Giờ mới: {formatDate(record.rescheduledTime)}
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: 'Trạng Thái',
              dataIndex: 'status',
              key: 'status',
              width: 140,
              render: (status) => {
                switch (status) {
                  case 'PENDING':
                    return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ tiếp nhận</Tag>;
                  case 'CONFIRMED':
                  case 'SCHEDULED':
                    return <Tag color="success" icon={<CheckCircleOutlined />}>Đã xếp lịch</Tag>;
                  case 'RESCHEDULED':
                    return <Tag color="orange" icon={<CalendarOutlined />}>Đã hẹn lại giờ</Tag>;
                  case 'CANCELLED':
                    return <Tag color="error" icon={<CloseCircleOutlined />}>Đã từ chối/Hủy</Tag>;
                  case 'COMPLETED':
                    return <Tag color="purple">Đã khám xong</Tag>;
                  default:
                    return <Tag color="default">{status || 'Chờ khám'}</Tag>;
                }
              },
            },
            {
              title: 'Quyết Định Xếp Lịch',
              key: 'action',
              width: 220,
              render: (_, record) => {
                if (record.status === 'PENDING') {
                  return (
                    <Space size={6} wrap>
                      <Tooltip title="Đồng ý tiếp nhận bệnh nhân này vào ca khám">
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleConfirm(record)}
                          loading={submittingAction}
                          style={{ background: '#0f766e', borderColor: '#0f766e' }}
                        >
                          Đồng ý
                        </Button>
                      </Tooltip>
                      <Tooltip title="Bận lịch hoặc kín chỗ -> Đổi ngày giờ khác cho bệnh nhân">
                        <Button
                          size="small"
                          icon={<CalendarOutlined />}
                          onClick={() => openRescheduleModal(record)}
                          style={{ borderColor: '#d97706', color: '#d97706' }}
                        >
                          Hẹn lại
                        </Button>
                      </Tooltip>
                      <Tooltip title="Từ chối đơn khám này">
                        <Button
                          size="small"
                          danger
                          icon={<CloseCircleOutlined />}
                          onClick={() => openRejectModal(record)}
                        >
                          Từ chối
                        </Button>
                      </Tooltip>
                    </Space>
                  );
                }

                if (record.status === 'CONFIRMED' || record.status === 'SCHEDULED' || record.status === 'RESCHEDULED') {
                  return (
                    <Space size={6}>
                      <Button
                        type="primary"
                        size="small"
                        icon={<MedicineBoxOutlined />}
                        onClick={() => navigate('/doctor/workspace')}
                        style={{ background: '#0284c7', borderColor: '#0284c7' }}
                      >
                        Khám Bệnh
                      </Button>
                      <Button
                        size="small"
                        onClick={() => openRescheduleModal(record)}
                        style={{ fontSize: 12 }}
                      >
                        Đổi giờ
                      </Button>
                    </Space>
                  );
                }

                return <Text type="secondary" style={{ fontSize: 12 }}>Đã kết thúc</Text>;
              },
            },
          ]}
        />
      </Card>

      {/* MODAL HẸN LẠI NGÀY GIỜ */}
      <Modal
        title="🗓️ Hẹn Lại Ngày Giờ Khám Bệnh"
        open={rescheduleModalOpen}
        onCancel={() => setRescheduleModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={rescheduleForm} layout="vertical" onFinish={handleRescheduleSubmit}>
          <Paragraph style={{ color: '#475569', fontSize: 13 }}>
            Bác sĩ vui lòng chọn thời gian mới thuận tiện và để lại lời dặn để hệ thống gửi thông báo đồng bộ 2 chiều đến bệnh nhân <b>{selectedAppointment?.patientName}</b>.
          </Paragraph>

          <Form.Item
            name="newTime"
            label="Ngày Giờ Hẹn Khám Mới"
            rules={[{ required: true, message: 'Vui lòng chọn ngày giờ hẹn mới!' }]}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              placeholder="Chọn ngày và giờ mới"
            />
          </Form.Item>

          <Form.Item
            name="doctorNote"
            label="Lời Dặn / Lý Do Hẹn Lại Của Bác Sĩ"
            rules={[{ required: true, message: 'Vui lòng nhập lý do hoặc lời dặn cho bệnh nhân!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Ví dụ: Bác sĩ bận trực ca cấp cứu vào sáng nay, xin hẹn bạn sang 14:00 chiều nay hoặc sáng mai nhé."
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setRescheduleModalOpen(false)}>Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" loading={submittingAction} style={{ background: '#d97706', borderColor: '#d97706' }}>
                Xác Nhận Hẹn Lại
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* MODAL TỪ CHỐI ĐƠN KHÁM */}
      <Modal
        title="⚠️ Từ Chối Tiếp Nhận Lịch Khám"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleRejectSubmit}>
          <Paragraph style={{ color: '#ef4444', fontSize: 13 }}>
            Lịch hẹn sẽ bị hủy và bệnh nhân <b>{selectedAppointment?.patientName}</b> sẽ nhận được thông báo kèm lý do từ chối.
          </Paragraph>

          <Form.Item
            name="reason"
            label="Lý Do Bác Sĩ Từ Chối"
            rules={[{ required: true, message: 'Vui lòng cung cấp lý do từ chối để thông báo cho bệnh nhân!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Ví dụ: Lịch phòng khám đã quá tải / Triệu chứng cần chuyển khoa Cấp cứu khẩn cấp."
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setRejectModalOpen(false)}>Quay lại</Button>
              <Button danger type="primary" htmlType="submit" loading={submittingAction}>
                Xác Nhận Từ Chối
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorDashboardPage;
