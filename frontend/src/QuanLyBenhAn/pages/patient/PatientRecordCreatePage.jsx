import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
  Divider,
  Tag,
  Space,
  notification,
  Radio,
  InputNumber,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import medicalRecordService from '../../services/medicalRecordService';
import profileService from '../../services/profileService';
import { calculateBmi, calculateNaegeleEdd, calculateGestationalAgeWeeks } from '../../utils/medicalCalculators';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
import { RECORD_TYPE_CONFIG } from '../../constants/medicalRecordConstants';

export const PatientRecordCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [recordType, setRecordType] = useState('SURGICAL');
  const [patientMode, setPatientMode] = useState('DIRECT');
  const [bmiResult, setBmiResult] = useState({ bmi: null, classification: '', tagColor: 'default' });

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await profileService.getProfiles();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        setProfiles(list);
        if (list.length > 0) {
          setPatientMode('SELECT');
          form.setFieldsValue({ selectedProfileId: list[0].id });
          handleSelectExistingProfile(list[0].id, list);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProfiles();
  }, [form]);

  const handleRecordTypeChange = (newType) => {
    setRecordType(newType);
    const cfg = RECORD_TYPE_CONFIG[newType];
    if (cfg) {
      form.setFieldsValue({ department: cfg.defaultDepartment });
    }

    if (newType === 'OBSTETRIC') {
      const currentGender = form.getFieldValue('gender');
      if (currentGender !== 'FEMALE') {
        form.setFieldsValue({ gender: 'FEMALE' });
      }
    }
  };

  const handleVitalsChange = () => {
    const w = form.getFieldValue('weight');
    const h = form.getFieldValue('height');
    if (w && h) {
      setBmiResult(calculateBmi(w, h));
    }
  };

  const handleSelectExistingProfile = (profileId, listSource) => {
    const source = listSource || profiles;
    const found = source.find((p) => p.id === profileId);
    if (found) {
      form.setFieldsValue({
        patientName: found.fullName,
        dateOfBirth: found.dateOfBirth ? dayjs(found.dateOfBirth) : null,
        gender: found.gender || 'MALE',
        identityCardNumber: found.identityCardNumber,
        healthInsuranceNumber: found.healthInsuranceNumber,
      });

      if (recordType === 'OBSTETRIC' && found.gender !== 'FEMALE') {
        notification.warning({
          message: 'Lưu ý',
          description: `Hồ sơ ${found.fullName} có giới tính Nam. Mẫu Sản khoa dành riêng cho nữ giới.`,
        });
      }
    }
  };

  const handleLmpChange = (date) => {
    if (date) {
      const edd = calculateNaegeleEdd(date);
      const weeks = calculateGestationalAgeWeeks(date);
      if (edd) {
        form.setFieldsValue({
          eddDate: dayjs(edd),
          gestationalAgeWeeks: weeks || undefined,
        });
      }
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let finalProfileId = values.selectedProfileId;

      if (patientMode === 'DIRECT' || !finalProfileId) {
        const profilePayload = {
          fullName: values.patientName?.trim() || 'Người Bệnh',
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : '1990-01-01',
          gender: values.gender || 'MALE',
          relationship: values.relationship || 'SELF',
          identityCardNumber: values.identityCardNumber || '',
          healthInsuranceNumber: values.healthInsuranceNumber || '',
          bloodType: values.bloodType || 'O_POSITIVE',
          address: values.address || 'Việt Nam',
        };

        const createProfRes = await profileService.createProfile(profilePayload);
        finalProfileId = createProfRes?.data?.id;
      }

      const recordPayload = {
        profileId: finalProfileId,
        recordType: recordType,
        hospitalName: values.hospitalName || 'Bệnh Viện Đa Khoa',
        department: values.department || RECORD_TYPE_CONFIG[recordType]?.defaultDepartment || 'Khoa Khám Bệnh',
        attendingDoctor: values.attendingDoctor || 'BS. Điều Trị',
        admissionDate: values.admissionDate ? values.admissionDate.format('YYYY-MM-DDTHH:mm:ss') : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        reasonForAdmission: values.reasonForAdmission || 'Khám điều trị',
        admissionDiagnosis: values.admissionDiagnosis || 'Khám sức khỏe chuyên khoa',
        icd10Code: values.icd10Code || 'I10',
        admissionGate: 'KHAM_BENH',
        admissionType: 'KHAM_BENH',
        insuranceType: values.insuranceType || 'BHYT_HO_NGHEO',
        vitalSigns: {
          bloodPressureSystolic: values.bloodPressureSystolic,
          bloodPressureDiastolic: values.bloodPressureDiastolic,
          pulse: values.pulse,
          temperature: values.temperature,
          spO2: values.spO2,
          weight: values.weight,
          height: values.height,
        },
      };

      if (recordType === 'SURGICAL') {
        recordPayload.surgicalDetail = {
          preOpDiagnosis: values.preOpDiagnosis || values.admissionDiagnosis,
          postOpDiagnosis: values.postOpDiagnosis || values.admissionDiagnosis,
          anesthesiaMethod: values.anesthesiaMethod || 'Gây mê nội khí quản',
          postOpMonitoring: values.postOpMonitoring || 'Vết mổ khô, mép liền tốt',
          drainRemovalDate: values.drainRemovalDate ? values.drainRemovalDate.format('YYYY-MM-DD') : null,
          sutureRemovalDate: values.sutureRemovalDate ? values.sutureRemovalDate.format('YYYY-MM-DD') : null,
          postOpCareGuidelines: values.postOpCareGuidelines || 'Chăm sóc vết thương, vệ sinh sạch',
        };
      } else if (recordType === 'INTERNAL') {
        recordPayload.internalDetail = {
          circulatorySystem: values.circulatorySystem || 'T1, T2 đều rõ, không tiếng thổi bệnh lý',
          respiratorySystem: values.respiratorySystem || 'Phổi trong, rì rào phế nang êm dịu',
          digestiveSystem: values.digestiveSystem || 'Bụng mềm, gan lách không sờ chạm',
          urinarySystem: values.urinarySystem || 'Chạm thận (-), bập bềnh thận (-)',
          nervousSystem: values.nervousSystem || 'Ý thức tỉnh táo, Glasgow 15đ',
          musculoskeletalSystem: values.musculoskeletalSystem || 'Khớp không sưng đau, vận động trong giới hạn',
          chronicMonitoringSummary: values.chronicMonitoringSummary || '',
          longTermMedicationPlan: values.longTermMedicationPlan || '',
        };
      } else if (recordType === 'PEDIATRIC') {
        recordPayload.pediatricDetail = {
          fatherName: values.fatherName || '',
          fatherOccupation: values.fatherOccupation || '',
          motherName: values.motherName || '',
          motherOccupation: values.motherOccupation || '',
          gestationalAgeWeeks: values.gestationalAgeWeeks ? Number(values.gestationalAgeWeeks) : 39,
          birthWeightGrams: values.birthWeightGrams ? Number(values.birthWeightGrams) : 3200,
          deliveryMethod: values.deliveryMethod || 'Đẻ thường',
          apgar1min: values.apgar1min ? Number(values.apgar1min) : 9,
          apgar5min: values.apgar5min ? Number(values.apgar5min) : 10,
          feedingRegimen: values.feedingRegimen || 'Bú mẹ hoàn toàn',
          psychomotorDevelopment: values.psychomotorDevelopment || 'Phát triển tâm thần vận động phù hợp lứa tuổi',
        };
      } else if (recordType === 'OBSTETRIC') {
        recordPayload.obstetricDetail = {
          menarcheAge: values.menarcheAge ? Number(values.menarcheAge) : 13,
          menstrualCycleDays: values.menstrualCycleDays ? Number(values.menstrualCycleDays) : 28,
          lmpDate: values.lmpDate ? values.lmpDate.format('YYYY-MM-DD') : null,
          eddDate: values.eddDate ? values.eddDate.format('YYYY-MM-DD') : null,
          gestationalAgeWeeks: values.gestationalAgeWeeks ? Number(values.gestationalAgeWeeks) : null,
          paraTerm: values.paraTerm ? Number(values.paraTerm) : 0,
          paraPreterm: values.paraPreterm ? Number(values.paraPreterm) : 0,
          paraAbortion: values.paraAbortion ? Number(values.paraAbortion) : 0,
          paraLiving: values.paraLiving ? Number(values.paraLiving) : 0,
          deliveryMethod: values.deliveryMethod || 'Đẻ thường',
          deliveryComplications: values.deliveryComplications || 'Không biến chứng',
          newbornWeightGrams: values.newbornWeightGrams ? Number(values.newbornWeightGrams) : null,
          postpartumCondition: values.postpartumCondition || 'Tử cung co hồi tốt, sản dịch bình thường',
        };
      }

      await medicalRecordService.createRecord(recordPayload);

      notification.success({
        message: 'Thành công',
        description: 'Bệnh án đã được lưu thành công.',
      });
      navigate('/patient/records');
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err.message || 'Không thể tạo bệnh án. Vui lòng kiểm tra lại thông tin.',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = RECORD_TYPE_CONFIG[recordType] || RECORD_TYPE_CONFIG.SURGICAL;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patient/records')}>
            Quay Về
          </Button>
          <Title level={3} style={{ margin: 0, color: '#0284c7' }}>
            Tạo Bệnh Án
          </Title>
        </Space>
      </div>

      <Card style={{ borderRadius: 10 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            hospitalName: 'Bệnh Viện Đa Khoa',
            department: currentConfig.defaultDepartment,
            admissionDate: dayjs(),
            gender: 'MALE',
            relationship: 'SELF',
            insuranceType: 'BHYT_HO_NGHEO',
            deliveryMethod: 'Đẻ thường',
            feedingRegimen: 'Bú mẹ hoàn toàn',
            paraTerm: 0,
            paraPreterm: 0,
            paraAbortion: 0,
            paraLiving: 0,
          }}
          size="middle"
        >
          {/* CHỌN CHUYÊN KHOA GỌN GÀNG */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ marginRight: 12, display: 'block', marginBottom: 8 }}>
              Chọn Mẫu Chuyên Khoa:
            </Text>
            <Radio.Group
              value={recordType}
              onChange={(e) => handleRecordTypeChange(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="SURGICAL">Ngoại khoa (MS: 10/BV-01)</Radio.Button>
              <Radio.Button value="INTERNAL">Nội khoa (MS: 01/BV-01)</Radio.Button>
              <Radio.Button value="PEDIATRIC">Nhi khoa (MS: 02/BV-01)</Radio.Button>
              <Radio.Button value="OBSTETRIC">Sản khoa</Radio.Button>
              <Radio.Button value="GENERAL">Khám bệnh chung</Radio.Button>
            </Radio.Group>
          </div>

          <Divider style={{ margin: '12px 0 16px 0' }} />

          {/* MỤC I: HÀNH CHÍNH & NGƯỜI BỆNH */}
          <div style={{ borderLeft: '4px solid #0284c7', paddingLeft: 10, marginBottom: 14 }}>
            <Title level={5} style={{ margin: 0, color: '#0f172a' }}>
              MỤC I. THÔNG TIN HÀNH CHÍNH & NGƯỜI BỆNH
            </Title>
          </div>

          {profiles.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Radio.Group
                value={patientMode}
                onChange={(e) => setPatientMode(e.target.value)}
                style={{ marginBottom: 12 }}
              >
                <Radio value="SELECT">Chọn người bệnh đã có trong sổ</Radio>
                <Radio value="DIRECT">Nhập người bệnh mới trực tiếp</Radio>
              </Radio.Group>

              {patientMode === 'SELECT' && (
                <Form.Item name="selectedProfileId" label={<span style={{ fontWeight: 600 }}>Người bệnh</span>}>
                  <Select
                    placeholder="Chọn thành viên..."
                    onChange={(val) => handleSelectExistingProfile(val)}
                    size="large"
                  >
                    {profiles.map((p) => (
                      <Option key={p.id} value={p.id}>
                        {p.fullName} - {p.gender === 'FEMALE' ? 'Nữ' : 'Nam'} ({p.relationship || 'Bản thân'})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </div>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="patientName"
                label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input placeholder="Nguyễn Văn A" prefix={<UserOutlined style={{ color: '#94a3b8' }} />} />
              </Form.Item>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Item
                name="gender"
                label={<span style={{ fontWeight: 600 }}>Giới tính</span>}
                rules={[{ required: true }]}
              >
                <Select disabled={recordType === 'OBSTETRIC'}>
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Item
                name="dateOfBirth"
                label={<span style={{ fontWeight: 600 }}>Ngày sinh</span>}
                rules={[{ required: true, message: 'Chọn ngày sinh!' }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="DD/MM/YYYY" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item name="relationship" label={<span style={{ fontWeight: 600 }}>Quan hệ</span>}>
                <Select>
                  <Option value="SELF">Bản thân</Option>
                  <Option value="FATHER">Bố</Option>
                  <Option value="MOTHER">Mẹ</Option>
                  <Option value="SPOUSE">Vợ / Chồng</Option>
                  <Option value="CHILD">Con</Option>
                  <Option value="OTHER">Người thân khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item name="healthInsuranceNumber" label="Số thẻ BHYT">
                <Input placeholder="DN401..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '14px 0' }} />

          {/* MỤC II: VÀO VIỆN & SINH HIỆU LÂM SÀNG */}
          <div style={{ borderLeft: '4px solid #0284c7', paddingLeft: 10, marginBottom: 14 }}>
            <Title level={5} style={{ margin: 0, color: '#0f172a' }}>
              MỤC II. QUẢN LÝ VÀO VIỆN & CHỈ SỐ SINH HIỆU
            </Title>
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="hospitalName" label={<span style={{ fontWeight: 600 }}>Bệnh viện / Cơ sở khám</span>} required>
                <Input placeholder="Bệnh viện..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="department" label="Khoa điều trị">
                <Input placeholder="Khoa điều trị..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="admissionDate" label="Ngày vào viện">
                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={12} sm={6} md={3}>
              <Form.Item name="bloodPressureSystolic" label="HA Tâm Thu">
                <Input placeholder="120" type="number" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item name="bloodPressureDiastolic" label="HA Tâm Trương">
                <Input placeholder="80" type="number" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item name="pulse" label="Mạch (nhịp/p)">
                <Input placeholder="75" type="number" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item name="temperature" label="Thân Nhiệt (°C)">
                <Input placeholder="37" type="number" step="0.1" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item name="height" label="Chiều Cao (cm)">
                <Input placeholder="165" type="number" onChange={handleVitalsChange} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item name="weight" label="Cân Nặng (kg)">
                <Input placeholder="60" type="number" onChange={handleVitalsChange} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginTop: 28 }}>
                {bmiResult.bmi ? (
                  <Tag color={bmiResult.tagColor} style={{ fontSize: 13, padding: '4px 8px' }}>
                    BMI: {bmiResult.bmi} ({bmiResult.classification})
                  </Tag>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>Chưa có BMI</Text>
                )}
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '14px 0' }} />

          {/* MỤC III: KHÁM CHUYÊN KHOA */}
          <div style={{ borderLeft: '4px solid #0284c7', paddingLeft: 10, marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0, color: '#0f172a' }}>
              MỤC III. KHÁM CHUYÊN KHOA — {currentConfig.label.toUpperCase()}
            </Title>
          </div>

          {/* 1. NGOẠI KHOA */}
          {recordType === 'SURGICAL' && (
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="preOpDiagnosis" label={<span style={{ fontWeight: 600 }}>Chẩn đoán trước phẫu thuật</span>}>
                    <Input placeholder="Viêm ruột thừa cấp giờ thứ 12..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="postOpDiagnosis" label={<span style={{ fontWeight: 600 }}>Chẩn đoán sau phẫu thuật</span>}>
                    <Input placeholder="Viêm ruột thừa mủ hoại tử..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="anesthesiaMethod" label="Phương pháp vô cảm">
                    <Select placeholder="Chọn phương pháp...">
                      <Option value="Gây mê nội khí quản">Gây mê nội khí quản</Option>
                      <Option value="Gây tê tủy sống">Gây tê tủy sống</Option>
                      <Option value="Gây tê ngoài màng cứng">Gây tê ngoài màng cứng</Option>
                      <Option value="Gây tê tại chỗ">Gây tê tại chỗ</Option>
                      <Option value="Tiền mê + Tê tại chỗ">Tiền mê + Tê tại chỗ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="postOpMonitoring" label="Tình trạng vết mổ & Hậu phẫu">
                    <Input placeholder="Vết mổ khô, không sưng đỏ rỉ dịch..." />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="drainRemovalDate" label="Ngày rút dẫn lưu">
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="sutureRemovalDate" label="Ngày cắt chỉ">
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="postOpCareGuidelines" label="Hướng dẫn chăm sóc sau mổ">
                    <Input placeholder="Thay băng định kỳ, vệ sinh sạch..." />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* 2. NỘI KHOA */}
          {recordType === 'INTERNAL' && (
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="circulatorySystem" label={<span style={{ fontWeight: 600 }}>Tuần hoàn (Tim mạch)</span>}>
                    <Input placeholder="T1, T2 đều rõ, nhịp tim đều..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="respiratorySystem" label={<span style={{ fontWeight: 600 }}>Hô hấp (Phổi)</span>}>
                    <Input placeholder="Lồng ngực cân đối, rì rào phế nang êm dịu..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="digestiveSystem" label={<span style={{ fontWeight: 600 }}>Tiêu hóa (Bụng)</span>}>
                    <Input placeholder="Bụng mềm, gan lách không to..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="urinarySystem" label="Thận - Tiết niệu">
                    <Input placeholder="Chạm thận (-), không tiểu buốt..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="nervousSystem" label="Thần kinh">
                    <Input placeholder="Tỉnh táo, tiếp xúc tốt..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="musculoskeletalSystem" label="Cơ - Xương - Khớp">
                    <Input placeholder="Khớp vận động bình thường..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="chronicMonitoringSummary" label="Bệnh nền đang theo dõi">
                    <Input placeholder="Tăng huyết áp, Đái tháo đường..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="longTermMedicationPlan" label="Kế hoạch dùng thuốc & Tái khám">
                    <Input placeholder="Duy trì thuốc theo đơn, tái khám sau 30 ngày..." />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* 3. NHI KHOA */}
          {recordType === 'PEDIATRIC' && (
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <Row gutter={16}>
                <Col xs={12} sm={6}>
                  <Form.Item name="gestationalAgeWeeks" label={<span style={{ fontWeight: 600 }}>Tuổi thai khi sinh (tuần)</span>}>
                    <InputNumber min={24} max={44} step={0.5} style={{ width: '100%' }} placeholder="39.5" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="birthWeightGrams" label={<span style={{ fontWeight: 600 }}>Cân nặng khi sinh (gram)</span>}>
                    <InputNumber min={500} max={6000} step={50} style={{ width: '100%' }} placeholder="3200" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="deliveryMethod" label="Hình thức đẻ">
                    <Select placeholder="Chọn hình thức...">
                      <Option value="Đẻ thường">Đẻ thường</Option>
                      <Option value="Đẻ mổ">Đẻ mổ</Option>
                      <Option value="Đẻ can thiệp">Đẻ can thiệp</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item label="Chỉ số Apgar (1p / 5p)">
                    <Space style={{ width: '100%' }}>
                      <Form.Item name="apgar1min" noStyle>
                        <InputNumber min={0} max={10} placeholder="1p" style={{ width: '48%' }} />
                      </Form.Item>
                      <Form.Item name="apgar5min" noStyle>
                        <InputNumber min={0} max={10} placeholder="5p" style={{ width: '48%' }} />
                      </Form.Item>
                    </Space>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item name="feedingRegimen" label="Chế độ nuôi dưỡng">
                    <Select placeholder="Chọn chế độ...">
                      <Option value="Bú mẹ hoàn toàn">Bú mẹ hoàn toàn</Option>
                      <Option value="Sữa mẹ kết hợp sữa công thức">Sữa mẹ kết hợp sữa công thức</Option>
                      <Option value="Sữa công thức hoàn toàn">Sữa công thức hoàn toàn</Option>
                      <Option value="Ăn dặm">Ăn dặm</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="psychomotorDevelopment" label="Đánh giá tâm thần vận động">
                    <Input placeholder="Vận động phù hợp lứa tuổi..." />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Item name="fatherName" label="Họ tên bố">
                    <Input placeholder="Họ tên bố" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="fatherOccupation" label="Nghề nghiệp bố">
                    <Input placeholder="Nghề nghiệp" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="motherName" label="Họ tên mẹ">
                    <Input placeholder="Họ tên mẹ" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="motherOccupation" label="Nghề nghiệp mẹ">
                    <Input placeholder="Nghề nghiệp" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* 4. SẢN KHOA */}
          {recordType === 'OBSTETRIC' && (
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
                Tiền sử thai sản PARA (Sinh đủ - Thiếu tháng - Sảy/nạo hút - Con sống)
              </div>
              <Row gutter={12} style={{ marginBottom: 8 }}>
                <Col xs={12} sm={6}>
                  <Form.Item name="paraTerm" label="Sinh đủ tháng">
                    <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="paraPreterm" label="Sinh thiếu tháng">
                    <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="paraAbortion" label="Sảy / Nạo hút">
                    <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="paraLiving" label="Con hiện sống">
                    <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '8px 0 16px 0' }} />

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="lmpDate" label={<span style={{ fontWeight: 600 }}>Ngày đầu kinh cuối (LMP)</span>}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} onChange={handleLmpChange} placeholder="Chọn ngày" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="eddDate" label={<span style={{ fontWeight: 600 }}>Ngày dự sinh (EDD)</span>}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="gestationalAgeWeeks" label="Tuổi thai (tuần)">
                    <InputNumber min={1} max={45} step={0.1} style={{ width: '100%' }} placeholder="38.5" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="deliveryMethod" label="Phương pháp sinh">
                    <Select placeholder="Chọn phương pháp...">
                      <Option value="Đẻ thường">Đẻ thường (Ngả âm đạo)</Option>
                      <Option value="Mổ lấy thai">Mổ lấy thai</Option>
                      <Option value="Đẻ can thiệp">Đẻ can thiệp (Forceps/Giác hút)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="newbornWeightGrams" label="Cân nặng bé sơ sinh (gram)">
                    <InputNumber min={500} max={6000} step={50} style={{ width: '100%' }} placeholder="3300" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="postpartumCondition" label="Tình trạng hậu sản">
                    <Input placeholder="Tử cung co hồi tốt, sản dịch..." />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* 5. KHÁM BỆNH CHUNG */}
          {recordType === 'GENERAL' && (
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="generalAppearance" label={<span style={{ fontWeight: 600 }}>Khám toàn thân & Thể trạng</span>}>
                    <Input placeholder="Thể trạng trung bình, niêm mạc hồng..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="lymphNodesAndThyroid" label={<span style={{ fontWeight: 600 }}>Hạch ngoại vi & Tuyến giáp</span>}>
                    <Input placeholder="Hạch ngoại vi không to, tuyến giáp bình thường..." />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="clinicalSyndromes" label="Tóm tắt hội chứng lâm sàng">
                    <Input placeholder="Không có hội chứng bất thường..." />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          <Divider style={{ margin: '14px 0' }} />

          {/* MỤC IV: CHẨN ĐOÁN & PHÁC ĐỒ */}
          <div style={{ borderLeft: '4px solid #0284c7', paddingLeft: 10, marginBottom: 14 }}>
            <Title level={5} style={{ margin: 0, color: '#0f172a' }}>
              MỤC IV. CHẨN ĐOÁN & PHÁC ĐỒ ĐIỀU TRỊ
            </Title>
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="icd10Code" label="Mã bệnh ICD-10">
                <Input placeholder="I10, K35, E11..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item
                name="admissionDiagnosis"
                label={<span style={{ fontWeight: 600 }}>Chẩn đoán xác định</span>}
                rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán!' }]}
              >
                <Input placeholder="Chẩn đoán xác định..." />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="reasonForAdmission" label="Diễn biến bệnh & Lời dặn">
                <TextArea rows={2} placeholder="Ghi chú quá trình khám và hướng dẫn..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: 'center' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
              style={{
                height: 44,
                padding: '0 36px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 8,
                background: '#0284c7',
                borderColor: '#0284c7',
              }}
            >
              Lưu Bệnh Án
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PatientRecordCreatePage;
