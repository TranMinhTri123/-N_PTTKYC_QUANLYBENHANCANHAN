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
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import medicalRecordService from '../../services/medicalRecordService';
import profileService from '../../services/profileService';
import catalogService from '../../services/catalogService';
import { useAuth } from '../../context/AuthContext';
import { RECORD_TYPE_CONFIG } from '../../constants/medicalRecordConstants';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const DoctorRecordCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      } catch (err) {
        console.error(err);
      }
    };
    loadProfiles();
  }, []);

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
      const res = await catalogService.searchIcd10(val.trim());
      const list = res?.data || [];
      const formatted = list.map((item) => ({
        value: `${item.code} - ${item.diseaseNameVi}`,
        label: (
          <div>
            <Tag color="blue">{item.code}</Tag> <strong>{item.diseaseNameVi}</strong>
          </div>
        ),
        code: item.code,
        name: item.diseaseNameVi,
      }));
      setIcdOptions(formatted);
    } catch {
      setIcdOptions([]);
    }
  };

  const handleVitalsChange = () => {
    const w = form.getFieldValue('weight');
    const h = form.getFieldValue('height');
    if (w && h) {
      const res = calculateBmi(w, h);
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
      const payload = {
        profileId: values.profileId,
        recordType: recordType,
        hospitalName: values.hospitalName || 'Bệnh Viện Đa Khoa Trung Ương',
        department: values.department || RECORD_TYPE_CONFIG[recordType]?.defaultDepartment || 'Khoa Điều Trị',
        attendingDoctor: user?.fullName || 'BS. Chuyên Khoa',
        admissionDate: values.admissionDate ? values.admissionDate.format('YYYY-MM-DDTHH:mm:ss') : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        reasonForAdmission: values.reasonForAdmission,
        admissionDiagnosis: values.admissionDiagnosis,
        icd10Code: values.icd10Code ? values.icd10Code.split(' - ')[0] : 'I10',
        insuranceType: values.insuranceType || 'BHYT_HO_NGHEO',
        admissionType: 'KHAM_BENH',
        admissionGate: 'KHAM_BENH',
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
        payload.obstetricDetail = {
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
          postpartumCondition: values.postpartumCondition || 'Tử cung co hồi tốt',
        };
      }

      await medicalRecordService.createRecord(payload);

      notification.success({
        message: 'Thành công',
        description: 'Bệnh án điện tử đã được lưu thành công.',
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
          initialValues={{
            hospitalName: 'Bệnh Viện Đa Khoa Trung Ương',
            department: currentConfig.defaultDepartment,
            admissionDate: dayjs(),
            insuranceType: 'BHYT_HO_NGHEO',
            deliveryMethod: 'Đẻ thường',
            feedingRegimen: 'Bú mẹ hoàn toàn',
            paraTerm: 0,
            paraPreterm: 0,
            paraAbortion: 0,
            paraLiving: 0,
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
              <Form.Item name="department" label="Khoa phòng điều trị">
                <Input size="large" placeholder="Khoa phòng..." />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="admissionDate"
                label={<span style={{ fontWeight: 600 }}>Thời điểm tiếp nhận</span>}
              >
                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} size="large" />
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
              <Form.Item name="spO2" label="SpO2 (%)">
                <Input placeholder="98" type="number" />
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
                rules={[{ required: true, message: 'Vui lòng nhập lý do khám!' }]}
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
                  <Form.Item name="circulatorySystem" label="Hệ Tuần Hoàn">
                    <Input placeholder="T1, T2 đều rõ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="respiratorySystem" label="Hệ Hô Hấp">
                    <Input placeholder="Phổi trong, không ran..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="digestiveSystem" label="Hệ Tiêu Hóa">
                    <Input placeholder="Bụng mềm, gan lách không to..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="urinarySystem" label="Thận - Tiết Niệu">
                    <Input placeholder="Chạm thận (-)..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="nervousSystem" label="Thần Kinh">
                    <Input placeholder="Tỉnh táo, Glasgow 15đ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="musculoskeletalSystem" label="Cơ - Xương - Khớp">
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
                  <Form.Item name="preOpDiagnosis" label="Chẩn đoán trước mổ">
                    <Input placeholder="Chẩn đoán trước mổ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="postOpDiagnosis" label="Chẩn đoán sau mổ">
                    <Input placeholder="Chẩn đoán sau mổ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="anesthesiaMethod" label="Phương pháp vô cảm">
                    <Select placeholder="Chọn phương pháp...">
                      <Option value="Gây mê nội khí quản">Gây mê nội khí quản</Option>
                      <Option value="Gây tê tủy sống">Gây tê tủy sống</Option>
                      <Option value="Gây tê ngoài màng cứng">Gây tê ngoài màng cứng</Option>
                      <Option value="Gây tê tại chỗ">Gây tê tại chỗ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="postOpMonitoring" label="Theo dõi vết mổ & Hậu phẫu">
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
                  <Form.Item name="gestationalAgeWeeks" label="Tuổi thai khi sinh (tuần)">
                    <InputNumber min={24} max={44} step={0.5} style={{ width: '100%' }} placeholder="39.5" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="birthWeightGrams" label="Cân nặng khi sinh (gram)">
                    <InputNumber min={500} max={6000} step={50} style={{ width: '100%' }} placeholder="3200" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item name="deliveryMethod" label="Cách thức sinh">
                    <Select placeholder="Chọn...">
                      <Option value="Đẻ thường">Đẻ thường</Option>
                      <Option value="Đẻ mổ">Đẻ mổ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item label="Apgar (1p / 5p)">
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
                    <Input placeholder="Bú mẹ hoàn toàn / Sữa công thức..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="psychomotorDevelopment" label="Đánh giá tâm thần vận động">
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
            </Card>
          )}

          {/* 5. KHÁM BỆNH CHUNG */}
          {recordType === 'GENERAL' && (
            <Card size="small" style={{ background: '#fafafa', marginBottom: 20 }}>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="generalAppearance" label="Toàn thân & Thể trạng">
                    <Input placeholder="Thể trạng trung bình, niêm mạc hồng..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="lymphNodesAndThyroid" label="Hạch ngoại vi & Tuyến giáp">
                    <Input placeholder="Hạch không to, tuyến giáp bình thường..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

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
