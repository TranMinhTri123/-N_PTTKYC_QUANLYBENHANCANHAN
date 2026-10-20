import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Table,
  Typography,
  Alert,
  Tag,
  Space,
  notification,
  InputNumber,
  AutoComplete,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  AlertOutlined,
  MedicineBoxOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import prescriptionService from '../../services/prescriptionService';
import profileService from '../../services/profileService';
import catalogService from '../../services/catalogService';
import medicalRecordService from '../../services/medicalRecordService';

const { Title, Text } = Typography;
const { Option } = Select;

export const DoctorPrescriptionPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [patientAllergies, setPatientAllergies] = useState([]);

  // Danh sách các mục thuốc trong đơn
  const [prescriptionItems, setPrescriptionItems] = useState([
    {
      id: 1,
      medicineName: 'Amlodipine 5mg',
      activeIngredient: 'Amlodipine besylate',
      quantity: 30,
      unit: 'Viên',
      dosage: '1 viên / lần',
      frequency: '1 lần / ngày (uống buổi sáng sau ăn)',
      durationDays: 30,
      instructions: 'Uống sau ăn no',
    },
  ]);

  // Cảnh báo sốc phản vệ dị ứng chéo
  const [allergyAlerts, setAllergyAlerts] = useState([]);

  // Tra cứu thuốc autocomplete
  const [medicineOptions, setMedicineOptions] = useState([]);

  useEffect(() => {
    // Tải danh sách hồ sơ
    const loadInit = async () => {
      try {
        const [profRes, recRes] = await Promise.allSettled([
          profileService.getProfiles(),
          medicalRecordService.getRecords({ page: 0, size: 50 }),
        ]);

        if (profRes.status === 'fulfilled') {
          const list = Array.isArray(profRes.value?.data) ? profRes.value.data : (profRes.value?.data?.content || []);
          setProfiles(list);
          if (list.length > 0) {
            handleSelectPatient(list[0].id, list);
          }
        }
        if (recRes.status === 'fulfilled') {
          const recList = Array.isArray(recRes.value?.data) ? recRes.value.data : (recRes.value?.data?.content || []);
          setRecords(recList);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadInit();
  }, []);

  // Khi chọn bệnh nhân -> tải chi tiết dị ứng để kiểm tra chéo
  const handleSelectPatient = async (profileId, profList = profiles) => {
    const prof = profList.find((p) => p.id === profileId);
    setSelectedProfile(prof);
    try {
      const res = await profileService.getProfile(profileId);
      const allergies = res?.data?.allergies || [];
      setPatientAllergies(allergies);
      checkCrossAllergies(prescriptionItems, allergies);
    } catch {
      setPatientAllergies([]);
    }
  };

  // Thuật toán kiểm tra dị ứng chéo (Cross-Allergy Detector)
  const checkCrossAllergies = (items, allergies = patientAllergies) => {
    const warnings = [];
    if (!allergies || allergies.length === 0) {
      setAllergyAlerts([]);
      return;
    }

    const allergyNames = allergies.map((a) => (a.allergen || '').toLowerCase());

    items.forEach((item) => {
      const medName = (item.medicineName || '').toLowerCase();
      const activeName = (item.activeIngredient || '').toLowerCase();

      // Kiểm tra nhóm Beta-lactam / Penicillin
      const hasPenicillinAllergy = allergyNames.some((a) => a.includes('penicillin') || a.includes('kháng sinh'));
      const isBetaLactamMed =
        medName.includes('amoxicillin') ||
        medName.includes('augmentin') ||
        medName.includes('ampicillin') ||
        activeName.includes('amoxicillin');

      if (hasPenicillinAllergy && isBetaLactamMed) {
        warnings.push({
          medicine: item.medicineName,
          severity: 'CRITICAL',
          message: `NGUY CƠ SỐC PHẢN VỆ: Bệnh nhân có tiền sử dị ứng Penicillin. Thuốc ${item.medicineName} thuộc nhóm Beta-lactam có khả năng gây dị ứng chéo cấp tính nguy kịch!`,
        });
      }

      // Kiểm tra trùng tên chất dị ứng trực tiếp
      allergies.forEach((a) => {
        const aName = (a.allergen || '').toLowerCase();
        if (aName && (medName.includes(aName) || activeName.includes(aName))) {
          warnings.push({
            medicine: item.medicineName,
            severity: a.severity || 'SEVERE',
            message: `CẢNH BÁO DỊ ỨNG: Bệnh nhân dị ứng với "${a.allergen}" (${a.reaction || 'Phản vệ'}). Không nên chỉ định ${item.medicineName}!`,
          });
        }
      });
    });

    setAllergyAlerts(warnings);
  };

  // Tra cứu thuốc
  const handleSearchMedicine = async (query) => {
    if (!query || query.length < 2) return;
    try {
      const res = await catalogService.searchMedicines(query);
      const list = res?.data || [];
      setMedicineOptions(
        list.map((m) => ({
          value: m.brandName || m.activeIngredient,
          label: (
            <div>
              <strong>{m.brandName}</strong> ({m.activeIngredient})
              <div style={{ fontSize: 11, color: '#64748b' }}>Hàm lượng: {m.strength || '-'} | ĐVT: {m.dosageForm || 'Viên'}</div>
            </div>
          ),
          item: m,
        }))
      );
    } catch {
      setMedicineOptions([]);
    }
  };

  // Thêm dòng thuốc mới
  const handleAddMedicineRow = () => {
    const newItem = {
      id: Date.now(),
      medicineName: '',
      activeIngredient: '',
      quantity: 10,
      unit: 'Viên',
      dosage: '1 viên / lần',
      frequency: '2 lần / ngày',
      durationDays: 5,
      instructions: 'Uống sau ăn',
    };
    const nextList = [...prescriptionItems, newItem];
    setPrescriptionItems(nextList);
    checkCrossAllergies(nextList);
  };

  // Xóa dòng thuốc
  const handleRemoveMedicineRow = (id) => {
    const nextList = prescriptionItems.filter((i) => i.id !== id);
    setPrescriptionItems(nextList);
    checkCrossAllergies(nextList);
  };

  // Cập nhật trường dòng thuốc
  const handleItemChange = (id, field, val) => {
    const nextList = prescriptionItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    });
    setPrescriptionItems(nextList);
    if (field === 'medicineName' || field === 'activeIngredient') {
      checkCrossAllergies(nextList);
    }
  };

  // Ký đơn thuốc
  const handleSubmitPrescription = async (values) => {
    if (prescriptionItems.length === 0) {
      notification.warning({ message: 'Đơn thuốc phải có ít nhất 1 loại thuốc!' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        medicalRecordId: values.medicalRecordId || (records.length > 0 ? records[0].id : null),
        diagnosis: values.diagnosis || 'Theo dõi điều trị ngoại trú',
        doctorAdvice: values.doctorAdvice || 'Uống thuốc đúng giờ, kiêng rượu bia, tái khám khi có dấu hiệu bất thường',
        items: prescriptionItems.map((i) => ({
          medicineName: i.medicineName,
          activeIngredient: i.activeIngredient,
          strength: 'Chuẩn',
          unit: i.unit || 'Viên',
          quantity: i.quantity || 1,
          dosage: i.dosage || '1 viên / lần',
          frequency: i.frequency || '1 lần / ngày',
          durationDays: i.durationDays || 7,
          instructions: i.instructions || 'Uống sau ăn',
        })),
      };

      await prescriptionService.createPrescription(payload);

      notification.success({
        message: 'Kê Đơn Thuốc Thành Công',
        description: 'Đơn thuốc điện tử đã được ban hành và cập nhật vào Tủ thuốc gia đình của người bệnh!',
      });
      navigate('/doctor/workspace');
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err.message || 'Không thể tạo đơn thuốc. Vui lòng kiểm tra lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/doctor/workspace')}>
            Quay Về
          </Button>
          <div>
            <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
              Kê Đơn Thuốc Điện Tử
            </Title>
          </div>
        </Space>
      </div>

      {/* BANNER CẢNH BÁO SỐC PHẢN VỆ DỊ ỨNG CHÉO (NẾU CÓ) */}
      {allergyAlerts.length > 0 && (
        <Alert
          className="anaphylaxis-banner allergy-pulse"
          message={
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#b91c1c' }}>
                CẢNH BÁO AN TOÀN DƯỢC LÝ: NGUY CƠ DỊ ỨNG THUỐC
              </span>
            </div>
          }
          description={
            <div style={{ marginTop: 8 }}>
              {allergyAlerts.map((w, idx) => (
                <div key={idx} style={{ marginBottom: 4, color: '#991b1b', fontWeight: 600 }}>
                  • {w.message}
                </div>
              ))}
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      <Card style={{ borderRadius: 12 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmitPrescription}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={<span style={{ fontWeight: 600 }}>Chọn Bệnh Nhân Nhận Đơn</span>} required>
                <Select
                  value={selectedProfile?.id}
                  onChange={(val) => handleSelectPatient(val)}
                  size="large"
                >
                  {profiles.map((p) => (
                    <Option key={p.id} value={p.id}>
                      {p.fullName} - {p.gender === 'FEMALE' ? 'Nữ' : 'Nam'} ({p.relationship || 'Bản thân'})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="medicalRecordId" label={<span style={{ fontWeight: 600 }}>Gắn Liền Đợt Bệnh Án</span>}>
                <Select placeholder="Chọn đợt bệnh án liên kết..." size="large">
                  {records.map((r) => (
                    <Option key={r.id} value={r.id}>
                      BA #{r.id} - {r.admissionDiagnosis || 'Khám chung'} ({r.hospitalName})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Hiển thị tiền sử dị ứng đã biết của bệnh nhân */}
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
            <Text strong style={{ marginRight: 8 }}>Tiền sử dị ứng đã ghi nhận của bệnh nhân:</Text>
            {patientAllergies.length === 0 ? (
              <Tag color="success">Không ghi nhận dị ứng thuốc</Tag>
            ) : (
              patientAllergies.map((a, i) => (
                <Tag color="error" key={i} style={{ fontWeight: 600 }}>
                  {a.allergen} ({a.severity || 'Nặng'})
                </Tag>
              ))
            )}
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* BẢNG KÊ THUỐC ĐỘNG */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0, color: '#0f766e' }}>
              Danh Mục Thuốc Kê Trong Đơn
            </Title>
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddMedicineRow}>
              Thêm Thuốc Mới
            </Button>
          </div>

          <Table
            dataSource={prescriptionItems}
            rowKey="id"
            pagination={false}
            size="middle"
            columns={[
              {
                title: 'Tên Thuốc (Biệt Dược / Hoạt Chất)',
                dataIndex: 'medicineName',
                key: 'medicineName',
                width: '30%',
                render: (_, record) => (
                  <AutoComplete
                    options={medicineOptions}
                    onSearch={handleSearchMedicine}
                    value={record.medicineName}
                    onChange={(val) => handleItemChange(record.id, 'medicineName', val)}
                    onSelect={(val, option) => {
                      handleItemChange(record.id, 'medicineName', val);
                      if (option.item?.activeIngredient) {
                        handleItemChange(record.id, 'activeIngredient', option.item.activeIngredient);
                      }
                    }}
                    placeholder="Gõ tên thuốc hoặc hoạt chất..."
                    style={{ width: '100%' }}
                  />
                ),
              },
              {
                title: 'Số Lượng',
                dataIndex: 'quantity',
                key: 'quantity',
                width: 100,
                render: (_, record) => (
                  <InputNumber
                    min={1}
                    value={record.quantity}
                    onChange={(val) => handleItemChange(record.id, 'quantity', val)}
                    style={{ width: '100%' }}
                  />
                ),
              },
              {
                title: 'Đơn Vị',
                dataIndex: 'unit',
                key: 'unit',
                width: 100,
                render: (_, record) => (
                  <Input
                    value={record.unit}
                    onChange={(e) => handleItemChange(record.id, 'unit', e.target.value)}
                  />
                ),
              },
              {
                title: 'Liều Dùng & Cách Dùng',
                dataIndex: 'instructions',
                key: 'instructions',
                render: (_, record) => (
                  <Input
                    value={record.instructions}
                    placeholder="vd: Uống 1 viên sau ăn no, sáng và tối"
                    onChange={(e) => handleItemChange(record.id, 'instructions', e.target.value)}
                  />
                ),
              },
              {
                title: 'Xóa',
                key: 'delete',
                width: 60,
                render: (_, record) => (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveMedicineRow(record.id)}
                    disabled={prescriptionItems.length === 1}
                  />
                ),
              },
            ]}
          />

          <Divider style={{ margin: '20px 0' }} />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="diagnosis" label={<span style={{ fontWeight: 600 }}>Chẩn Đoán Kèm Theo Đơn</span>}>
                <Input placeholder="Ví dụ: Tăng huyết áp độ 2, Rối loạn lipid máu" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="doctorAdvice" label={<span style={{ fontWeight: 600 }}>Lời Dặn Của Bác Sĩ</span>}>
                <Input placeholder="Uống nhiều nước, hạn chế ăn mặn, tập thể dục nhẹ nhàng..." size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 20, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
              style={{ background: '#0f766e', borderColor: '#0f766e', borderRadius: 8, fontWeight: 600 }}
            >
              Ký & Ban Hành Đơn Thuốc Điện Tử
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DoctorPrescriptionPage;
