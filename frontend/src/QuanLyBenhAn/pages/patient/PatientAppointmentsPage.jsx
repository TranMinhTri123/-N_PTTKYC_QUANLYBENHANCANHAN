import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Space,
  notification,
} from 'antd';
import {
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import profileService from '../../services/profileService';
import { formatDate } from '../../utils/formatters';
import AppointmentBookingModal from './AppointmentBookingModal';

const { Title, Text } = Typography;

export const PatientAppointmentsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Lịch Hẹn Khám
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý và đặt lịch khám bệnh trực tuyến với 5 bệnh viện đối tác
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ borderRadius: 6, fontWeight: 600, background: '#0284c7' }}
          size="large"
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
              title: 'Bệnh Viện & Chuyên Khoa',
              dataIndex: 'hospitalName',
              key: 'hospitalName',
              render: (hosp, record) => (
                <div>
                  <Text strong style={{ color: '#0369a1' }}>
                    {hosp || record.facilityName || 'Bệnh Viện'}
                  </Text>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {record.department || 'Khoa khám'}
                  </div>
                </div>
              ),
            },
            {
              title: 'Bác Sĩ Phụ Trách',
              key: 'doctor',
              render: (_, record) => (
                <div>
                  <Text strong style={{ color: '#0f766e' }}>
                    {record.doctorName || record.attendingDoctor || 'BS. Chuyên khoa'}
                  </Text>
                </div>
              ),
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
              title: 'Nội Dung / Lý Do Khám',
              dataIndex: 'title',
              key: 'title',
              render: (t, record) => (
                <div>
                  <div>{t || 'Khám theo yêu cầu'}</div>
                  {record.notes && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {record.notes}
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: 'Trạng Thái & Phản Hồi Bác Sĩ',
              key: 'status',
              render: (_, record) => {
                const status = record.status;
                let statusTag = <Tag color="processing">Chờ Khám</Tag>;
                if (status === 'PENDING') {
                  statusTag = <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ bác sĩ tiếp nhận</Tag>;
                } else if (status === 'CONFIRMED' || status === 'SCHEDULED') {
                  statusTag = <Tag color="success" icon={<CheckCircleOutlined />}>Bác sĩ đã đồng ý xếp lịch</Tag>;
                } else if (status === 'RESCHEDULED') {
                  statusTag = <Tag color="orange" icon={<ClockCircleOutlined />}>Bác sĩ hẹn lại ngày giờ</Tag>;
                } else if (status === 'CANCELLED') {
                  statusTag = <Tag color="error">Bác sĩ từ chối / Đã hủy</Tag>;
                } else if (status === 'COMPLETED') {
                  statusTag = <Tag color="purple">Đã khám xong</Tag>;
                }

                return (
                  <div>
                    {statusTag}
                    {record.rescheduledTime && (
                      <div style={{ marginTop: 4, fontSize: 12, color: '#d97706', fontWeight: 600 }}>
                        🗓️ Giờ hẹn mới: {formatDate(record.rescheduledTime)}
                      </div>
                    )}
                    {record.doctorNote && (
                      <div style={{ marginTop: 4, fontSize: 12, color: '#0f766e', background: '#f0fdf4', padding: '3px 8px', borderRadius: 4, border: '1px solid #bbf7d0' }}>
                        👨‍⚕️ <b>Bác sĩ nhắn:</b> {record.doctorNote}
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              title: 'Thao Tác',
              key: 'actions',
              render: (_, record) => {
                const canCancel = record.status === 'PENDING' || record.status === 'CONFIRMED';
                return (
                  <Space>
                    {canCancel && (
                      <Button
                        size="small"
                        danger
                        onClick={async () => {
                          try {
                            await appointmentService.updateStatus(record.id, 'CANCELLED');
                            notification.success({ message: 'Đã hủy lịch hẹn', description: 'Bạn đã hủy yêu cầu đặt lịch hẹn thành công.' });
                            loadData();
                          } catch (err) {
                            notification.error({ message: 'Lỗi', description: err.message || 'Không thể hủy lịch.' });
                          }
                        }}
                      >
                        Hủy Lịch
                      </Button>
                    )}
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>

      {/* MODAL ĐẶT LỊCH KHÁM CASCADING (BỆNH VIỆN → CHUYÊN KHOA → BÁC SĨ → NGÀY HẸN) */}
      <AppointmentBookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
        onReloadProfiles={loadData}
        profiles={profiles}
      />
    </div>
  );
};

export default PatientAppointmentsPage;
