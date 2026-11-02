
import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Alert,
  Card,
  Space,
  Tag,
  Divider,
  Result,
  Descriptions,
  notification,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  CURRENT_HOSPITAL,
  PARTNER_HOSPITALS,
  TIME_SLOTS,
  MAX_BOOKING_DAYS,
  getSpecialtiesByHospital,
  getDoctorsByHospitalAndSpecialty,
  getHospitalById,
  getSpecialtyById,
  getDoctorById,
  validateBookingDate,
} from '../../constants/appointmentBookingConfig';
import appointmentService from '../../services/appointmentService';
import catalogService from '../../services/catalogService';
import profileService from '../../services/profileService';
import doctorScheduleService from '../../services/doctorScheduleService';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const AppointmentBookingModal = ({ open, onClose, onSuccess, onReloadProfiles, profiles = [] }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [quickProfileForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [quickProfileOpen, setQuickProfileOpen] = useState(false);
  const [submittingQuickProfile, setSubmittingQuickProfile] = useState(false);

  // Trạng thái cascading dependencies
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [doctorOffDates, setDoctorOffDates] = useState([]);
  const [doctorWeeklySchedules, setDoctorWeeklySchedules] = useState({});

  // Lắng nghe ngày hẹn đã chọn trên form để đồng bộ ca làm việc (Sáng / Chiều)
  const watchedBookingDate = Form.useWatch('bookingDate', form);

  // Tải danh sách ngày nghỉ và cấu hình ca trực tuần thực tế của bác sĩ từ Backend khi bác sĩ được chọn
  useEffect(() => {
    if (!selectedDoctorId) {
      setDoctorOffDates([]);
      setDoctorWeeklySchedules({});
      return;
    }
    const fetchOffDates = async () => {
      try {
        const res = await doctorScheduleService.getDoctorOffDates(selectedDoctorId);
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setDoctorOffDates(list);
          return;
        }
      } catch {
        // ignore
      }
      // Fallback nếu offline hoặc cache
      const offDatesStr =
        localStorage.getItem(`phr_doctor_off_dates_${selectedDoctorId}`) ||
        localStorage.getItem(`phr_doctor_off_dates_current`);
      if (offDatesStr) {
        try {
          setDoctorOffDates(JSON.parse(offDatesStr));
        } catch {
          // ignore
        }
      }
    };

    const fetchWeeklySchedules = async () => {
      let scheduleMap = null;
      try {
        const res = await doctorScheduleService.getDoctorSchedules(selectedDoctorId);
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          scheduleMap = {};
          list.forEach((s) => {
            scheduleMap[s.dayOfWeek] = {
              active: s.active,
              morning: s.morningShift,
              afternoon: s.afternoonShift,
              maxSlots: s.maxSlots,
            };
          });
        }
      } catch {
        // ignore
      }

      // Fallback local storage nếu backend chưa lưu hoặc chạy offline
      if (!scheduleMap) {
        const localData =
          localStorage.getItem(`phr_doctor_schedule_${selectedDoctorId}`) ||
          localStorage.getItem('phr_doctor_schedule_current');
        if (localData) {
          try {
            scheduleMap = JSON.parse(localData);
          } catch {
            // ignore
          }
        }
      }

      setDoctorWeeklySchedules(scheduleMap || {});
    };

    fetchOffDates();
    fetchWeeklySchedules();
  }, [selectedDoctorId]);

  // Tính toán trạng thái ca trực (Sáng / Chiều) theo ngày hẹn được chọn
  const selectedDayInfo = useMemo(() => {
    if (!watchedBookingDate) return null;
    const dayOfWeekIndex = watchedBookingDate.day(); // 0: CN, 1: T2, 2: T3...
    const dayOfWeekKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayKey = dayOfWeekKeys[dayOfWeekIndex];
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayLabel = dayNames[dayOfWeekIndex];

    const conf = doctorWeeklySchedules[dayKey];
    if (!conf) {
      return {
        dayKey,
        dayLabel,
        isConfigured: false,
        active: true,
        morning: true,
        afternoon: true,
      };
    }

    const isDayActive = conf.active !== false;
    const isMorningActive = isDayActive && conf.morning !== false && conf.morningShift !== false;
    const isAfternoonActive = isDayActive && conf.afternoon !== false && conf.afternoonShift !== false;

    return {
      dayKey,
      dayLabel,
      isConfigured: true,
      active: isDayActive && (isMorningActive || isAfternoonActive),
      morning: isMorningActive,
      afternoon: isAfternoonActive,
    };
  }, [watchedBookingDate, doctorWeeklySchedules]);

  // Tự động bỏ chọn khung giờ nếu người dùng chuyển sang ngày mà ca đó bị bác sĩ tắt
  useEffect(() => {
    if (!selectedDayInfo) return;
    const currentSlot = form.getFieldValue('timeSlot');
    if (!currentSlot) return;

    const slotObj = TIME_SLOTS.find((s) => s.value === currentSlot);
    if (!slotObj) return;

    const isMorningSlot = slotObj.period === 'Sáng';
    const isSlotDisabled = isMorningSlot ? !selectedDayInfo.morning : !selectedDayInfo.afternoon;

    if (isSlotDisabled) {
      form.setFieldsValue({ timeSlot: undefined });
    }
  }, [selectedDayInfo, form]);

  // Danh sách bác sĩ thật từ Database
  const [dbDoctors, setDbDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Màn hình tóm tắt xác nhận sau khi đặt lịch thành công
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Tải danh sách bác sĩ thật từ Database khi mở modal
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await catalogService.getDoctors();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        if (list && list.length > 0) {
          setDbDoctors(list);
        }
      } catch (err) {
        console.warn('Lỗi khi tải bác sĩ từ Database:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    if (open) {
      fetchDoctors();
    }
  }, [open]);

  // 1. Danh sách chuyên khoa phụ thuộc theo Bệnh viện đã chọn
  const availableSpecialties = useMemo(() => {
    return getSpecialtiesByHospital(selectedHospitalId);
  }, [selectedHospitalId]);

  // 2. Danh sách bác sĩ phụ thuộc theo Bệnh viện & Chuyên khoa đã chọn
  // (Ưu tiên lấy tài khoản bác sĩ thật đã lưu trong Database, fallback sang danh mục nếu cần)
  const availableDoctors = useMemo(() => {
    if (!selectedSpecialtyId) return [];

    if (dbDoctors && dbDoctors.length > 0) {
      const filteredFromDb = dbDoctors.filter((doc) => {
        if (!doc.specialtyCode) return true;
        return doc.specialtyCode.toUpperCase() === selectedSpecialtyId.toUpperCase();
      });

      if (filteredFromDb.length > 0) {
        return filteredFromDb.map((doc) => ({
          id: doc.id,
          name: doc.fullName || `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Bác sĩ chuyên khoa',
          degree: doc.department || 'Bác sĩ điều trị',
          experience: 'Tài khoản Bác sĩ hệ thống',
          room: doc.department || 'Phòng khám chuyên khoa',
          email: doc.email,
          phone: doc.phone,
          hospitalId: selectedHospitalId || CURRENT_HOSPITAL.id,
          specialtyId: selectedSpecialtyId,
          isDbAccount: true,
        }));
      }
    }

    return getDoctorsByHospitalAndSpecialty(selectedHospitalId, selectedSpecialtyId);
  }, [selectedHospitalId, selectedSpecialtyId, dbDoctors]);

  // Thông tin chi tiết của các đối tượng đã chọn (dùng cho preview)
  const currentHospital = useMemo(() => getHospitalById(selectedHospitalId), [selectedHospitalId]);
  const currentSpecialty = useMemo(() => getSpecialtyById(selectedSpecialtyId), [selectedSpecialtyId]);
  const currentDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return (
      availableDoctors.find((d) => String(d.id) === String(selectedDoctorId)) ||
      getDoctorById(selectedDoctorId)
    );
  }, [selectedDoctorId, availableDoctors]);

  // Reset form khi mở modal
  useEffect(() => {
    if (open) {
      setBookingSuccessData(null);
      form.resetFields();
      setSelectedHospitalId(CURRENT_HOSPITAL.id);
      setSelectedSpecialtyId(null);
      setSelectedDoctorId(null);

      // Điền sẵn bệnh viện mặc định, profile đầu tiên hoặc chủ tài khoản
      form.setFieldsValue({
        hospitalId: CURRENT_HOSPITAL.id,
        patientPhone: user?.phone || user?.phoneNumber || '',
        ...(profiles && profiles.length > 0 ? { profileId: profiles[0].id } : {}),
      });
    }
  }, [open, profiles, user, form]);

  // Xử lý khi đổi Người khám (Profile)
  const handleProfileChange = (profileId) => {
    const prof = profiles.find((p) => p.id === profileId);
    if (prof && (prof.phone || prof.phoneNumber || prof.emergencyContactPhone)) {
      form.setFieldsValue({ patientPhone: prof.phone || prof.phoneNumber || prof.emergencyContactPhone });
    } else if (user?.phone || user?.phoneNumber) {
      form.setFieldsValue({ patientPhone: user?.phone || user?.phoneNumber });
    }
  };

  // Mở modal tạo hồ sơ cá nhân nhanh
  const handleOpenQuickProfile = () => {
    quickProfileForm.resetFields();
    quickProfileForm.setFieldsValue({
      relationship: 'SELF',
      fullName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
      phone: user?.phone || user?.phoneNumber || '',
      gender: user?.gender || 'MALE',
      dateOfBirth: user?.dateOfBirth ? dayjs(user?.dateOfBirth) : null,
    });
    setQuickProfileOpen(true);
  };

  // Lưu hồ sơ cá nhân nhanh trực tiếp từ Modal đặt lịch
  const handleQuickProfileSubmit = async (values) => {
    setSubmittingQuickProfile(true);
    try {
      const payload = {
        fullName: values.fullName?.trim(),
        relationship: values.relationship || 'SELF',
        gender: values.gender || 'MALE',
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        cccd: values.cccd?.trim() || null,
        bhytNumber: values.bhytNumber?.trim() || null,
        phone: values.phone?.trim() || null,
        phoneNumber: values.phone?.trim() || null,
        addressDetail: values.addressDetail?.trim() || null,
        address: values.addressDetail?.trim() || null,
        emergencyContactName: values.emergencyContactName?.trim() || null,
        emergencyContactPhone: values.emergencyContactPhone?.trim() || null,
      };

      const res = await profileService.createProfile(payload);
      const newProfile = res?.data || res;
      notification.success({ message: 'Lưu hồ sơ cá nhân thành công!' });

      setQuickProfileOpen(false);

      // Gọi callback để load lại danh sách hồ sơ ở trang cha
      if (onReloadProfiles) {
        await onReloadProfiles();
      }

      // Tự động chọn hồ sơ vừa tạo
      if (newProfile?.id) {
        form.setFieldsValue({
          profileId: newProfile.id,
          patientPhone: values.phone || values.emergencyContactPhone || user?.phone || '',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err.message || 'Không thể lưu hồ sơ cá nhân.',
      });
    } finally {
      setSubmittingQuickProfile(false);
    }
  };

  // 1. KHI ĐỔI BỆNH VIỆN: Reset toàn bộ cấp dưới (Chuyên khoa, Bác sĩ)
  const handleHospitalChange = (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setSelectedSpecialtyId(null);
    setSelectedDoctorId(null);

    // Xóa giá trị các field cấp dưới trên Form
    form.setFieldsValue({
      specialtyId: undefined,
      doctorId: undefined,
    });
  };

  // 2. KHI ĐỔI CHUYÊN KHOA: Reset Bác sĩ
  const handleSpecialtyChange = (specialtyId) => {
    setSelectedSpecialtyId(specialtyId);
    setSelectedDoctorId(null);

    // Xóa giá trị Bác sĩ trên Form
    form.setFieldsValue({
      doctorId: undefined,
    });
  };

  // 3. KHI CHỌN BÁC SĨ
  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
  };

  // 4. QUY TẮC VALIDATE NGÀY HẸN
  // - Vô hiệu hóa ngày trong quá khứ (< hôm nay)
  // - Vô hiệu hóa ngày quá xa (> hôm nay + MAX_BOOKING_DAYS = 30 ngày)
  // - Vô hiệu hóa các ngày nghỉ mà bác sĩ đã đăng ký (Group 2 Synchronization)
  // - Vô hiệu hóa các ngày trong tuần nếu bác sĩ đã tắt toàn bộ cả ngày
  const disabledBookingDate = (current) => {
    if (!current) return false;
    const today = dayjs().startOf('day');
    const maxDate = dayjs().add(MAX_BOOKING_DAYS, 'day').endOf('day');
    if (current < today || current > maxDate) return true;

    // Kiểm tra ngày nghỉ của bác sĩ đã đăng ký
    if (selectedDoctorId && doctorOffDates.length > 0) {
      const currentStr = current.format('YYYY-MM-DD');
      if (doctorOffDates.includes(currentStr)) {
        return true;
      }
    }

    // Kiểm tra nếu bác sĩ tắt cả ca sáng lẫn ca chiều vào thứ trong tuần đó
    if (selectedDoctorId && Object.keys(doctorWeeklySchedules).length > 0) {
      const dayOfWeekKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayKey = dayOfWeekKeys[current.day()];
      const conf = doctorWeeklySchedules[dayKey];
      if (conf) {
        const isDayActive = conf.active !== false;
        const morning = isDayActive && conf.morning !== false && conf.morningShift !== false;
        const afternoon = isDayActive && conf.afternoon !== false && conf.afternoonShift !== false;
        if (!morning && !afternoon) {
          return true; // Bác sĩ không làm việc cả ngày
        }
      }
    }

    return false;
  };

  // Validator ngày hẹn khi submit
  const dateValidator = (_, value) => {
    const res = validateBookingDate(value);
    if (!res.valid) {
      return Promise.reject(new Error(res.message));
    }

    if (selectedDoctorId && value && doctorOffDates.length > 0) {
      const valStr = value.format('YYYY-MM-DD');
      if (doctorOffDates.includes(valStr)) {
        return Promise.reject(new Error('Bác sĩ đã đăng ký nghỉ ca trực vào ngày này. Vui lòng chọn ngày khác!'));
      }
    }

    if (selectedDoctorId && value && Object.keys(doctorWeeklySchedules).length > 0) {
      const dayOfWeekKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayKey = dayOfWeekKeys[value.day()];
      const conf = doctorWeeklySchedules[dayKey];
      if (conf) {
        const isDayActive = conf.active !== false;
        const morning = isDayActive && conf.morning !== false && conf.morningShift !== false;
        const afternoon = isDayActive && conf.afternoon !== false && conf.afternoonShift !== false;
        if (!morning && !afternoon) {
          return Promise.reject(new Error('Bác sĩ không tiếp nhận bệnh nhân vào ngày này trong tuần!'));
        }
      }
    }

    return Promise.resolve();
  };

  // XỬ LÝ SUBMIT ĐẶT LỊCH
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const hospital = getHospitalById(values.hospitalId);
      const specialty = getSpecialtyById(values.specialtyId);
      const doctor =
        availableDoctors.find((d) => String(d.id) === String(values.doctorId)) ||
        getDoctorById(values.doctorId);
      const profile = profiles.find((p) => p.id === values.profileId);

      // Ghép ngày hẹn và giờ hẹn
      const timeStr = values.timeSlot || '08:30';
      const [hours, minutes] = timeStr.split(':');
      const appointmentDateTime = values.bookingDate
        .hour(parseInt(hours, 10))
        .minute(parseInt(minutes, 10))
        .second(0);

      // Chuẩn bị payload gửi backend
      const payload = {
        profileId: values.profileId,
        title: `Khám ${specialty?.fullName || 'chuyên khoa'} - ${doctor?.name || 'BS phụ trách'}`,
        facilityName: hospital?.name || 'Bệnh viện đối tác',
        hospitalName: hospital?.name || 'Bệnh viện đối tác',
        department: specialty?.departmentName || 'Khoa khám',
        doctorName: doctor?.name || 'BS. Chuyên khoa',
        doctor: doctor?.name || 'BS. Chuyên khoa',
        doctorId: typeof doctor?.id === 'number' ? doctor.id : (parseInt(doctor?.id, 10) || null),
        patientPhone: values.patientPhone || null,
        status: 'PENDING',
        appointmentTime: appointmentDateTime.format('YYYY-MM-DDTHH:mm:ss'),
        appointmentType: specialty?.id === 'OBSTETRIC' ? 'PRENATAL' : 'FOLLOW_UP',
        notes: values.symptoms
          ? `Lý do khám: ${values.symptoms.trim()} (SĐT: ${values.patientPhone || 'Chưa cung cấp'})`
          : `SĐT: ${values.patientPhone || 'Chưa cung cấp'}`,
      };

      const res = await appointmentService.createAppointment(payload);
      const created = res?.data || payload;

      // Lưu thông tin tóm tắt để hiển thị màn hình xác nhận
      setBookingSuccessData({
        id: created.id || Math.floor(100000 + Math.random() * 900000),
        patientName: profile?.fullName || user?.fullName || 'Bệnh nhân',
        patientPhone: values.patientPhone || 'Chưa có',
        hospitalName: hospital?.name,
        hospitalAddress: hospital?.address,
        specialtyName: specialty?.fullName,
        departmentName: specialty?.departmentName,
        doctorName: doctor?.name,
        doctorDegree: doctor?.degree,
        doctorRoom: doctor?.room,
        bookingDateStr: values.bookingDate.format('DD/MM/YYYY'),
        timeSlotStr: TIME_SLOTS.find((t) => t.value === values.timeSlot)?.label || values.timeSlot,
        symptoms: values.symptoms || 'Khám kiểm tra theo yêu cầu',
      });

      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err) {
      Modal.error({
        title: 'Đặt lịch chưa thành công',
        content: err.response?.data?.message || err.message || 'Có lỗi xảy ra trong quá trình đặt lịch khám.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setBookingSuccessData(null);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        bookingSuccessData ? null : (
          <Space>
            <MedicineBoxOutlined style={{ color: '#0284c7', fontSize: 20 }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              Đặt Lịch Khám Khám Bệnh Trực Tuyến
            </span>
          </Space>
        )
      }
      open={open}
      onCancel={handleModalClose}
      footer={null}
      width={720}
      destroyOnClose
      style={{ top: 20 }}
    >
      {/* =========================================================================
          MÀN HÌNH XÁC NHẬN TÓM TẮT THÔNG TIN ĐÃ ĐẶT (CONFIRMATION RESULT)
         ========================================================================= */}
      {bookingSuccessData ? (
        <div style={{ padding: '8px 0' }}>
          <Result
            status="success"
            title={
              <span style={{ color: '#0f766e', fontWeight: 700, fontSize: 22 }}>
                Đặt Lịch Khám Thành Công!
              </span>
            }
            subTitle={
              <Text type="secondary" style={{ fontSize: 14 }}>
                Hệ thống đã gửi xác nhận đến bệnh viện. Mã phiếu hẹn của bạn là{' '}
                <Tag color="cyan" style={{ fontSize: 14, fontWeight: 700, padding: '2px 8px' }}>
                  #LH-{bookingSuccessData.id}
                </Tag>
              </Text>
            }
            extra={[
              <Button
                type="primary"
                key="done"
                size="large"
                style={{ background: '#0284c7', borderColor: '#0284c7', borderRadius: 8, fontWeight: 600 }}
                onClick={handleModalClose}
              >
                Xem Danh Sách Lịch Hẹn
              </Button>,
            ]}
          />

          <Card
            bordered={false}
            style={{
              background: '#f8fafc',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              marginTop: -8,
            }}
          >
            <Descriptions
              title={<span style={{ color: '#0f172a', fontSize: 15 }}>Chi Tiết Lịch Hẹn Khám</span>}
              bordered
              size="small"
              column={{ xs: 1, sm: 2 }}
            >
              <Descriptions.Item label="Người khám" span={1}>
                <strong>{bookingSuccessData.patientName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={1}>
                {bookingSuccessData.patientPhone}
              </Descriptions.Item>

              <Descriptions.Item label="Bệnh viện tiếp nhận" span={2}>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>{bookingSuccessData.hospitalName}</span>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {bookingSuccessData.hospitalAddress}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Chuyên khoa & Phòng">
                {bookingSuccessData.specialtyName}
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {bookingSuccessData.doctorRoom || bookingSuccessData.departmentName}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Bác sĩ phụ trách">
                <span style={{ fontWeight: 600, color: '#0f766e' }}>{bookingSuccessData.doctorName}</span>
                <div style={{ fontSize: 12, color: '#64748b' }}>{bookingSuccessData.doctorDegree}</div>
              </Descriptions.Item>

              <Descriptions.Item label="Thời gian hẹn" span={2}>
                <Tag color="blue" icon={<CalendarOutlined />}>
                  {bookingSuccessData.bookingDateStr}
                </Tag>
                <Tag color="green" icon={<ClockCircleOutlined />}>
                  {bookingSuccessData.timeSlotStr}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Lý do khám" span={2}>
                <Text type="secondary">{bookingSuccessData.symptoms}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Alert
              style={{ marginTop: 14, borderRadius: 8 }}
              message="Lưu ý quan trọng dành cho bệnh nhân"
              description="Vui lòng đến bệnh viện trước giờ hẹn 15 phút, xuất trình mã lịch hẹn tại quầy tiếp đón ưu tiên để được hỗ trợ làm thủ tục vào phòng khám."
              type="info"
              showIcon
            />
          </Card>
        </div>
      ) : (
        /* =========================================================================
            FORM ĐẶT LỊCH KHÁM CASCADING (BỆNH VIỆN → CHUYÊN KHOA → BÁC SĨ → NGÀY)
           ========================================================================= */
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            timeSlot: '08:30',
          }}
          style={{ marginTop: 12 }}
        >
          {/* I. THÔNG TIN BỆNH NHÂN */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ color: '#0f766e', fontSize: 14, textTransform: 'uppercase' }}>
                1. Thông Tin Người Khám
              </Text>
              <Button
                type="link"
                icon={<PlusOutlined />}
                size="small"
                onClick={handleOpenQuickProfile}
                style={{ fontWeight: 600, color: '#0284c7', padding: 0 }}
              >
                + Thêm hồ sơ người khám
              </Button>
            </div>
            <Divider style={{ margin: '8px 0 14px 0' }} />

            {(!profiles || profiles.length === 0) && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
                message="Chưa có Hồ sơ cá nhân nào"
                description={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span>Bạn cần có hồ sơ cá nhân để bệnh viện tiếp nhận thông tin đặt lịch.</span>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={handleOpenQuickProfile}
                      style={{ background: '#0284c7', fontWeight: 600 }}
                    >
                      Khai báo hồ sơ ngay
                    </Button>
                  </div>
                }
              />
            )}

            <Row gutter={12}>
              <Col xs={24} sm={14}>
                <Form.Item
                  name="profileId"
                  label={<span style={{ fontWeight: 600 }}>Người khám</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn người khám!' }]}
                >
                  <Select
                    placeholder="Chọn hồ sơ bệnh nhân..."
                    size="large"
                    onChange={handleProfileChange}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ padding: '0 8px 4px' }}>
                          <Button
                            type="link"
                            icon={<PlusOutlined />}
                            onClick={handleOpenQuickProfile}
                            style={{ padding: 0, fontWeight: 600 }}
                          >
                            + Thêm hồ sơ người khám mới
                          </Button>
                        </div>
                      </>
                    )}
                  >
                    {profiles.map((p) => (
                      <Option key={p.id} value={p.id}>
                        <UserOutlined style={{ marginRight: 6, color: '#0284c7' }} />
                        {p.fullName} ({p.relationship === 'SELF' ? 'Chính chủ' : (p.relationship || 'Bản thân')})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={10}>
                <Form.Item
                  name="patientPhone"
                  label={<span style={{ fontWeight: 600 }}>Số điện thoại liên hệ</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    {
                      pattern: /^(0|\+84)[0-9]{9,10}$/,
                      message: 'Số điện thoại không hợp lệ (10 chữ số)!',
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
                    placeholder="Ví dụ: 0912345678"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* II. LUỒNG CHỌN PHỤ THUỘC (BỆNH VIỆN → CHUYÊN KHOA → BÁC SĨ) */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: '#0f766e', fontSize: 14, textTransform: 'uppercase' }}>
              2. Chọn Cơ Sở & Bác Sĩ Khám
            </Text>
            <Divider style={{ margin: '8px 0 14px 0' }} />

            <Row gutter={12}>
              {/* CẤP 1: BỆNH VIỆN ĐỐI TÁC (5 BỆNH VIỆN) */}
              <Col xs={24} sm={12}>
                <Form.Item
                  name="hospitalId"
                  label={<span style={{ fontWeight: 600 }}>Bệnh viện đối tác</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn bệnh viện đối tác!' }]}
                >
                  <Select
                    placeholder="-- Chọn bệnh viện tiếp nhận --"
                    size="large"
                    onChange={handleHospitalChange}
                    showSearch
                    optionFilterProp="children"
                  >
                    {PARTNER_HOSPITALS.map((h) => (
                      <Option key={h.id} value={h.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{h.name}</span>
                          <Tag color={h.badgeColor} style={{ margin: 0, fontSize: 11 }}>
                            {h.badge}
                          </Tag>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* CẤP 2: CHUYÊN KHOA (PHỤ THUỘC BỆNH VIỆN) */}
              <Col xs={24} sm={12}>
                <Form.Item
                  name="specialtyId"
                  label={<span style={{ fontWeight: 600 }}>Chuyên khoa</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa!' }]}
                  extra={
                    !selectedHospitalId ? (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        * Vui lòng chọn bệnh viện trước
                      </span>
                    ) : availableSpecialties.length === 0 ? (
                      <span style={{ fontSize: 12, color: '#f59e0b' }}>
                        Bệnh viện này hiện chưa có chuyên khoa hỗ trợ
                      </span>
                    ) : null
                  }
                >
                  <Select
                    placeholder={
                      selectedHospitalId
                        ? '-- Chọn chuyên khoa khám --'
                        : 'Vui lòng chọn bệnh viện trước'
                    }
                    size="large"
                    disabled={!selectedHospitalId}
                    onChange={handleSpecialtyChange}
                  >
                    {availableSpecialties.map((s) => (
                      <Option key={s.id} value={s.id}>
                        <strong>{s.name}</strong> - {s.fullName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* CẤP 3: BÁC SĨ (PHỤ THUỘC BỆNH VIỆN & CHUYÊN KHOA) */}
              <Col xs={24}>
                <Form.Item
                  name="doctorId"
                  label={<span style={{ fontWeight: 600 }}>Bác sĩ phụ trách</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn bác sĩ phụ trách!' }]}
                  extra={
                    !selectedSpecialtyId ? (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        * Vui lòng chọn chuyên khoa để hiển thị danh sách bác sĩ
                      </span>
                    ) : availableDoctors.length === 0 ? (
                      <Alert
                        style={{ marginTop: 6 }}
                        type="warning"
                        showIcon
                        message="Hiện chưa có bác sĩ khả dụng"
                        description="Bệnh viện hiện chưa mở lịch hẹn cho chuyên khoa này. Vui lòng chọn chuyên khoa hoặc bệnh viện khác."
                      />
                    ) : null
                  }
                >
                  <Select
                    placeholder={
                      !selectedSpecialtyId
                        ? 'Vui lòng chọn chuyên khoa trước'
                        : availableDoctors.length === 0
                          ? 'Hiện chưa có bác sĩ khả dụng'
                          : '-- Chọn bác sĩ chuyên khoa --'
                    }
                    size="large"
                    disabled={!selectedSpecialtyId || availableDoctors.length === 0}
                    onChange={handleDoctorChange}
                  >
                    {availableDoctors.map((d) => (
                      <Option key={d.id} value={d.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 600, color: '#0f766e' }}>{d.name}</span>
                            <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>
                              ({d.degree})
                            </span>
                          </div>
                          <Tag color="cyan" style={{ fontSize: 11 }}>
                            {d.experience}
                          </Tag>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Card hiển thị tóm tắt thông tin bác sĩ khi đã chọn */}
                {currentDoctor && (
                  <div
                    style={{
                      background: '#f0fdfa',
                      border: '1px solid #ccfbf1',
                      borderRadius: 8,
                      padding: '10px 14px',
                      marginBottom: 14,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong style={{ color: '#0f766e' }}>
                        {currentDoctor.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {currentDoctor.room}
                      </Text>
                    </div>
                    <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
                      {currentDoctor.degree} • {currentDoctor.experience}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </div>

          {/* III. THỜI GIAN HẸN (NGÀY & KHUNG GIỜ) */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: '#0f766e', fontSize: 14, textTransform: 'uppercase' }}>
              3. Thời Gian Khám
            </Text>
            <Divider style={{ margin: '8px 0 14px 0' }} />

            <Row gutter={12}>
              <Col xs={24} sm={14}>
                <Form.Item
                  name="bookingDate"
                  label={
                    <span style={{ fontWeight: 600 }}>
                      Ngày hẹn khám{' '}
                      <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                        (Tối đa 30 ngày kể từ hôm nay)
                      </Text>
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày hẹn khám!' },
                    { validator: dateValidator },
                  ]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="Chọn ngày khám (hôm nay - 30 ngày tới)"
                    disabledDate={disabledBookingDate}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={10}>
                <Form.Item
                  name="timeSlot"
                  label={<span style={{ fontWeight: 600 }}>Khung giờ khám</span>}
                  rules={[
                    { required: true, message: 'Vui lòng chọn khung giờ khám!' },
                    () => ({
                      validator(_, value) {
                        if (!value || !selectedDayInfo) return Promise.resolve();
                        const slotObj = TIME_SLOTS.find((s) => s.value === value);
                        if (!slotObj) return Promise.resolve();
                        const isMorning = slotObj.period === 'Sáng';
                        if (isMorning && !selectedDayInfo.morning) {
                          return Promise.reject(new Error(`Bác sĩ đã tắt ca sáng vào ${selectedDayInfo.dayLabel}!`));
                        }
                        if (!isMorning && !selectedDayInfo.afternoon) {
                          return Promise.reject(new Error(`Bác sĩ đã tắt ca chiều vào ${selectedDayInfo.dayLabel}!`));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Select placeholder="Chọn khung giờ..." size="large">
                    {TIME_SLOTS.map((slot) => {
                      const isMorning = slot.period === 'Sáng';
                      const isSlotDisabled = selectedDayInfo
                        ? isMorning
                          ? !selectedDayInfo.morning
                          : !selectedDayInfo.afternoon
                        : false;

                      return (
                        <Option
                          key={slot.value}
                          value={slot.value}
                          disabled={isSlotDisabled}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ color: isSlotDisabled ? '#94a3b8' : 'inherit' }}>
                              <ClockCircleOutlined style={{ marginRight: 6, color: isSlotDisabled ? '#cbd5e1' : '#0284c7' }} />
                              {slot.label}
                            </span>
                            {isSlotDisabled && (
                              <Tag color="default" style={{ margin: 0, fontSize: 11, color: '#94a3b8', background: '#f1f5f9' }}>
                                Bác sĩ không trực
                              </Tag>
                            )}
                          </div>
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Cảnh báo tương tác thời gian thực khi Bác sĩ tắt ca sáng hoặc ca chiều */}
            {selectedDayInfo && watchedBookingDate && (!selectedDayInfo.morning || !selectedDayInfo.afternoon) && (
              <Alert
                type="warning"
                showIcon
                style={{ marginTop: 6, fontSize: 13, borderRadius: 6, background: '#fffbeb', borderColor: '#fef3c7' }}
                message={
                  <span>
                    <strong>Thông báo ca làm việc của Bác sĩ: </strong>
                    {!selectedDayInfo.morning && !selectedDayInfo.afternoon ? (
                      <span style={{ color: '#dc2626' }}>
                        Bác sĩ không có ca khám bệnh vào <b>{selectedDayInfo.dayLabel}</b> ({watchedBookingDate.format('DD/MM/YYYY')}).
                      </span>
                    ) : !selectedDayInfo.afternoon ? (
                      <span style={{ color: '#b45309' }}>
                        Bác sĩ đã tắt <b>Ca Chiều</b> vào <b>{selectedDayInfo.dayLabel}</b>. Vui lòng chỉ chọn khung giờ Ca Sáng (vùng chọn ca chiều đã bị làm xám vô hiệu hóa).
                      </span>
                    ) : (
                      <span style={{ color: '#b45309' }}>
                        Bác sĩ đã tắt <b>Ca Sáng</b> vào <b>{selectedDayInfo.dayLabel}</b>. Vui lòng chỉ chọn khung giờ Ca Chiều (vùng chọn ca sáng đã bị làm xám vô hiệu hóa).
                      </span>
                    )}
                  </span>
                }
              />
            )}
          </div>

          {/* IV. LÝ DO KHÁM / TRIỆU CHỨNG (BỆNH NHÂN TỰ MÔ TẢ) */}
          {/* LƯU Ý: ĐÃ BỎ HOÀN TOÀN TRƯỜNG "GHI CHÚ / DẶN DÒ" THEO YÊU CẦU */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ color: '#0f766e', fontSize: 14, textTransform: 'uppercase' }}>
              4. Lý Do Khám & Triệu Chứng
            </Text>
            <Divider style={{ margin: '8px 0 14px 0' }} />

            <Form.Item
              name="symptoms"
              label={<span style={{ fontWeight: 600 }}>Mô tả triệu chứng / Lý do khám</span>}
              rules={[{ required: true, message: 'Vui lòng mô tả lý do khám hoặc triệu chứng của bạn!' }]}
            >
              <TextArea
                rows={3}
                placeholder="Ví dụ: Đau đầu kéo dài 3 ngày, muốn khám kiểm tra; Ho sốt tái phát; Khám thai định kỳ tuần thứ 28..."
                showCount
                maxLength={300}
              />
            </Form.Item>
          </div>

          {/* NÚT THAO TÁC */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              borderTop: '1px solid #f1f5f9',
              paddingTop: 16,
            }}
          >
            <Button size="large" onClick={handleModalClose}>
              Hủy Bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              icon={<CheckCircleOutlined />}
              style={{
                background: '#0284c7',
                borderColor: '#0284c7',
                borderRadius: 8,
                fontWeight: 600,
                padding: '0 24px',
              }}
            >
              Xác Nhận Đặt Lịch
            </Button>
          </div>
        </Form>
      )}

      {/* MODAL KHAI BÁO HỒ SƠ CÁ NHÂN NHANH */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#0284c7' }} />
            <span style={{ fontWeight: 700 }}>Khai Báo Hồ Sơ Người Khám</span>
          </Space>
        }
        open={quickProfileOpen}
        onCancel={() => setQuickProfileOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Form
          form={quickProfileForm}
          layout="vertical"
          onFinish={handleQuickProfileSubmit}
          style={{ marginTop: 12 }}
        >
          <Row gutter={12}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="fullName"
                label={<span style={{ fontWeight: 600 }}>Họ và tên người khám <Text type="danger">*</Text></span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input placeholder="Ví dụ: Nguyễn Văn An" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="relationship"
                label={<span style={{ fontWeight: 600 }}>Quan hệ <Text type="danger">*</Text></span>}
                rules={[{ required: true, message: 'Vui lòng chọn mối quan hệ!' }]}
              >
                <Select size="large">
                  <Option value="SELF">Bản thân</Option>
                  <Option value="CHILD">Con cái</Option>
                  <Option value="PARENT">Bố / Mẹ</Option>
                  <Option value="SPOUSE">Vợ / Chồng</Option>
                  <Option value="OTHER">Người thân khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gender"
                label={<span style={{ fontWeight: 600 }}>Giới tính <Text type="danger">*</Text></span>}
                rules={[{ required: true, message: 'Chọn giới tính!' }]}
              >
                <Select size="large">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="dateOfBirth"
                label={<span style={{ fontWeight: 600 }}>Ngày sinh <Text type="danger">*</Text></span>}
                rules={[{ required: true, message: 'Chọn ngày sinh!' }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  size="large"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label={<span style={{ fontWeight: 600 }}>Số điện thoại cá nhân <Text type="danger">*</Text></span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại cá nhân!' },
                  {
                    pattern: /^(0|\+84)[0-9]{9,10}$/,
                    message: 'Số điện thoại không hợp lệ (10 chữ số)!',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#0284c7' }} />}
                  placeholder="Ví dụ: 0912345678"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="cccd"
                label={<span style={{ fontWeight: 600 }}>Số CCCD / Định danh <Text type="danger">*</Text></span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập số CCCD / CMND!' },
                  {
                    pattern: /^[0-9]{9}$|^[0-9]{12}$/,
                    message: 'CCCD phải gồm đúng 9 hoặc 12 chữ số!',
                  },
                ]}
              >
                <Input placeholder="Ví dụ: 084206007888" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyContactName"
                label={<span style={{ fontWeight: 600 }}>Tên người liên hệ khẩn cấp <Text type="danger">*</Text></span>}
                rules={[{ required: true, message: 'Nhập tên người liên hệ khẩn cấp!' }]}
              >
                <Input placeholder="Ví dụ: Bố - Nguyễn Văn B" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyContactPhone"
                label={<span style={{ fontWeight: 600 }}>SĐT người liên hệ khẩn cấp <Text type="danger">*</Text></span>}
                rules={[
                  { required: true, message: 'Nhập SĐT người liên hệ khẩn cấp!' },
                  {
                    pattern: /^(0|\+84)[0-9]{9,10}$/,
                    message: 'Số điện thoại khẩn cấp không hợp lệ!',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#dc2626' }} />}
                  placeholder="Ví dụ: 0987654321"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="addressDetail"
            label={<span style={{ fontWeight: 600 }}>Địa chỉ thường trú <Text type="danger">*</Text></span>}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ thường trú!' }]}
          >
            <Input
              prefix={<HomeOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Ví dụ: 91 Đường 447, Phường Tăng Nhơn Phú, TP. Thủ Đức"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="bhytNumber"
            label={<span style={{ fontWeight: 600 }}>Mã thẻ BHYT (tùy chọn)</span>}
          >
            <Input placeholder="Ví dụ: GD4797931400123" size="large" />
          </Form.Item>

          <Divider style={{ margin: '14px 0' }} />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setQuickProfileOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submittingQuickProfile}
                style={{ background: '#0284c7', fontWeight: 600 }}
              >
                Lưu & Chọn Ngay
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default AppointmentBookingModal;
