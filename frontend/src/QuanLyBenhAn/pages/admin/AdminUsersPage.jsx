import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Popconfirm,
  Input,
  message,
  Typography,
  Row,
  Col,
  Alert,
  Modal,
  Select,
  Form,
  Divider,
} from 'antd';
import {
  TeamOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
  MedicineBoxOutlined,
  CrownOutlined,
  UserOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Danh mục các chuyên khoa y tế chuẩn
const STANDARD_DEPARTMENTS = [
  'Khoa Tim Mạch & Lão Khoa',
  'Khoa Nhi & Dị Ứng Miễn Dịch',
  'Khoa Ngoại Chấn Thương Chỉnh Hình',
  'Khoa Mắt & Tai Mũi Họng',
  'Khoa Thần Kinh & Hồi Sức Cấp Cứu',
  'Khoa Sản Phụ Khoa',
  'Khoa Nội Tổng Hợp',
  'Khoa Ngoại Tiêu Hóa',
  'Khoa Hồi Sức Tích Cực (ICU)',
  'Khoa Ung Bướu & Y Học Hạt Nhân',
  'Khoa Răng Hàm Mặt',
  'Khoa Chẩn Đoán Hình Ảnh',
  'Khoa Khám Bệnh Đa Khoa',
];

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State Modal cấp/đổi khoa Bác sĩ
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const [selectedUserForDoctor, setSelectedUserForDoctor] = useState(null);
  const [modalForm] = Form.useForm();
  const [submittingDoctor, setSubmittingDoctor] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setUsers(list);
    } catch (err) {
      message.error(err.message || 'Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Cấp quyền Admin hoặc hạ về User
  const handleUpdateRole = async (userId, targetRole, userFullName, department = null) => {
    try {
      await adminService.updateUserRole(userId, targetRole, department);
      message.success(`Đã cập nhật quyền ${targetRole} cho ${userFullName}!`);
      loadUsers();
    } catch (err) {
      message.error(err.message || 'Lỗi khi cập nhật quyền');
    }
  };

  // Mở modal cấp quyền Bác sĩ và gán Khoa
  const handleOpenDoctorModal = (targetUser) => {
    setSelectedUserForDoctor(targetUser);
    modalForm.setFieldsValue({
      department: targetUser.department || 'Khoa Tim Mạch & Lão Khoa',
    });
    setDoctorModalVisible(true);
  };

  // Submit Modal cấp quyền Bác sĩ + Khoa
  const handleSubmitDoctorModal = async () => {
    try {
      const values = await modalForm.validateFields();
      setSubmittingDoctor(true);
      await adminService.updateUserRole(
        selectedUserForDoctor.id,
        'ROLE_DOCTOR',
        values.department.trim()
      );
      message.success(
        `Đã phân bổ Bác sĩ thành công cho ${selectedUserForDoctor.fullName} tại ${values.department}!`
      );
      setDoctorModalVisible(false);
      loadUsers();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.message || 'Lỗi khi cấp quyền Bác sĩ');
    } finally {
      setSubmittingDoctor(false);
    }
  };

  const handleToggleLock = async (userId, isLocked, userFullName) => {
    try {
      await adminService.toggleLock(userId);
      message.success(`Đã ${isLocked ? 'mở khóa' : 'khóa'} tài khoản ${userFullName}!`);
      loadUsers();
    } catch (err) {
      message.error(err.message || 'Lỗi khi thay đổi trạng thái khóa tài khoản');
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter((u) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = u.fullName?.toLowerCase().includes(term);
    const emailMatch = u.email?.toLowerCase().includes(term);
    const phoneMatch = u.phone?.toLowerCase().includes(term);
    const deptMatch = u.department?.toLowerCase().includes(term);
    return nameMatch || emailMatch || phoneMatch || deptMatch;
  });

  const getRoleTag = (roles = []) => {
    if (roles.includes('ROLE_ADMIN')) {
      return (
        <Tag color="purple" icon={<CrownOutlined />} style={{ fontSize: 13, padding: '4px 8px' }}>
          Quản Trị Viên (ADMIN)
        </Tag>
      );
    }
    if (roles.includes('ROLE_DOCTOR')) {
      return (
        <Tag color="cyan" icon={<MedicineBoxOutlined />} style={{ fontSize: 13, padding: '4px 8px' }}>
          Bác Sĩ (DOCTOR)
        </Tag>
      );
    }
    return (
      <Tag color="blue" icon={<UserOutlined />} style={{ fontSize: 13, padding: '4px 8px' }}>
        Người Dùng (USER)
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name, r) => (
        <div>
          <strong style={{ fontSize: 14 }}>{name}</strong>
          {r.id === currentUser?.id && (
            <Tag color="gold" style={{ marginLeft: 8 }}>
              Bạn
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Email đăng nhập',
      dataIndex: 'email',
      key: 'email',
      render: (email) => <code>{email}</code>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (p) => p || <Text type="secondary">—</Text>,
    },
    {
      title: 'Vai trò hiện tại',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => getRoleTag(roles),
    },
    {
      title: 'Khoa / Chuyên môn',
      dataIndex: 'department',
      key: 'department',
      render: (dept, r) => {
        const isDoctor = r.roles?.includes('ROLE_DOCTOR');
        if (isDoctor) {
          return dept ? (
            <Tag color="geekblue" icon={<MedicineBoxOutlined />} style={{ fontWeight: 600, padding: '3px 8px' }}>
              {dept}
            </Tag>
          ) : (
            <Tag color="warning">Chưa phân bổ khoa</Tag>
          );
        }
        return <Text type="secondary">—</Text>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, r) => (
        r.accountLocked ? (
          <Tag color="error" icon={<LockOutlined />}>Đã khóa</Tag>
        ) : (
          <Tag color="success" icon={<UnlockOutlined />}>Hoạt động</Tag>
        )
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '—'),
    },
    {
      title: 'Cấp quyền & Thao tác',
      key: 'actions',
      render: (_, r) => {
        const isSelf = r.id === currentUser?.id;
        const isDoctor = r.roles?.includes('ROLE_DOCTOR');
        const isAdmin = r.roles?.includes('ROLE_ADMIN');

        return (
          <Space wrap size={6}>
            {/* Cấp quyền Bác sĩ kèm chọn Khoa */}
            {!isDoctor && !isSelf && (
              <Button
                size="small"
                type="primary"
                ghost
                icon={<MedicineBoxOutlined />}
                onClick={() => handleOpenDoctorModal(r)}
              >
                Cấp Bác Sĩ & Khoa
              </Button>
            )}

            {/* Đổi Khoa cho Bác sĩ hiện tại */}
            {isDoctor && (
              <Button
                size="small"
                icon={<EditOutlined />}
                style={{ borderColor: '#0284c7', color: '#0284c7' }}
                onClick={() => handleOpenDoctorModal(r)}
              >
                Đổi Khoa
              </Button>
            )}

            {/* Cấp quyền Quản trị viên */}
            {!isAdmin && !isSelf && (
              <Popconfirm
                title={`Xác nhận cấp quyền Quản trị viên (Admin) cho ${r.fullName}?`}
                description="Tài khoản này sẽ có toàn quyền cấu hình danh mục và quản lý người dùng."
                onConfirm={() => handleUpdateRole(r.id, 'ROLE_ADMIN', r.fullName)}
                okText="Cấp Admin"
                cancelText="Hủy"
              >
                <Button size="small" style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>
                  Cấp Admin
                </Button>
              </Popconfirm>
            )}

            {/* Hạ quyền về Người dùng bình thường */}
            {(isDoctor || (isAdmin && !isSelf)) && (
              <Popconfirm
                title={`Thu hồi quyền và đưa ${r.fullName} về Người Dùng bình thường?`}
                description="Tài khoản sẽ bị hủy quyền Bác sĩ/Admin và xóa phân bổ khoa chuyên môn."
                onConfirm={() => handleUpdateRole(r.id, 'ROLE_USER', r.fullName, null)}
                okText="Hạ quyền"
                cancelText="Hủy"
              >
                <Button size="small">
                  Hạ về User
                </Button>
              </Popconfirm>
            )}

            {/* Khóa / Mở khóa */}
            {!isSelf && (
              <Popconfirm
                title={`Bạn có chắc muốn ${r.accountLocked ? 'mở khóa' : 'khóa'} tài khoản này?`}
                onConfirm={() => handleToggleLock(r.id, r.accountLocked, r.fullName)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button size="small" danger={!r.accountLocked}>
                  {r.accountLocked ? 'Mở khóa' : 'Khóa'}
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Quản Lý Người Dùng & Phân Quyền
          </Title>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={loadUsers} loading={loading}>
            Làm Mới
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 10 }}>
        {/* Bộ lọc tìm kiếm */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={14} md={10}>
            <Input
              placeholder="Tìm theo họ tên, email, số điện thoại hoặc khoa..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col>
            <Text type="secondary">
              Tổng số tài khoản: <strong>{filteredUsers.length}</strong>
            </Text>
          </Col>
        </Row>

        <div className="table-responsive-container">
          <Table
            columns={columns}
            dataSource={Array.isArray(filteredUsers) ? filteredUsers : []}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Không tìm thấy tài khoản nào phù hợp' }}
          />
        </div>
      </Card>

      {/* Modal Cấp quyền Bác sĩ & Bổ nhiệm Khoa */}
      <Modal
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#0284c7', fontSize: 20 }} />
            <span>
              {selectedUserForDoctor?.roles?.includes('ROLE_DOCTOR')
                ? 'Điều Chuyển Khoa Công Tác Cho Bác Sĩ'
                : 'Cấp Quyền Bác Sĩ & Bổ Nhiệm Khoa Chuyên Môn'}
            </span>
          </Space>
        }
        open={doctorModalVisible}
        onOk={handleSubmitDoctorModal}
        onCancel={() => setDoctorModalVisible(false)}
        okText={
          selectedUserForDoctor?.roles?.includes('ROLE_DOCTOR')
            ? 'Cập Nhật Khoa'
            : 'Xác Nhận Cấp Bác Sĩ'
        }
        cancelText="Hủy Bỏ"
        confirmLoading={submittingDoctor}
        destroyOnClose
      >
        <Divider style={{ margin: '12px 0 20px' }} />

        {selectedUserForDoctor && (
          <div style={{ marginBottom: 20, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 6px' }}>
              <strong>Họ và tên:</strong> {selectedUserForDoctor.fullName}
            </p>
            <p style={{ margin: '0 0 6px' }}>
              <strong>Email:</strong> <code>{selectedUserForDoctor.email}</code>
            </p>
            {selectedUserForDoctor.department && (
              <p style={{ margin: 0 }}>
                <strong>Khoa hiện tại:</strong>{' '}
                <Tag color="cyan">{selectedUserForDoctor.department}</Tag>
              </p>
            )}
          </div>
        )}

        <Form form={modalForm} layout="vertical">
          <Form.Item
            name="department"
            label={<strong style={{ fontSize: 14 }}>Chọn Khoa / Chuyên Khoa Công Tác</strong>}
            rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập khoa chuyên môn!' }]}
            extra="Bạn có thể chọn từ danh sách có sẵn hoặc gõ trực tiếp tên chuyên khoa mới."
          >
            <Select
              showSearch
              placeholder="Chọn hoặc nhập tên khoa..."
              size="large"
              dropdownMatchSelectWidth={false}
            >
              {STANDARD_DEPARTMENTS.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
