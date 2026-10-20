import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Table, Tag, Typography, Space, Modal, Form, Input, Select, notification, Alert, Popconfirm } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, WarningOutlined, MedicineBoxOutlined, HeartOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import profileService from '../../services/profileService';
import { formatVnDate, maskIdentity } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;
const { Option } = Select;

export const ProfileDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [chronicDiseases, setChronicDiseases] = useState([]);
  const [familyHistories, setFamilyHistories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [allergyModal, setAllergyModal] = useState(false);
  const [diseaseModal, setDiseaseModal] = useState(false);
  const [familyModal, setFamilyModal] = useState(false);

  const [allergyForm] = Form.useForm();
  const [diseaseForm] = Form.useForm();
  const [familyForm] = Form.useForm();

  const fetchProfileDetail = async () => {
    setLoading(true);
    try {
      const [resProfile, resAllergies, resDiseases, resFamily] = await Promise.all([
        profileService.getProfileById(id),
        profileService.getAllergies(id),
        profileService.getChronicDiseases(id),
        profileService.getFamilyHistories(id),
      ]);
      setProfile(resProfile?.data || null);
      setAllergies(Array.isArray(resAllergies?.data) ? resAllergies.data : []);
      setChronicDiseases(Array.isArray(resDiseases?.data) ? resDiseases.data : []);
      setFamilyHistories(Array.isArray(resFamily?.data) ? resFamily.data : []);
    } catch (err) {
      notification.error({
        message: 'Lỗi tải hồ sơ',
        description: err.message || 'Không thể tải chi tiết hồ sơ.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetail();
  }, [id]);

  // Thêm dị ứng
  const handleAddAllergy = async (values) => {
    try {
      await profileService.addAllergy(id, values);
      notification.success({ message: 'Thêm dị ứng thành công!' });
      setAllergyModal(false);
      allergyForm.resetFields();
      fetchProfileDetail();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message });
    }
  };

  const handleDeleteAllergy = async (allergyId) => {
    try {
      await profileService.deleteAllergy(id, allergyId);
      notification.success({ message: 'Đã xóa tiền sử dị ứng!' });
      fetchProfileDetail();
    } catch (err) {
      notification.error({ message: 'Lỗi khi xóa', description: err.message });
    }
  };

  // Thêm bệnh mạn tính
  const handleAddDisease = async (values) => {
    try {
      await profileService.addChronicDisease(id, values);
      notification.success({ message: 'Thêm bệnh mạn tính thành công!' });
      setDiseaseModal(false);
      diseaseForm.resetFields();
      fetchProfileDetail();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message });
    }
  };

  const handleDeleteDisease = async (diseaseId) => {
    try {
      await profileService.deleteChronicDisease(id, diseaseId);
      notification.success({ message: 'Đã xóa bệnh mạn tính!' });
      fetchProfileDetail();
    } catch (err) {
      notification.error({ message: 'Lỗi khi xóa', description: err.message });
    }
  };

  // Thêm tiền sử gia đình
  const handleAddFamily = async (values) => {
    try {
      await profileService.addFamilyHistory(id, values);
      notification.success({ message: 'Thêm tiền sử gia đình thành công!' });
      setFamilyModal(false);
      familyForm.resetFields();
      fetchProfileDetail();
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err.message });
    }
  };

  const handleDeleteFamily = async (historyId) => {
    try {
      await profileService.deleteFamilyHistory(id, historyId);
      notification.success({ message: 'Đã xóa tiền sử gia đình!' });
      fetchProfileDetail();
    } catch (err) {
      notification.error({ message: 'Lỗi khi xóa', description: err.message });
    }
  };

  // Cột bảng dị ứng
  const allergyColumns = [
    {
      title: 'Tác Nhân Dị Ứng',
      dataIndex: 'allergenName',
      key: 'allergenName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Nhóm Dị Ứng',
      dataIndex: 'allergyType',
      key: 'allergyType',
      render: (type) => {
        const map = {
          DRUG: { text: 'Thuốc / Dược phẩm', color: 'red' },
          FOOD: { text: 'Thực phẩm', color: 'orange' },
          ENVIRONMENT: { text: 'Môi trường / Thời tiết', color: 'cyan' },
          OTHER: { text: 'Khác', color: 'default' },
        };
        const item = map[type] || { text: type, color: 'default' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: 'Mức Độ Nghiêm Trọng',
      dataIndex: 'severity',
      key: 'severity',
      render: (sev) => {
        if (sev === 'SEVERE') {
          return <Tag color="error" className="badge-severe-allergy">Nguy Kịch / Sốc Phản Vệ</Tag>;
        }
        if (sev === 'MODERATE') {
          return <Tag color="warning">Trung Bình</Tag>;
        }
        return <Tag color="green">Nhẹ</Tag>;
      },
    },
    {
      title: 'Triệu Chứng Thường Gặp',
      dataIndex: 'reactionSymptoms',
      key: 'reactionSymptoms',
      render: (text) => text || '—',
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="Xóa tiền sử dị ứng này?"
          onConfirm={() => handleDeleteAllergy(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger type="text" icon={<DeleteOutlined />} size="small">Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  // Cột bảng bệnh mạn tính
  const diseaseColumns = [
    {
      title: 'Tên Bệnh Mạn Tính',
      dataIndex: 'diseaseName',
      key: 'diseaseName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Năm Chẩn Đoán',
      dataIndex: 'diagnosisYear',
      key: 'diagnosisYear',
      render: (year) => year || '—',
    },
    {
      title: 'Tình Trạng Điều Trị',
      dataIndex: 'treatmentStatus',
      key: 'treatmentStatus',
      render: (status) => <Tag color="blue">{status || 'Đang theo dõi'}</Tag>,
    },
    {
      title: 'Phác Đồ Thuốc Duy Trì',
      dataIndex: 'medicationRegimen',
      key: 'medicationRegimen',
      render: (text) => text || '—',
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="Xóa bệnh mạn tính này?"
          onConfirm={() => handleDeleteDisease(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger type="text" icon={<DeleteOutlined />} size="small">Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  // Cột bảng tiền sử gia đình
  const familyColumns = [
    {
      title: 'Quan Hệ Huyết Thống',
      dataIndex: 'relationship',
      key: 'relationship',
      render: (text) => <Tag color="geekblue">{text || 'Người thân'}</Tag>,
    },
    {
      title: 'Bệnh Lý Di Truyền',
      dataIndex: 'conditionName',
      key: 'conditionName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Độ Tuổi Khởi Phát',
      dataIndex: 'onsetAge',
      key: 'onsetAge',
      render: (age) => (age ? `${age} tuổi` : '—'),
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => text || '—',
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="Xóa tiền sử gia đình này?"
          onConfirm={() => handleDeleteFamily(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger type="text" icon={<DeleteOutlined />} size="small">Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  if (!profile && !loading) {
    return <Alert type="warning" message="Không tìm thấy hồ sơ người bệnh." showIcon />;
  }

  const hasSevereAllergy = allergies?.some((a) => a.severity === 'SEVERE');

  return (
    <div>
      {/* Header Navigation */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/profiles')}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách hồ sơ
      </Button>

      {/* Severe Allergy Alert Banner (Rule 9) */}
      {hasSevereAllergy && (
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined style={{ fontSize: 20 }} />}
          message="CẢNH BÁO Y TẾ: NGƯỜI BỆNH CÓ TIỀN SỬ DỊ ỨNG THUỐC NGUY KỊCH!"
          description="Bác sĩ hoặc nhân viên y tế cần kiểm tra kỹ danh sách dị ứng bên dưới trước khi chỉ định kê đơn thuốc điều trị để phòng ngừa sốc phản vệ."
          style={{ marginBottom: 20, borderRadius: 10, border: '2px solid #ef4444' }}
        />
      )}

      {/* Patient Demographic Card */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              {profile?.fullName}
            </Title>
            <Space size={8} style={{ marginTop: 6 }}>
              <Tag color="blue">{profile?.relationship || 'Thành viên'}</Tag>
              <Tag color={profile?.gender === 'FEMALE' ? 'pink' : 'cyan'}>
                {profile?.gender === 'FEMALE' ? 'Nữ' : 'Nam'}
              </Tag>
              {profile?.bloodType && <Tag color="volcano">Nhóm máu: {profile?.bloodType}</Tag>}
            </Space>
          </div>
          <Button
            type="primary"
            onClick={() => navigate(`/medical-records/create?profileId=${id}`)}
          >
            Tạo Bệnh Án Cho Người Này
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>Ngày sinh</Text>
            <strong>{formatVnDate(profile?.dateOfBirth)}</strong>
          </div>
          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>Số CCCD</Text>
            <strong>{maskIdentity(profile?.cccd, 'CCCD')}</strong>
          </div>
          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>Mã Thẻ BHYT</Text>
            <strong>{maskIdentity(profile?.bhytNumber, 'BHYT')}</strong>
          </div>
          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>Địa chỉ cư trú</Text>
            <span>{profile?.addressDetail || 'Chưa cập nhật'}</span>
          </div>
        </div>
      </Card>

      {/* 3 Medical History Tabs */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <WarningOutlined style={{ color: '#ef4444' }} /> Tiền Sử Dị Ứng ({allergies?.length || 0})
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setAllergyModal(true)}
                    >
                      Thêm Tiền Sử Dị Ứng
                    </Button>
                  </div>
                  <div className="table-responsive-container">
                    <Table
                      columns={allergyColumns}
                      dataSource={Array.isArray(allergies) ? allergies : []}
                      rowKey="id"
                      pagination={false}
                      locale={{ emptyText: 'Chưa có tiền sử dị ứng nào được ghi nhận' }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <HeartOutlined style={{ color: '#0284c7' }} /> Bệnh Mạn Tính Nền ({chronicDiseases?.length || 0})
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setDiseaseModal(true)}
                    >
                      Thêm Bệnh Mạn Tính
                    </Button>
                  </div>
                  <div className="table-responsive-container">
                    <Table
                      columns={diseaseColumns}
                      dataSource={Array.isArray(chronicDiseases) ? chronicDiseases : []}
                      rowKey="id"
                      pagination={false}
                      locale={{ emptyText: 'Chưa có bệnh mạn tính nào được ghi nhận' }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <span>
                  <TeamOutlined style={{ color: '#8b5cf6' }} /> Tiền Sử Bệnh Gia Đình ({familyHistories?.length || 0})
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setFamilyModal(true)}
                    >
                      Thêm Tiền Sử Gia Đình
                    </Button>
                  </div>
                  <div className="table-responsive-container">
                    <Table
                      columns={familyColumns}
                      dataSource={Array.isArray(familyHistories) ? familyHistories : []}
                      rowKey="id"
                      pagination={false}
                      locale={{ emptyText: 'Chưa có tiền sử bệnh gia đình nào được ghi nhận' }}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Thêm Dị Ứng */}
      <Modal
        title="Thêm Tiền Sử Dị Ứng"
        open={allergyModal}
        onCancel={() => setAllergyModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={allergyForm} layout="vertical" onFinish={handleAddAllergy}>
          <Form.Item name="allergenName" label="Tên chất gây dị ứng (Ví dụ: Penicillin, Tôm, Đậu phộng)" rules={[{ required: true, message: 'Nhập tên chất dị ứng!' }]}>
            <Input placeholder="Penicillin" />
          </Form.Item>
          <Form.Item name="allergyType" label="Loại dị ứng" rules={[{ required: true }]}>
            <Select placeholder="Chọn nhóm dị ứng">
              <Option value="DRUG">Thuốc / Dược phẩm</Option>
              <Option value="FOOD">Thực phẩm</Option>
              <Option value="ENVIRONMENT">Môi trường</Option>
              <Option value="OTHER">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="severity" label="Mức độ nghiêm trọng" rules={[{ required: true }]}>
            <Select placeholder="Chọn mức độ">
              <Option value="MILD">Nhẹ</Option>
              <Option value="MODERATE">Trung bình</Option>
              <Option value="SEVERE">Nguy kịch / Sốc phản vệ</Option>
            </Select>
          </Form.Item>
          <Form.Item name="reactionSymptoms" label="Triệu chứng phản ứng">
            <Input.TextArea placeholder="Mẩn ngứa, khó thở, tụt huyết áp..." rows={3} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setAllergyModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu Dị Ứng</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Thêm Bệnh Mạn Tính */}
      <Modal
        title="Thêm Bệnh Mạn Tính Nền"
        open={diseaseModal}
        onCancel={() => setDiseaseModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={diseaseForm} layout="vertical" onFinish={handleAddDisease}>
          <Form.Item name="diseaseName" label="Tên bệnh mạn tính" rules={[{ required: true }]}>
            <Input placeholder="Tăng huyết áp, Đái tháo đường Type 2..." />
          </Form.Item>
          <Form.Item
            name="diagnosisYear"
            label="Năm chẩn đoán"
            rules={[
              () => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const yr = Number(value);
                  const currentYear = dayjs().year();
                  if (yr < 1920 || yr > currentYear) {
                    return Promise.reject(new Error(`Năm chẩn đoán phải từ 1920 đến ${currentYear}!`));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="2020" type="number" />
          </Form.Item>
          <Form.Item name="treatmentStatus" label="Tình trạng điều trị">
            <Input placeholder="Đang uống thuốc ổn định" />
          </Form.Item>
          <Form.Item name="medicationRegimen" label="Phác đồ thuốc đang dùng">
            <Input.TextArea placeholder="Amlodipine 5mg ngày 1 viên..." rows={2} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setDiseaseModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu Bệnh Nền</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Thêm Tiền Sử Gia Đình */}
      <Modal
        title="Thêm Tiền Sử Bệnh Gia Đình"
        open={familyModal}
        onCancel={() => setFamilyModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={familyForm} layout="vertical" onFinish={handleAddFamily}>
          <Form.Item name="relationship" label="Quan hệ huyết thống" rules={[{ required: true, message: 'Nhập quan hệ huyết thống!' }]}>
            <Input placeholder="Bố đẻ, Mẹ đẻ, Ông nội..." />
          </Form.Item>
          <Form.Item name="conditionName" label="Bệnh lý di truyền" rules={[{ required: true, message: 'Nhập bệnh lý di truyền!' }]}>
            <Input placeholder="Bệnh mạch vành, Ung thư đại trực tràng..." />
          </Form.Item>
          <Form.Item
            name="onsetAge"
            label="Độ tuổi khởi phát (Nếu biết)"
            rules={[
              () => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const age = Number(value);
                  if (age < 0 || age > 120) {
                    return Promise.reject(new Error('Độ tuổi khởi phát phải từ 0 đến 120 tuổi!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="55" type="number" />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setFamilyModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu Tiền Sử</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfileDetailPage;
