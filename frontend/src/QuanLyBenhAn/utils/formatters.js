import dayjs from 'dayjs';

/**
 * Định dạng ngày theo chuẩn Việt Nam DD/MM/YYYY
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY');
};

/**
 * Định dạng ngày và giờ DD/MM/YYYY HH:mm
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

/**
 * Ẩn thông tin nhạy cảm định danh (PII Masking)
 * Ví dụ CCCD 001234567890 -> 001******890
 * BHYT DN4012345678901 -> DN4******901
 */
export const maskPii = (value) => {
  if (!value) return '-';
  const str = String(value).trim();
  if (str.length <= 6) return '***';
  const prefix = str.slice(0, 3);
  const suffix = str.slice(-3);
  return `${prefix}******${suffix}`;
};

/**
 * Định dạng số điện thoại Việt Nam (0912 345 678)
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};

/**
 * Dịch nghĩa quan hệ gia đình sang tiếng Việt
 */
export const formatRelationship = (rel) => {
  const map = {
    SELF: 'Bản thân',
    FATHER: 'Bố',
    MOTHER: 'Mẹ',
    SPOUSE: 'Vợ / Chồng',
    CHILD: 'Con',
    SIBLING: 'Anh / Chị / Em',
    GRANDPARENT: 'Ông / Bà',
    OTHER: 'Khác',
  };
  return map[rel] || rel || 'Người thân';
};

/**
 * Dịch nghĩa loại bệnh án
 */
export const formatRecordType = (type) => {
  const map = {
    INTERNAL: 'Nội Khoa (MS: 01/BV-01)',
    SURGICAL: 'Ngoại Khoa (MS: 10/BV-01)',
    PEDIATRIC: 'Nhi Khoa (MS: 02/BV-01)',
    OBSTETRIC: 'Sản Khoa (Chuẩn Naegele)',
    GENERAL: 'Khám Bệnh Chung',
  };
  return map[type] || type || 'Khám chung';
};
