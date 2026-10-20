import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Input,
  Modal,
  Form,
  Tag,
  Space,
  Row,
  Col,
  message,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  SearchOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
  BookOutlined,
} from '@ant-design/icons';
import catalogService from '../../services/catalogService';

const { Title, Text } = Typography;

export const AdminCatalogsPage = () => {
  // ICD-10 State
  const [icdList, setIcdList] = useState([]);
  const [icdKeyword, setIcdKeyword] = useState('');
  const [loadingIcd, setLoadingIcd] = useState(false);
  const [isIcdModalOpen, setIsIcdModalOpen] = useState(false);
  const [submittingIcd, setSubmittingIcd] = useState(false);
  const [icdForm] = Form.useForm();

  // Medicines State
  const [medList, setMedList] = useState([]);
  const [medKeyword, setMedKeyword] = useState('');
  const [loadingMed, setLoadingMed] = useState(false);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [submittingMed, setSubmittingMed] = useState(false);
  const [medForm] = Form.useForm();

  // Fetch ICD-10
  const fetchIcd10 = async (kw = '') => {
    setLoadingIcd(true);
    try {
      const res = await catalogService.searchIcd10(kw, 0, 50);
      const data = res?.data?.content || (Array.isArray(res?.data) ? res.data : []);
      setIcdList(data);
    } catch (err) {
      message.error('Không thể tải danh mục ICD-10');
    } finally {
      setLoadingIcd(false);
    }
  };

  // Fetch Medicines
  const fetchMedicines = async (kw = '') => {
    setLoadingMed(true);
    try {
      const res = await catalogService.searchMedicines(kw);
      const data = res?.data?.content || (Array.isArray(res?.data) ? res.data : []);
      setMedList(data);
    } catch (err) {
      message.error('Không thể tải danh mục thuốc');
    } finally {
      setLoadingMed(false);
    }
  };

  useEffect(() => {
    fetchIcd10('');
    fetchMedicines('');
  }, []);

  // Submit ICD-10
  const handleAddIcd = async (values) => {
    setSubmittingIcd(true);
    try {
      await catalogService.createIcd10({
        ...values,
        isActive: true,
      });
      message.success('Thêm mã bệnh ICD-10 thành công!');
      setIsIcdModalOpen(false);
      icdForm.resetFields();
      fetchIcd10(icdKeyword);
    } catch (err) {
      message.error(err.message || 'Lỗi khi thêm mã ICD-10');
    } finally {
      setSubmittingIcd(false);
    }
  };

  // Submit Medicine
  const handleAddMed = async (values) => {
    setSubmittingMed(true);
    try {
      await catalogService.createMedicine(values);
      message.success('Thêm thuốc mới thành công!');
      setIsMedModalOpen(false);
      medForm.resetFields();
      fetchMedicines(medKeyword);
    } catch (err) {
      message.error(err.message || 'Lỗi khi thêm thuốc');
    } finally {
      setSubmittingMed(false);
    }
  };

  const icdColumns = [
    {
      title: 'Mã ICD-10',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Tag color="blue" style={{ fontSize: 14 }}>{code}</Tag>,
    },
    {
      title: 'Tên bệnh (Tiếng Việt)',
      dataIndex: 'diseaseNameVi',
      key: 'diseaseNameVi',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Tên quốc tế (English)',
      dataIndex: 'diseaseNameEn',
      key: 'diseaseNameEn',
      render: (en) => en || <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Chương / Nhóm bệnh',
      dataIndex: 'chapter',
      key: 'chapter',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (act) => (act !== false ? <Tag color="success">Kích hoạt</Tag> : <Tag>Khóa</Tag>),
    },
  ];

  const medColumns = [
    {
      title: 'Tên biệt dược',
      dataIndex: 'brandName',
      key: 'brandName',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Hoạt chất chính',
      dataIndex: 'activeIngredient',
      key: 'activeIngredient',
      render: (ing) => <Tag color="cyan">{ing}</Tag>,
    },
    {
      title: 'Hàm lượng / Nồng độ',
      dataIndex: 'strength',
      key: 'strength',
    },
    {
      title: 'Dạng bào chế',
      dataIndex: 'dosageForm',
      key: 'dosageForm',
    },
    {
      title: 'Nhà sản xuất',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: 'Số đăng ký',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      render: (reg) => reg ? <code>{reg}</code> : 'N/A',
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Quản Lý Danh Mục Y Tế
          </Title>
        </Col>
      </Row>

      <Card>
        <Tabs
          defaultActiveKey="icd10"
          items={[
            {
              key: 'icd10',
              label: (
                <span>
                  <BookOutlined /> Danh mục mã bệnh ICD-10
                </span>
              ),
              children: (
                <div>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={14} md={10}>
                      <Input
                        placeholder="Tìm theo mã (I10, E11...) hoặc tên bệnh tiếng Việt"
                        prefix={<SearchOutlined />}
                        value={icdKeyword}
                        onChange={(e) => setIcdKeyword(e.target.value)}
                        onPressEnter={() => fetchIcd10(icdKeyword)}
                        allowClear
                      />
                    </Col>
                    <Col>
                      <Space>
                        <Button onClick={() => fetchIcd10(icdKeyword)}>Tìm kiếm</Button>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setIsIcdModalOpen(true)}
                        >
                          Thêm mã ICD-10
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                  <div className="table-responsive-container">
                    <Table
                      columns={icdColumns}
                      dataSource={Array.isArray(icdList) ? icdList : []}
                      rowKey="id"
                      loading={loadingIcd}
                      pagination={{ pageSize: 15 }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'medicines',
              label: (
                <span>
                  <MedicineBoxOutlined /> Danh mục thuốc quốc gia
                </span>
              ),
              children: (
                <div>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={14} md={10}>
                      <Input
                        placeholder="Tìm theo tên thuốc hoặc hoạt chất (Paracetamol, Amlodipine...)"
                        prefix={<SearchOutlined />}
                        value={medKeyword}
                        onChange={(e) => setMedKeyword(e.target.value)}
                        onPressEnter={() => fetchMedicines(medKeyword)}
                        allowClear
                      />
                    </Col>
                    <Col>
                      <Space>
                        <Button onClick={() => fetchMedicines(medKeyword)}>Tìm kiếm</Button>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setIsMedModalOpen(true)}
                        >
                          Thêm thuốc mới
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                  <div className="table-responsive-container">
                    <Table
                      columns={medColumns}
                      dataSource={Array.isArray(medList) ? medList : []}
                      rowKey="id"
                      loading={loadingMed}
                      pagination={{ pageSize: 15 }}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal thêm ICD-10 */}
      <Modal
        title="Thêm mã bệnh ICD-10 vào từ điển hệ thống"
        open={isIcdModalOpen}
        onCancel={() => setIsIcdModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={icdForm} layout="vertical" onFinish={handleAddIcd}>
          <Form.Item
            name="code"
            label="Mã ICD-10"
            rules={[{ required: true, message: 'Nhập mã ICD-10' }]}
          >
            <Input placeholder="Ví dụ: I10, E11.9, J00..." />
          </Form.Item>

          <Form.Item
            name="diseaseNameVi"
            label="Tên bệnh (Tiếng Việt)"
            rules={[{ required: true, message: 'Nhập tên bệnh tiếng Việt' }]}
          >
            <Input placeholder="Ví dụ: Tăng huyết áp vô căn (nguyên phát)" />
          </Form.Item>

          <Form.Item name="diseaseNameEn" label="Tên bệnh (Tiếng Anh)">
            <Input placeholder="Ví dụ: Essential (primary) hypertension" />
          </Form.Item>

          <Form.Item name="chapter" label="Chương / Nhóm bệnh">
            <Input placeholder="Ví dụ: Chương IX: Bệnh hệ tuần hoàn" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsIcdModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submittingIcd}>
                Lưu mã bệnh
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal thêm thuốc */}
      <Modal
        title="Thêm thuốc mới vào danh mục quốc gia"
        open={isMedModalOpen}
        onCancel={() => setIsMedModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={medForm} layout="vertical" onFinish={handleAddMed}>
          <Form.Item
            name="brandName"
            label="Tên biệt dược"
            rules={[{ required: true, message: 'Nhập tên biệt dược' }]}
          >
            <Input placeholder="Ví dụ: Panadol Extra, Augmentin..." />
          </Form.Item>

          <Row gutter={12}>
            <Col span={14}>
              <Form.Item
                name="activeIngredient"
                label="Hoạt chất chính"
                rules={[{ required: true, message: 'Nhập hoạt chất' }]}
              >
                <Input placeholder="Paracetamol, Amoxicillin/Clavulanate..." />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="strength" label="Hàm lượng">
                <Input placeholder="500mg, 625mg..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="dosageForm" label="Dạng bào chế">
                <Input placeholder="Viên nén, Hỗn dịch uống..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="registrationNumber" label="Số đăng ký">
                <Input placeholder="VN-12345-20" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="manufacturer" label="Công ty / Nhà sản xuất">
            <Input placeholder="GlaxoSmithKline, Dược Hậu Giang..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsMedModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submittingMed}>
                Lưu thuốc mới
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCatalogsPage;
