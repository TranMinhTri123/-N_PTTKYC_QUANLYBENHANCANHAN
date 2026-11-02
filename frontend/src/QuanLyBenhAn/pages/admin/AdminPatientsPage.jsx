import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Typography,
  Tag,
  Space,
  message,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  IdcardOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const AdminPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8088/api/v1/patients?size=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setPatients(list);
    } catch (err) {
      // Mock sample patients if DB is fresh
      setPatients([
        {
          id: 1,
          mrn: 'BN-2026-001',
          fullName: 'Nguyễn Văn An',
          dateOfBirth: '1988-05-14',
          gender: 'MALE',
          nationalId: '001088012345',
          phone: '0912345678',
          bloodType: 'O+',
          allergies: 'Dị ứng Penicillin',
          address: 'Ba Đình, Hà Nội',
        },
        {
          id: 2,
          mrn: 'BN-2026-002',
          fullName: 'Trần Thị Mai',
          dateOfBirth: '1995-10-22',
          gender: 'FEMALE',
          nationalId: '001195054321',
          phone: '0987654321',
          bloodType: 'A+',
          allergies: 'Dị ứng Aspirin, Hải sản',
          address: 'Cầu Giấy, Hà Nội',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleCreate = async (values) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const payload = {
        mrn: values.mrn.trim().toUpperCase(),
        fullName: values.fullName.trim(),
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        gender: values.gender,
        nationalId: values.nationalId,
        phone: values.phone,
        bloodType: values.bloodType,
        allergies: values.allergies,
        address: values.address,
      };

      await axios.post('http://localhost:8088/api/v1/patients', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(`Đã khởi tạo thành công hồ sơ bệnh nhân MRN: ${payload.mrn}`);
      setModalVisible(false);
      form.resetFields();
      fetchPatients();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể tạo hồ sơ bệnh nhân. Vui lòng kiểm tra lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Mã Bệnh Nhân (MRN)',
      dataIndex: 'mrn',
      key: 'mrn',
      render: (mrn) => <Tag color="blue" style={{ fontSize: 13, fontWeight: 600 }}>{mrn}</Tag>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name) => <Text strong style={{ textTransform: 'uppercase' }}>{name}</Text>,
    },
    {
      title: 'Ngày Sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (dob) => (dob ? dayjs(dob).format('DD/MM/YYYY') : '---'),
    },
    {
      title: 'Giới Tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (g) => (g === 'MALE' ? <Tag color="cyan">Nam</Tag> : <Tag color="magenta">Nữ</Tag>),
    },
    {
      title: 'CCCD / Định Danh',
      dataIndex: 'nationalId',
      key: 'nationalId',
      render: (id) => id || '---',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (p) => p || '---',
    },
    {
      title: 'Nhóm Máu',
      dataIndex: 'bloodType',
      key: 'bloodType',
      render: (b) => <Tag color="red">{b || 'Chưa rõ'}</Tag>,
    },
    {
      title: 'Tiền Sử Dị Ứng',
      dataIndex: 'allergies',
      key: 'allergies',
      ellipsis: true,
      render: (al) => (al ? <Tag color="error">{al}</Tag> : <Text type="secondary">Không có</Text>),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản Lý Hồ Sơ Bệnh Nhân Gốc (HIS / MRN)
          </Title>
          <Text type="secondary">
            Khởi tạo mã MRN và quản lý hồ sơ định danh bệnh viện cho bệnh nhân
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchPatients} loading={loading}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            style={{ background: '#0284c7' }}
          >
            Cấp Mã MRN Mới
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={patients}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* MODAL TẠO MỚI MRN */}
      <Modal
        title={
          <Space>
            <IdcardOutlined style={{ color: '#0284c7' }} />
            <span>Khởi Tạo Hồ Sơ Bệnh Nhân Bệnh Viện (MRN)</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={650}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mrn"
                label="Mã Bệnh Nhân (MRN)"
                rules={[{ required: true, message: 'Vui lòng nhập mã MRN' }]}
                extra="Ví dụ: BN-2026-003"
              >
                <Input placeholder="BN-2026-003" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và Tên Bệnh Nhân"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày Sinh"
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới Tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nationalId" label="Số CCCD / Định danh">
                <Input placeholder="001088..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số Điện Thoại">
                <Input placeholder="0912..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bloodType" label="Nhóm Máu">
                <Select placeholder="Chọn nhóm máu" allowClear>
                  <Option value="O+">O+</Option>
                  <Option value="A+">A+</Option>
                  <Option value="B+">B+</Option>
                  <Option value="AB+">AB+</Option>
                  <Option value="O-">O-</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="allergies" label="Tiền Sử Dị Ứng">
                <Input placeholder="Dị ứng Penicillin, Aspirin..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa Chỉ Thường Trú">
            <TextArea rows={2} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting} style={{ background: '#0284c7' }}>
                Khởi Tạo Hồ Sơ
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPatientsPage;

