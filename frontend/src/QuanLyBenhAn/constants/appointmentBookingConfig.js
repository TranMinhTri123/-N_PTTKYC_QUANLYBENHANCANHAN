/**
 * CẤU HÌNH DỮ LIỆU ĐẶT LỊCH KHÁM (CHUẨN HÓA MỘT BỆNH VIỆN DUY NHẤT)
 */
import dayjs from 'dayjs';

// Số ngày tối đa bệnh nhân được đặt lịch trước kể từ hôm nay
export const MAX_BOOKING_DAYS = 30;

// 1. THÔNG TIN BỆNH VIỆN DUY NHẤT (THEO NGUYÊN TẮC HỆ THỐNG PHR)
export const CURRENT_HOSPITAL = {
  id: 'bv_phr',
  code: 'BV-PHR',
  name: 'Bệnh viện Đa khoa PHR',
  shortName: 'BV PHR',
  address: 'Khu Y Tế Trung Tâm, TP.HCM',
  badge: 'Bệnh Viện Phát Hành',
  badgeColor: 'blue',
  supportedSpecialties: ['INTERNAL', 'SURGICAL', 'OBSTETRIC', 'PEDIATRIC', 'GENERAL'],
};

export const PARTNER_HOSPITALS = [CURRENT_HOSPITAL];

// 2. DANH MỤC 5 CHUYÊN KHOA CỐ ĐỊNH
export const SPECIALTIES = [
  {
    id: 'INTERNAL',
    name: 'Nội',
    fullName: 'Nội khoa',
    departmentName: 'Khoa Nội Tổng Hợp',
    description: 'Tim mạch, hô hấp, tiêu hóa, thần kinh, nội tiết',
  },
  {
    id: 'SURGICAL',
    name: 'Ngoại',
    fullName: 'Ngoại khoa',
    departmentName: 'Khoa Ngoại Tổng Quát',
    description: 'Phẫu thuật ngoại tiêu hóa, chấn thương, lồng ngực',
  },
  {
    id: 'OBSTETRIC',
    name: 'Sản',
    fullName: 'Sản - Phụ khoa',
    departmentName: 'Khoa Phụ Sản',
    description: 'Khám thai định kỳ, sàng lọc trước sinh, phụ khoa',
  },
  {
    id: 'PEDIATRIC',
    name: 'Nhi',
    fullName: 'Nhi khoa',
    departmentName: 'Khoa Nhi',
    description: 'Chăm sóc sức khỏe toàn diện cho trẻ sơ sinh & trẻ em',
  },
  {
    id: 'GENERAL',
    name: 'Chung',
    fullName: 'Khám bệnh chung / Đa khoa',
    departmentName: 'Phòng Khám Đa Khoa',
    description: 'Khám sức khỏe tổng quát, tầm soát ban đầu',
  },
];

// 3. DANH SÁCH BÁC SĨ MẶC ĐỊNH (DANH SÁCH THỰC TẾ ĐƯỢC TẢI TỪ DATABASE QUA API)
export const DOCTOR_CATALOG = [];

// 4. DANH SÁCH KHUNG GIỜ KHÁM TRONG NGÀY
export const TIME_SLOTS = [
  { value: '07:30', label: '07:30 - 08:30 (Sáng)', period: 'Sáng' },
  { value: '08:30', label: '08:30 - 09:30 (Sáng)', period: 'Sáng' },
  { value: '09:30', label: '09:30 - 10:30 (Sáng)', period: 'Sáng' },
  { value: '10:30', label: '10:30 - 11:30 (Sáng)', period: 'Sáng' },
  { value: '13:30', label: '13:30 - 14:30 (Chiều)', period: 'Chiều' },
  { value: '14:30', label: '14:30 - 15:30 (Chiều)', period: 'Chiều' },
  { value: '15:30', label: '15:30 - 16:30 (Chiều)', period: 'Chiều' },
];

// ============================================================================
// CÁC HÀM TIỆN ÍCH TRUY XUẤT DỮ LIỆU CẤU HÌNH
// ============================================================================

export const getSpecialtiesByHospital = (hospitalId) => {
  return SPECIALTIES;
};

export const getDoctorsByHospitalAndSpecialty = (hospitalId, specialtyId) => {
  if (!specialtyId) return [];
  return DOCTOR_CATALOG.filter((doc) => doc.specialtyId === specialtyId);
};

export const getHospitalById = (hospitalId) => {
  return CURRENT_HOSPITAL;
};

export const getSpecialtyById = (specialtyId) => {
  return SPECIALTIES.find((s) => s.id === specialtyId) || null;
};

export const getDoctorById = (doctorId) => {
  return DOCTOR_CATALOG.find((d) => d.id === doctorId) || null;
};

export const validateBookingDate = (date) => {
  if (!date) {
    return { valid: false, message: 'Vui lòng chọn ngày hẹn!' };
  }
  const today = dayjs().startOf('day');
  const maxDate = dayjs().add(MAX_BOOKING_DAYS, 'day').endOf('day');

  if (date.isBefore(today, 'day')) {
    return { valid: false, message: 'Không thể chọn ngày trong quá khứ!' };
  }
  if (date.isAfter(maxDate, 'day')) {
    return {
      valid: false,
      message: `Vui lòng chọn ngày từ hôm nay đến ${MAX_BOOKING_DAYS} ngày tới! Không cho phép đặt trước quá 30 ngày.`,
    };
  }
  return { valid: true, message: '' };
};
