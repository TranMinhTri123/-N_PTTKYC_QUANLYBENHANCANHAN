import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Switch,
  TimePicker,
  InputNumber,
  Button,
  DatePicker,
  Select,
  Input,
  Table,
  Tag,
  Space,
  Alert,
  message,
  Modal,
  Divider,
} from 'antd';
import {
  ScheduleOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import doctorScheduleService from '../../services/doctorScheduleService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Thứ Hai' },
  { key: 'TUESDAY', label: 'Thứ Ba' },
  { key: 'WEDNESDAY', label: 'Thứ Tư' },
  { key: 'THURSDAY', label: 'Thứ Năm' },
  { key: 'FRIDAY', label: 'Thứ Sáu' },
  { key: 'SATURDAY', label: 'Thứ Bảy' },
  { key: 'SUNDAY', label: 'Chủ Nhật' },
];

export const DoctorSchedulePage = () => {
  const { user } = useAuth();
  const scheduleStorageKey = `phr_doctor_schedule_${user?.id || 'current'}`;
  const leavesStorageKey = `phr_doctor_leaves_${user?.id || 'current'}`;

  // Weekly shift config
  const [shifts, setShifts] = useState(() => {
    const saved = localStorage.getItem(scheduleStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      MONDAY: { active: true, morning: true, afternoon: true, maxSlot: 10 },
      TUESDAY: { active: true, morning: true, afternoon: true, maxSlot: 10 },
      WEDNESDAY: { active: true, morning: true, afternoon: true, maxSlot: 10 },
      THURSDAY: { active: true, morning: true, afternoon: true, maxSlot: 10 },
      FRIDAY: { active: true, morning: true, afternoon: true, maxSlot: 10 },
      SATURDAY: { active: true, morning: true, afternoon: false, maxSlot: 8 },
      SUNDAY: { active: false, morning: false, afternoon: false, maxSlot: 0 },
    };
  });

  // Registered leaves/off-days
  const [leaves, setLeaves] = useState(() => {
    const saved = localStorage.getItem(leavesStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 1,
        date: dayjs().add(5, 'day').format('YYYY-MM-DD'),
        type: 'Hội nghị chuyên môn',
        reason: 'Tham gia hội thảo tim mạch toàn quốc',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
      },
    ];
  });

  // Existing appointments to detect conflict
  const [appointments, setAppointments] = useState([]);
  const [newLeaveDate, setNewLeaveDate] = useState(null);
  const [newLeaveType, setNewLeaveType] = useState('Nghỉ phép');
  const [newLeaveReason, setNewLeaveReason] = useState('');
  const [conflictWarning, setConflictWarning] = useState(null);

  // Fetch appointments to check for conflicts & Load backend schedules/leaves
  useEffect(() => {
    const loadData = async () => {
      try {
        const [apptRes, schedRes, leaveRes] = await Promise.allSettled([
          appointmentService.getAppointments(),
          doctorScheduleService.getMySchedules(),
          doctorScheduleService.getMyLeaves(),
        ]);

        if (apptRes.status === 'fulfilled') {
          const list = Array.isArray(apptRes.value?.data)
            ? apptRes.value.data
            : apptRes.value?.data?.content || [];
          setAppointments(list);
        }

        if (schedRes.status === 'fulfilled') {
          const list = schedRes.value?.data?.data || schedRes.value?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            const shiftMap = {};
            list.forEach((s) => {
              shiftMap[s.dayOfWeek] = {
                active: s.active,
                morning: s.morningShift,
                afternoon: s.afternoonShift,
                maxSlot: s.maxSlots || 10,
              };
            });
            setShifts((prev) => ({ ...prev, ...shiftMap }));
          }
        }

        if (leaveRes.status === 'fulfilled') {
          const list = leaveRes.value?.data?.data || leaveRes.value?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            const formatted = list.map((l) => ({
              id: l.id,
              date: l.leaveDate,
              type: l.leaveType,
              reason: l.reason,
              createdAt: l.createdDate ? dayjs(l.createdDate).format('YYYY-MM-DD HH:mm') : '-',
            }));
            setLeaves(formatted);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu lịch:', err);
      }
    };
    loadData();
  }, []);

  // Check collision when date changes
  useEffect(() => {
    if (!newLeaveDate) {
      setConflictWarning(null);
      return;
    }
    const selectedDateStr = newLeaveDate.format('YYYY-MM-DD');
    const colliding = appointments.filter((a) => {
      if (!a.appointmentTime) return false;
      const apptDateStr = dayjs(a.appointmentTime).format('YYYY-MM-DD');
      const isNotCancelled = a.status !== 'CANCELLED';
      return apptDateStr === selectedDateStr && isNotCancelled;
    });

    if (colliding.length > 0) {
      setConflictWarning({
        count: colliding.length,
        appointments: colliding,
      });
    } else {
      setConflictWarning(null);
    }
  }, [newLeaveDate, appointments]);

  // Save weekly shift
  const handleSaveShifts = async () => {
    localStorage.setItem(scheduleStorageKey, JSON.stringify(shifts));
    localStorage.setItem('phr_doctor_schedule_current', JSON.stringify(shifts));
    if (user?.id) {
      localStorage.setItem(`phr_doctor_schedule_${user.id}`, JSON.stringify(shifts));
    }
    try {
      const payload = DAYS_OF_WEEK.map((d) => {
        const conf = shifts[d.key] || {};
        return {
          dayOfWeek: d.key,
          active: conf.active ?? true,
          morningShift: conf.morning ?? true,
          afternoonShift: conf.afternoon ?? true,
          maxSlots: conf.maxSlot || 10,
        };
      });
      await doctorScheduleService.updateMySchedules(payload);
      message.success('Đã lưu cấu hình ca làm việc hàng tuần thành công!');
    } catch {
      message.success('Đã lưu cấu hình ca làm việc cục bộ!');
    }
  };

  // Add leave
  const handleAddLeave = async () => {
    if (!newLeaveDate) {
      message.error('Vui lòng chọn ngày nghỉ!');
      return;
    }
    const dateStr = newLeaveDate.format('YYYY-MM-DD');
    if (leaves.some((l) => l.date === dateStr)) {
      message.warning('Ngày này đã được đăng ký nghỉ trước đó!');
      return;
    }

    try {
      const res = await doctorScheduleService.createLeave({
        leaveDate: dateStr,
        leaveType: newLeaveType,
        reason: newLeaveReason || 'Việc cá nhân / Nghỉ theo lịch',
      });
      const savedItem = res?.data?.data || res?.data;
      const newLeave = {
        id: savedItem?.id || Date.now(),
        date: dateStr,
        type: newLeaveType,
        reason: newLeaveReason || 'Việc cá nhân / Nghỉ theo lịch',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
      };

      const updated = [...leaves, newLeave];
      setLeaves(updated);
      localStorage.setItem(leavesStorageKey, JSON.stringify(updated));
      localStorage.setItem(`phr_doctor_off_dates_${user?.id || 'current'}`, JSON.stringify(updated.map((l) => l.date)));

      message.success(`Đã đăng ký ngày nghỉ ${dayjs(dateStr).format('DD/MM/YYYY')} thành công!`);
      setNewLeaveDate(null);
      setNewLeaveReason('');
      setConflictWarning(null);
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Lỗi khi đăng ký ngày nghỉ');
    }
  };

  // Remove leave
  const handleDeleteLeave = (id) => {
    Modal.confirm({
      title: 'Hủy đăng ký ngày nghỉ?',
      icon: <ExclamationCircleOutlined style={{ color: '#ef4444' }} />,
      content: 'Bác sĩ sẽ mở lại lịch làm việc và nhận đặt khám bình thường cho ngày này.',
      okText: 'Xác Nhận Hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await doctorScheduleService.deleteLeave(id);
        } catch (e) {
          console.warn('Lỗi xóa ngày nghỉ backend:', e);
        }
        const updated = leaves.filter((l) => l.id !== id);
        setLeaves(updated);
        localStorage.setItem(leavesStorageKey, JSON.stringify(updated));
        localStorage.setItem(`phr_doctor_off_dates_${user?.id || 'current'}`, JSON.stringify(updated.map((l) => l.date)));
        message.success('Đã hủy ngày nghỉ.');
      },
    });
  };

  const leaveColumns = [
    {
      title: 'Ngày Nghỉ',
      dataIndex: 'date',
      key: 'date',
      render: (d) => (
        <Space>
          <CalendarOutlined style={{ color: '#0f766e' }} />
          <strong>{dayjs(d).format('DD/MM/YYYY')}</strong>
          <Tag color="geekblue">{dayjs(d).format('dddd')}</Tag>
        </Space>
      ),
    },
    {
      title: 'Loại Nghỉ',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="orange">{type}</Tag>,
    },
    {
      title: 'Lý Do Chi Tiết',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Thời Gian Đăng Ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (t) => <Text type="secondary" style={{ fontSize: 12 }}>{t}</Text>,
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteLeave(record.id)}
        >
          Hủy Nghỉ
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#0f766e' }}>
          Quản Lý Lịch Làm Việc & Ca Trực
        </Title>
        <Text type="secondary">
          Thiết lập ca trực hàng tuần, đăng ký ngày nghỉ phép/đột xuất và đồng bộ chặn lịch hẹn đặt trước (tối đa 30 ngày)
        </Text>
      </div>

      <Row gutter={[20, 20]}>
        {/* Weekly Shifts */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#0f766e' }} />
                <span>Thiết Lập Ca Làm Việc Hàng Tuần</span>
              </Space>
            }
            extra={
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveShifts} style={{ background: '#0f766e', borderColor: '#0f766e' }}>
                Lưu Ca Trực
              </Button>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {DAYS_OF_WEEK.map((day) => {
                const conf = shifts[day.key] || { active: false, morning: false, afternoon: false, maxSlot: 10 };
                return (
                  <div
                    key={day.key}
                    style={{
                      padding: '12px 16px',
                      background: conf.active ? '#f8fafc' : '#f1f5f9',
                      borderRadius: 8,
                      border: conf.active ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 100 }}>
                      <Switch
                        checked={conf.active}
                        onChange={(checked) =>
                          setShifts((prev) => ({
                            ...prev,
                            [day.key]: { ...prev[day.key], active: checked },
                          }))
                        }
                        style={{ marginRight: 8 }}
                      />
                      <Text strong style={{ color: conf.active ? '#0f172a' : '#94a3b8' }}>
                        {day.label}
                      </Text>
                    </div>

                    {conf.active ? (
                      <Space wrap size={12}>
                        <label orientation="horizontal">
                          <input
                            type="checkbox"
                            checked={conf.morning}
                            onChange={(e) =>
                              setShifts((prev) => ({
                                ...prev,
                                [day.key]: { ...prev[day.key], morning: e.target.checked },
                              }))
                            }
                            style={{ marginRight: 4 }}
                          />
                          <span style={{ fontSize: 13 }}>Sáng (08:00 - 12:00)</span>
                        </label>

                        <label orientation="horizontal">
                          <input
                            type="checkbox"
                            checked={conf.afternoon}
                            onChange={(e) =>
                              setShifts((prev) => ({
                                ...prev,
                                [day.key]: { ...prev[day.key], afternoon: e.target.checked },
                              }))
                            }
                            style={{ marginRight: 4 }}
                          />
                          <span style={{ fontSize: 13 }}>Chiều (13:30 - 17:00)</span>
                        </label>

                        <Space size={4}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>Tối đa:</span>
                          <InputNumber
                            min={1}
                            max={30}
                            size="small"
                            value={conf.maxSlot}
                            onChange={(val) =>
                              setShifts((prev) => ({
                                ...prev,
                                [day.key]: { ...prev[day.key], maxSlot: val || 10 },
                              }))
                            }
                            style={{ width: 60 }}
                          />
                          <span style={{ fontSize: 12, color: '#64748b' }}>lượt/khung</span>
                        </Space>
                      </Space>
                    ) : (
                      <Text type="secondary" italic style={{ fontSize: 12 }}>
                        Không nhận ca trực
                      </Text>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Leave and Day-off Management */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ScheduleOutlined style={{ color: '#0f766e' }} />
                <span>Đăng Ký Ngày Nghỉ / Nghỉ Phép / Đột Xuất</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>
                    Chọn ngày nghỉ (Tối đa 30 ngày)
                  </Text>
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    value={newLeaveDate}
                    onChange={setNewLeaveDate}
                    disabledDate={(current) =>
                      current &&
                      (current < dayjs().startOf('day') || current > dayjs().add(30, 'day').endOf('day'))
                    }
                    placeholder="Chọn ngày nghỉ"
                  />
                </Col>
                <Col span={12}>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>
                    Loại nghỉ
                  </Text>
                  <Select
                    value={newLeaveType}
                    onChange={setNewLeaveType}
                    style={{ width: '100%' }}
                  >
                    <Option value="Nghỉ phép thường niên">Nghỉ phép thường niên</Option>
                    <Option value="Nghỉ lễ / Tết">Nghỉ lễ / Tết</Option>
                    <Option value="Hội nghị chuyên môn">Hội nghị chuyên môn</Option>
                    <Option value="Trực cấp cứu bệnh viện">Trực cấp cứu bệnh viện</Option>
                    <Option value="Nghỉ đột xuất / Việc riêng">Nghỉ đột xuất / Việc riêng</Option>
                  </Select>
                </Col>
              </Row>

              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  Lý do chi tiết
                </Text>
                <Input
                  value={newLeaveReason}
                  onChange={(e) => setNewLeaveReason(e.target.value)}
                  placeholder="Ghi chú lý do nghỉ để chuyển đổi ca hoặc thông báo..."
                />
              </div>

              {/* Conflict warning alert if appointments exist */}
              {conflictWarning && (
                <Alert
                  type="warning"
                  showIcon
                  icon={<ExclamationCircleOutlined />}
                  message={
                    <span>
                      <strong>Cảnh Báo Xung Đột Lịch Hẹn!</strong> Có <strong>{conflictWarning.count}</strong> bệnh nhân đã đặt lịch trong ngày {newLeaveDate.format('DD/MM/YYYY')}:
                    </span>
                  }
                  description={
                    <div style={{ marginTop: 6 }}>
                      {conflictWarning.appointments.map((a) => (
                        <div key={a.id} style={{ fontSize: 12, marginBottom: 2 }}>
                          • #{a.id} - <strong>{a.profileFullName}</strong> ({dayjs(a.appointmentTime).format('HH:mm')}) - SĐT: {a.patientPhone || 'N/A'}
                        </div>
                      ))}
                      <div style={{ marginTop: 6, color: '#b45309', fontWeight: 600 }}>
                        Vui lòng vào trang "Lịch Hẹn Khám" để hẹn lại hoặc dời lịch cho các bệnh nhân này!
                      </div>
                    </div>
                  }
                />
              )}

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddLeave}
                style={{ background: '#0284c7', borderColor: '#0284c7', marginTop: 4 }}
              >
                Xác Nhận Đăng Ký Ngày Nghỉ
              </Button>
            </div>
          </Card>

          {/* Leaves Table */}
          <Card
            title="Danh Sách Ngày Nghỉ Đã Đăng Ký"
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <Table
              columns={leaveColumns}
              dataSource={leaves}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
              locale={{ emptyText: 'Chưa có ngày nghỉ nào được đăng ký' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorSchedulePage;

