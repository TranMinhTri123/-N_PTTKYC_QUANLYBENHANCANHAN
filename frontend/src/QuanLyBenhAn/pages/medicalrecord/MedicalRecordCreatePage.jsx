import React, { useState, useEffect } from 'react';
import { Steps, Form, Input, Button, Select, DatePicker, Row, Col, Card, Typography, Alert, Tag, Modal, Divider, Space, notification } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CalculatorOutlined, PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import medicalRecordService from '../../services/medicalRecordService';
import profileService from '../../services/profileService';
import { calculateBmi, calculateNaegeleEdd, calculateGestationalAgeWeeks } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const MedicalRecordCreatePage = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [profileForm] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Modal thêm nhanh hồ sơ người bệnh
  const [quickProfileModalOpen, setQuickProfileModalOpen] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);

  // State live calculations
  const [bmiResult, setBmiResult] = useState({ bmi: null, classification: '', tagColor: 'default' });
  const [selectedRecordType, setSelectedRecordType] = useState('INTERNAL');
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [naegeleEdd, setNaegeleEdd] = useState(null);
  const [gestationalAge, setGestationalAge] = useState(null);

  const getRecordTypeLabel = (type) => {
    const map = {
      INTERNAL: 'Nội Khoa (MS: 01/BV-01)',
      SURGICAL: 'Ngoại Khoa (MS: 10/BV-01)',
      PEDIATRIC: 'Nhi Khoa (MS: 02/BV-01)',
      OBSTETRIC: 'Sản Khoa (Quy chuẩn Sản khoa)',
      GENERAL: 'Khám Bệnh Chung',
    };
    return map[type] || type || 'Nội Khoa';
  };

  const fetchProfiles = async () => {
    try {
      const res = await profileService.getProfiles();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setProfiles(list);

      const initialProfileId = searchParams.get('profileId');
      if (initialProfileId) {
        const idNum = Number(initialProfileId);
        setSelectedProfileId(idNum);
        form.setFieldsValue({ profileId: idNum });
      } else if (list.length > 0) {
        const selfProfile = list.find((p) => p.relationship === 'SELF');
        const chosenId = selfProfile ? selfProfile.id : list[0].id;
        setSelectedProfileId(chosenId);
        form.setFieldsValue({ profileId: chosenId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleGoToStep = async (targetStep) => {
    if (targetStep > currentStep) {
      if (currentStep === 0) {
        try {
          await form.validateFields(['profileId', 'recordType', 'visitDate', 'hospitalName', 'chiefComplaint']);
        } catch (err) {
          notification.warning({
            message: 'Thông tin chưa đầy đủ',
            description: 'Vui lòng chọn Người bệnh và điền đầy đủ các thông tin bắt buộc tại bước 1 trước khi tiếp tục!',
          });
          return;
        }
      }
    }
    setCurrentStep(targetStep);
  };

  // Khởi tạo nhanh hồ sơ cho chính chủ tài khoản (1-click)
  const handleQuickCreateSelfProfile = async () => {
    setCreatingProfile(true);
    try {
      const payload = {
        fullName: user?.fullName || 'Bản thân (Tôi)',
        dateOfBirth: '1995-05-21',
        gender: 'MALE',
        relationship: 'SELF',
        ethnicity: 'Kinh',
        nationality: 'Việt Nam',
        addressDetail: 'TP. Hồ Chí Minh',
      };
      const res = await profileService.createProfile(payload);
      notification.success({
        message: 'Khởi tạo thành công',
        description: `Đã tạo hồ sơ cho ${res?.data?.fullName || 'bản thân'} và chọn vào đợt khám!`,
      });
      await fetchProfiles();
      if (res?.data?.id) {
        setSelectedProfileId(res.data.id);
        form.setFieldsValue({ profileId: res.data.id });
      }
    } catch (err) {
      notification.error({
        message: 'Khởi tạo thất bại',
        description: err.message || 'Không thể tạo hồ sơ tự động.',
      });
    } finally {
      setCreatingProfile(false);
    }
  };

  // Tạo hồ sơ người bệnh mới qua modal
  const handleSaveQuickProfile = async (values) => {
    setCreatingProfile(true);
    try {
      const payload = {
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        gender: values.gender,
        relationship: values.relationship,
        bloodType: values.bloodType,
        cccd: values.cccd,
        bhytNumber: values.bhytNumber,
        addressDetail: values.addressDetail || 'Việt Nam',
      };
      const res = await profileService.createProfile(payload);
      notification.success({
        message: 'Thêm hồ sơ thành công',
        description: `Đã tạo hồ sơ "${res?.data?.fullName}" và chọn vào đợt khám!`,
      });
      setQuickProfileModalOpen(false);
      profileForm.resetFields();
      await fetchProfiles();
      if (res?.data?.id) {
        setSelectedProfileId(res.data.id);
        form.setFieldsValue({ profileId: res.data.id });
      }
    } catch (err) {
      notification.error({
        message: 'Thêm hồ sơ thất bại',
        description: err.message || 'Vui lòng kiểm tra lại thông tin.',
      });
    } finally {
      setCreatingProfile(false);
    }
  };

  const getRelationshipLabel = (rel) => {
    const map = {
      SELF: 'Bản thân (Chủ tài khoản)',
      CHILD: 'Con cái',
      PARENT: 'Bố / Mẹ',
      SPOUSE: 'Vợ / Chồng',
      OTHER: 'Người thân khác',
    };
    return map[rel] || rel || 'Khác';
  };

  // Tính BMI live khi gõ chiều cao hoặc cân nặng
  const handleVitalsChange = () => {
    try {
      const height = Number(form.getFieldValue('heightCm'));
      const weight = Number(form.getFieldValue('weightKg'));
      if (!isNaN(height) && !isNaN(weight) && height > 0 && weight > 0) {
        const res = calculateBmi(height, weight);
        setBmiResult(res || { bmi: null, classification: '', tagColor: 'default' });
      } else {
        setBmiResult({ bmi: null, classification: '', tagColor: 'default' });
      }
    } catch (e) {
      console.error('BMI Calculation Error:', e);
      setBmiResult({ bmi: null, classification: '', tagColor: 'default' });
    }
  };

  // Tính Naegele live khi chọn ngày kinh cuối (LMP)
  const handleLmpChange = (date) => {
    if (date) {
      const edd = calculateNaegeleEdd(date);
      const weeks = calculateGestationalAgeWeeks(date);
      setNaegeleEdd(edd);
      setGestationalAge(weeks);
    } else {
      setNaegeleEdd(null);
      setGestationalAge(null);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const allValues = { ...form.getFieldsValue(true), ...values };

      const finalProfileId = allValues.profileId || form.getFieldValue('profileId') || selectedProfileId || profiles[0]?.id;
      const finalRecordType = allValues.recordType || form.getFieldValue('recordType') || selectedRecordType || 'INTERNAL';

      if (!finalProfileId) {
        notification.error({
          message: 'Chưa chọn người bệnh',
          description: 'Vui lòng quay lại Bước 1 và chọn hoặc tạo mới hồ sơ người bệnh!',
        });
        setCurrentStep(0);
        setSubmitting(false);
        return;
      }

      const rawVisitDate = allValues.visitDate || form.getFieldValue('visitDate');
      const formattedVisitDate = rawVisitDate
        ? (dayjs.isDayjs(rawVisitDate) ? rawVisitDate.format('YYYY-MM-DD') : String(rawVisitDate))
        : dayjs().format('YYYY-MM-DD');

      const payload = {
        profileId: Number(finalProfileId),
        recordType: finalRecordType,
        hospitalName: allValues.hospitalName || form.getFieldValue('hospitalName') || 'Bệnh viện Đa khoa',
        admissionType: allValues.admissionType || form.getFieldValue('admissionType') || 'OUTPATIENT',
        departmentName: allValues.departmentName || form.getFieldValue('departmentName') || 'Khoa Khám Bệnh',
        attendingDoctor: allValues.treatingDoctor || allValues.attendingDoctor || form.getFieldValue('treatingDoctor') || 'BS. CK1 Nguyễn Văn Tuấn',
        chiefComplaint: allValues.chiefComplaint || form.getFieldValue('chiefComplaint') || 'Khám kiểm tra sức khỏe',
        visitDate: formattedVisitDate,
        primaryDiagnosis: allValues.primaryDiagnosis || form.getFieldValue('primaryDiagnosis') || 'Theo dõi sức khỏe',
        primaryIcd10: allValues.primaryIcd10 || form.getFieldValue('primaryIcd10') || null,
        treatmentPlan: allValues.treatmentPlan || form.getFieldValue('treatmentPlan') || '',
        followUpInstructions: allValues.followUpInstructions || form.getFieldValue('followUpInstructions') || '',
        vitalSigns: {
          pulse: allValues.pulse ? Number(allValues.pulse) : null,
          temperature: allValues.temperature ? Number(allValues.temperature) : null,
          systolicBp: allValues.systolicBp ? Number(allValues.systolicBp) : null,
          diastolicBp: allValues.diastolicBp ? Number(allValues.diastolicBp) : null,
          heightCm: allValues.heightCm ? Number(allValues.heightCm) : null,
          weightKg: allValues.weightKg ? Number(allValues.weightKg) : null,
          spo2: allValues.spo2 ? Number(allValues.spo2) : null,
        },
      };

      // Tùy theo chuyên khoa
      if (finalRecordType === 'INTERNAL') {
        payload.internalDetail = {
          circulatorySystem: allValues.circulatorySystem,
          respiratorySystem: allValues.respiratorySystem,
          digestiveSystem: allValues.digestiveSystem,
          chronicConditionSummary: allValues.chronicConditionSummary,
        };
      } else if (finalRecordType === 'SURGICAL') {
        payload.surgicalDetail = {
          preOpDiagnosis: allValues.preOpDiagnosis,
          postOpDiagnosis: allValues.postOpDiagnosis,
          anesthesiaMethod: allValues.anesthesiaMethod,
          postOpMonitoring: allValues.postOpMonitoring,
        };
      } else if (finalRecordType === 'PEDIATRIC') {
        payload.pediatricDetail = {
          birthWeightGrams: allValues.birthWeightGrams ? Number(allValues.birthWeightGrams) : null,
          apgar1min: allValues.apgar1min ? Number(allValues.apgar1min) : null,
          apgar5min: allValues.apgar5min ? Number(allValues.apgar5min) : null,
          feedingRegimen: allValues.feedingRegimen,
        };
      } else if (finalRecordType === 'OBSTETRIC') {
        const rawLmp = allValues.lmpDate || form.getFieldValue('lmpDate');
        payload.obstetricDetail = {
          lmpDate: rawLmp ? (dayjs.isDayjs(rawLmp) ? rawLmp.format('YYYY-MM-DD') : String(rawLmp)) : null,
          eddDate: naegeleEdd,
          gestationalAgeWeeks: gestationalAge,
          paraTerm: allValues.paraTerm ? Number(allValues.paraTerm) : 0,
          paraPreterm: allValues.paraPreterm ? Number(allValues.paraPreterm) : 0,
          paraAbortion: allValues.paraAbortion ? Number(allValues.paraAbortion) : 0,
          paraLiving: allValues.paraLiving ? Number(allValues.paraLiving) : 0,
        };
      }

      const res = await medicalRecordService.createMedicalRecord(payload);
      notification.success({
        message: 'Tạo bệnh án thành công!',
        description: `Mã bệnh án: ${res?.data?.medicalRecordCode}`,
      });

      navigate('/medical-records');
    } catch (err) {
      notification.error({
        message: 'Tạo bệnh án thất bại',
        description: err.message || 'Vui lòng kiểm tra lại dữ liệu.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/medical-records')} style={{ marginBottom: 16 }}>
        Quay lại danh sách bệnh án
      </Button>

      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Tạo Đợt Bệnh Án Mới
        </Title>
        <Text type="secondary">
          Nhập liệu theo chuẩn biểu mẫu Bộ Y Tế Việt Nam tích hợp thuật toán tính toán tự động
        </Text>
      </div>

      <Steps
        current={currentStep}
        onChange={handleGoToStep}
        style={{ marginBottom: 32 }}
        items={[
          { title: 'Hành Chính & Khám' },
          { title: 'Sinh Hiệu (Auto BMI)' },
          { title: 'Biểu Mẫu Chuyên Khoa' },
          { title: 'Chẩn Đoán & Hoàn Tất' },
        ]}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        preserve={true}
        size="large"
        onValuesChange={(changedValues) => {
          if ('heightCm' in changedValues || 'weightKg' in changedValues) {
            handleVitalsChange();
          }
          if ('profileId' in changedValues) {
            setSelectedProfileId(changedValues.profileId);
          }
          if ('recordType' in changedValues) {
            setSelectedRecordType(changedValues.recordType);
          }
        }}
        initialValues={{
          recordType: 'INTERNAL',
          hospitalName: 'Bệnh viện Đa khoa',
          admissionType: 'OUTPATIENT',
          visitDate: dayjs(),
        }}
      >
        {/* Bước 0: Hành chính */}
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <Card title="1. Thông Tin Hành Chính & Tiếp Nhận" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>
                    <span style={{ color: '#ff4d4f' }}>* </span>Người bệnh (Bản thân hoặc người thân)
                  </span>
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      profileForm.resetFields();
                      setQuickProfileModalOpen(true);
                    }}
                    style={{ padding: 0, fontWeight: 600 }}
                  >
                    + Nhập hồ sơ mới tại đây
                  </Button>
                </div>
                <Form.Item
                  name="profileId"
                  rules={[{ required: true, message: 'Vui lòng chọn người bệnh!' }]}
                  style={{ marginBottom: profiles.length === 0 ? 8 : 24 }}
                >
                  <Select
                    placeholder="Chọn người bệnh (Bản thân hoặc người thân)..."
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ padding: '4px 8px' }}>
                          <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => {
                              profileForm.resetFields();
                              setQuickProfileModalOpen(true);
                            }}
                            style={{ width: '100%', color: '#0284c7', borderColor: '#38bdf8' }}
                          >
                            + Nhập thông tin người bệnh mới ngay tại đây
                          </Button>
                        </div>
                      </>
                    )}
                  >
                    {(Array.isArray(profiles) ? profiles : []).map((p) => {
                      const isSelf = p.relationship === 'SELF';
                      return (
                        <Option key={p.id} value={p.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                              <strong>{p.fullName}</strong>
                              {isSelf ? (
                                <Tag color="blue" style={{ marginLeft: 8 }}>Bản thân (Chủ tài khoản)</Tag>
                              ) : (
                                <Tag color="cyan" style={{ marginLeft: 8 }}>{getRelationshipLabel(p.relationship)}</Tag>
                              )}
                            </span>
                            <span style={{ color: '#64748b', fontSize: 12 }}>
                              {p.gender === 'FEMALE' ? 'Nữ' : 'Nam'}
                            </span>
                          </div>
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                {profiles.length === 0 && (
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 24, borderRadius: 8 }}
                    message="Chưa có hồ sơ người bệnh trong hệ thống"
                    description={
                      <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Button
                          type="primary"
                          size="small"
                          loading={creatingProfile}
                          onClick={handleQuickCreateSelfProfile}
                        >
                          Khởi tạo nhanh hồ sơ cho chính tôi ({user?.fullName || 'Bản thân'})
                        </Button>
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            profileForm.resetFields();
                            setQuickProfileModalOpen(true);
                          }}
                        >
                          Nhập hồ sơ đầy đủ
                        </Button>
                      </div>
                    }
                  />
                )}
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="recordType"
                  label={<span style={{ fontWeight: 600 }}>Chuyên khoa điều trị</span>}
                  rules={[{ required: true }]}
                >
                  <Select
                    onChange={(val) => setSelectedRecordType(val)}
                  >
                    <Option value="INTERNAL">Nội Khoa (MS: 01/BV-01)</Option>
                    <Option value="SURGICAL">Ngoại Khoa (MS: 10/BV-01)</Option>
                    <Option value="PEDIATRIC">Nhi Khoa (MS: 02/BV-01)</Option>
                    <Option value="OBSTETRIC">Sản Khoa (Quy chuẩn Sản khoa)</Option>
                    <Option value="GENERAL">Khám Bệnh Chung</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="visitDate"
                  label={<span style={{ fontWeight: 600 }}>Ngày vào viện / Khám</span>}
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày khám!' },
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        if (value.isAfter(dayjs(), 'day')) {
                          return Promise.reject(new Error('Ngày khám / vào viện không thể ở trong tương lai!'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày khám"
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="treatingDoctor" label={<span style={{ fontWeight: 600 }}>Bác sĩ điều trị</span>}>
                  <Input placeholder="BS. CK1 Nguyễn Văn Tuấn" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="hospitalName"
                  label={<span style={{ fontWeight: 600 }}>Cơ sở y tế / Bệnh viện</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập tên bệnh viện/cơ sở y tế!' }]}
                >
                  <Input placeholder="Bệnh viện Đa khoa Trung ương" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="admissionType"
                  label={<span style={{ fontWeight: 600 }}>Hình thức điều trị</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn hình thức điều trị!' }]}
                >
                  <Select>
                    <Option value="OUTPATIENT">Khám Ngoại Trú (Khám định kỳ / KKB)</Option>
                    <Option value="INPATIENT">Điều Trị Nội Trú (Nằm viện)</Option>
                    <Option value="EMERGENCY">Cấp Cứu Ban Đầu</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="chiefComplaint"
              label={<span style={{ fontWeight: 600 }}>Lý do vào viện / Triệu chứng chính</span>}
              rules={[{ required: true, message: 'Vui lòng nhập lý do khám!' }]}
            >
              <TextArea placeholder="Đau đầu, chóng mặt từng cơn kéo dài 3 ngày..." rows={3} />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Button type="primary" onClick={() => handleGoToStep(1)}>
                Tiếp tục: Đo Sinh Hiệu
              </Button>
            </div>
          </Card>
        </div>

        {/* Bước 1: Sinh hiệu & Tự tính BMI */}
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Card title="2. Diễn Tiến Sinh Hiệu Lâm Sàng & Tự Động Tính BMI" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item
                  name="heightCm"
                  label={<span style={{ fontWeight: 600 }}>Chiều cao (cm)</span>}
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const h = Number(value);
                        if (h < 30 || h > 250) return Promise.reject(new Error('Chiều cao phải từ 30 đến 250 cm!'));
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="165" type="number" min={30} max={250} onChange={handleVitalsChange} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="weightKg"
                  label={<span style={{ fontWeight: 600 }}>Cân nặng (kg)</span>}
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const w = Number(value);
                        if (w < 1 || w > 350) return Promise.reject(new Error('Cân nặng phải từ 1 đến 350 kg!'));
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="60" type="number" min={1} max={350} step="0.1" onChange={handleVitalsChange} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: 8, border: '1px solid #bae6fd', height: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <CalculatorOutlined style={{ fontSize: 28, color: '#0284c7' }} />
                  <div>
                    <Text strong style={{ fontSize: 15 }}>Chỉ Số BMI Tự Tính: </Text>
                    {bmiResult && bmiResult.bmi ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>{bmiResult.bmi}</span>
                        <Tag color={bmiResult.tagColor || 'default'} style={{ fontSize: 13, padding: '2px 8px' }}>
                          {bmiResult.classification || 'Bình thường'}
                        </Tag>
                      </div>
                    ) : (
                      <Text type="secondary">Nhập chiều cao và cân nặng để tự động tính</Text>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col xs={12} md={6}>
                <Form.Item
                  name="pulse"
                  label={<span style={{ fontWeight: 600 }}>Mạch (lần/phút)</span>}
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const p = Number(value);
                        if (p < 30 || p > 220) return Promise.reject(new Error('Mạch phải từ 30 đến 220 lần/phút!'));
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="78" type="number" min={30} max={220} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="temperature"
                  label={<span style={{ fontWeight: 600 }}>Nhiệt độ (°C)</span>}
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const t = Number(value);
                        if (t < 34 || t > 43) return Promise.reject(new Error('Nhiệt độ phải từ 34.0 đến 43.0 °C!'));
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="36.8" type="number" step="0.1" min={34} max={43} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="systolicBp"
                  label={<span style={{ fontWeight: 600 }}>Huyết áp tâm thu (mmHg)</span>}
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const s = Number(value);
                        if (s < 50 || s > 260) return Promise.reject(new Error('Tâm thu phải từ 50 đến 260 mmHg!'));
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="120" type="number" min={50} max={260} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="diastolicBp"
                  label={<span style={{ fontWeight: 600 }}>Huyết áp tâm trương (mmHg)</span>}
                  dependencies={['systolicBp']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const d = Number(value);
                        const s = Number(getFieldValue('systolicBp'));
                        if (d < 30 || d > 160) return Promise.reject(new Error('Tâm trương phải từ 30 đến 160 mmHg!'));
                        if (s && d >= s) return Promise.reject(new Error('Tâm thu phải lớn hơn tâm trương!'));
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="80" type="number" min={30} max={160} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item
                  name="spo2"
                  label={<span style={{ fontWeight: 600 }}>Nồng độ Oxy SpO2 (%)</span>}
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const sp = Number(value);
                        if (sp < 50 || sp > 100) return Promise.reject(new Error('SpO2 phải từ 50% đến 100%!'));
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="98" type="number" min={50} max={100} />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <Button onClick={() => handleGoToStep(0)}>Quay lại</Button>
              <Button type="primary" onClick={() => handleGoToStep(2)}>
                Tiếp tục: Biểu Mẫu Chuyên Khoa
              </Button>
            </div>
          </Card>
        </div>

        {/* Bước 2: Biểu mẫu chuyên khoa tương ứng */}
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <Card title={`3. Biểu Mẫu Khám Chuyên Khoa: ${getRecordTypeLabel(selectedRecordType)}`} style={{ borderRadius: 12 }}>
            {selectedRecordType === 'INTERNAL' && (
              <div>
                <Alert message="Khám lâm sàng 7 hệ cơ quan theo biểu mẫu MS: 01/BV-01 Bộ Y Tế" type="info" style={{ marginBottom: 16 }} showIcon />
                <Form.Item name="circulatorySystem" label="Hệ tuần hoàn (Tim mạch)">
                  <TextArea placeholder="Tim đều, T1 T2 rõ, không âm thổi bệnh lý..." rows={2} />
                </Form.Item>
                <Form.Item name="respiratorySystem" label="Hệ hô hấp (Phổi)">
                  <TextArea placeholder="Rì rào phế nang êm dịu 2 phế trường, không rale..." rows={2} />
                </Form.Item>
                <Form.Item name="digestiveSystem" label="Hệ tiêu hóa (Bụng)">
                  <TextArea placeholder="Bụng mềm, không chướng, gan lách không sờ chạm..." rows={2} />
                </Form.Item>
                <Form.Item name="chronicConditionSummary" label="Tóm tắt bệnh mạn tính kết hợp">
                  <TextArea placeholder="Tiền sử tăng huyết áp 3 năm..." rows={2} />
                </Form.Item>
              </div>
            )}

            {selectedRecordType === 'SURGICAL' && (
              <div>
                <Alert message="Biểu mẫu Phẫu thuật - Hậu phẫu theo MS: 10/BV-01 Bộ Y Tế" type="warning" style={{ marginBottom: 16 }} showIcon />
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="preOpDiagnosis" label="Chẩn đoán trước mổ">
                      <Input placeholder="Viêm ruột thừa cấp giờ thứ 12" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="postOpDiagnosis" label="Chẩn đoán sau mổ">
                      <Input placeholder="Viêm ruột thừa mủ hoại tử" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="anesthesiaMethod" label="Phương pháp vô cảm (Gây mê/tê)">
                  <Input placeholder="Mê nội khí quản / Tê tủy sống" />
                </Form.Item>
                <Form.Item name="postOpMonitoring" label="Theo dõi diễn tiến vết mổ & dẫn lưu">
                  <TextArea placeholder="Vết mổ khô, chân chỉ sạch, dẫn lưu ra 15ml dịch hồng..." rows={2} />
                </Form.Item>
              </div>
            )}

            {selectedRecordType === 'PEDIATRIC' && (
              <div>
                <Alert message="Biểu mẫu Nhi khoa theo MS: 02/BV-01 Bộ Y Tế" type="success" style={{ marginBottom: 16 }} showIcon />
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="birthWeightGrams" label="Cân nặng lúc sinh (gram)">
                      <Input placeholder="3200" type="number" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="apgar1min" label="Chỉ số Apgar 1 phút">
                      <Input placeholder="8" type="number" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="apgar5min" label="Chỉ số Apgar 5 phút">
                      <Input placeholder="10" type="number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="feedingRegimen" label="Chế độ nuôi dưỡng hiện tại">
                  <Input placeholder="Sữa mẹ hoàn toàn / Sữa công thức" />
                </Form.Item>
              </div>
            )}

            {selectedRecordType === 'OBSTETRIC' && (
              <div>
                <Alert message="Quy chuẩn Sản khoa: Tự động tính ngày dự sinh theo công thức Naegele" type="error" style={{ marginBottom: 16 }} showIcon />
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="lmpDate"
                      label="Ngày đầu kỳ kinh cuối (LMP)"
                      rules={[
                        () => ({
                          validator(_, value) {
                            if (!value) return Promise.resolve();
                            if (value.isAfter(dayjs(), 'day')) {
                              return Promise.reject(new Error('Ngày kinh cuối không thể ở trong tương lai!'));
                            }
                            if (value.isBefore(dayjs().subtract(44, 'week'))) {
                              return Promise.reject(new Error('Ngày kinh cuối phải trong vòng 44 tuần gần nhất!'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày LMP"
                        disabledDate={(current) => current && (current > dayjs().endOf('day') || current < dayjs().subtract(44, 'week'))}
                        onChange={handleLmpChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <div style={{ background: '#fdf2f8', padding: '16px', borderRadius: 8, border: '1px solid #fbcfe8' }}>
                      <Text strong style={{ color: '#be185d' }}>Công Thức Naegele Tự Tính:</Text>
                      <div style={{ marginTop: 6 }}>
                        <div>Ngày dự sinh (EDD): <strong>{naegeleEdd ? formatVnDate(naegeleEdd) : '—'}</strong></div>
                        <div>Tuổi thai: <strong>{gestationalAge ? `${gestationalAge} tuần` : '—'}</strong></div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div style={{ marginTop: 12 }}>
                  <Text strong>Tiền sử sản khoa PARA 4 số:</Text>
                  <Row gutter={12} style={{ marginTop: 8 }}>
                    <Col span={6}>
                      <Form.Item name="paraTerm" label="Sinh đủ tháng (P)">
                        <Input placeholder="0" type="number" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="paraPreterm" label="Sinh non (A)">
                        <Input placeholder="0" type="number" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="paraAbortion" label="Sảy / Hút (R)">
                        <Input placeholder="0" type="number" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="paraLiving" label="Con sống (A)">
                        <Input placeholder="0" type="number" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {selectedRecordType === 'GENERAL' && (
              <div>
                <Form.Item name="treatmentPlan" label="Nhận xét lâm sàng chung">
                  <TextArea placeholder="Khám thể lực và các cơ quan không ghi nhận bất thường..." rows={3} />
                </Form.Item>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <Button onClick={() => handleGoToStep(1)}>Quay lại</Button>
              <Button type="primary" onClick={() => handleGoToStep(3)}>
                Tiếp tục: Chẩn Đoán & Lưu
              </Button>
            </div>
          </Card>
        </div>

        {/* Bước 3: Chẩn đoán & Hoàn tất */}
        <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
          <Card title="4. Chẩn Đoán ICD-10 & Phác Đồ Điều Trị" style={{ borderRadius: 12 }}>
            {/* Tóm tắt thông tin hành chính đã nhập để người dùng luôn kiểm tra được */}
            {(() => {
              const currentPatient = profiles.find((p) => p.id === (form.getFieldValue('profileId') || selectedProfileId));
              return (
                <Card
                  size="small"
                  style={{
                    marginBottom: 20,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text strong style={{ color: '#0f172a', fontSize: 14 }}>
                      Thông tin bệnh án tiếp nhận đã chọn
                    </Text>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleGoToStep(0)}
                      style={{ padding: 0, fontWeight: 600 }}
                    >
                      Chỉnh sửa thông tin hành chính
                    </Button>
                  </div>
                  <Row gutter={[16, 10]}>
                    <Col xs={24} sm={12} md={6}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Người bệnh:</Text>
                      <div style={{ marginTop: 2 }}>
                        {currentPatient ? (
                          <>
                            <Text strong>{currentPatient.fullName}</Text>{' '}
                            <Tag color={currentPatient.relationship === 'SELF' ? 'blue' : 'cyan'}>
                              {getRelationshipLabel(currentPatient.relationship)}
                            </Tag>
                          </>
                        ) : (
                          <Text type="danger">Chưa chọn (Quay lại bước 1 để chọn)</Text>
                        )}
                      </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Chuyên khoa điều trị:</Text>
                      <div style={{ marginTop: 2 }}>
                        <Tag color="geekblue">
                          {getRecordTypeLabel(form.getFieldValue('recordType') || selectedRecordType)}
                        </Tag>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Cơ sở khám:</Text>
                      <div style={{ marginTop: 2, fontWeight: 600, color: '#334155' }}>
                        {form.getFieldValue('hospitalName') || 'Bệnh viện Đa khoa'}
                      </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Ngày vào viện / Khám:</Text>
                      <div style={{ marginTop: 2, fontWeight: 600, color: '#334155' }}>
                        {form.getFieldValue('visitDate') ? dayjs(form.getFieldValue('visitDate')).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY')}
                      </div>
                    </Col>
                  </Row>
                </Card>
              );
            })()}

            <Row gutter={16}>
              <Col xs={24} md={16}>
                <Form.Item
                  name="primaryDiagnosis"
                  label={<span style={{ fontWeight: 600 }}>Chẩn đoán xác định</span>}
                  rules={[{ required: true, message: 'Nhập chẩn đoán!' }]}
                >
                  <Input placeholder="Tăng huyết áp vô căn / Viêm dạ dày ruột cấp..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="primaryIcd10" label={<span style={{ fontWeight: 600 }}>Mã ICD-10 (Nếu có)</span>}>
                  <Input placeholder="I10, E11, K29..." />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="treatmentPlan" label={<span style={{ fontWeight: 600 }}>Kế hoạch điều trị</span>}>
              <TextArea placeholder="Nghỉ ngơi, dùng thuốc theo đơn, hạn chế muối..." rows={3} />
            </Form.Item>

            <Form.Item name="followUpInstructions" label={<span style={{ fontWeight: 600 }}>Lời dặn dò tái khám</span>}>
              <TextArea placeholder="Tái khám sau 1 tuần hoặc khi có dấu hiệu sốt cao, đau đầu dữ dội..." rows={2} />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Button onClick={() => handleGoToStep(2)}>Quay lại</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                loading={submitting}
                style={{ height: 44, fontWeight: 700, padding: '0 32px' }}
              >
                Hoàn Tất & Lưu Bệnh Án
              </Button>
            </div>
          </Card>
        </div>
      </Form>

      {/* Modal Nhập Hồ Sơ Người Bệnh Mới Trực Tiếp */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserAddOutlined style={{ color: '#0284c7', fontSize: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 17 }}>Nhập Hồ Sơ Người Bệnh Mới</span>
          </div>
        }
        open={quickProfileModalOpen}
        onCancel={() => setQuickProfileModalOpen(false)}
        footer={null}
        destroyOnClose
        width={560}
      >
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
          Nhập thông tin hồ sơ sức khỏe cho bản thân hoặc người thân. Sau khi lưu, hệ thống sẽ tự động chọn hồ sơ này vào đợt khám bệnh án hiện tại.
        </p>
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleSaveQuickProfile}
          initialValues={{
            relationship: profiles.some((p) => p.relationship === 'SELF') ? 'CHILD' : 'SELF',
            gender: 'MALE',
            bloodType: 'O',
            fullName: profiles.some((p) => p.relationship === 'SELF') ? '' : user?.fullName || '',
          }}
        >
          <Form.Item
            name="relationship"
            label={<span style={{ fontWeight: 600 }}>Mối quan hệ với chủ tài khoản</span>}
            rules={[{ required: true, message: 'Vui lòng chọn mối quan hệ!' }]}
          >
            <Select
              onChange={(val) => {
                if (val === 'SELF' && user?.fullName && !profileForm.getFieldValue('fullName')) {
                  profileForm.setFieldsValue({ fullName: user.fullName });
                }
              }}
            >
              <Option value="SELF">Bản thân (Chính tôi - Chủ tài khoản)</Option>
              <Option value="CHILD">Con cái</Option>
              <Option value="PARENT">Bố / Mẹ</Option>
              <Option value="SPOUSE">Vợ / Chồng</Option>
              <Option value="OTHER">Người thân khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="fullName"
            label={<span style={{ fontWeight: 600 }}>Họ và tên người bệnh</span>}
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A hoặc Minh Trí" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label={<span style={{ fontWeight: 600 }}>Ngày sinh</span>}
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày sinh!' },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (value.isAfter(dayjs(), 'day')) {
                        return Promise.reject(new Error('Ngày sinh không thể ở trong tương lai!'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={<span style={{ fontWeight: 600 }}>Giới tính</span>}
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
              >
                <Select>
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="bloodType" label={<span style={{ fontWeight: 600 }}>Nhóm máu</span>}>
                <Select placeholder="Chọn nhóm máu">
                  <Option value="A">A</Option>
                  <Option value="B">B</Option>
                  <Option value="AB">AB</Option>
                  <Option value="O">O</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bhytNumber" label={<span style={{ fontWeight: 600 }}>Mã BHYT (nếu có)</span>}>
                <Input placeholder="Ví dụ: DN4010123456789" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="cccd" label={<span style={{ fontWeight: 600 }}>Số CCCD / CMND (nếu có)</span>}>
            <Input placeholder="12 chữ số CCCD" />
          </Form.Item>

          <Form.Item name="addressDetail" label={<span style={{ fontWeight: 600 }}>Địa chỉ cư trú</span>}>
            <Input placeholder="Ví dụ: Số 123 đường Lê Lợi, Quận 1, TP.HCM" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setQuickProfileModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={creatingProfile}>
              Lưu & Chọn Vào Bệnh Án
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalRecordCreatePage;
