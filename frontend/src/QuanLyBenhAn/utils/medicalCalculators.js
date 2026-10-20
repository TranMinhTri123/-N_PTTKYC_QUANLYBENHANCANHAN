import dayjs from 'dayjs';

/**
 * 1. Tính toán chỉ số khối cơ thể (BMI) theo chuẩn WHO & Châu Á
 * @param {number} heightCm - Chiều cao tính bằng cm
 * @param {number} weightKg - Cân nặng tính bằng kg
 * @returns {object} { bmi, classification, tagColor }
 */
export const calculateBmi = (heightCm, weightKg) => {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return { bmi: null, classification: 'Chưa đủ dữ liệu', tagColor: 'default' };
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let classification = '';
  let tagColor = 'default';

  if (bmi < 18.5) {
    classification = 'Thiếu cân / Gầy';
    tagColor = 'warning';
  } else if (bmi < 23) {
    classification = 'Bình thường / Tối ưu';
    tagColor = 'success';
  } else if (bmi < 25) {
    classification = 'Thừa cân (Tiền béo phì)';
    tagColor = 'warning';
  } else if (bmi < 30) {
    classification = 'Béo phì độ 1';
    tagColor = 'error';
  } else {
    classification = 'Béo phì độ 2 (Nguy hiểm)';
    tagColor = 'error';
  }

  return { bmi, classification, tagColor };
};

/**
 * 2. Công thức Naegele tính ngày dự sinh (EDD) cho Chuyên khoa Sản
 * Quy tắc: EDD = Ngày đầu kỳ kinh cuối (LMP) + 7 ngày - 3 tháng + 1 năm
 * @param {string|dayjs.Dayjs} lmpDate 
 * @returns {string|null} Định dạng YYYY-MM-DD
 */
export const calculateNaegeleEdd = (lmpDate) => {
  if (!lmpDate) return null;
  const lmp = dayjs(lmpDate);
  if (!lmp.isValid()) return null;

  const edd = lmp.add(7, 'day').subtract(3, 'month').add(1, 'year');
  return edd.format('YYYY-MM-DD');
};

/**
 * 3. Tính tuổi thai theo tuần từ ngày kinh cuối (LMP)
 * @param {string|dayjs.Dayjs} lmpDate 
 * @returns {number|null} Tuổi thai tính theo tuần
 */
export const calculateGestationalAgeWeeks = (lmpDate) => {
  if (!lmpDate) return null;
  const lmp = dayjs(lmpDate);
  if (!lmp.isValid()) return null;

  const now = dayjs();
  const diffDays = now.diff(lmp, 'day');
  if (diffDays < 0) return null;

  return Math.floor(diffDays / 7);
};

/**
 * 4. Che bớt thông tin nhạy cảm định danh (PII Masking - Rule 5)
 * @param {string} text - Số CCCD hoặc số thẻ BHYT
 * @param {string} type - 'CCCD' hoặc 'BHYT'
 */
export const maskIdentity = (text, type = 'CCCD') => {
  if (!text) return '—';
  if (type === 'CCCD' && text.length === 12) {
    return `${text.slice(0, 3)}******${text.slice(-3)}`;
  }
  if (type === 'BHYT' && text.length >= 10) {
    return `${text.slice(0, 3)}*****${text.slice(-3)}`;
  }
  return text;
};

/**
 * 5. Định dạng ngày giờ chuẩn Việt Nam (Rule 7)
 */
export const formatVnDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = dayjs(dateStr);
  return d.isValid() ? d.format('DD/MM/YYYY') : '—';
};

export const formatVnDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = dayjs(dateStr);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : '—';
};
