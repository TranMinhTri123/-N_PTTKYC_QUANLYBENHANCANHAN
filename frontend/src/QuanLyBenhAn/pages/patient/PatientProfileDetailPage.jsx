import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Typography,
  Button,
  Space,
  Tag,
  Descriptions,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  notification,
  Popconfirm,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  AlertOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import AllergyBadge from '../../components/AllergyBadge';
import { formatDate, maskPii, formatRelationship } from '../../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;

export const PatientProfileDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  // Modal thêm dị ứng
  const [allergyModalOpen, setAllergyModalOpen] = useState(false);
  const [allergyForm] = Form.useForm();
  const [submittingAllergy, setSubmittingAllergy] = useState(false);

  // Modal thêm bệnh mạn tính
  const [chronicModalOpen, setChronicModalOpen] = useState(false);
  const [chronicForm] = Form.useForm();

  const loadProfileDetail = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfile(id);
      setProfile(res?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProfileDetail();
  }, [id]);

  // Thêm dị ứng
  const handleAddAllergy = async (values) => {
    setSubmittingAllergy(true);
    try {
      await profileService.addAllergy(id, {
        allergen: values.allergen?.trim(),
        allergyType: values.allergyType || 'MEDICATION',
        severity: values.severity || 'SEVERE',
        reaction: values.reaction?.trim() || 'Phản ứng dị ứng',
      });
      notification.success({ message: 'Thêm tiền sử dị ứng thành công!' });
      setAllergyModalOpen(false);
      allergyForm.resetFields();
      loadProfileDetail();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message || 'Không thể thêm dị ứng.' });
    } finally {
      setSubmittingAllergy(false);
    }
  };

  // Xóa dị ứng
  const handleDeleteAllergy = async (allergyId) => {
    try {
      await profileService.deleteAllergy(id, allergyId);
      notification.success({ message: 'Đã xóa bản ghi dị ứng!' });
      loadProfileDetail();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message || 'Không thể xóa.' });
    }
  };

  // Thêm bệnh mạn tính
  const handleAddChronic = async (values) => {
    try {
      await profileService.addChronicDisease(id, {
        diseaseName: values.diseaseName?.trim(),
        diagnosedYear: values.diagnosedYear || 2020,
        status: values.status || 'Đang dùng thuốc duy trì',
      });
      notification.success({ message: 'Đã thêm bệnh mạn tính nền!' });
      setChronicModalOpen(false);
      chronicForm.resetFields();
      loadProfileDetail();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message || 'Không thể thêm.' });
    }
  };

  const allergies = profile?.allergies || [];
  const chronicDiseases = profile?.chronicDiseases || [];
  const familyHistories = profile?.familyHistories || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patient/profiles')}>
            Quay Về
          </Button>
          <div>
            <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
              Chi Tiết Hồ Sơ: {profile?.fullName || 'Người Thân'}
            </Title>
          </div>
        </Space>
      </div>

      {/* Thông tin nhân khẩu học */}
      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 4 }}>
          <Descriptions.Item label="Họ và tên"><strong>{profile?.fullName}</strong></Descriptions.Item>
          <Descriptions.Item label="Giới tính">{profile?.gender === 'FEMALE' ? 'Nữ' : 'Nam'}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">{profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Quan hệ">{formatRelationship(profile?.relationship)}</Descriptions.Item>
          <Descriptions.Item label="Số CCCD">{profile?.identityCardNumber ? maskPii(profile.identityCardNumber) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Số thẻ BHYT">{profile?.healthInsuranceNumber ? maskPii(profile.healthInsuranceNumber) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Nhóm máu">{profile?.bloodType || '-'}</Descriptions.Item>
          <Descriptions.Item label="Điện thoại">{profile?.phoneNumber || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 3 TABS CHUYÊN SÂU: DỊ ỨNG, BỆNH MẠN TÍNH, TIỀN SỬ GIA ĐÌNH */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="allergies"
          items={[
            {
              key: 'allergies',
              label: (
                <span>
                  <AlertOutlined style={{ color: '#ef4444' }} /> Tiền Sử Dị Ứng ({allergies.length})
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                    <Button
                      type="primary"
                      danger
                      icon={<PlusOutlined />}
                      onClick={() => setAllergyModalOpen(true)}
                    >
                      Thêm Dị Ứng
                    </Button>
                  </div>

                  <Table
                    dataSource={allergies}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      {
                        title: 'Tác Nhân Dị Ứng (Dị Nguyên)',
                        dataIndex: 'allergen',
                        key: 'allergen',
                        render: (_, record) => (
                          <AllergyBadge
                            allergen={record.allergen}
                            severity={record.severity}
                            type={record.allergyType}
                            reaction={record.reaction}
                          />
                        ),
                      },
                      {
                        title: 'Nhóm Dị Ứng',
                        dataIndex: 'allergyType',
                        key: 'allergyType',
                        render: (t) => <Tag color="blue">{t || 'Thuốc'}</Tag>,
                      },
                      {
                        title: 'Mức Độ Nguy Hiểm',
                        dataIndex: 'severity',
                        key: 'severity',
                        render: (s) => (
                          <Tag color={s === 'CRITICAL' || s === 'SEVERE' ? 'red' : 'orange'}>
                            {s === 'CRITICAL' ? 'Nguy Kịch' : s === 'SEVERE' ? 'Nặng' : 'Trung Bình / Nhẹ'}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Triệu Chứng Phản Vệ',
                        dataIndex: 'reaction',
                        key: 'reaction',
                        render: (r) => r || 'Phát ban, khó thở',
                      },
                      {
                        title: 'Xóa',
                        key: 'actions',
                        render: (_, record) => (
                          <Popconfirm title="Xóa dị ứng này?" onConfirm={() => handleDeleteAllergy(record.id)}>
                            <Button type="text" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'chronic',
              label: (
                <span>
                  <MedicineBoxOutlined style={{ color: '#0f766e' }} /> Bệnh Mạn Tính Nền ({chronicDiseases.length})
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setChronicModalOpen(true)}>
                      + Thêm Bệnh Mạn Tính
                    </Button>
                  </div>
                  <Table
                    dataSource={chronicDiseases}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      {
                        title: 'Tên Bệnh Mạn Tính',
                        dataIndex: 'diseaseName',
                        key: 'diseaseName',
                        render: (name) => <Text strong>{name}</Text>,
                      },
                      {
                        title: 'Năm Phát Hiện Chẩn Đoán',
                        dataIndex: 'diagnosedYear',
                        key: 'diagnosedYear',
                      },
                      {
                        title: 'Tình Trạng Điều Trị Hiện Tại',
                        dataIndex: 'status',
                        key: 'status',
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'family',
              label: (
                <span>
                  <TeamOutlined style={{ color: '#0284c7' }} /> Tiền Sử Di Truyền Gia Đình ({familyHistories.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={familyHistories}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: 'Bệnh Lý Di Truyền', dataIndex: 'diseaseName', key: 'diseaseName' },
                    { title: 'Quan Hệ Huyết Thống', dataIndex: 'relationship', key: 'relationship' },
                    { title: 'Ghi Chú', dataIndex: 'notes', key: 'notes' },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Thêm Dị Ứng */}
      <Modal
        title="Thêm Tiền Sử Dị Ứng Mới"
        open={allergyModalOpen}
        onCancel={() => setAllergyModalOpen(false)}
        footer={null}
      >
        <Form form={allergyForm} layout="vertical" onFinish={handleAddAllergy} style={{ marginTop: 16 }}>
          <Form.Item name="allergen" label="Tác nhân gây dị ứng (Tên thuốc / Thức ăn)" rules={[{ required: true, message: 'Nhập tên dị nguyên!' }]}>
            <Input placeholder="Ví dụ: Penicillin, Amoxicillin, Hải sản..." />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="allergyType" label="Nhóm dị ứng" initialValue="MEDICATION">
                <Select>
                  <Option value="MEDICATION">Thuốc / Dược phẩm</Option>
                  <Option value="FOOD">Thực phẩm</Option>
                  <Option value="ENVIRONMENT">Thời tiết / Môi trường</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="severity" label="Mức độ nghiêm trọng" initialValue="SEVERE">
                <Select>
                  <Option value="CRITICAL">Nguy kịch (Sốc phản vệ)</Option>
                  <Option value="SEVERE">Nặng</Option>
                  <Option value="MODERATE">Trung bình</Option>
                  <Option value="MILD">Nhẹ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="reaction" label="Triệu chứng phản vệ thường gặp">
            <Input placeholder="Nổi mề đay, khó thở, tụt huyết áp..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={submittingAllergy} danger>
              Lưu Cảnh Báo Dị Ứng
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Thêm Bệnh Mạn Tính */}
      <Modal
        title="Thêm Bệnh Mạn Tính Nền"
        open={chronicModalOpen}
        onCancel={() => setChronicModalOpen(false)}
        footer={null}
      >
        <Form form={chronicForm} layout="vertical" onFinish={handleAddChronic} style={{ marginTop: 16 }}>
          <Form.Item name="diseaseName" label="Tên bệnh mạn tính" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Tăng huyết áp, Đái tháo đường Type 2, Hen suyễn..." />
          </Form.Item>
          <Form.Item name="diagnosedYear" label="Năm chẩn đoán" initialValue={2022}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="Tình trạng điều trị hiện tại" initialValue="Đang uống thuốc đều">
            <Input />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit">
              Lưu Bệnh Nền
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientProfileDetailPage;
