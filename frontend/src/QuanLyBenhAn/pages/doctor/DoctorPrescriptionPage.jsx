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
  Modal,
  Spin,
  Segmented,
  Tooltip,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  MedicineBoxOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import prescriptionService from '../../services/prescriptionService';
import profileService from '../../services/profileService';
import catalogService from '../../services/catalogService';
import medicalRecordService from '../../services/medicalRecordService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const DoctorPrescriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Nguồn tra cứu thuốc: ALL | OPEN_FDA | NIH_RXTERMS | NATIONAL
  const [drugSource, setDrugSource] = useState('ALL');

  // Cảnh báo sốc phản vệ dị ứng chéo
  const [allergyAlerts, setAllergyAlerts] = useState([]);

  // Tra cứu thuốc autocomplete
  const [medicineOptions, setMedicineOptions] = useState([]);

  // Tra cứu bệnh WHO ICD-11 & ICD-10
  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [diagnosisValue, setDiagnosisValue] = useState('');

  // Modal Dược lý & An toàn FDA
  const [fdaModalVisible, setFdaModalVisible] = useState(false);
  const [fdaModalLoading, setFdaModalLoading] = useState(false);
  const [fdaDrugData, setFdaDrugData] = useState(null);

  // Thuật toán kiểm tra dị ứng chéo (Cross-Allergy Detector)
  const checkCrossAllergies = (items, allergies = patientAllergies) => {
    const warnings = [];
    if (!allergies || allergies.length === 0) {
      setAllergyAlerts([]);
      return;
    }

    const allergyNames = allergies.map((a) => (a.allergenName || a.allergen || '').toLowerCase());

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
        const aName = (a.allergenName || a.allergen || '').toLowerCase();
        if (aName && (medName.includes(aName) || activeName.includes(aName))) {
          warnings.push({
            medicine: item.medicineName,
            severity: a.severity || 'SEVERE',
            message: `CẢNH BÁO DỊ ỨNG: Bệnh nhân dị ứng với "${a.allergenName || a.allergen}" (${a.reactionSymptoms || a.reaction || 'Phản vệ'}). Không nên chỉ định ${item.medicineName}!`,
          });
        }
      });
    });

    setAllergyAlerts(warnings);
  };

  // Khi chọn bệnh nhân -> tải chi tiết dị ứng để kiểm tra chéo
  const handleSelectPatient = async (profileId, profList = profiles) => {
    const prof = profList.find((p) => p.id === profileId);
    setSelectedProfile(prof);
    try {
      const res = await profileService.getAllergies(profileId);
      const allergies = Array.isArray(res?.data) ? res.data : [];
      setPatientAllergies(allergies);
      checkCrossAllergies(prescriptionItems, allergies);
    } catch {
      setPatientAllergies([]);
    }
  };

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
          const targetId = location.state?.profileId || (list.length > 0 ? list[0].id : null);
          if (targetId) {
            form.setFieldsValue({ profileId: targetId });
            handleSelectPatient(targetId, list);
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
  }, [location.state?.profileId]);

  // Tra cứu thuốc thông minh từ các API (openFDA, NIH RxTerms, Bộ Y Tế)
  const handleSearchMedicine = async (query) => {
    if (!query || query.trim().length < 2) return;
    try {
      const res = await catalogService.searchExternalDrugs(query.trim(), drugSource);
      const list = res?.data || [];
      setMedicineOptions(
        list.map((m) => {
          let sourceBadge = <Tag color="blue">Bộ Y Tế</Tag>;
          if (m.source === 'OPEN_FDA') sourceBadge = <Tag color="cyan">openFDA</Tag>;
          if (m.source === 'NIH_RXTERMS') sourceBadge = <Tag color="purple">NIH RxTerms</Tag>;

          return {
            value: m.brandName || m.name || m.genericName,
            label: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{m.brandName || m.name}</strong>
                  {m.genericName && m.genericName !== m.brandName && (
                    <span style={{ color: '#475569', marginLeft: 6 }}>({m.genericName})</span>
                  )}
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Dạng: {m.dosageForm || 'Viên'} | Hàm lượng: {m.strength || '-'} | {m.manufacturer || ''}
                  </div>
                </div>
                <div>{sourceBadge}</div>
              </div>
            ),
            item: m,
          };
        })
      );
    } catch {
      setMedicineOptions([]);
    }
  };

  // Tra cứu bệnh & mã chẩn đoán từ WHO ICD-11 & ICD-10
  const handleSearchDisease = async (query) => {
    setDiagnosisValue(query);
    if (!query || query.trim().length < 2) return;
    try {
      const res = await catalogService.searchExternalDiseases(query.trim());
      const list = res?.data || [];
      setDiseaseOptions(
        list.map((d) => {
          const icd11Tag = d.icd11Code ? <Tag color="geekblue">ICD-11: {d.icd11Code}</Tag> : null;
          const icd10Tag = d.icd10Code ? <Tag color="green">ICD-10: {d.icd10Code}</Tag> : null;

          const displayLabel = (
            <div>
              <Space orientation="horizontal" size={4}>
                {icd11Tag}
                {icd10Tag}
                <strong>{d.diseaseNameVi || d.diseaseNameEn}</strong>
              </Space>
              {d.diseaseNameEn && d.diseaseNameVi && d.diseaseNameEn !== d.diseaseNameVi && (
                <div style={{ fontSize: 12, color: '#475569' }}>Tiếng Anh: {d.diseaseNameEn}</div>
              )}
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Chương: {d.chapter || 'Chẩn đoán chung'}</div>
            </div>
          );

          const insertValue = d.icd11Code
            ? `[ICD-11: ${d.icd11Code}${d.icd10Code ? ` / ICD-10: ${d.icd10Code}` : ''}] ${d.diseaseNameVi || d.diseaseNameEn}`
            : `[ICD-10: ${d.icd10Code}] ${d.diseaseNameVi || d.diseaseNameEn}`;

          return {
            value: insertValue,
            label: displayLabel,
            item: d,
          };
        })
      );
    } catch {
      setDiseaseOptions([]);
    }
  };

  // Mở Modal xem chi tiết an toàn dược lý openFDA
  const handleOpenFdaModal = async (drugName) => {
    if (!drugName) return;
    setFdaModalLoading(true);
    setFdaModalVisible(true);
    setFdaDrugData(null);
    try {
      const res = await catalogService.getDrugSafetyDetails(drugName);
      setFdaDrugData(res?.data || null);
    } catch (err) {
      notification.warning({
        message: 'Thông báo',
        description: 'Không thể tải nhãn thuốc FDA cho tên này. Vui lòng thử từ khóa tên hoạt chất.',
      });
    } finally {
      setFdaModalLoading(false);
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
      instructions: 'Uống sau ăn no',
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
        diagnosis: diagnosisValue || values.diagnosis || 'Theo dõi điều trị ngoại trú',
        doctorAdvice: values.doctorAdvice || 'Uống thuốc đúng giờ, kiêng rượu bia, tái khám khi có dấu hiệu bất thường',
        items: prescriptionItems.map((i) => ({
          medicineName: i.medicineName,
          activeIngredient: i.activeIngredient,
          strength: i.strength || 'Chuẩn',
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
              Kê Đơn Thuốc Điện Tử & Dược Thư Quốc Tế
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Tích hợp tra cứu openFDA Hoa Kỳ, NIH RxTerms & Danh mục bệnh WHO ICD-11
            </Text>
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

          {/* THANH CHỌN NGUỒN TRA CỨU THUỐC MỞ RỘNG */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <Title level={5} style={{ margin: 0, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MedicineBoxOutlined /> Danh Mục Thuốc Kê Trong Đơn
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Gõ tên thuốc để tìm kiếm tự động từ FDA Hoa Kỳ, NIH hoặc Dược thư Bộ Y Tế
              </Text>
            </div>

            <Space>
              <Text strong style={{ fontSize: 12, color: '#475569' }}>Nguồn dữ liệu:</Text>
              <Segmented
                value={drugSource}
                onChange={setDrugSource}
                options={[
                  { label: '🌐 Tất cả nguồn', value: 'ALL' },
                  { label: '🇺🇸 openFDA', value: 'OPEN_FDA' },
                  { label: '🔬 NIH RxTerms', value: 'NIH_RXTERMS' },
                  { label: '🇻🇳 Bộ Y Tế', value: 'NATIONAL' },
                ]}
              />
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddMedicineRow}>
                Thêm Thuốc Mới
              </Button>
            </Space>
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
                width: '32%',
                render: (_, record) => (
                  <div>
                    <AutoComplete
                      options={medicineOptions}
                      onSearch={handleSearchMedicine}
                      value={record.medicineName}
                      onChange={(val) => handleItemChange(record.id, 'medicineName', val)}
                      onSelect={(val, option) => {
                        handleItemChange(record.id, 'medicineName', val);
                        if (option.item?.activeIngredient || option.item?.genericName) {
                          handleItemChange(record.id, 'activeIngredient', option.item.activeIngredient || option.item.genericName);
                        }
                        if (option.item?.dosageForm) {
                          handleItemChange(record.id, 'unit', option.item.dosageForm.includes('Pill') || option.item.dosageForm.includes('Tab') ? 'Viên' : option.item.dosageForm);
                        }
                        if (option.item?.strength) {
                          handleItemChange(record.id, 'strength', option.item.strength);
                        }
                      }}
                      placeholder="Gõ tên thuốc hoặc hoạt chất (vd: Paracetamol, Amoxicillin, Amlodipine...)"
                      style={{ width: '100%' }}
                    />
                    {record.medicineName && record.medicineName.length >= 2 && (
                      <div style={{ marginTop: 4 }}>
                        <Button
                          type="link"
                          size="small"
                          icon={<SafetyCertificateOutlined />}
                          onClick={() => handleOpenFdaModal(record.activeIngredient || record.medicineName)}
                          style={{ padding: 0, fontSize: 12, color: '#0284c7' }}
                        >
                          Tra cứu Dược lý & An toàn FDA
                        </Button>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: 'Số Lượng',
                dataIndex: 'quantity',
                key: 'quantity',
                width: 90,
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
                    placeholder="Viên/Gói/Chai"
                    onChange={(e) => handleItemChange(record.id, 'unit', e.target.value)}
                  />
                ),
              },
              {
                title: 'Liều Dùng & Hướng Dẫn',
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
                title: 'Thao tác',
                key: 'actions',
                width: 90,
                align: 'center',
                render: (_, record) => (
                  <Space size="small">
                    <Tooltip title="Xem thông tin an toàn & tương tác thuốc từ FDA">
                      <Button
                        type="text"
                        icon={<InfoCircleOutlined style={{ color: '#0284c7' }} />}
                        onClick={() => handleOpenFdaModal(record.activeIngredient || record.medicineName)}
                        disabled={!record.medicineName}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa dòng thuốc này">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMedicineRow(record.id)}
                        disabled={prescriptionItems.length === 1}
                      />
                    </Tooltip>
                  </Space>
                ),
              },
            ]}
          />

          <Divider style={{ margin: '20px 0' }} />

          {/* CHẨN ĐOÁN KÈM THEO ĐƠN VỚI TÍCH HỢP WHO ICD-11 & ICD-10 */}
          <Row gutter={16}>
            <Col xs={24} md={14}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOutlined style={{ color: '#0f766e' }} />
                    Chẩn Đoán Bệnh Kèm Theo Đơn (Tra cứu WHO ICD-11 & ICD-10)
                  </span>
                }
              >
                <AutoComplete
                  options={diseaseOptions}
                  onSearch={handleSearchDisease}
                  value={diagnosisValue}
                  onChange={setDiagnosisValue}
                  placeholder="Gõ tên bệnh hoặc mã ICD (vd: Tăng huyết áp, tiểu đường, BA00, I10, hen, dạ dày...)"
                  size="large"
                  style={{ width: '100%' }}
                />
                <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>
                  Gợi ý chuẩn: <Tag color="geekblue">ICD-11</Tag> & <Tag color="green">ICD-10</Tag> tự động điền mã bệnh chính xác vào đơn thuốc.
                </div>
              </Form.Item>
            </Col>

            <Col xs={24} md={10}>
              <Form.Item name="doctorAdvice" label={<span style={{ fontWeight: 600 }}>Lời Dặn Của Bác Sĩ</span>}>
                <Input placeholder="Uống nhiều nước, hạn chế ăn mặn, tái khám đúng hẹn..." size="large" />
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

      {/* MODAL TRA CỨU DƯỢC LÝ & AN TOÀN THUỐC OPENFDA */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, color: '#0369a1' }}>
            <SafetyCertificateOutlined />
            <span>Thông Tin Dược Lý & An Toàn Thuốc (openFDA)</span>
          </div>
        }
        open={fdaModalVisible}
        onCancel={() => setFdaModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setFdaModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={850}
        destroyOnClose
      >
        {fdaModalLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 12, color: '#64748b' }}>Đang tra cứu dữ liệu từ FDA Hoa Kỳ...</div>
          </div>
        ) : fdaDrugData ? (
          <div>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên Biệt Dược / Thuốc" span={1}>
                <strong>{fdaDrugData.brandName || fdaDrugData.drugName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Hoạt Chất Chính (Generic)" span={1}>
                <Tag color="cyan">{fdaDrugData.genericName || fdaDrugData.drugName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đường Dùng (Route)" span={1}>
                {fdaDrugData.route || 'Đường uống (Oral)'}
              </Descriptions.Item>
              <Descriptions.Item label="Nhà Sản Xuất / Cấp Phép" span={1}>
                {fdaDrugData.manufacturer || 'US FDA Approved'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 8 }}>
              {/* CHỈ ĐỊNH ĐIỀU TRỊ */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: '#0369a1', fontSize: 14 }}>
                  📋 Chỉ Định Điều Trị (Indications & Usage):
                </Text>
                <Paragraph style={{ marginTop: 4, background: '#f0f9ff', padding: 10, borderRadius: 6, fontSize: 13 }}>
                  {fdaDrugData.indicationsAndUsage || 'Chỉ định theo phác đồ của bác sĩ chuyên khoa.'}
                </Paragraph>
              </div>

              {/* HƯỚNG DẪN LIỀU LƯỢNG */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: '#15803d', fontSize: 14 }}>
                  ⚖️ Hướng Dẫn Liều Dùng (Dosage & Administration):
                </Text>
                <Paragraph style={{ marginTop: 4, background: '#f0fdf4', padding: 10, borderRadius: 6, fontSize: 13 }}>
                  {fdaDrugData.dosageAndAdministration || 'Dùng theo chỉ định của bác sĩ điều trị.'}
                </Paragraph>
              </div>

              {/* TƯƠNG TÁC THUỐC */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: '#b45309', fontSize: 14 }}>
                  ⚠️ Tương Tác Thuốc Cần Lưu Ý (Drug Interactions):
                </Text>
                <Paragraph style={{ marginTop: 4, background: '#fffbeb', padding: 10, borderRadius: 6, fontSize: 13 }}>
                  {fdaDrugData.drugInteractions || 'Tham khảo kỹ bảng tương tác thuốc khi dùng đồng thời với các kháng sinh, thuốc hạ huyết áp hoặc thuốc ức chế enzym.'}
                </Paragraph>
              </div>

              {/* CHỐNG CHỈ ĐỊNH */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: '#b91c1c', fontSize: 14 }}>
                  🚫 Chống Chỉ Định (Contraindications):
                </Text>
                <Paragraph style={{ marginTop: 4, background: '#fef2f2', padding: 10, borderRadius: 6, fontSize: 13 }}>
                  {fdaDrugData.contraindications || 'Chống chỉ định đối với bệnh nhân mẫn cảm hoặc dị ứng với các thành phần của thuốc.'}
                </Paragraph>
              </div>

              {/* CẢNH BÁO & THẬN TRỌNG */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: '#c2410c', fontSize: 14 }}>
                  🚨 Cảnh Báo & Thận Trọng (Warnings & Precautions):
                </Text>
                <Paragraph style={{ marginTop: 4, background: '#fff7ed', padding: 10, borderRadius: 6, fontSize: 13 }}>
                  {fdaDrugData.warningsAndPrecautions || 'Kiểm tra chức năng gan thận đối với bệnh nhân dùng thuốc dài ngày.'}
                </Paragraph>
              </div>

              {/* TÁC DỤNG PHỤ */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: '#475569', fontSize: 14 }}>
                  🩺 Tác Dụng Phụ Có Thể Gặp (Adverse Reactions):
                </Text>
                <Paragraph style={{ marginTop: 4, background: '#f8fafc', padding: 10, borderRadius: 6, fontSize: 13 }}>
                  {fdaDrugData.adverseReactions || 'Có thể gây rối loạn tiêu hóa nhẹ, buồn nôn, chóng mặt thoáng qua.'}
                </Paragraph>
              </div>

              {/* THAI KỲ & BẢO QUẢN */}
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong style={{ fontSize: 13 }}>Phụ nữ mang thai & cho con bú:</Text>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                    {fdaDrugData.pregnancyWarning || 'Cân nhắc lợi ích và nguy cơ trước khi chỉ định.'}
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong style={{ fontSize: 13 }}>Bảo quản:</Text>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                    {fdaDrugData.storageAndHandling || 'Nơi khô mát, nhiệt độ dưới 30°C.'}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b' }}>
            Không tìm thấy thông tin chi tiết trên openFDA cho từ khóa này.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPrescriptionPage;
