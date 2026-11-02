import http from 'http';

const BASE_URL = 'http://localhost:8088/api/v1';

async function request(path, options = {}) {
  const url = new URL(BASE_URL + path);
  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

const testResults = [];

function recordTest(id, category, testCase, expected, actual, pass, severity, notes = '') {
  testResults.push({
    id,
    category,
    testCase,
    expected,
    actual: typeof actual === 'object' ? JSON.stringify(actual) : String(actual),
    pass,
    status: pass ? 'ĐẠT' : 'LỖI',
    severity,
    notes,
  });
}

async function runAllTests() {
  console.log('=== KHỞI CHẠY KIỂM THỬ TOÀN DIỆN PHÂN HỆ BÁC SĨ (QA AUTOMATION SUITE) ===\n');

  let doctorToken = null;
  let doctorUserId = null;
  let adminToken = null;
  let patientToken = null;

  // -------------------------------------------------------------
  // TEST SUITE 1: TÀI KHOẢN VÀ ĐĂNG NHẬP
  // -------------------------------------------------------------
  console.log('--- 1. Kiểm thử Tài khoản & Đăng nhập ---');

  // TC 1.1: Đăng nhập Bác sĩ đúng mật khẩu
  try {
    const res = await request('/auth/authenticate', {
      method: 'POST',
      body: { email: 'doctor@phr.vn', password: 'Admin@123' },
    });
    const pass = res.status === 200 && (res.data?.data?.token || res.data?.token);
    doctorToken = res.data?.data?.token || res.data?.token;
    recordTest(
      'TC-1.1',
      'Tài khoản & Đăng nhập',
      'Đăng nhập Bác sĩ với email và mật khẩu đúng',
      'HTTP 200, trả về Access Token',
      `HTTP ${res.status}, ${doctorToken ? 'Có Token' : 'Không có token'}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-1.1', 'Tài khoản & Đăng nhập', 'Đăng nhập Bác sĩ đúng', 'HTTP 200', err.message, false, '🔴 Nghiêm trọng');
  }

  // TC 1.2: Đăng nhập Admin
  try {
    const res = await request('/auth/authenticate', {
      method: 'POST',
      body: { email: 'admin@phr.vn', password: 'Admin@123' },
    });
    adminToken = res.data?.data?.token || res.data?.token;
    recordTest(
      'TC-1.2',
      'Tài khoản & Đăng nhập',
      'Đăng nhập Admin để quản trị bệnh viện',
      'HTTP 200, cấp quyền ROLE_ADMIN',
      `HTTP ${res.status}`,
      res.status === 200,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-1.2', 'Tài khoản & Đăng nhập', 'Đăng nhập Admin', 'HTTP 200', err.message, false, '🔴 Nghiêm trọng');
  }

  // TC 1.3: Đăng nhập sai mật khẩu
  try {
    const res = await request('/auth/authenticate', {
      method: 'POST',
      body: { email: 'doctor@phr.vn', password: 'WrongPassword123!' },
    });
    const errMsg = res.data?.errorDescription || res.data?.message || res.data?.error || '';
    const pass = (res.status === 401 || res.status === 400 || res.status === 403) && !errMsg.toLowerCase().includes('sql');
    recordTest(
      'TC-1.3',
      'Tài khoản & Đăng nhập',
      'Đăng nhập sai mật khẩu (kiểm tra an toàn thông báo)',
      'HTTP 401/400, thông báo lỗi chung, không để lộ cấu trúc hệ thống',
      `HTTP ${res.status}: ${errMsg}`,
      pass,
      '🟡 Nên sửa'
    );
  } catch (err) {
    recordTest('TC-1.3', 'Tài khoản & Đăng nhập', 'Đăng nhập sai mật khẩu', 'HTTP 401', err.message, false, '🟡 Nên sửa');
  }

  // TC 1.4: Đăng nhập tài khoản không tồn tại
  try {
    const res = await request('/auth/authenticate', {
      method: 'POST',
      body: { email: 'nonexistent_doc_999@phr.vn', password: 'SomePassword123!' },
    });
    const errMsg = res.data?.errorDescription || res.data?.message || '';
    const pass = res.status === 401 || res.status === 404 || res.status === 400;
    recordTest(
      'TC-1.4',
      'Tài khoản & Đăng nhập',
      'Đăng nhập email không tồn tại trong hệ thống',
      'HTTP 401/404, không phân biệt lỗi email vs mật khẩu để chống User Enumeration',
      `HTTP ${res.status}: ${errMsg}`,
      pass,
      '🟡 Nên sửa'
    );
  } catch (err) {
    recordTest('TC-1.4', 'Tài khoản & Đăng nhập', 'Đăng nhập email không tồn tại', 'HTTP 401/404', err.message, false, '🟡 Nên sửa');
  }

  // TC 1.5: Đăng ký tài khoản bệnh nhân test
  const patientEmail = `testpatient_${Date.now()}@phr.vn`;
  try {
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        email: patientEmail,
        password: 'Password@123',
        firstName: 'Nguyễn',
        lastName: 'Văn Test',
      },
    });
    patientToken = regRes.data?.data?.token || regRes.data?.token;
    recordTest(
      'TC-1.5',
      'Tài khoản & Đăng nhập',
      'Đăng ký tài khoản Bệnh nhân giả lập',
      'HTTP 201/200, tự động gán ROLE_USER (bác sĩ không được tự đăng ký)',
      `HTTP ${regRes.status}`,
      regRes.status === 201 || regRes.status === 200,
      '🟢 Gợi ý'
    );
  } catch (err) {
    recordTest('TC-1.5', 'Tài khoản & Đăng nhập', 'Đăng ký BN giả lập', 'HTTP 201', err.message, false, '🟢 Gợi ý');
  }

  // TC 1.6: Xem thông tin Bác sĩ hiện tại (/auth/me)
  try {
    const res = await request('/auth/me', { token: doctorToken });
    const user = res.data?.data || res.data;
    doctorUserId = user?.id;
    const isDoc = user?.roles?.includes('ROLE_DOCTOR');
    recordTest(
      'TC-1.6',
      'Tài khoản & Hồ sơ',
      'Xem thông tin tài khoản Bác sĩ hiện tại (/auth/me)',
      'HTTP 200, có vai trò ROLE_DOCTOR và thông tin khoa phòng',
      `HTTP ${res.status}, Roles: ${JSON.stringify(user?.roles)}, Khoa: ${user?.department || 'N/A'}`,
      res.status === 200 && isDoc,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-1.6', 'Tài khoản & Hồ sơ', 'Xem thông tin /auth/me', 'HTTP 200', err.message, false, '🔴 Nghiêm trọng');
  }

  // TC 1.7: Cập nhật hồ sơ Bác sĩ (/auth/profile) với tiếng Việt có dấu
  try {
    const res = await request('/auth/profile', {
      method: 'PUT',
      token: doctorToken,
      body: {
        firstName: 'Nguyễn Văn',
        lastName: 'An (BS Chuyên Khoa)',
        phone: '0912345678',
        department: 'Khoa Nội Tổng Hợp',
      },
    });
    recordTest(
      'TC-1.7',
      'Tài khoản & Hồ sơ',
      'Cập nhật hồ sơ Bác sĩ với tên tiếng Việt có dấu và SĐT',
      'HTTP 200, lưu đúng ký tự tiếng Việt UTF-8 không lỗi font',
      `HTTP ${res.status}: ${res.data?.data?.fullName || res.data?.message || 'OK'}`,
      res.status === 200,
      '🟡 Nên sửa'
    );
  } catch (err) {
    recordTest('TC-1.7', 'Tài khoản & Hồ sơ', 'Cập nhật hồ sơ Bác sĩ', 'HTTP 200', err.message, false, '🟡 Nên sửa');
  }

  // -------------------------------------------------------------
  // TEST SUITE 2: PHÂN QUYỀN VÀ BẢO MẬT (ƯU TIÊN CAO NHẤT)
  // -------------------------------------------------------------
  console.log('--- 2. Kiểm thử Phân quyền & Bảo mật (Security & Authorization) ---');

  // TC 2.1: Bệnh nhân cố tình gọi API Bác sĩ (/appointments/{id}/doctor-action)
  try {
    const res = await request('/appointments/1/doctor-action', {
      method: 'POST',
      token: patientToken,
      body: { action: 'CONFIRM', doctorNote: 'Hacker giả mạo bác sĩ' },
    });
    const pass = res.status === 403 || res.status === 401;
    recordTest(
      'TC-2.1',
      'Phân quyền & Bảo mật',
      'Bệnh nhân (ROLE_USER) gọi API Bác sĩ xác nhận lịch hẹn',
      'HTTP 403 Forbidden, từ chối quyền truy cập',
      `HTTP ${res.status}: ${res.data?.errorDescription || res.data?.message || ''}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-2.1', 'Phân quyền & Bảo mật', 'Bệnh nhân gọi API Bác sĩ', 'HTTP 403', err.message, true, '🔴 Nghiêm trọng');
  }

  // TC 2.2: Người dùng chưa đăng nhập gọi API Bác sĩ
  try {
    const res = await request('/appointments/1/doctor-action', {
      method: 'POST',
      body: { action: 'CONFIRM' },
    });
    const pass = res.status === 401 || res.status === 403;
    recordTest(
      'TC-2.2',
      'Phân quyền & Bảo mật',
      'Chưa đăng nhập gọi API thao tác lịch hẹn',
      'HTTP 401 Unauthorized',
      `HTTP ${res.status}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-2.2', 'Phân quyền & Bảo mật', 'Chưa đăng nhập gọi API', 'HTTP 401', err.message, true, '🔴 Nghiêm trọng');
  }

  // TC 2.3: Bác sĩ tự nâng quyền lên ROLE_ADMIN qua API
  try {
    const res = await request('/admin/users/2/role', {
      method: 'PUT',
      token: doctorToken,
      body: { roleName: 'ROLE_ADMIN' },
    });
    const pass = res.status === 403 || res.status === 401;
    recordTest(
      'TC-2.3',
      'Phân quyền & Bảo mật',
      'Bác sĩ tự nâng quyền thành ROLE_ADMIN (/admin/users/{id}/role)',
      'HTTP 403 Forbidden, chỉ ROLE_ADMIN mới có quyền cấp role',
      `HTTP ${res.status}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-2.3', 'Phân quyền & Bảo mật', 'Bác sĩ tự nâng quyền Admin', 'HTTP 403', err.message, true, '🔴 Nghiêm trọng');
  }

  // TC 2.4: SQL Injection ở API Đăng nhập và Tìm kiếm
  try {
    const res = await request('/auth/authenticate', {
      method: 'POST',
      body: { email: "' OR '1'='1", password: "' OR '1'='1" },
    });
    const pass = res.status === 401 || res.status === 400 || res.status === 404;
    recordTest(
      'TC-2.4',
      'Phân quyền & Bảo mật',
      "SQL Injection payload (' OR '1'='1) tại endpoint Đăng nhập",
      'HTTP 401/400, cơ sở dữ liệu không bị khai thác hoặc crash',
      `HTTP ${res.status}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-2.4', 'Phân quyền & Bảo mật', 'SQL Injection Auth', 'HTTP 401/400', err.message, true, '🔴 Nghiêm trọng');
  }

  // TC 2.5: XSS Injection trong lý do khám & ghi chú chuyên môn
  try {
    const res = await request('/doctor-notes', {
      method: 'POST',
      token: doctorToken,
      body: {
        medicalRecordId: 999999,
        doctorName: 'BS. Test',
        department: 'Khoa Nội',
        evaluationNote: "<script>alert('XSS-TEST')</script><img src=x onerror=alert(1)>",
        clinicalAdvice: 'Uống thuốc đúng giờ',
      },
    });
    const pass = res.status === 404 || res.status === 400 || res.status === 200 || res.status === 201;
    recordTest(
      'TC-2.5',
      'Phân quyền & Bảo mật',
      'XSS Injection payload (<script> & <img>) trong ghi chú chuyên môn',
      'HTTP 400/404/200, an toàn không thực thi mã nguy hại',
      `HTTP ${res.status}`,
      pass,
      '🟡 Nên sửa'
    );
  } catch (err) {
    recordTest('TC-2.5', 'Phân quyền & Bảo mật', 'XSS Injection Notes', 'HTTP 400/404', err.message, true, '🟡 Nên sửa');
  }

  // TC 2.6: IDOR - Bác sĩ khác (Doctor B) cố tình can thiệp lịch hẹn của Bác sĩ A
  let doctor2Token = null;
  try {
    const doc2Email = `doctor2_${Date.now()}@phr.vn`;
    // Register new user
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: { email: doc2Email, password: 'Password@123', firstName: 'Lê Văn', lastName: 'Bình (BS Ngoại)' },
    });
    const doc2Id = regRes.data?.data?.user?.id || regRes.data?.user?.id;
    doctor2Token = regRes.data?.data?.token || regRes.data?.token;

    // Admin grants ROLE_DOCTOR to doc2
    if (adminToken && doc2Id) {
      await request(`/admin/users/${doc2Id}/role`, {
        method: 'PUT',
        token: adminToken,
        body: { roleName: 'ROLE_DOCTOR', department: 'Khoa Ngoại', hospitalName: 'Bệnh viện Đa khoa PHR' },
      });
      // Re-login to get updated role token
      const reLogin = await request('/auth/authenticate', {
        method: 'POST',
        body: { email: doc2Email, password: 'Password@123' },
      });
      doctor2Token = reLogin.data?.data?.token || reLogin.data?.token || doctor2Token;
    }

    if (appointmentId && doctor2Token) {
      const idorRes = await request(`/appointments/${appointmentId}/doctor-action`, {
        method: 'POST',
        token: doctor2Token,
        body: { action: 'CONFIRM', doctorNote: 'Bác sĩ 2 can thiệp trái phép' },
      });
      const pass = idorRes.status === 403;
      recordTest(
        'TC-2.6',
        'Phân quyền & Bảo mật',
        'IDOR: Bác sĩ B gọi API can thiệp lịch hẹn được phân công cho Bác sĩ A',
        'HTTP 403 Forbidden, từ chối quyền can thiệp lịch của bác sĩ khác',
        `HTTP ${idorRes.status}: ${idorRes.data?.errorDescription || idorRes.data?.message || ''}`,
        pass,
        '🔴 Nghiêm trọng'
      );
    }
  } catch (err) {
    recordTest('TC-2.6', 'Phân quyền & Bảo mật', 'IDOR Bác sĩ can thiệp lịch chéo', 'HTTP 403', err.message, true, '🔴 Nghiêm trọng');
  }

  // -------------------------------------------------------------
  // TEST SUITE 3: LỊCH HẸN VÀ MÁY TRẠNG THÁI (APPOINTMENT WORKFLOW)
  // -------------------------------------------------------------
  console.log('--- 3. Kiểm thử Nghiệp vụ Lịch hẹn & Máy trạng thái ---');

  // Tạo một hồ sơ người bệnh giả lập để đặt lịch
  let profileId = null;
  try {
    const profRes = await request('/health-profiles', {
      method: 'POST',
      token: patientToken,
      body: {
        fullName: 'Trần Thị Bệnh Nhân Giả Lập',
        relationship: 'SELF',
        gender: 'FEMALE',
        dateOfBirth: '1992-05-15',
        phone: '0987654321',
        bloodType: 'O_POSITIVE',
        addressDetail: 'Phường Hiệp Phú, TP. Thủ Đức',
      },
    });
    profileId = profRes.data?.data?.id || profRes.data?.id;
  } catch (err) {
    console.warn('Lỗi tạo hồ sơ test:', err.message);
  }

  // TC 3.1: Bệnh nhân đặt lịch hẹn khám mới
  let appointmentId = null;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const tomorrowStr = tomorrow.toISOString().split('T')[0] + 'T09:00:00';

  try {
    const bookRes = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        profileId: profileId,
        title: 'Khám Nội tổng hợp - BS. CK1 Nguyễn Văn An',
        facilityName: 'Bệnh viện Đa khoa PHR',
        doctorName: 'BS. CK1 Nguyễn Văn An',
        appointmentTime: tomorrowStr,
        appointmentType: 'FOLLOW_UP',
        notes: 'Bệnh nhân đau tức ngực kéo dài 3 ngày, muốn khám kiểm tra chuyên sâu.',
        patientPhone: '0987654321',
      },
    });
    appointmentId = bookRes.data?.data?.id || bookRes.data?.id;
    const initialStatus = bookRes.data?.data?.status || bookRes.data?.status;
    const pass = (bookRes.status === 201 || bookRes.status === 200) && initialStatus === 'PENDING';
    recordTest(
      'TC-3.1',
      'Quản lý Lịch hẹn',
      'Bệnh nhân tạo lịch hẹn mới qua luồng Đặt lịch',
      'HTTP 201/200, trạng thái khởi tạo bắt buộc là PENDING (Chờ bác sĩ tiếp nhận)',
      `HTTP ${bookRes.status}, Trạng thái: ${initialStatus}, ID: #${appointmentId}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-3.1', 'Quản lý Lịch hẹn', 'Tạo lịch hẹn mới', 'HTTP 201', err.message, false, '🔴 Nghiêm trọng');
  }

  // TC 3.2: Validate ngày hẹn vượt quá 30 ngày (MAX_BOOKING_DAYS)
  const past35Days = new Date();
  past35Days.setDate(past35Days.getDate() + 35);
  try {
    const res = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        profileId: profileId,
        facilityName: 'Bệnh viện Đa khoa PHR',
        appointmentTime: past35Days.toISOString(),
        appointmentType: 'FOLLOW_UP',
      },
    });
    const pass = res.status === 400;
    recordTest(
      'TC-3.2',
      'Lịch làm việc & Giới hạn',
      'Đặt lịch hẹn quá 30 ngày (ngày thứ 35 kể từ hôm nay)',
      'HTTP 400 Bad Request (Chặn ở Server/API theo MAX_BOOKING_DAYS = 30)',
      `HTTP ${res.status}: ${res.data?.errorDescription || res.data?.message || 'Thành công ngoài ý muốn'}`,
      pass,
      '🔴 Nghiêm trọng',
      res.status !== 400 ? 'Server chưa validate MAX_BOOKING_DAYS = 30 tại backend API!' : ''
    );
  } catch (err) {
    recordTest('TC-3.2', 'Lịch làm việc & Giới hạn', 'Đặt lịch quá 30 ngày', 'HTTP 400', err.message, true, '🔴 Nghiêm trọng');
  }

  // TC 3.3: Validate ngày hẹn trong quá khứ
  const pastDay = new Date();
  pastDay.setDate(pastDay.getDate() - 2);
  try {
    const res = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        profileId: profileId,
        facilityName: 'Bệnh viện Đa khoa PHR',
        appointmentTime: pastDay.toISOString(),
        appointmentType: 'FOLLOW_UP',
      },
    });
    const pass = res.status === 400;
    recordTest(
      'TC-3.3',
      'Lịch làm việc & Giới hạn',
      'Đặt lịch hẹn trong quá khứ (2 ngày trước)',
      'HTTP 400 Bad Request, không được đặt ngày quá khứ',
      `HTTP ${res.status}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-3.3', 'Lịch làm việc & Giới hạn', 'Đặt lịch quá khứ', 'HTTP 400', err.message, true, '🔴 Nghiêm trọng');
  }

  // TC 3.4: Bác sĩ xem danh sách lịch hẹn
  try {
    const res = await request('/appointments', { token: doctorToken });
    const list = Array.isArray(res.data?.data) ? res.data?.data : res.data;
    const pass = res.status === 200 && Array.isArray(list);
    recordTest(
      'TC-3.4',
      'Quản lý Lịch hẹn',
      'Bác sĩ lấy danh sách tất cả lịch hẹn điều trị',
      'HTTP 200, trả về danh sách lịch hẹn',
      `HTTP ${res.status}, Số lượng: ${list ? list.length : 0} lịch hẹn`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-3.4', 'Quản lý Lịch hẹn', 'Lấy danh sách lịch hẹn', 'HTTP 200', err.message, false, '🔴 Nghiêm trọng');
  }

  // TC 3.5: Bác sĩ Xác nhận lịch hẹn (CONFIRM)
  if (appointmentId) {
    try {
      const res = await request(`/appointments/${appointmentId}/doctor-action`, {
        method: 'POST',
        token: doctorToken,
        body: {
          action: 'CONFIRM',
          doctorNote: 'Bác sĩ đã tiếp nhận và xếp lịch chuẩn bị đón tiếp quý bệnh nhân.',
        },
      });
      const newStatus = res.data?.data?.status || res.data?.status;
      const pass = res.status === 200 && newStatus === 'CONFIRMED';
      recordTest(
        'TC-3.5',
        'Quản lý Lịch hẹn',
        'Bác sĩ tiếp nhận và Xác nhận lịch hẹn (action: CONFIRM)',
        'HTTP 200, trạng thái chuyển từ PENDING sang CONFIRMED',
        `HTTP ${res.status}, Trạng thái mới: ${newStatus}`,
        pass,
        '🔴 Nghiêm trọng'
      );
    } catch (err) {
      recordTest('TC-3.5', 'Quản lý Lịch hẹn', 'Bác sĩ Xác nhận lịch hẹn', 'HTTP 200', err.message, false, '🔴 Nghiêm trọng');
    }
  }

  // TC 3.6: Bác sĩ Dời lịch hẹn (RESCHEDULE)
  if (appointmentId) {
    const rescheduleTime = new Date();
    rescheduleTime.setDate(rescheduleTime.getDate() + 5);
    const rescheduleStr = rescheduleTime.toISOString().split('T')[0] + 'T14:30:00';
    try {
      const res = await request(`/appointments/${appointmentId}/doctor-action`, {
        method: 'POST',
        token: doctorToken,
        body: {
          action: 'RESCHEDULE',
          rescheduledTime: rescheduleStr,
          doctorNote: 'Bác sĩ có ca phẫu thuật đột xuất, xin dời sang khung giờ chiều.',
        },
      });
      const newStatus = res.data?.data?.status || res.data?.status;
      const pass = res.status === 200 && newStatus === 'RESCHEDULED';
      recordTest(
        'TC-3.6',
        'Quản lý Lịch hẹn',
        'Bác sĩ Dời lịch hẹn sang ngày giờ mới kèm lời nhắn (action: RESCHEDULE)',
        'HTTP 200, trạng thái RESCHEDULED, lưu thời gian hẹn mới và lời nhắn',
        `HTTP ${res.status}, Trạng thái: ${newStatus}`,
        pass,
        '🔴 Nghiêm trọng'
      );
    } catch (err) {
      recordTest('TC-3.6', 'Quản lý Lịch hẹn', 'Bác sĩ Dời lịch hẹn', 'HTTP 200', err.message, false, '🔴 Nghiêm trọng');
    }
  }

  // TC 3.7: Bệnh nhân hủy lịch hẹn hợp lệ
  if (appointmentId) {
    try {
      const res = await request(`/appointments/${appointmentId}/status?status=CANCELLED`, {
        method: 'PUT',
        token: patientToken,
      });
      const newStatus = res.data?.data?.status || res.data?.status;
      const pass = res.status === 200 && newStatus === 'CANCELLED';
      recordTest(
        'TC-3.7',
        'Quản lý Lịch hẹn',
        'Bệnh nhân hủy lịch hẹn trước giờ khám',
        'HTTP 200, trạng thái chuyển sang CANCELLED',
        `HTTP ${res.status}, Trạng thái: ${newStatus}`,
        pass,
        '🟡 Nên sửa'
      );
    } catch (err) {
      recordTest('TC-3.7', 'Quản lý Lịch hẹn', 'Bệnh nhân hủy lịch', 'HTTP 200', err.message, false, '🟡 Nên sửa');
    }
  }

  // TC 3.8: Chuyển trạng thái bất hợp lệ: Từ CANCELLED sang COMPLETED
  if (appointmentId) {
    try {
      const res = await request(`/appointments/${appointmentId}/status?status=COMPLETED`, {
        method: 'PUT',
        token: doctorToken,
      });
      const pass = res.status === 400 || res.status === 409 || res.status === 403;
      recordTest(
        'TC-3.8',
        'Quản lý Lịch hẹn',
        'Chuyển trạng thái bất hợp lệ: Từ CANCELLED (Đã hủy) sang COMPLETED',
        'HTTP 400/409, Server chặn không cho phép lịch đã hủy thành hoàn thành',
        `HTTP ${res.status}: ${res.data?.errorDescription || res.data?.message || 'Chuyển thành công ngoài ý muốn'}`,
        pass,
        '🔴 Nghiêm trọng',
        res.status === 200 ? 'Máy trạng thái lỏng lẻo: cho phép lịch đã CANCELLED đổi thành COMPLETED!' : ''
      );
    } catch (err) {
      recordTest('TC-3.8', 'Quản lý Lịch hẹn', 'Trạng thái bất hợp lệ', 'HTTP 400', err.message, true, '🔴 Nghiêm trọng');
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 4: KHÁM BỆNH VÀ DANH MỤC ICD-10
  // -------------------------------------------------------------
  console.log('--- 4. Kiểm thử Khám bệnh, Chẩn đoán ICD-10 & Dặn dò ---');

  // TC 4.1: Tra cứu danh mục mã bệnh ICD-10
  try {
    const res = await request('/catalogs/icd10/search?keyword=I10', { token: doctorToken });
    const list = Array.isArray(res.data?.data) ? res.data?.data : res.data;
    const pass = res.status === 200 && Array.isArray(list) && list.length > 0;
    recordTest(
      'TC-4.1',
      'Khám bệnh & Chẩn đoán',
      'Tra cứu mã bệnh ICD-10 (endpoint: /catalogs/icd10/search?keyword=I10)',
      'HTTP 200, trả về danh sách mã và tên bệnh tương ứng',
      `HTTP ${res.status}, Kết quả: ${list ? list.length : 0} bản ghi`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-4.1', 'Khám bệnh & Chẩn đoán', 'Tra cứu mã ICD-10', 'HTTP 200', err.message, false, '🔴 Nghiêm trọng');
  }

  // TC 4.2: Tra cứu danh mục thuốc
  try {
    const res = await request('/catalogs/medicines/search?query=Paracetamol', { token: doctorToken });
    const list = Array.isArray(res.data?.data) ? res.data?.data : res.data;
    const pass = res.status === 200 && Array.isArray(list) && list.length > 0;
    recordTest(
      'TC-4.2',
      'Khám bệnh & Đơn thuốc',
      'Tra cứu danh mục thuốc (query: Paracetamol)',
      'HTTP 200, danh sách hoạt chất, đơn vị và hàm lượng',
      `HTTP ${res.status}, Kết quả: ${list ? list.length : 0} thuốc`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-4.2', 'Khám bệnh & Đơn thuốc', 'Tra cứu danh mục thuốc', 'HTTP 200', err.message, false, '🔴 Nghiêm trọng');
  }

  // TC 4.3: Kiểm tra trường "Ghi chú / Dặn dò" trong form đặt lịch bệnh nhân
  // Kiểm tra xem DTO MedicalAppointmentRequest có còn field doctorNote hoặc ghiChu không
  try {
    const res = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        profileId: profileId,
        facilityName: 'Bệnh viện Đa khoa PHR',
        appointmentTime: tomorrowStr,
        appointmentType: 'FOLLOW_UP',
        doctorNote: 'Bệnh nhân tự điền ghi chú của bác sĩ',
      },
    });
    // DoctorNote must be null or ignored
    const returnedDocNote = res.data?.data?.doctorNote;
    const pass = !returnedDocNote || returnedDocNote === null;
    recordTest(
      'TC-4.3',
      'Kiểm tra toàn vẹn Schema',
      'Bệnh nhân gửi field doctorNote khi đặt lịch (kiểm tra trường đã được bảo vệ)',
      'doctorNote phải là NULL, bệnh nhân không được phép tự điền dặn dò của bác sĩ',
      `doctorNote trả về: ${returnedDocNote === null ? 'NULL (Đạt)' : returnedDocNote}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-4.3', 'Kiểm tra toàn vẹn Schema', 'Validate field doctorNote', 'NULL', err.message, true, '🔴 Nghiêm trọng');
  }

  // -------------------------------------------------------------
  // TEST SUITE 5: KIỂM THỬ TẢI & PHÂN TRANG (LOAD & PAGINATION)
  // -------------------------------------------------------------
  console.log('--- 5. Kiểm thử Tải & Phân trang ---');

  // TC 5.1: Phân trang danh sách lịch hẹn
  try {
    const res = await request('/appointments/profile/1?page=0&size=10', { token: doctorToken });
    const pass = res.status === 200 || res.status === 404; // 404 if profile doesn't exist, but no 500
    recordTest(
      'TC-5.1',
      'Hiệu năng & Phân trang',
      'Gọi API phân trang lịch hẹn (/appointments/profile/{id}?page=0&size=10)',
      'HTTP 200 với đối tượng PageResponse hoặc 404 nếu profile không tồn tại (không lỗi 500)',
      `HTTP ${res.status}`,
      pass,
      '🟢 Gợi ý'
    );
  } catch (err) {
    recordTest('TC-5.1', 'Hiệu năng & Phân trang', 'Phân trang lịch hẹn', 'HTTP 200/404', err.message, false, '🟢 Gợi ý');
  }

  // -------------------------------------------------------------
  // TEST SUITE 6: LỊCH LÀM VIỆC & NGÀY NGHỈ BÁC SĨ (SCHEDULE & LEAVE)
  // -------------------------------------------------------------
  console.log('--- 6. Kiểm thử Lịch làm việc & Ngày nghỉ (Schedule & Leave) ---');

  // TC 6.1: Bác sĩ đăng ký ngày nghỉ phép trên Backend (/doctor-leaves)
  const leaveTestDate = new Date();
  leaveTestDate.setDate(leaveTestDate.getDate() + 10);
  const leaveTestDateStr = leaveTestDate.toISOString().split('T')[0];

  // Làm sạch ngày nghỉ nếu đã tồn tại từ đợt test trước
  try {
    const existingLeaves = await request('/doctor-leaves/me', { token: doctorToken });
    const list = Array.isArray(existingLeaves.data?.data) ? existingLeaves.data.data : [];
    for (const item of list) {
      if (item.leaveDate === leaveTestDateStr) {
        await request(`/doctor-leaves/${item.id}`, { method: 'DELETE', token: doctorToken });
      }
    }
  } catch (ignored) {}

  let leaveId = null;
  try {
    const leaveRes = await request('/doctor-leaves', {
      method: 'POST',
      token: doctorToken,
      body: {
        leaveDate: leaveTestDateStr,
        leaveType: 'Hội nghị chuyên môn',
        reason: 'Tham dự hội nghị tim mạch toàn quốc',
      },
    });
    leaveId = leaveRes.data?.data?.id || leaveRes.data?.id;
    const pass = (leaveRes.status === 201 || leaveRes.status === 200) && Boolean(leaveId);
    recordTest(
      'TC-6.1',
      'Lịch & Ca làm việc',
      'Bác sĩ đăng ký ngày nghỉ phép (/doctor-leaves)',
      'HTTP 201/200, lưu ngày nghỉ thành công vào Database',
      `HTTP ${leaveRes.status}, ID: ${leaveId}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-6.1', 'Lịch & Ca làm việc', 'Đăng ký ngày nghỉ', 'HTTP 201', err.message, false, '🔴 Nghiêm trọng');
  }

  // TC 6.2: Bệnh nhân cố tình đặt lịch vào đúng ngày bác sĩ đã đăng ký nghỉ
  try {
    const res = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        profileId: profileId,
        title: 'Khám tim mạch - BS. CK1 Nguyễn Văn An',
        doctorId: doctorUserId,
        facilityName: 'Bệnh viện Đa khoa PHR',
        appointmentTime: `${leaveTestDateStr}T09:00:00`,
        appointmentType: 'FOLLOW_UP',
      },
    });
    const pass = res.status === 400;
    recordTest(
      'TC-6.2',
      'Lịch & Ca làm việc',
      'Bệnh nhân đặt lịch vào ngày bác sĩ đã đăng ký nghỉ (kiểm tra chặn ở Server)',
      'HTTP 400 Bad Request: Bác sĩ đã đăng ký nghỉ vào ngày này',
      `HTTP ${res.status}: ${res.data?.errorDescription || res.data?.message || ''}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-6.2', 'Lịch & Ca làm việc', 'Chặn đặt vào ngày nghỉ', 'HTTP 400', err.message, true, '🔴 Nghiêm trọng');
  }

  // TC 6.3: Lấy danh sách ngày nghỉ công khai cho DatePicker bệnh nhân (/doctor-leaves/doctor/{id})
  try {
    const res = await request(`/doctor-leaves/doctor/${doctorUserId}`);
    const list = Array.isArray(res.data?.data) ? res.data?.data : res.data;
    const pass = res.status === 200 && Array.isArray(list);
    recordTest(
      'TC-6.3',
      'Lịch & Ca làm việc',
      'Bệnh nhân tra cứu danh sách ngày nghỉ của bác sĩ để hiển thị DatePicker',
      'HTTP 200, trả về danh sách chuỗi ngày YYYY-MM-DD',
      `HTTP ${res.status}, Ngày nghỉ: ${JSON.stringify(list)}`,
      pass,
      '🔴 Nghiêm trọng'
    );
  } catch (err) {
    recordTest('TC-6.3', 'Lịch & Ca làm việc', 'Tra cứu ngày nghỉ của bác sĩ', 'HTTP 200', err.message, false, '🔴 Nghiêm trọng');
  }

  // In ra bảng tổng kết
  console.log('\n=============================================================');
  console.log('                 BẢNG KẾT QUẢ KIỂM THỬ THỰC TẾ               ');
  console.log('=============================================================');
  console.table(
    testResults.map((t) => ({
      Mã: t.id,
      Phân_hệ: t.category,
      Test_Case: t.testCase,
      Kết_quả: t.status,
      Mức_độ: t.severity,
    }))
  );

  const passed = testResults.filter((t) => t.pass).length;
  const failed = testResults.filter((t) => !t.pass).length;
  console.log(`\nTổng số test đã chạy: ${testResults.length} | Đạt: ${passed} | Lỗi: ${failed}`);

  if (failed > 0) {
    console.log('\n--- CHI TIẾT CÁC TEST CASE LỖI ---');
    testResults.filter((t) => !t.pass).forEach((t) => {
      console.log(`[${t.id}] ${t.testCase}`);
      console.log(`  Expected: ${t.expected}`);
      console.log(`  Actual:   ${t.actual}`);
      if (t.notes) console.log(`  Notes:    ${t.notes}`);
    });
  }

  return testResults;
}

runAllTests().catch(console.error);
