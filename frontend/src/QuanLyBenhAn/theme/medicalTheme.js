// Ant Design Custom Medical Theme Token
export const medicalTheme = {
  token: {
    colorPrimary: '#0284c7', // Medical Cyan/Teal
    colorSuccess: '#10b981', // Normal / Optimal / Success
    colorWarning: '#f59e0b', // Elevated / Warning
    colorError: '#ef4444',   // Critical / Severe Allergy / Danger
    colorInfo: '#0284c7',

    colorBgBase: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorTextBase: '#0f172a',
    colorTextSecondary: '#475569',
    colorBorder: '#e2e8f0',

    fontFamily: "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 15,
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    wireframe: false,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
  },
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 46,
      borderRadius: 8,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 12,
      headerHeight: 52,
    },
    Table: {
      borderRadius: 8,
      headerBg: '#f1f5f9',
      headerColor: '#1e293b',
      rowHoverBg: '#f8fafc',
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Select: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Menu: {
      itemBorderRadius: 8,
      itemHoverBg: '#e0f2fe',
      itemSelectedBg: '#e0f2fe',
      itemSelectedColor: '#0284c7',
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
};
