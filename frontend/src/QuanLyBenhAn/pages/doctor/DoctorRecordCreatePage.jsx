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
  AutoComplete,
  Radio,
  InputNumber,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import medicalRecordService from '../../services/medicalRecordService';
import profileService from '../../services/profileService';
import catalogService from '../../services/catalogService';
import appointmentService from '../../services/appointmentService';
import doctorNoteService from '../../services/doctorNoteService';
import { useAuth } from '../../context/AuthContext';
import { RECORD_TYPE_CONFIG } from '../../constants/medicalRecordConstants';
import { calculateBmi, calculateNaegeleEdd, calculateGestationalAgeWeeks } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const checkNumberRange = (min, max, name, unit = '', required = false) => ({
  validator(_, value) {
    if (value === undefined || value === null || value === '') {
      if (required) {
        return Promise.reject(new Error(`Vui lòng nhập ${name}!`));
      }
      return Promise.resolve();
    }
    const num = Number(value);
    if (isNaN(num)) {
      return Promise.reject(new Error(`${name} phải là chữ số hợp lệ!`));
    }
    if (num < min || num > max) {
      const unitStr = unit ? ` ${unit}` : '';
      return Promise.reject(new Error(`${name} không hợp lý (${min} - ${max}${unitStr})!`));
    }
    return Promise.resolve();
  },
});

