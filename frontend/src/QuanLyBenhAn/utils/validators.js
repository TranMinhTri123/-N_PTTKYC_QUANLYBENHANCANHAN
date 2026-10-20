import dayjs from 'dayjs';

/**
 * Ràng buộc số điện thoại di động Việt Nam (10 số, đầu 03, 05, 07, 08, 09)
 */
export const vietnamesePhoneRule = {
  pattern: /^0(3|5|7|8|9)[0-9]{8}$/,
  message: 'Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số chuẩn di động Việt Nam (03, 05, 07, 08, 09).',
};

/**
 * Ràng buộc ngày sinh không được ở tương lai và không quá 120 tuổi
 */
export const birthDateRule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    const date = dayjs(value);
    const now = dayjs();
    if (date.isAfter(now)) {
      return Promise.reject(new Error('Ngày sinh không thể ở tương lai!'));
    }
    if (now.diff(date, 'year') > 120) {
      return Promise.reject(new Error('Tuổi không thể vượt quá 120 tuổi!'));
    }
    return Promise.resolve();
  },
};

/**
 * Ràng buộc email chuẩn RFC 5322 cơ bản
 */
export const emailRule = {
  type: 'email',
  message: 'Định dạng email không hợp lệ!',
};

/**
 * Ràng buộc mật khẩu tối thiểu 6 ký tự
 */
export const passwordRule = {
  min: 6,
  message: 'Mật khẩu phải chứa ít nhất 6 ký tự!',
};
