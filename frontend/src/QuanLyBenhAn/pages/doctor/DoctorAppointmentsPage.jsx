import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Descriptions,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined,
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  SwapOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { formatVnDate, formatVnDateTime } from '../../utils/medicalCalculators';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ tiếp nhận',
    color: 'gold',
    badgeStatus: 'warning',
    bg: '#fefce8',
    borderColor: '#fef08a',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'blue',
    badgeStatus: 'processing',
    bg: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  SCHEDULED: {
    label: 'Đã lên lịch',
    color: 'geekblue',
    badgeStatus: 'processing',
    bg: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  RESCHEDULED: {
    label: 'Đã hẹn lại',
    color: 'purple',
    badgeStatus: 'default',
    bg: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  COMPLETED: {
    label: 'Đã khám xong',
    color: 'green',
    badgeStatus: 'success',
    bg: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  CANCELLED: {
    label: 'Đã từ chối / Hủy',
    color: 'red',
    badgeStatus: 'error',
    bg: '#fef2f2',
    borderColor: '#fecaca',
  },
};

export const DoctorAppointmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, NEXT_7_DAYS, CUSTOM
  const [customDate, setCustomDate] = useState(null);
  const [revealedPhones, setRevealedPhones] = useState(new Set());

  // Modals
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const [rescheduleForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setAppointments(list);
    } catch (err) {
      message.error('Không thể tải danh sách lịch hẹn: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      // 1. Search text (Patient name, phone, title, notes, id)
      if (searchText.trim()) {
        const query = searchText.toLowerCase().trim();
        const patientName = (item.profileFullName || '').toLowerCase();
        const phone = (item.patientPhone || '').toLowerCase();
        const notes = (item.notes || '').toLowerCase();
        const code = `#LH-${item.id}`.toLowerCase();
        if (
          !patientName.includes(query) &&
          !phone.includes(query) &&
          !notes.includes(query) &&
          !code.includes(query)
        ) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'CONFIRMED') {
          if (item.status !== 'CONFIRMED' && item.status !== 'SCHEDULED') return false;
        } else if (item.status !== statusFilter) {
          return false;
        }
      }

      // 3. Date filter
      if (item.appointmentTime) {
        const apptDate = dayjs(item.appointmentTime);
        const today = dayjs().startOf('day');

        if (dateFilter === 'TODAY') {
          if (!apptDate.isSame(today, 'day')) return false;
        } else if (dateFilter === 'NEXT_7_DAYS') {
          const sevenDaysLater = today.add(7, 'day').endOf('day');
          if (!apptDate.isSameOrAfter(today) || !apptDate.isSameOrBefore(sevenDaysLater)) {
            return false;
          }
        } else if (dateFilter === 'CUSTOM' && customDate) {
          if (!apptDate.isSame(customDate, 'day')) return false;
        }
      }

      return true;
    });
  }, [appointments, searchText, statusFilter, dateFilter, customDate]);

  // Statistics
  const stats = useMemo(() => {
    const today = dayjs().startOf('day');
    let pending = 0;
    let confirmed = 0;
    let todayCount = 0;
    let completed = 0;
    let cancelled = 0;

    appointments.forEach((item) => {
      if (item.status === 'PENDING') pending++;
      else if (item.status === 'CONFIRMED' || item.status === 'SCHEDULED') confirmed++;
      else if (item.status === 'COMPLETED') completed++;
      else if (item.status === 'CANCELLED') cancelled++;

      if (item.appointmentTime && dayjs(item.appointmentTime).isSame(today, 'day')) {
        todayCount++;
      }
    });

    return { total: appointments.length, pending, confirmed, todayCount, completed, cancelled };
  }, [appointments]);

  // Action: Confirm
  const handleConfirmAppointment = async (record) => {
    Modal.confirm({
      title: 'Tiếp nhận & Xác nhận lịch hẹn khám?',
      icon: <CheckCircleOutlined style={{ color: '#16a34a' }} />,
      content: (
        <div>
          <p>
            Bệnh nhân: <strong>{record.profileFullName}</strong>
          </p>
          <p>
            Thời gian hẹn: <strong>{formatVnDateTime(record.appointmentTime)}</strong>
          </p>
          <p style={{ color: '#4b5563', fontSize: 13 }}>
            Sau khi xác nhận, bệnh nhân sẽ nhận được thông báo lịch khám đã được duyệt.
          </p>
        </div>
      ),
      okText: 'Xác Nhận Tiếp Nhận',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await appointmentService.doctorAction(record.id, {
            action: 'CONFIRM',
            doctorNote: 'Bác sĩ đã tiếp nhận và xác nhận lịch khám đúng hẹn.',
          });
          message.success('Đã tiếp nhận và xác nhận lịch khám thành công!');
          fetchAppointments();
        } catch (err) {
          message.error('Lỗi khi tiếp nhận lịch hẹn: ' + (err.message || 'Lỗi server'));
        }
      },
    });
  };

  // Action: Open Reschedule Modal
  const openRescheduleModal = (record) => {
    setSelectedAppointment(record);
    rescheduleForm.resetFields();
    if (record.appointmentTime) {
      rescheduleForm.setFieldsValue({
        rescheduledDate: dayjs(record.appointmentTime).add(1, 'day'),
        rescheduledSlot: '08:30 - 09:30',
        doctorNote: 'Bác sĩ bận hội chẩn ca khẩn cấp, xin dời lịch sang giờ này. Rất mong quý bệnh nhân thông cảm!',
      });
    }
    setRescheduleModalVisible(true);
  };

  // Submit Reschedule
  const handleRescheduleSubmit = async (values) => {
    if (!selectedAppointment) return;
    setSubmittingAction(true);
    try {
      const datePart = values.rescheduledDate.format('YYYY-MM-DD');
      const startTime = (values.rescheduledSlot || '08:30 - 09:30').split(' - ')[0].trim();
      const newDateTime = `${datePart}T${startTime}:00`;

      await appointmentService.doctorAction(selectedAppointment.id, {
        action: 'RESCHEDULE',
        rescheduledTime: newDateTime,
        doctorNote: values.doctorNote,
      });

      message.success('Đã dời lịch hẹn và gửi phản hồi thông báo đến bệnh nhân!');
      setRescheduleModalVisible(false);
      fetchAppointments();
    } catch (err) {
      message.error('Lỗi khi dời lịch hẹn: ' + (err.message || 'Lỗi server'));
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Open Reject Modal
  const openRejectModal = (record) => {
    setSelectedAppointment(record);
    rejectForm.resetFields();
    rejectForm.setFieldsValue({
      doctorNote: 'Bác sĩ bận lịch phẫu thuật đột xuất trong khung giờ này, xin vui lòng chọn bác sĩ khác hoặc ngày khác.',
    });
    setRejectModalVisible(true);
  };

  // Submit Reject
  const handleRejectSubmit = async (values) => {
    if (!selectedAppointment) return;
    setSubmittingAction(true);
    try {
      await appointmentService.doctorAction(selectedAppointment.id, {
        action: 'REJECT',
        doctorNote: values.doctorNote,
      });

      message.warning('Đã từ chối lịch hẹn và gửi lý do cho bệnh nhân.');
      setRejectModalVisible(false);
      fetchAppointments();
    } catch (err) {
      message.error('Lỗi khi từ chối lịch: ' + (err.message || 'Lỗi server'));
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Complete examination
  const handleCompleteAppointment = async (record) => {
    try {
      await appointmentService.updateStatus(record.id, 'COMPLETED');
      message.success('Đã hoàn tất ca khám!');
      fetchAppointments();
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái: ' + (err.message || 'Lỗi'));
    }
  };

  // Action: Start Medical Record
  const handleStartConsultation = (record) => {
    navigate('/doctor/records/create', {
      state: {
        appointmentId: record.id,
        profileId: record.profileId,
        patientName: record.profileFullName,
        patientPhone: record.patientPhone,
        reasonForAdmission: record.notes || 'Khám theo lịch hẹn trực tuyến',
        appointmentTime: record.appointmentTime,
      },
    });
  };

  const columns = [
    {
      title: 'Mã Lịch',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <Tag color="blue" style={{ fontWeight: 600 }}>#LH-{id}</Tag>,
    },
    {
      title: 'Thời Gian Hẹn Khám',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      width: 170,
      render: (time) => {
        if (!time) return <Text type="secondary">Chưa định ngày</Text>;
        const d = dayjs(time);
        const isToday = d.isSame(dayjs(), 'day');
        const isPast = d.isBefore(dayjs(), 'minute');

        return (
          <div>
            <div style={{ fontWeight: 600, color: isToday ? '#0284c7' : '#1e293b' }}>
              <ClockCircleOutlined style={{ marginRight: 5 }} />
              {d.format('HH:mm')}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{d.format('DD/MM/YYYY')}</div>
            {isToday && <Tag color="cyan" style={{ fontSize: 10, marginTop: 2 }}>Hôm nay</Tag>}
            {isPast && !isToday && <Tag color="default" style={{ fontSize: 10, marginTop: 2 }}>Đã qua</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Thông Tin Bệnh Nhân',
      key: 'patient',
      width: 220,
      render: (_, record) => {
        let ageStr = '';
        if (record.patientDob) {
          const age = dayjs().diff(dayjs(record.patientDob), 'year');
          ageStr = ` (${age} tuổi)`;
        }
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0f766e', fontSize: 14 }}>
              <UserOutlined style={{ marginRight: 6 }} />
              {record.profileFullName || 'Bệnh nhân'}
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
              {record.patientGender ? `${record.patientGender === 'FEMALE' ? 'Nữ' : 'Nam'}${ageStr}` : ''}
            </div>
            {record.patientPhone && (
              <div style={{ fontSize: 12, color: '#2563eb', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <PhoneOutlined />
                <span>
                  {revealedPhones.has(record.id)
                    ? record.patientPhone
                    : record.patientPhone.replace(/(\d{4})\d{3}(\d{3})/, '$1***$2')}
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={revealedPhones.has(record.id) ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  style={{ padding: '0 2px', fontSize: 11, color: '#64748b' }}
                  onClick={() => {
                    setRevealedPhones((prev) => {
                      const next = new Set(prev);
                      if (next.has(record.id)) next.delete(record.id);
                      else next.add(record.id);
                      return next;
                    });
                  }}
                  title={revealedPhones.has(record.id) ? 'Ẩn bớt số điện thoại' : 'Xem đầy đủ số điện thoại'}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Lý Do Khám & Triệu Chứng',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes, record) => (
        <div>
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}
            style={{ margin: 0, color: '#334155' }}
          >
            {notes || <Text type="secondary" italic>Không ghi chú triệu chứng cụ thể</Text>}
          </Paragraph>
          {record.doctorNote && (
            <div
              style={{
                marginTop: 6,
                padding: '4px 8px',
                background: '#f8fafc',
                borderLeft: '3px solid #0284c7',
                borderRadius: '0 4px 4px 0',
                fontSize: 12,
                color: '#0369a1',
              }}
            >
              <strong>Bác sĩ phản hồi:</strong> {record.doctorNote}
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
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
        return (
          <Tag color={cfg.color} style={{ fontWeight: 600, padding: '2px 8px' }}>
            <Badge status={cfg.badgeStatus} style={{ marginRight: 6 }} />
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Thao Tác Bác Sĩ',
      key: 'actions',
      width: 220,
      render: (_, record) => {
        const isPending = record.status === 'PENDING';
        const isConfirmed = record.status === 'CONFIRMED' || record.status === 'SCHEDULED';
        const isRescheduled = record.status === 'RESCHEDULED';

        return (
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {isPending && (
              <Space wrap size={4}>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ background: '#059669', borderColor: '#059669' }}
                  onClick={() => handleConfirmAppointment(record)}
                >
                  Xác Nhận
                </Button>
                <Button
                  size="small"
                  icon={<SwapOutlined />}
                  onClick={() => openRescheduleModal(record)}
                >
                  Hẹn Lại
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => openRejectModal(record)}
                >
                  Từ Chối
                </Button>
              </Space>
            )}

            {(isConfirmed || isRescheduled) && (
              <Space wrap size={4}>
                <Button
                  type="primary"
                  size="small"
                  icon={<MedicineBoxOutlined />}
                  style={{ background: '#0f766e', borderColor: '#0f766e' }}
                  onClick={() => handleStartConsultation(record)}
                >
                  Bắt Đầu Khám
                </Button>
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleCompleteAppointment(record)}
                >
                  Xong Ca
                </Button>
                <Button
                  size="small"
                  icon={<SwapOutlined />}
                  onClick={() => openRescheduleModal(record)}
                >
                  Dời Giờ
                </Button>
              </Space>
            )}

            {record.status === 'COMPLETED' && (
              <Space size={4}>
                <Tag color="success">✓ Đã Khám Xong</Tag>
                <Button
                  size="small"
                  type="link"
                  onClick={() => handleStartConsultation(record)}
                >
                  Xem Bệnh Án
                </Button>
              </Space>
            )}

            {record.status === 'CANCELLED' && (
              <Tag color="error">Đã từ chối tiếp nhận</Tag>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#0f766e' }}>
          Quản Lý Lịch Hẹn Khám Bệnh
        </Title>
        <Text type="secondary">
          Tiếp nhận, xác nhận, dời lịch và gọi khám bệnh nhân theo khung giờ đăng ký tại Bệnh viện Đa khoa PHR
        </Text>
      </div>

      {/* KPI Stats Bar */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} style={{ borderRadius: 10, background: '#f8fafc', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Tổng Lịch Hẹn"
              value={stats.total}
              valueStyle={{ color: '#0f172a', fontWeight: 700 }}
              prefix={<CalendarOutlined style={{ color: '#64748b' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card bordered={false} style={{ borderRadius: 10, background: '#fefce8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Chờ Tiếp Nhận"
              value={stats.pending}
              valueStyle={{ color: '#d97706', fontWeight: 700 }}
              prefix={<ClockCircleOutlined style={{ color: '#d97706' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card bordered={false} style={{ borderRadius: 10, background: '#eff6ff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Đã Xác Nhận"
              value={stats.confirmed}
              valueStyle={{ color: '#2563eb', fontWeight: 700 }}
              prefix={<CheckCircleOutlined style={{ color: '#2563eb' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card bordered={false} style={{ borderRadius: 10, background: '#ecfdf5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Lịch Khám Hôm Nay"
              value={stats.todayCount}
              valueStyle={{ color: '#059669', fontWeight: 700 }}
              prefix={<MedicineBoxOutlined style={{ color: '#059669' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card bordered={false} style={{ borderRadius: 10, background: '#f0fdf4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Đã Hoàn Tất"
              value={stats.completed}
              valueStyle={{ color: '#16a34a', fontWeight: 700 }}
              prefix={<CheckCircleOutlined style={{ color: '#16a34a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          marginBottom: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Row gutter={[12, 12]} align="middle" justify="space-between">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo tên bệnh nhân, SĐT, mã lịch..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 8 }}
            />
          </Col>

          <Col xs={24} md={16}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 160 }}
              >
                <Option value="ALL">Tất cả trạng thái</Option>
                <Option value="PENDING">Chờ tiếp nhận</Option>
                <Option value="CONFIRMED">Đã xác nhận</Option>
                <Option value="RESCHEDULED">Đã hẹn lại</Option>
                <Option value="COMPLETED">Đã khám xong</Option>
                <Option value="CANCELLED">Đã hủy / Từ chối</Option>
              </Select>

              <Select
                value={dateFilter}
                onChange={(val) => {
                  setDateFilter(val);
                  if (val !== 'CUSTOM') setCustomDate(null);
                }}
                style={{ width: 140 }}
              >
                <Option value="ALL">Tất cả ngày</Option>
                <Option value="TODAY">Hôm nay</Option>
                <Option value="NEXT_7_DAYS">7 ngày tới</Option>
                <Option value="CUSTOM">Chọn ngày...</Option>
              </Select>

              {dateFilter === 'CUSTOM' && (
                <DatePicker
                  value={customDate}
                  onChange={setCustomDate}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày khám"
                />
              )}

              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAppointments}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Appointment Table */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} lịch hẹn`,
          }}
          locale={{ emptyText: 'Không tìm thấy lịch hẹn khám nào phù hợp' }}
        />
      </Card>

      {/* Modal: Hẹn Lại (Reschedule) */}
      <Modal
        title={
          <Space>
            <SwapOutlined style={{ color: '#7c3aed' }} />
            <span>Hẹn Lại Ngày / Giờ Khám Mới Cho Bệnh Nhân</span>
          </Space>
        }
        open={rescheduleModalVisible}
        onCancel={() => setRescheduleModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        {selectedAppointment && (
          <div style={{ marginBottom: 16, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
            <Text>
              Bệnh nhân: <strong>{selectedAppointment.profileFullName}</strong> ({selectedAppointment.patientPhone || 'Không có SĐT'})
            </Text>
            <br />
            <Text type="secondary">
              Thời gian hiện tại: {formatVnDateTime(selectedAppointment.appointmentTime)}
            </Text>
          </div>
        )}

        <Form form={rescheduleForm} layout="vertical" onFinish={handleRescheduleSubmit}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="rescheduledDate"
                label="Ngày hẹn mới đề xuất"
                rules={[{ required: true, message: 'Vui lòng chọn ngày mới!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current &&
                    (current < dayjs().startOf('day') || current > dayjs().add(30, 'day').endOf('day'))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rescheduledSlot"
                label="Khung giờ khám mới"
                rules={[{ required: true, message: 'Vui lòng chọn khung giờ!' }]}
              >
                <Select placeholder="Chọn khung giờ">
                  <Option value="08:00 - 09:00">08:00 - 09:00 (Sáng)</Option>
                  <Option value="09:00 - 10:00">09:00 - 10:00 (Sáng)</Option>
                  <Option value="10:00 - 11:00">10:00 - 11:00 (Sáng)</Option>
                  <Option value="13:30 - 14:30">13:30 - 14:30 (Chiều)</Option>
                  <Option value="14:30 - 15:30">14:30 - 15:30 (Chiều)</Option>
                  <Option value="15:30 - 16:30">15:30 - 16:30 (Chiều)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="doctorNote"
            label="Lời nhắn / Lý do dời lịch gửi đến bệnh nhân"
            rules={[{ required: true, message: 'Vui lòng nhập lý do để bệnh nhân nắm rõ!' }]}
          >
            <TextArea rows={3} placeholder="Ví dụ: Bác sĩ có ca mổ cấp cứu đột xuất, xin dời sang khung giờ này..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setRescheduleModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submittingAction} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
                Xác Nhận Hẹn Lại
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal: Từ Chối Lịch (Reject) */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ef4444' }} />
            <span>Từ Chối Lịch Hẹn Khám Bệnh</span>
          </Space>
        }
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        {selectedAppointment && (
          <div style={{ marginBottom: 16, background: '#fef2f2', padding: 12, borderRadius: 8 }}>
            <Text>
              Bệnh nhân: <strong>{selectedAppointment.profileFullName}</strong>
            </Text>
            <br />
            <Text type="secondary">
              Thời gian hẹn: {formatVnDateTime(selectedAppointment.appointmentTime)}
            </Text>
          </div>
        )}

        <Form form={rejectForm} layout="vertical" onFinish={handleRejectSubmit}>
          <Form.Item
            name="doctorNote"
            label="Lý do từ chối gửi bệnh nhân"
            rules={[{ required: true, message: 'Vui lòng cung cấp lý do từ chối!' }]}
          >
            <TextArea rows={3} placeholder="Ví dụ: Bác sĩ nghỉ công tác đột xuất, quý khách vui lòng chọn bác sĩ hoặc khoa khác..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setRejectModalVisible(false)}>Đóng</Button>
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

export default DoctorAppointmentsPage;

