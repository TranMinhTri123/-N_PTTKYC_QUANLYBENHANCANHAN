// Định nghĩa Design Tokens chuẩn Y Tế cho 3 Phân Hệ (Patient, Doctor, Admin)
export const themeTokens = {
  // 1. Phân hệ Bệnh Nhân & Gia Đình (Patient Portal) - Medical Cyan thân thiện, dịu mắt
  patient: {
    token: {
      colorPrimary: '#0284c7', // Sky blue / Medical Cyan
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: '#0ea5e9',
      colorBgBase: '#ffffff',
      colorBgLayout: '#f8fafc',
      borderRadius: 10,
      fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
      fontSize: 14,
    },
    components: {
      Layout: {
        headerBg: '#ffffff',
        headerHeight: 64,
        siderBg: '#ffffff',
      },
      Button: {
        controlHeight: 38,
        borderRadius: 8,
      },
      Card: {
        borderRadiusLG: 12,
      },
    },
  },

  // 2. Phân hệ Bác Sĩ Điều Trị (Doctor Portal) - Medical Teal chuyên môn, nghiêm túc
  doctor: {
    token: {
      colorPrimary: '#0f766e', // Deep Teal / Clinical Medical
      colorSuccess: '#059669',
      colorWarning: '#d97706',
      colorError: '#dc2626',
      colorInfo: '#0284c7',
      colorBgBase: '#ffffff',
      colorBgLayout: '#f0fdfa',
      borderRadius: 8,
      fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
      fontSize: 14,
    },
    components: {
      Layout: {
        headerBg: '#0f766e',
        headerHeight: 64,
        siderBg: '#ffffff',
      },
      Button: {
        controlHeight: 38,
        borderRadius: 6,
      },
      Card: {
        borderRadiusLG: 10,
      },
    },
  },

  // 3. Phân hệ Quản Trị Viên (Admin Portal) - Slate Dark công nghệ cao, an ninh
  admin: {
    token: {
      colorPrimary: '#1e293b', // Deep Slate
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: '#3b82f6',
      colorBgBase: '#ffffff',
      colorBgLayout: '#f1f5f9',
      borderRadius: 8,
      fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
      fontSize: 14,
    },
    components: {
      Layout: {
        headerBg: '#1e293b',
        headerHeight: 64,
        siderBg: '#0f172a',
      },
      Button: {
        controlHeight: 38,
        borderRadius: 6,
      },
      Card: {
        borderRadiusLG: 10,
      },
    },
  },

  // 4. Giao diện Chung / Auth (Đăng nhập, Đăng ký, Quên mật khẩu)
  shared: {
    token: {
      colorPrimary: '#0284c7',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorBgLayout: '#f8fafc',
      borderRadius: 10,
      fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    },
  },
};