export const DoctorRecordCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [recordType, setRecordType] = useState('INTERNAL');
  const [bmiResult, setBmiResult] = useState({ bmi: null, classification: '', tagColor: 'default' });
  const [icdOptions, setIcdOptions] = useState([]);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await profileService.getProfiles();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        setProfiles(list);
        if (location.state?.profileId) {
          form.setFieldsValue({
            profileId: location.state.profileId,
            reasonForAdmission: location.state.reasonForAdmission || '',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProfiles();
  }, [location.state?.profileId]);

  const handleRecordTypeChange = (newType) => {
    setRecordType(newType);
    const cfg = RECORD_TYPE_CONFIG[newType];
    if (cfg) {
      form.setFieldsValue({ department: cfg.defaultDepartment });
    }
  };

  const handleSearchIcd = async (val) => {
    if (!val || val.trim().length < 2) {
      setIcdOptions([]);
      return;
    }
    try {
      const res = await catalogService.searchExternalDiseases(val.trim());
      const list = res?.data || [];
      const formatted = list.map((item) => {
        const codeDisplay = item.icd11Code ? `ICD-11: ${item.icd11Code}` : `ICD-10: ${item.icd10Code}`;
        return {
          value: item.icd11Code
            ? `[ICD-11: ${item.icd11Code}${item.icd10Code ? ` / ICD-10: ${item.icd10Code}` : ''}] ${item.diseaseNameVi || item.diseaseNameEn}`
            : `${item.icd10Code} - ${item.diseaseNameVi || item.diseaseNameEn}`,
          label: (
            <div>
              <Tag color={item.icd11Code ? 'geekblue' : 'blue'}>{codeDisplay}</Tag>
              {item.icd10Code && item.icd11Code && <Tag color="green">ICD-10: {item.icd10Code}</Tag>}
              <strong>{item.diseaseNameVi || item.diseaseNameEn}</strong>
            </div>
          ),
          code: item.icd11Code || item.icd10Code,
          name: item.diseaseNameVi || item.diseaseNameEn,
        };
      });
      setIcdOptions(formatted);
    } catch {
      setIcdOptions([]);
    }
  };

  const handleVitalsChange = () => {
    const w = form.getFieldValue('weight');
    const h = form.getFieldValue('height');
    if (w && h) {
      const res = calculateBmi(h, w);
      setBmiResult(res);
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
      const h = values.height ? Number(values.height) : undefined;
      const w = values.weight ? Number(values.weight) : undefined;
      let calculatedBmi = undefined;
      if (h && w && h > 0) {
        const hm = h / 100;
        calculatedBmi = Number((w / (hm * hm)).toFixed(1));
      }

      const payload = {
        profileId: values.profileId,
        recordType: recordType,
        hospitalName: values.hospitalName || 'Bệnh Viện Đa Khoa Trung Ương',
        departmentName: values.department || RECORD_TYPE_CONFIG[recordType]?.defaultDepartment || 'Khoa Điều Trị',
        attendingDoctor: user?.fullName || 'BS. Chuyên Khoa',
        visitDate: values.admissionDate ? values.admissionDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        admissionDateTime: values.admissionDate ? values.admissionDate.format('YYYY-MM-DDTHH:mm:ss') : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        admissionType: 'OUTPATIENT',
        admissionGate: 'EXAM_DEPT',
        chiefComplaint: values.reasonForAdmission || 'Khám điều trị chuyên khoa',
        admissionDiagnosis: values.admissionDiagnosis || 'Khám sức khỏe chuyên khoa',
        primaryDiagnosis: values.admissionDiagnosis || 'Khám sức khỏe chuyên khoa',
        primaryIcd10: values.icd10Code ? values.icd10Code.split(' - ')[0] : 'I10',
        insuranceType: 'BHYT',
        vitalSigns: {
          pulse: values.pulse ? Number(values.pulse) : undefined,
          temperature: values.temperature ? Number(values.temperature) : undefined,
          systolicBp: values.bloodPressureSystolic ? Number(values.bloodPressureSystolic) : undefined,
          diastolicBp: values.bloodPressureDiastolic ? Number(values.bloodPressureDiastolic) : undefined,
          spo2: values.spO2 ? Number(values.spO2) : undefined,
          weightKg: w,
          heightCm: h,
          bmi: calculatedBmi,
        },
      };

      if (recordType === 'INTERNAL') {
        payload.internalDetail = {
          circulatorySystem: values.circulatorySystem || 'T1, T2 đều rõ, không tiếng thổi bệnh lý',
          respiratorySystem: values.respiratorySystem || 'Rì rào phế nang êm dịu 2 phế trường',
          digestiveSystem: values.digestiveSystem || 'Bụng mềm, gan lách không sờ chạm',
          urinarySystem: values.urinarySystem || 'Chạm thận (-), bập bềnh thận (-)',
          nervousSystem: values.nervousSystem || 'Ý thức tỉnh táo, Glasgow 15đ',
          musculoskeletalSystem: values.musculoskeletalSystem || 'Khớp không sưng đau, vận động tốt',
          chronicMonitoringSummary: values.chronicMonitoringSummary || '',
          longTermMedicationPlan: values.longTermMedicationPlan || '',
        };
      } else if (recordType === 'SURGICAL') {
        payload.surgicalDetail = {
          preOpDiagnosis: values.preOpDiagnosis || values.admissionDiagnosis,
          postOpDiagnosis: values.postOpDiagnosis || values.admissionDiagnosis,
          anesthesiaMethod: values.anesthesiaMethod || 'Gây mê nội khí quản',
          postOpMonitoring: values.postOpMonitoring || 'Vết mổ khô, không rỉ dịch',
          drainRemovalDate: values.drainRemovalDate ? values.drainRemovalDate.format('YYYY-MM-DD') : null,
          sutureRemovalDate: values.sutureRemovalDate ? values.sutureRemovalDate.format('YYYY-MM-DD') : null,
          postOpCareGuidelines: values.postOpCareGuidelines || 'Chăm sóc vết mổ, vận động nhẹ',
        };
      } else if (recordType === 'PEDIATRIC') {
        payload.pediatricDetail = {
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
          psychomotorDevelopment: values.psychomotorDevelopment || 'Phát triển tâm thần vận động bình thường',
        };
      } else if (recordType === 'OBSTETRIC') {
        const lmp = values.lmpDate;
        const ga = values.gestationalAgeWeeks;
        const edd = values.eddDate;

        if (!lmp && !ga && !edd) {
          notification.error({
            message: 'Thiếu thông tin Sản khoa',
            description: 'Vui lòng nhập Ngày đầu kinh cuối (LMP) hoặc Tuổi thai / Ngày dự sinh trước khi lưu bệnh án Sản khoa!',
          });
          setLoading(false);
          return;
        }

        payload.obstetricDetail = {
          menarcheAge: values.menarcheAge ? Number(values.menarcheAge) : 13,
          menstrualCycleDays: values.menstrualCycleDays ? Number(values.menstrualCycleDays) : 28,
          lmpDate: lmp ? lmp.format('YYYY-MM-DD') : null,
          eddDate: edd ? edd.format('YYYY-MM-DD') : null,
          gestationalAgeWeeks: ga ? Number(ga) : null,
          paraTerm: values.paraTerm !== undefined && values.paraTerm !== null ? Number(values.paraTerm) : 0,
          paraPreterm: values.paraPreterm !== undefined && values.paraPreterm !== null ? Number(values.paraPreterm) : 0,
          paraAbortion: values.paraAbortion !== undefined && values.paraAbortion !== null ? Number(values.paraAbortion) : 0,
          paraLiving: values.paraLiving !== undefined && values.paraLiving !== null ? Number(values.paraLiving) : 0,
          deliveryMethod: values.deliveryMethod || 'Đẻ thường',
          deliveryComplications: values.deliveryComplications || 'Không biến chứng',
          newbornWeightGrams: values.newbornWeightGrams ? Number(values.newbornWeightGrams) : null,
          postpartumCondition: values.postpartumCondition || 'Tử cung co hồi tốt',
        };
      } else if (recordType === 'GENERAL') {
        const generalParts = [];
        if (values.generalAppearance) generalParts.push(`Khám toàn thân & Thể trạng: ${values.generalAppearance}`);
        if (values.lymphNodesAndThyroid) generalParts.push(`Hạch ngoại vi & Tuyến giáp: ${values.lymphNodesAndThyroid}`);
        if (values.clinicalSyndromes) generalParts.push(`Hội chứng lâm sàng: ${values.clinicalSyndromes}`);

        payload.internalDetail = {
          circulatorySystem: values.generalAppearance || 'Khám toàn thân bình thường',
          endocrineSystem: values.lymphNodesAndThyroid || 'Hạch ngoại vi, tuyến giáp không to',
          chronicMonitoringSummary: values.clinicalSyndromes || '',
          otherOrgans: generalParts.join('\n') || 'Khám chung bình thường',
        };
      }

      const createdRecord = await medicalRecordService.createRecord(payload);
      const newRecordId = createdRecord?.data?.id || createdRecord?.id;

      // 1. Tự động hoàn tất lịch hẹn nếu bác sĩ mở từ lịch hẹn
      if (location.state?.appointmentId) {
        try {
          await appointmentService.updateStatus(location.state.appointmentId, 'COMPLETED');
        } catch (e) {
          console.error('Không thể tự động cập nhật lịch hẹn:', e);
        }
      }

      // 2. Lưu dặn dò sau khám vào ghi chú bác sĩ
      if (newRecordId && (values.doctorAdvice || values.followupPlan)) {
        try {
          await doctorNoteService.addNote({
            medicalRecordId: newRecordId,
            doctorName: user?.fullName || 'BS. Chuyên Khoa',
            department: values.department || 'Khoa Điều Trị',
            clinicalAdvice: values.doctorAdvice || '',
            followupPlan: values.followupPlan || '',
          });
        } catch (e) {
          console.error('Không thể lưu ghi chú chuyên môn:', e);
        }
      }

      // 3. Tự động xếp lịch tái khám nếu bác sĩ hẹn ngày tái khám
      if (values.followupDate) {
        try {
          await appointmentService.createAppointment({
            profileId: values.profileId,
            medicalRecordId: newRecordId,
            facilityName: values.hospitalName || 'Bệnh viện Đa khoa PHR',
            doctorName: user?.fullName || 'BS. Chuyên Khoa',
            doctorId: user?.id,
            appointmentTime: values.followupDate.format('YYYY-MM-DDTHH:mm:ss'),
            appointmentType: 'FOLLOW_UP',
            title: 'Lịch hẹn tái khám chuyên khoa',
            notes: values.followupPlan || values.doctorAdvice || 'Tái khám theo chỉ định sau đợt điều trị',
          });
        } catch (e) {
          console.error('Lỗi tự động tạo lịch hẹn tái khám:', e);
        }
      }

      notification.success({
        message: 'Thành công',
        description: 'Bệnh án điện tử và các chỉ định dặn dò sau khám đã được lưu thành công.',
      });
      navigate('/doctor/workspace');
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err.message || 'Không thể tạo bệnh án. Vui lòng kiểm tra lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = RECORD_TYPE_CONFIG[recordType] || RECORD_TYPE_CONFIG.INTERNAL;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/doctor/workspace')}>
            Quay Về
          </Button>
          <Title level={3} style={{ margin: 0, color: '#0f766e' }}>
            Lập Bệnh Án Điện Tử
          </Title>
        </Space>
      </div>

      <Card style={{ borderRadius: 10 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          scrollToFirstError
          preserve={false}
          initialValues={{
            hospitalName: 'Bệnh Viện Đa Khoa Trung Ương',
            department: currentConfig.defaultDepartment,
            admissionDate: dayjs(),
            insuranceType: 'BHYT_HO_NGHEO',
          }}
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
              <Radio.Button value="INTERNAL">Nội khoa (MS: 01/BV-01)</Radio.Button>
              <Radio.Button value="SURGICAL">Ngoại khoa (MS: 10/BV-01)</Radio.Button>
              <Radio.Button value="PEDIATRIC">Nhi khoa (MS: 02/BV-01)</Radio.Button>
              <Radio.Button value="OBSTETRIC">Sản khoa</Radio.Button>
              <Radio.Button value="GENERAL">Khám bệnh chung</Radio.Button>
            </Radio.Group>
          </div>

          <Divider style={{ margin: '12px 0 16px 0' }} />

          {/* I. CHỌN BỆNH NHÂN & TIẾP NHẬN */}
          <Title level={5} style={{ color: '#0f766e', marginBottom: 16 }}>
            I. THÔNG TIN HÀNH CHÍNH & TIẾP NHẬN BỆNH NHÂN
          </Title>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="profileId"
                label={<span style={{ fontWeight: 600 }}>Người bệnh</span>}
                rules={[{ required: true, message: 'Vui lòng chọn người bệnh!' }]}
              >
                <Select
                  placeholder="Chọn bệnh nhân..."
                  size="large"
                  showSearch
                  optionFilterProp="children"
                >
                  {profiles.map((p) => (
                    <Option key={p.id} value={p.id}>
                      {p.fullName} - {p.gender === 'FEMALE' ? 'Nữ' : 'Nam'} ({p.relationship || 'Bản thân'})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="department"
                label={<span style={{ fontWeight: 600 }}>Khoa phòng điều trị</span>}
                rules={[{ required: true, message: 'Vui lòng nhập khoa phòng điều trị!' }]}
              >
                <Input size="large" placeholder="Khoa phòng..." />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="admissionDate"
                label={<span style={{ fontWeight: 600 }}>Thời điểm tiếp nhận</span>}
                rules={[
                  { required: true, message: 'Vui lòng chọn thời điểm tiếp nhận!' },
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isAfter(dayjs().endOf('day'))) {
                        return Promise.reject(new Error('Thời điểm tiếp nhận không thể ở trong tương lai!'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  size="large"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          {/* II. SINH HIỆU LÂM SÀNG */}
          <Title level={5} style={{ color: '#0f766e', marginBottom: 16 }}>
            II. SINH HIỆU LÂM SÀNG & THỂ TRẠNG
          </Title>

          <Row gutter={12}>
            <Col xs={12} sm={6} md={3}>
              <Form.Item
                name="bloodPressureSystolic"
                label={<span style={{ fontWeight: 600 }}>HA Tâm Thu</span>}
                rules={[checkNumberRange(50, 250, 'HA tâm thu', 'mmHg', true)]}
              >
                <Input placeholder="120" type="number" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item
                name="bloodPressureDiastolic"
                label={<span style={{ fontWeight: 600 }}>HA Tâm Trương</span>}
                rules={[checkNumberRange(30, 160, 'HA tâm trương', 'mmHg', true)]}
              >
                <Input placeholder="80" type="number" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item
                name="pulse"
                label={<span style={{ fontWeight: 600 }}>Mạch (nhịp/p)</span>}
                rules={[checkNumberRange(30, 220, 'mạch', 'nhịp/p', true)]}
              >
                <Input placeholder="75" type="number" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item
                name="temperature"
                label={<span style={{ fontWeight: 600 }}>Thân Nhiệt (°C)</span>}
                rules={[checkNumberRange(34, 43, 'thân nhiệt', '°C', true)]}
              >
                <Input placeholder="37" type="number" step="0.1" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item
                name="spO2"
                label={<span style={{ fontWeight: 600 }}>SpO2 (%)</span>}
                rules={[checkNumberRange(50, 100, 'SpO2', '%', true)]}
              >
                <Input placeholder="98" type="number" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item
                name="height"
                label={<span style={{ fontWeight: 600 }}>Chiều Cao (cm)</span>}
                rules={[checkNumberRange(30, 250, 'chiều cao', 'cm', true)]}
              >
                <Input placeholder="165" type="number" onChange={handleVitalsChange} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Item
                name="weight"
                label={<span style={{ fontWeight: 600 }}>Cân Nặng (kg)</span>}
                rules={[checkNumberRange(1, 300, 'cân nặng', 'kg', true)]}
              >
                <Input placeholder="60" type="number" onChange={handleVitalsChange} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={3}>
              <div style={{ marginTop: 28 }}>
                {bmiResult.bmi ? (
                  <Tag color={bmiResult.tagColor} style={{ fontSize: 13, padding: '4px 8px' }}>
                    BMI: {bmiResult.bmi}
                  </Tag>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>Chưa có BMI</Text>
                )}
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          {/* III. LÝ DO KHÁM & CHẨN ĐOÁN ICD-10 */}
          <Title level={5} style={{ color: '#0f766e', marginBottom: 16 }}>
            III. LÝ DO KHÁM & CHẨN ĐOÁN ICD-10
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="reasonForAdmission"
                label={<span style={{ fontWeight: 600 }}>Lý do vào viện / Bệnh sử</span>}
                rules={[{ required: true, message: 'Vui lòng nhập lý do khám & bệnh sử!' }]}
              >
                <TextArea rows={3} placeholder="Ghi nhận lý do khám và bệnh sử..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="icd10Code"
                label={<span style={{ fontWeight: 600 }}>Tra cứu mã bệnh ICD-10</span>}
                rules={[{ required: true, message: 'Vui lòng chọn mã bệnh ICD-10!' }]}
              >
                <AutoComplete
                  options={icdOptions}
                  onSearch={handleSearchIcd}
                  placeholder="Gõ mã hoặc tên bệnh (I10, E11...)"
                  size="large"
                >
                  <Input suffix={<SearchOutlined style={{ color: '#0f766e' }} />} />
                </AutoComplete>
              </Form.Item>

              <Form.Item
                name="admissionDiagnosis"
                label={<span style={{ fontWeight: 600 }}>Chẩn đoán xác định</span>}
                rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán xác định!' }]}
              >
                <Input placeholder="Chẩn đoán xác định..." />
              </Form.Item>
            </Col>
          </Row>

          {/* IV. KHÁM CHUYÊN KHOA */}
          <Divider style={{ margin: '16px 0' }} />
          <Title level={5} style={{ color: '#0f766e', marginBottom: 16 }}>
            IV. KHÁM CHUYÊN KHOA — {currentConfig.label.toUpperCase()}
          </Title>

          {/* 1. NỘI KHOA */}
          {recordType === 'INTERNAL' && (
            <Card size="small" style={{ background: '#fafafa', marginBottom: 20 }}>
              <Row gutter={12}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="circulatorySystem"
                    label={<span style={{ fontWeight: 600 }}>Hệ Tuần Hoàn</span>}
                  >
                    <Input placeholder="T1, T2 đều rõ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="respiratorySystem"
                    label={<span style={{ fontWeight: 600 }}>Hệ Hô Hấp</span>}
                  >
                    <Input placeholder="Phổi trong, không ran..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="digestiveSystem"
                    label={<span style={{ fontWeight: 600 }}>Hệ Tiêu Hóa</span>}
                  >
                    <Input placeholder="Bụng mềm, gan lách không to..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="urinarySystem"
                    label={<span style={{ fontWeight: 600 }}>Thận - Tiết Niệu</span>}
                  >
                    <Input placeholder="Chạm thận (-)..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="nervousSystem"
                    label={<span style={{ fontWeight: 600 }}>Thần Kinh</span>}
                  >
                    <Input placeholder="Tỉnh táo, Glasgow 15đ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="musculoskeletalSystem"
                    label={<span style={{ fontWeight: 600 }}>Cơ - Xương - Khớp</span>}
                  >
                    <Input placeholder="Khớp vận động bình thường..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* 2. NGOẠI KHOA */}
          {recordType === 'SURGICAL' && (
            <Card size="small" style={{ background: '#fafafa', marginBottom: 20 }}>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="preOpDiagnosis"
                    label={<span style={{ fontWeight: 600 }}>Chẩn đoán trước mổ</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán trước mổ!' }]}
                  >
                    <Input placeholder="Chẩn đoán trước mổ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="postOpDiagnosis"
                    label={<span style={{ fontWeight: 600 }}>Chẩn đoán sau mổ</span>}
                  >
                    <Input placeholder="Chẩn đoán sau mổ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="anesthesiaMethod"
                    label={<span style={{ fontWeight: 600 }}>Phương pháp vô cảm</span>}
                  >
                    <Select placeholder="Chọn phương pháp...">
                      <Option value="Gây mê nội khí quản">Gây mê nội khí quản</Option>
                      <Option value="Gây tê tủy sống">Gây tê tủy sống</Option>
                      <Option value="Gây tê ngoài màng cứng">Gây tê ngoài màng cứng</Option>
                      <Option value="Gây tê tại chỗ">Gây tê tại chỗ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="postOpMonitoring"
                    label={<span style={{ fontWeight: 600 }}>Theo dõi vết mổ & Hậu phẫu</span>}
                  >
                    <Input placeholder="Vết mổ khô..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* 3. NHI KHOA */}
          {recordType === 'PEDIATRIC' && (
            <Card size="small" style={{ background: '#fafafa', marginBottom: 20 }}>
              <Row gutter={12}>
                <Col xs={12} sm={6}>
                  <Form.Item
                    name="gestationalAgeWeeks"
                    label={<span style={{ fontWeight: 600 }}>Tuổi thai khi sinh (tuần)</span>}
                    rules={[checkNumberRange(24, 44, 'tuổi thai khi sinh', 'tuần', false)]}
                  >
                    <InputNumber min={24} max={44} step={0.5} style={{ width: '100%' }} placeholder="39.5" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item
                    name="birthWeightGrams"
                    label={<span style={{ fontWeight: 600 }}>Cân nặng khi sinh (gram)</span>}
                    rules={[checkNumberRange(500, 6000, 'cân nặng khi sinh', 'gram', false)]}
                  >
                    <InputNumber min={500} max={6000} step={50} style={{ width: '100%' }} placeholder="3200" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item
                    name="deliveryMethod"
                    label={<span style={{ fontWeight: 600 }}>Cách thức sinh</span>}
                  >
                    <Select placeholder="Chọn...">
                      <Option value="Đẻ thường">Đẻ thường</Option>
                      <Option value="Đẻ mổ">Đẻ mổ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item
                    label={<span style={{ fontWeight: 600 }}>Apgar (1p / 5p)</span>}
                  >
                    <Space style={{ width: '100%' }}>
                      <Form.Item
                        name="apgar1min"
                        noStyle
                        rules={[checkNumberRange(0, 10, 'Apgar 1p', '', false)]}
                      >
                        <InputNumber min={0} max={10} placeholder="1p" style={{ width: '48%' }} />
                      </Form.Item>
                      <Form.Item
                        name="apgar5min"
                        noStyle
                        rules={[checkNumberRange(0, 10, 'Apgar 5p', '', false)]}
                      >
                        <InputNumber min={0} max={10} placeholder="5p" style={{ width: '48%' }} />
                      </Form.Item>
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="feedingRegimen"
                    label={<span style={{ fontWeight: 600 }}>Chế độ nuôi dưỡng</span>}
                  >
                    <Input placeholder="Bú mẹ hoàn toàn / Sữa công thức..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="psychomotorDevelopment"
                    label={<span style={{ fontWeight: 600 }}>Đánh giá tâm thần vận động</span>}
                  >
                    <Input placeholder="Phát triển bình thường..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* 4. SẢN KHOA */}
          {recordType === 'OBSTETRIC' && (
            <Card size="small" style={{ background: '#fafafa', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
                Tiền sử thai sản PARA (Sinh đủ - Thiếu tháng - Sảy/nạo hút - Con sống)
              </div>
              <Row gutter={12} style={{ marginBottom: 8 }}>
                <Col xs={12} sm={6}>
                  <Form.Item
                    name="paraTerm"
                    label={<span style={{ fontWeight: 600 }}>Sinh đủ tháng</span>}
                    rules={[checkNumberRange(0, 20, 'số lần sinh đủ tháng', '', false)]}
                  >
                    <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item
                    name="paraPreterm"
                    label={<span style={{ fontWeight: 600 }}>Sinh thiếu tháng</span>}
                    rules={[checkNumberRange(0, 20, 'số lần sinh thiếu tháng', '', false)]}
                  >
                    <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item
                    name="paraAbortion"
                    label={<span style={{ fontWeight: 600 }}>Sảy / Nạo hút</span>}
                    rules={[checkNumberRange(0, 20, 'số lần sảy/nạo hút', '', false)]}
                  >
                    <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item
                    name="paraLiving"
                    label={<span style={{ fontWeight: 600 }}>Con hiện sống</span>}
                    rules={[checkNumberRange(0, 20, 'số con hiện sống', '', false)]}
                  >
                    <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '8px 0 16px 0' }} />

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="lmpDate"
                    label={<span style={{ fontWeight: 600 }}>Ngày đầu kinh cuối (LMP)</span>}
                  >
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} onChange={handleLmpChange} placeholder="Chọn ngày" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="eddDate"
                    label={<span style={{ fontWeight: 600 }}>Ngày dự sinh (EDD)</span>}
                  >
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="gestationalAgeWeeks"
                    label={<span style={{ fontWeight: 600 }}>Tuổi thai (tuần)</span>}
                    rules={[checkNumberRange(1, 45, 'tuổi thai', 'tuần', false)]}
                  >
                    <InputNumber min={1} max={45} step={0.1} style={{ width: '100%' }} placeholder="38.5" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* 5. KHÁM BỆNH CHUNG */}
          {recordType === 'GENERAL' && (
            <Card size="small" style={{ background: '#fafafa', marginBottom: 20 }}>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="generalAppearance"
                    label={<span style={{ fontWeight: 600 }}>Toàn thân & Thể trạng</span>}
                  >
                    <Input placeholder="Thể trạng trung bình, niêm mạc hồng..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lymphNodesAndThyroid"
                    label={<span style={{ fontWeight: 600 }}>Hạch ngoại vi & Tuyến giáp</span>}
                  >
                    <Input placeholder="Hạch không to, tuyến giáp bình thường..." />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="clinicalSyndromes"
                    label={<span style={{ fontWeight: 600 }}>Tóm tắt hội chứng lâm sàng</span>}
                  >
                    <Input placeholder="Không có hội chứng bất thường..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* V. DẶN DÒ SAU KHÁM & HẸN TÁI KHÁM (CHUYÊN MÔN BÁC SĨ) */}
          <Divider style={{ margin: '20px 0' }} />
          <Title level={5} style={{ color: '#0f766e', marginBottom: 16 }}>
            V. DẶN DÒ SAU KHÁM & CHỈ ĐỊNH TÁI KHÁM
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="doctorAdvice"
                label={<span style={{ fontWeight: 600 }}>Ghi chú & Dặn dò sau khám của bác sĩ</span>}
              >
                <TextArea
                  rows={4}
                  placeholder="Dặn dò chế độ dinh dưỡng, cách uống thuốc, lưu ý sinh hoạt, dấu hiệu nguy hiểm cần nhập viện ngay..."
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="followupDate"
                label={<span style={{ fontWeight: 600 }}>Hẹn ngày tái khám (Nếu cần)</span>}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  disabledDate={(current) =>
                    current &&
                    (current < dayjs().endOf('day') || current > dayjs().add(30, 'day').endOf('day'))
                  }
                  placeholder="Chọn ngày giờ tái khám (Tối đa 30 ngày)"
                />
              </Form.Item>

              <Form.Item
                name="followupPlan"
                label={<span style={{ fontWeight: 600 }}>Nội dung / Mục tiêu lần tái khám</span>}
              >
                <Input placeholder="Ví dụ: Kiểm tra lại huyết áp, làm lại xét nghiệm men gan..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
              style={{
                background: '#0f766e',
                borderColor: '#0f766e',
                borderRadius: 8,
                fontWeight: 600,
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

export default DoctorRecordCreatePage;
