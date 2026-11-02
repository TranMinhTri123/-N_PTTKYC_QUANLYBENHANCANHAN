import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  notification,
  Avatar,
  Divider,
  Descriptions,
  Empty,
  Popconfirm,
  Alert,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HeartOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import profileService from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const PatientProfilesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [form] = Form.useForm();

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfiles();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setProfiles(list);
    } catch (err) {
      notification.error({
        message: 'Lỗi tải danh sách hồ sơ',
        description: err.message || 'Không thể kết nối đến máy chủ.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // Phân loại hồ sơ chính chủ (SELF) và người thân (FAMILY)
  const selfProfile = useMemo(() => {
    return profiles.find((p) => p.relationship === 'SELF') || null;
  }, [profiles]);

  const familyProfiles = useMemo(() => {
    return profiles.filter((p) => p.relationship !== 'SELF');
  }, [profiles]);

  // Mở modal tạo hồ sơ chính chủ (tự động điền dữ liệu tài khoản nếu có)
  const handleOpenCreateSelf = () => {
    setEditingProfile(null);
    form.resetFields();
    form.setFieldsValue({
      relationship: 'SELF',
      fullName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
      phone: user?.phone || user?.phoneNumber || '',
      gender: user?.gender || 'MALE',
      dateOfBirth: user?.dateOfBirth ? dayjs(user?.dateOfBirth) : null,
      ethnicity: 'Kinh',
      nationality: 'Việt Nam',
    });
    setModalOpen(true);
  };

  // Mở modal tạo hồ sơ người thân
  const handleOpenCreateFamily = () => {
    setEditingProfile(null);
    form.resetFields();
    form.setFieldsValue({
      relationship: 'CHILD',
      gender: 'MALE',
      ethnicity: 'Kinh',
      nationality: 'Việt Nam',
    });
    setModalOpen(true);
  };

  // Mở modal sửa hồ sơ
  const handleOpenEdit = (prof) => {
    setEditingProfile(prof);
    form.setFieldsValue({
      relationship: prof.relationship || 'SELF',
      fullName: prof.fullName,
      gender: prof.gender || 'MALE',
      dateOfBirth: prof.dateOfBirth ? dayjs(prof.dateOfBirth) : null,
      bloodType: prof.bloodType || undefined,
      cccd: prof.cccd || prof.identityCardNumber || '',
      bhytNumber: prof.bhytNumber || prof.healthInsuranceNumber || '',
      phone: prof.phone || prof.phoneNumber || user?.phone || '',
      addressDetail: prof.addressDetail || prof.address || '',
      emergencyContactName: prof.emergencyContactName || '',
      emergencyContactPhone: prof.emergencyContactPhone || '',
    });
    setModalOpen(true);
  };

  // Lưu hồ sơ
  const handleSubmitProfile = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        fullName: values.fullName?.trim(),
        relationship: values.relationship,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        bloodType: values.bloodType || null,
        cccd: values.cccd?.trim() || null,
        bhytNumber: values.bhytNumber?.trim() || null,
        phone: values.phone?.trim() || null,
        phoneNumber: values.phone?.trim() || null,
        addressDetail: values.addressDetail?.trim() || null,
        address: values.addressDetail?.trim() || null,
        emergencyContactName: values.emergencyContactName?.trim() || null,
        emergencyContactPhone: values.emergencyContactPhone?.trim() || null,
      };

      if (editingProfile) {
        await profileService.updateProfile(editingProfile.id, payload);
        notification.success({ message: 'Cập nhật hồ sơ cá nhân thành công!' });
      } else {
        await profileService.createProfile(payload);
        notification.success({ message: 'Lưu hồ sơ cá nhân thành công!' });
      }
      setModalOpen(false);
      loadProfiles();
    } catch (err) {
      notification.error({
        message: 'Lưu hồ sơ thất bại',
        description: err.message || 'Vui lòng kiểm tra lại thông tin nhập.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa hồ sơ người thân
  const handleDeleteProfile = async (id) => {
    try {
      await profileService.deleteProfile(id);
      notification.success({ message: 'Đã xóa hồ sơ người thân!' });
      loadProfiles();
    } catch (err) {
      notification.error({
        message: 'Xóa thất bại',
        description: err.message || 'Không thể xóa hồ sơ.',
      });
    }
  };

  // Format nhãn quan hệ
  const getRelationshipLabel = (rel) => {
    switch (rel) {
      case 'SELF':
        return 'Chính chủ (Bản thân)';
      case 'PARENT':
        return 'Bố / Mẹ';
      case 'SPOUSE':
        return 'Vợ / Chồng';
      case 'CHILD':
        return 'Con cái';
      default:
        return 'Người thân khác';
    }
  };

  // Tính tuổi
  const calculateAge = (dob) => {
    if (!dob) return null;
    return dayjs().diff(dayjs(dob), 'year');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* HEADER TRANG */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            Hồ Sơ Cá Nhân
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản lý thông tin định danh y tế, thẻ BHYT, địa chỉ liên lạc và người liên hệ khẩn cấp dùng để tiếp nhận khám bệnh.
          </Text>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={selfProfile ? handleOpenCreateFamily : handleOpenCreateSelf}
            style={{ borderRadius: 8, height: 40, fontWeight: 600, background: '#0284c7' }}
          >
            {selfProfile ? '+ Thêm Hồ Sơ Người Thân' : '+ Tạo Hồ Sơ Cá Nhân'}
          </Button>
        </Space>
      </div>

      {/* THÔNG BÁO HƯỚNG DẪN NẾU CHƯA CÓ HỒ SƠ */}
      {!selfProfile && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
          message="Bạn chưa hoàn thiện Hồ Sơ Cá Nhân"
          description={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span>
                Vui lòng cập nhật đầy đủ thông tin cá nhân (Họ tên, Ngày sinh, CCCD, Địa chỉ, SĐT khẩn cấp) để sẵn sàng <strong>Đặt Lịch Khám Trực Tuyến</strong> tại Bệnh viện Đa khoa PHR.
              </span>
              <Button type="primary" size="small" onClick={handleOpenCreateSelf} style={{ background: '#0284c7' }}>
                Khai báo thông tin ngay
              </Button>
            </div>
          }
        />
      )}

      {/* 1. HỒ SƠ CHÍNH CHỦ (BẢN THÂN) */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: '#0284c7', fontSize: 18 }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>1. Thông Tin Bản Thân (Chính Chủ)</span>
            <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 600 }}>CHÍNH CHỦ</Tag>
          </Space>
        }
        extra={
          selfProfile ? (
            <Space>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleOpenEdit(selfProfile)}
                style={{ fontWeight: 600 }}
              >
                Chỉnh sửa
              </Button>
              <Button
                type="primary"
                ghost
                icon={<CalendarOutlined />}
                onClick={() => navigate('/patient/appointments')}
                style={{ borderRadius: 6, fontWeight: 600 }}
              >
                Đặt Lịch Khám
              </Button>
            </Space>
          ) : null
        }
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderTop: '4px solid #0284c7',
          marginBottom: 28,
        }}
      >
        {selfProfile ? (
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={6} style={{ textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
              <Avatar
                size={84}
                style={{
                  backgroundColor: selfProfile.gender === 'FEMALE' ? '#ec4899' : '#0284c7',
                  fontSize: 32,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {selfProfile.fullName?.charAt(0) || 'P'}
              </Avatar>
              <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                {selfProfile.fullName}
              </Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                {getRelationshipLabel(selfProfile.relationship)}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={selfProfile.gender === 'FEMALE' ? 'magenta' : 'blue'}>
                  {selfProfile.gender === 'FEMALE' ? 'Nữ' : (selfProfile.gender === 'MALE' ? 'Nam' : 'Khác')}
                </Tag>
                {selfProfile.bloodType && (
                  <Tag color="red" icon={<HeartOutlined />}>
                    Nhóm máu: {selfProfile.bloodType.replace('_', ' ')}
                  </Tag>
                )}
              </div>
            </Col>

            <Col xs={24} md={18}>
              <Row gutter={[12, 12]}>
                {/* 1. THÔNG TIN ĐỊNH DANH */}
                <Col xs={24} sm={12} lg={8}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 76 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
                      <CalendarOutlined style={{ marginRight: 6, color: '#0284c7' }} />
                      Ngày sinh & Tuổi
                    </Text>
                    <Text strong style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                      {selfProfile.dateOfBirth ? `${formatDate(selfProfile.dateOfBirth)} (${calculateAge(selfProfile.dateOfBirth)} tuổi)` : 'Chưa cập nhật'}
                    </Text>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 76 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
                      <IdcardOutlined style={{ marginRight: 6, color: '#0284c7' }} />
                      Số CCCD / Định danh
                    </Text>
                    <Text strong style={{ fontSize: 14, color: '#0369a1', whiteSpace: 'nowrap' }}>
                      {selfProfile.cccd || 'Chưa cập nhật'}
                    </Text>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 76 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
                      <SafetyCertificateOutlined style={{ marginRight: 6, color: '#16a34a' }} />
                      Mã thẻ BHYT
                    </Text>
                    {selfProfile.bhytNumber ? (
                      <Tag color="green" style={{ fontSize: 13, fontWeight: 600 }}>{selfProfile.bhytNumber}</Tag>
                    ) : (
                      <Text type="secondary">Chưa có</Text>
                    )}
                  </div>
                </Col>

                {/* 2. THÔNG TIN LIÊN LẠC */}
                <Col xs={24} sm={12} lg={8}>
                  <div style={{ background: '#f0f9ff', padding: '12px 16px', borderRadius: 8, border: '1px solid #bae6fd', minHeight: 76 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2, color: '#0369a1' }}>
                      <PhoneOutlined style={{ marginRight: 6, color: '#0284c7' }} />
                      Số điện thoại cá nhân
                    </Text>
                    <Text strong style={{ fontSize: 15, color: '#0284c7', whiteSpace: 'nowrap' }}>
                      {selfProfile.phone || selfProfile.phoneNumber || user?.phone || 'Chưa cập nhật'}
                    </Text>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={16}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 76 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
                      <HomeOutlined style={{ marginRight: 6, color: '#64748b' }} />
                      Địa chỉ thường trú
                    </Text>
                    <Text strong style={{ fontSize: 14 }}>
                      {selfProfile.addressDetail || 'Chưa cập nhật'}
                    </Text>
                  </div>
                </Col>

                {/* 3. LIÊN HỆ KHẨN CẤP */}
                <Col xs={24} sm={12} lg={12}>
                  <div style={{ background: '#fffbeb', padding: '12px 16px', borderRadius: 8, border: '1px solid #fef3c7', minHeight: 76 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2, color: '#b45309' }}>
                      <AlertOutlined style={{ marginRight: 6, color: '#d97706' }} />
                      Người liên hệ khẩn cấp
                    </Text>
                    <Text strong style={{ fontSize: 14, color: '#92400e' }}>
                      {selfProfile.emergencyContactName || 'Chưa cập nhật'}
                    </Text>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={12}>
                  <div style={{ background: '#fef2f2', padding: '12px 16px', borderRadius: 8, border: '1px solid #fecaca', minHeight: 76 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2, color: '#dc2626' }}>
                      <PhoneOutlined style={{ marginRight: 6, color: '#dc2626' }} />
                      SĐT người liên hệ khẩn cấp
                    </Text>
                    <Text strong style={{ fontSize: 15, color: '#b91c1c', whiteSpace: 'nowrap' }}>
                      {selfProfile.emergencyContactPhone || 'Chưa cập nhật'}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Paragraph style={{ margin: 0, fontWeight: 500, color: '#475569' }}>
                  Chưa có thông tin hồ sơ cho bản thân.
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Khai báo thông tin cá nhân ngay để sẵn sàng tiếp nhận và Đặt Lịch Khám Bệnh.
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateSelf}
              style={{ borderRadius: 6, fontWeight: 600, background: '#0284c7' }}
            >
              Khai Báo Hồ Sơ Cá Nhân Ngay
            </Button>
          </Empty>
        )}
      </Card>

      {/* 2. HỒ SƠ NGƯỜI THÂN TRONG GIA ĐÌNH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            <TeamOutlined style={{ marginRight: 8, color: '#10b981' }} />
            2. Hồ Sơ Người Thân (Gia Đình)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Thêm hồ sơ con cái, bố mẹ hoặc người thân để đặt lịch khám cho cả gia đình.
          </Text>
        </div>

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateFamily}
          style={{ borderRadius: 6, fontWeight: 600 }}
        >
          + Thêm Người Thân
        </Button>
      </div>

      {familyProfiles.length > 0 ? (
        <Row gutter={[16, 16]}>
          {familyProfiles.map((p) => (
            <Col xs={24} sm={12} lg={8} key={p.id}>
              <Card
                className="medical-card"
                style={{
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  borderTop: '3px solid #10b981',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                actions={[
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEdit(p)}>
                    Sửa
                  </Button>,
                  <Popconfirm
                    title="Xóa hồ sơ người thân?"
                    description="Bạn có chắc chắn muốn xóa hồ sơ này không?"
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDeleteProfile(p.id)}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Avatar
                    size={48}
                    style={{
                      backgroundColor: p.gender === 'FEMALE' ? '#f472b6' : '#38bdf8',
                      fontWeight: 700,
                    }}
                  >
                    {p.fullName?.charAt(0) || 'F'}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ margin: 0 }}>
                      {p.fullName}
                    </Title>
                    <Space size={4} style={{ marginTop: 2 }}>
                      <Tag color="green">{getRelationshipLabel(p.relationship)}</Tag>
                      <Tag color={p.gender === 'FEMALE' ? 'pink' : 'blue'}>
                        {p.gender === 'FEMALE' ? 'Nữ' : 'Nam'}
                      </Tag>
                    </Space>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, flex: 1 }}>
                  <div>
                    <strong>Ngày sinh:</strong> {p.dateOfBirth ? formatDate(p.dateOfBirth) : '-'}
                    {p.dateOfBirth && ` (${calculateAge(p.dateOfBirth)} tuổi)`}
                  </div>
                  <div><strong>Số CCCD:</strong> {p.cccd || '-'}</div>
                  <div><strong>Thẻ BHYT:</strong> {p.bhytNumber || '-'}</div>
                  <div><strong>SĐT liên hệ:</strong> {p.phone || p.phoneNumber || p.emergencyContactPhone || '-'}</div>
                  {p.emergencyContactName && (
                    <div style={{ color: '#b45309' }}>
                      <strong>Người liên hệ khẩn:</strong> {p.emergencyContactName} ({p.emergencyContactPhone || '-'})
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card style={{ borderRadius: 12, textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có hồ sơ người thân. Bấm '+ Thêm Người Thân' nếu bạn muốn đặt lịch khám hộ người nhà."
          />
        </Card>
      )}

      {/* MODAL THÊM / SỬA HỒ SƠ */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#0284c7' }} />
            <span style={{ fontWeight: 700 }}>
              {editingProfile
                ? 'Cập Nhật Hồ Sơ Cá Nhân'
                : form.getFieldValue('relationship') === 'SELF'
                  ? 'Khai Báo Hồ Sơ Cá Nhân (Chính Chủ)'
                  : 'Thêm Hồ Sơ Người Thân'}
            </span>
          </Space>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitProfile}
          style={{ marginTop: 16 }}
        >
          {/* PHẦN 1: THÔNG TIN ĐỊNH DANH */}
          <Divider orientation="left" style={{ margin: '0 0 16px 0', fontSize: 13, color: '#0284c7', fontWeight: 600 }}>
            1. THÔNG TIN ĐỊNH DANH Y TẾ
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="fullName"
                label={<span style={{ fontWeight: 600 }}>Họ và tên bệnh nhân <Text type="danger">*</Text></span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên!' },
                  { min: 2, message: 'Họ và tên tối thiểu 2 ký tự!' },
                  { whitespace: true, message: 'Họ và tên không được chỉ chứa khoảng trắng!' },
                ]}
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
                  <Option value="SELF">Bản thân (Chính chủ)</Option>
                  <Option value="CHILD">Con cái</Option>
                  <Option value="PARENT">Bố / Mẹ</Option>
                  <Option value="SPOUSE">Vợ / Chồng</Option>
                  <Option value="OTHER">Người thân khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="gender"
                label={<span style={{ fontWeight: 600 }}>Giới tính <Text type="danger">*</Text></span>}
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
              >
                <Select size="large">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="dateOfBirth"
                label={<span style={{ fontWeight: 600 }}>Ngày sinh <Text type="danger">*</Text></span>}
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
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

            <Col xs={24} sm={8}>
              <Form.Item
                name="bloodType"
                label={<span style={{ fontWeight: 600 }}>Nhóm máu</span>}
              >
                <Select size="large" placeholder="Chọn nhóm máu" allowClear>
                  <Option value="A_POSITIVE">A+</Option>
                  <Option value="A_NEGATIVE">A-</Option>
                  <Option value="B_POSITIVE">B+</Option>
                  <Option value="B_NEGATIVE">B-</Option>
                  <Option value="O_POSITIVE">O+</Option>
                  <Option value="O_NEGATIVE">O-</Option>
                  <Option value="AB_POSITIVE">AB+</Option>
                  <Option value="AB_NEGATIVE">AB-</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cccd"
                label={<span style={{ fontWeight: 600 }}>Số CCCD / Định danh (9 hoặc 12 số) <Text type="danger">*</Text></span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập số CCCD / CMND!' },
                  {
                    pattern: /^[0-9]{9}$|^[0-9]{12}$/,
                    message: 'Số CCCD phải gồm đúng 9 chữ số (CMND) hoặc 12 chữ số (CCCD gắn chip)!',
                  },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Ví dụ: 084206007888"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="bhytNumber"
                label={<span style={{ fontWeight: 600 }}>Mã số thẻ BHYT (nếu có)</span>}
              >
                <Input placeholder="Ví dụ: GD 4010123456789" size="large" />
              </Form.Item>
            </Col>
          </Row>

          {/* PHẦN 2: THÔNG TIN LIÊN LẠC & ĐỊA CHỈ */}
          <Divider orientation="left" style={{ margin: '8px 0 16px 0', fontSize: 13, color: '#0284c7', fontWeight: 600 }}>
            2. LIÊN LẠC & ĐỊA CHỈ THƯỜNG TRÚ
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label={<span style={{ fontWeight: 600 }}>Số điện thoại liên lạc cá nhân <Text type="danger">*</Text></span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại cá nhân!' },
                  {
                    pattern: /^(0|\+84)[0-9]{9,10}$/,
                    message: 'Số điện thoại không hợp lệ (10 chữ số, ví dụ: 0912345678)!',
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
                name="addressDetail"
                label={<span style={{ fontWeight: 600 }}>Địa chỉ thường trú / Nơi ở <Text type="danger">*</Text></span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập địa chỉ thường trú!' },
                  { min: 5, message: 'Vui lòng nhập chi tiết số nhà, tên đường, phường/xã, quận/huyện!' },
                ]}
              >
                <Input
                  prefix={<HomeOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Ví dụ: 91 Đường 447, Phường Tăng Nhơn Phú, TP. Thủ Đức"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* PHẦN 3: LIÊN HỆ KHẨN CẤP */}
          <Divider orientation="left" style={{ margin: '8px 0 16px 0', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
            3. THÔNG TIN NGƯỜI LIÊN HỆ KHẨN CẤP
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyContactName"
                label={<span style={{ fontWeight: 600 }}>Tên người liên hệ khẩn cấp <Text type="danger">*</Text></span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập tên người liên hệ khẩn cấp!' },
                  { min: 2, message: 'Tên người liên hệ tối thiểu 2 ký tự!' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#dc2626' }} />}
                  placeholder="Ví dụ: Bố - Nguyễn Văn B"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyContactPhone"
                label={<span style={{ fontWeight: 600 }}>SĐT người liên hệ khẩn cấp <Text type="danger">*</Text></span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại người liên hệ khẩn cấp!' },
                  {
                    pattern: /^(0|\+84)[0-9]{9,10}$/,
                    message: 'Số điện thoại khẩn cấp không hợp lệ (10 chữ số)!',
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

          <Divider style={{ margin: '16px 0' }} />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ background: '#0284c7', fontWeight: 600, minWidth: 130 }}
              >
                {editingProfile ? 'Cập Nhật Hồ Sơ' : 'Lưu Hồ Sơ Cá Nhân'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientProfilesPage;
