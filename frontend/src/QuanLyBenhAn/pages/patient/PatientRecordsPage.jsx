import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Typography,
  Tag,
  Space,
  Row,
  Col,
  Empty,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Divider,
  notification,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
  BookOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import medicalRecordService from '../../services/medicalRecordService';
import profileService from '../../services/profileService';
import { formatDate } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';

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

export const PatientRecordsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('ALL');
  const [selectedRecordType, setSelectedRecordType] = useState('ALL');

  // Trạng thái modal chỉnh sửa
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, profRes] = await Promise.allSettled([
        medicalRecordService.getRecords({ size: 100 }),
        profileService.getProfiles(),
      ]);

      if (recRes.status === 'fulfilled') {
        const list = Array.isArray(recRes.value?.data) ? recRes.value.data : (recRes.value?.data?.content || []);
        setRecords(list);
      }
      if (profRes.status === 'fulfilled') {
        const profList = Array.isArray(profRes.value?.data) ? profRes.value.data : (profRes.value?.data?.content || []);
        setProfiles(profList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = records.filter((r) => {
    if (selectedProfileId !== 'ALL' && r.profileId !== selectedProfileId) return false;
    if (selectedRecordType !== 'ALL' && r.recordType !== selectedRecordType) return false;
    return true;
  });

  // Mở modal sửa bệnh án
  const handleOpenEdit = async (record) => {
    try {
      setEditLoading(true);
      const res = await medicalRecordService.getRecord(record.id);
      const detail = res?.data || record;
      setEditingRecord(detail);

      editForm.setFieldsValue({
        hospitalName: detail.hospitalName,
        departmentName: detail.departmentName,
        attendingDoctor: detail.attendingDoctor,
        visitDate: detail.visitDate ? dayjs(detail.visitDate) : dayjs(),
        admissionType: detail.admissionType || 'OUTPATIENT',
        primaryDiagnosis: detail.primaryDiagnosis || detail.admissionDiagnosis,
        primaryIcd10: detail.primaryIcd10 || detail.admissionIcd10,
        reasonForAdmission: detail.chiefComplaint || detail.historyOfIllness,
        treatmentPlan: detail.treatmentPlan || '',
        followUpInstructions: detail.followUpInstructions || '',
        pulse: detail.vitalSigns?.pulse,
        temperature: detail.vitalSigns?.temperature,
        bloodPressureSystolic: detail.vitalSigns?.systolicBp,
        bloodPressureDiastolic: detail.vitalSigns?.diastolicBp,
        weight: detail.vitalSigns?.weightKg,
        height: detail.vitalSigns?.heightCm,
        // Chuyên khoa khám chung
        generalAppearance: detail.internalDetail?.circulatorySystem,
        lymphNodesAndThyroid: detail.internalDetail?.endocrineSystem,
        clinicalSyndromes: detail.internalDetail?.chronicMonitoringSummary,
        // Chuyên khoa sản
        lmpDate: detail.obstetricDetail?.lmpDate ? dayjs(detail.obstetricDetail.lmpDate) : null,
        gestationalAgeWeeks: detail.obstetricDetail?.gestationalAgeWeeks,
      });

      setEditModalVisible(true);
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải chi tiết bệnh án để chỉnh sửa.',
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Lưu chỉnh sửa bệnh án
  const handleSaveEdit = async (values) => {
    if (!editingRecord) return;
    setEditLoading(true);
    try {
      const h = values.height ? Number(values.height) : undefined;
      const w = values.weight ? Number(values.weight) : undefined;
      let calculatedBmi = undefined;
      if (h && w && h > 0) {
        const hm = h / 100;
        calculatedBmi = Number((w / (hm * hm)).toFixed(1));
      }

      const updatePayload = {
        profileId: editingRecord.profileId,
        recordType: editingRecord.recordType,
        hospitalName: values.hospitalName || 'Bệnh Viện Đa Khoa',
        departmentName: values.departmentName || 'Khoa Khám Bệnh',
        attendingDoctor: values.attendingDoctor || 'BS. Điều Trị',
        visitDate: values.visitDate ? values.visitDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        admissionType: values.admissionType || 'OUTPATIENT',
        chiefComplaint: values.reasonForAdmission || editingRecord.chiefComplaint || 'Khám bệnh',
        historyOfIllness: values.reasonForAdmission || editingRecord.historyOfIllness || '',
        admissionDiagnosis: values.primaryDiagnosis || 'Khám sức khỏe',
        primaryDiagnosis: values.primaryDiagnosis || 'Khám sức khỏe',
        primaryIcd10: values.primaryIcd10 || 'I10',
        treatmentPlan: values.treatmentPlan || '',
        followUpInstructions: values.followUpInstructions || '',
        vitalSigns: {
          pulse: values.pulse ? Number(values.pulse) : undefined,
          temperature: values.temperature ? Number(values.temperature) : undefined,
          systolicBp: values.bloodPressureSystolic ? Number(values.bloodPressureSystolic) : undefined,
          diastolicBp: values.bloodPressureDiastolic ? Number(values.bloodPressureDiastolic) : undefined,
          weightKg: w,
          heightCm: h,
          bmi: calculatedBmi,
        },
      };

      if (editingRecord.recordType === 'GENERAL') {
        const generalParts = [];
        if (values.generalAppearance) generalParts.push(`Khám toàn thân: ${values.generalAppearance}`);
        if (values.lymphNodesAndThyroid) generalParts.push(`Hạch/Tuyến giáp: ${values.lymphNodesAndThyroid}`);
        if (values.clinicalSyndromes) generalParts.push(`Hội chứng: ${values.clinicalSyndromes}`);

        updatePayload.internalDetail = {
          circulatorySystem: values.generalAppearance || 'Khám toàn thân bình thường',
          endocrineSystem: values.lymphNodesAndThyroid || 'Hạch ngoại vi, tuyến giáp bình thường',
          chronicMonitoringSummary: values.clinicalSyndromes || '',
          otherOrgans: generalParts.join('\n') || 'Khám chung bình thường',
        };
      } else if (editingRecord.recordType === 'OBSTETRIC') {
        updatePayload.obstetricDetail = {
          ...(editingRecord.obstetricDetail || {}),
          lmpDate: values.lmpDate ? values.lmpDate.format('YYYY-MM-DD') : editingRecord.obstetricDetail?.lmpDate,
          gestationalAgeWeeks: values.gestationalAgeWeeks ? Number(values.gestationalAgeWeeks) : editingRecord.obstetricDetail?.gestationalAgeWeeks,
        };
      }

      await medicalRecordService.updateMedicalRecord(editingRecord.id, updatePayload);

      notification.success({
        message: 'Thành công',
        description: `Bệnh án ${editingRecord.medicalRecordCode || `#BA-${editingRecord.id}`} đã được cập nhật thành công.`,
      });

      setEditModalVisible(false);
      loadData();
    } catch (err) {
      notification.error({
        message: 'Lỗi cập nhật',
        description: err.message || 'Không thể cập nhật bệnh án. Vui lòng kiểm tra lại.',
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Xóa mềm bệnh án (có xác nhận)
  const handleDelete = async (id) => {
    try {
      await medicalRecordService.deleteRecord(id);
      notification.success({
        message: 'Thành công',
        description: 'Bệnh án đã được xóa thành công khỏi sổ theo dõi.',
      });
      loadData();
    } catch (err) {
      notification.error({
        message: 'Lỗi xóa',
        description: err.message || 'Không thể xóa bệnh án. Vui lòng thử lại.',
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Lịch Sử Đợt Khám (Timeline Bệnh Án)
          </Title>
          <Text type="secondary">
            Bệnh viện phát hành chính thức – Chỉ xem và tải hồ sơ tóm tắt PDF
          </Text>
        </div>
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          onClick={() => navigate('/patient/appointments')}
          style={{ borderRadius: 6, fontWeight: 600, background: '#0284c7' }}
        >
          Đặt Lịch Khám Bệnh
        </Button>
      </div>

      {records.length === 0 && !loading ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '30px 0' }}>
          <EmptyState
            description="Chưa có đợt khám bệnh nào được Bệnh viện phát hành cho hồ sơ của bạn."
            actionText="Đặt Lịch Khám Bệnh Ngay"
            onAction={() => navigate('/patient/appointments')}
          />
        </Card>
      ) : (
        <Card style={{ borderRadius: 12 }}>
          {/* BỘ LỌC ĐA TIÊU CHÍ */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Select
                value={selectedProfileId}
                onChange={setSelectedProfileId}
                style={{ width: '100%' }}
                placeholder="Lọc theo người bệnh..."
              >
                <Option value="ALL">Tất cả người bệnh trong gia đình</Option>
                {profiles.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.fullName} ({p.relationship || 'Bản thân'})
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Select
                value={selectedRecordType}
                onChange={setSelectedRecordType}
                style={{ width: '100%' }}
                placeholder="Lọc theo chuyên khoa..."
              >
                <Option value="ALL">Tất cả chuyên khoa</Option>
                <Option value="SURGICAL">Ngoại Khoa (MS: 10/BV-01)</Option>
                <Option value="INTERNAL">Nội Khoa (MS: 01/BV-01)</Option>
                <Option value="PEDIATRIC">Nhi Khoa (MS: 02/BV-01)</Option>
                <Option value="OBSTETRIC">Sản Khoa</Option>
                <Option value="GENERAL">Khám Bệnh Chung</Option>
              </Select>
            </Col>

            <Col xs={24} sm={24} md={12} style={{ textAlign: 'right' }}>
              <Text type="secondary">
                Tìm thấy <strong>{filteredRecords.length}</strong> đợt khám
              </Text>
            </Col>
          </Row>

          <Table
            dataSource={filteredRecords}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Mã BA',
                dataIndex: 'id',
                key: 'id',
                render: (id, record) => (
                  <div>
                    <Tag color="blue">{record.medicalRecordCode || `#BA-${id}`}</Tag>
                  </div>
                ),
              },
              {
                title: 'Người Bệnh',
                dataIndex: 'patientName',
                key: 'patientName',
                render: (name, record) => {
                  const prof = profiles.find((p) => p.id === record.profileId);
                  return <Text strong>{record.profileFullName || name || prof?.fullName || 'Người bệnh'}</Text>;
                },
              },
              {
                title: 'Chuyên Khoa',
                dataIndex: 'recordType',
                key: 'recordType',
                render: (type) => {
                  const map = {
                    INTERNAL: { label: 'Nội khoa', color: 'blue' },
                    SURGICAL: { label: 'Ngoại khoa', color: 'orange' },
                    PEDIATRIC: { label: 'Nhi khoa', color: 'green' },
                    OBSTETRIC: { label: 'Sản khoa', color: 'magenta' },
                    GENERAL: { label: 'Khám chung', color: 'cyan' },
                  };
                  const t = map[type] || { label: type || 'Khám chung', color: 'cyan' };
                  return <Tag color={t.color}>{t.label}</Tag>;
                },
              },
              {
                title: 'Cơ Sở Khám & Khoa',
                dataIndex: 'hospitalName',
                key: 'hospitalName',
                render: (hosp, record) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{hosp || '-'}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{record.departmentName || record.department || 'Khoa khám'}</div>
                  </div>
                ),
              },
              {
                title: 'Chẩn Đoán Xác Định',
                dataIndex: 'primaryDiagnosis',
                key: 'primaryDiagnosis',
                render: (diag, record) => (
                  <div>
                    <Text strong>{diag || record.admissionDiagnosis || '-'}</Text>
                    {record.primaryIcd10 && <Tag color="geekblue" style={{ marginLeft: 6, fontSize: 11 }}>{record.primaryIcd10}</Tag>}
                  </div>
                ),
              },
              {
                title: 'Ngày Khám',
                dataIndex: 'visitDate',
                key: 'visitDate',
                render: (date, record) => {
                  const d = date || record.admissionDateTime || record.admissionDate;
                  return d ? formatDate(d) : '-';
                },
              },
              {
                title: 'Thao Tác',
                key: 'actions',
                render: (_, record) => (
                  <Space size="small" wrap>
                    {/* NÚT CHI TIẾT */}
                    <Button
                      size="small"
                      type="primary"
                      icon={<EyeOutlined />}
                      style={{ background: '#0284c7', borderColor: '#0284c7' }}
                      onClick={() => navigate(`/patient/records/${record.id}`)}
                    >
                      Chi Tiết
                    </Button>

                    {/* NÚT TẢI PDF */}
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => medicalRecordService.downloadPdf(record.id, record.medicalRecordCode || `BA_${record.id}`)}
                    >
                      Tải PDF
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* MODAL CHỈNH SỬA BỆNH ÁN */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditOutlined style={{ color: '#0284c7' }} />
            <span>Chỉnh Sửa Bệnh Án {editingRecord?.medicalRecordCode || `#BA-${editingRecord?.id}`}</span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={780}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveEdit}
          scrollToFirstError
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="hospitalName"
                label={<span style={{ fontWeight: 600 }}>Tên cơ sở khám chữa bệnh</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên bệnh viện/phòng khám!' }]}
              >
                <Input placeholder="Bệnh Viện Đa Khoa..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="departmentName"
                label={<span style={{ fontWeight: 600 }}>Khoa / Phòng khám</span>}
                rules={[{ required: true, message: 'Vui lòng nhập khoa/phòng khám!' }]}
              >
                <Input placeholder="Khoa Khám Bệnh, Phòng khám nội..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="attendingDoctor"
                label={<span style={{ fontWeight: 600 }}>Bác sĩ phụ trách / điều trị</span>}
                rules={[{ required: true, message: 'Vui lòng nhập bác sĩ phụ trách!' }]}
              >
                <Input placeholder="BS. Nguyễn Văn A..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="visitDate"
                label={<span style={{ fontWeight: 600 }}>Ngày khám / vào viện</span>}
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày khám!' },
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isAfter(dayjs().endOf('day'))) {
                        return Promise.reject(new Error('Ngày khám không thể ở trong tương lai!'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0 16px 0' }} />

          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="primaryDiagnosis"
                label={<span style={{ fontWeight: 600 }}>Chẩn đoán xác định</span>}
                rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán xác định!' }]}
              >
                <Input placeholder="Táo bón, Viêm dạ dày, Tăng huyết áp..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="primaryIcd10"
                label={<span style={{ fontWeight: 600 }}>Mã bệnh ICD-10</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mã bệnh ICD-10!' }]}
              >
                <Input placeholder="K59, I10, K29..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="reasonForAdmission"
                label={<span style={{ fontWeight: 600 }}>Lý do khám / Diễn biến bệnh</span>}
              >
                <TextArea rows={2} placeholder="Mô tả triệu chứng và quá trình bệnh..." />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="treatmentPlan"
                label={<span style={{ fontWeight: 600 }}>Phương pháp & Lời dặn điều trị</span>}
              >
                <TextArea rows={2} placeholder="Uống nhiều nước, ăn nhiều rau xanh, dùng thuốc theo đơn..." />
              </Form.Item>
            </Col>
          </Row>

          {/* CHUYÊN KHOA KHÁM CHUNG */}
          {editingRecord?.recordType === 'GENERAL' && (
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, color: '#0284c7', marginBottom: 10 }}>Khám Chuyên Khoa Chung</div>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="generalAppearance"
                    label="Toàn thân & Thể trạng"
                  >
                    <Input placeholder="Thể trạng trung bình, niêm mạc hồng..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lymphNodesAndThyroid"
                    label="Hạch ngoại vi & Tuyến giáp"
                  >
                    <Input placeholder="Hạch không to, tuyến giáp bình thường..." />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="clinicalSyndromes"
                    label="Tóm tắt hội chứng lâm sàng"
                  >
                    <Input placeholder="Mô tả hội chứng bất thường (nếu có)..." />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* CHUYÊN KHOA SẢN */}
          {editingRecord?.recordType === 'OBSTETRIC' && (
            <div style={{ background: '#fdf4ff', padding: 14, borderRadius: 8, marginBottom: 16, border: '1px solid #f0abfc' }}>
              <div style={{ fontWeight: 600, color: '#c026d3', marginBottom: 10 }}>Thông Tin Chuyên Khoa Sản</div>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lmpDate"
                    label="Ngày đầu kinh cuối (LMP)"
                  >
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="gestationalAgeWeeks"
                    label="Tuổi thai (tuần)"
                    rules={[checkNumberRange(1, 45, 'tuổi thai', 'tuần', false)]}
                  >
                    <InputNumber min={1} max={45} step={0.1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* CHỈ SỐ SINH HIỆU */}
          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600, color: '#0f766e', marginBottom: 10 }}>Chỉ Số Sinh Hiệu</div>
            <Row gutter={12}>
              <Col xs={12} sm={6}>
                <Form.Item
                  name="bloodPressureSystolic"
                  label="HA Tâm thu (mmHg)"
                  rules={[checkNumberRange(50, 250, 'HA tâm thu', 'mmHg', false)]}
                >
                  <InputNumber min={50} max={250} placeholder="120" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  name="bloodPressureDiastolic"
                  label="HA Tâm trương (mmHg)"
                  rules={[checkNumberRange(30, 160, 'HA tâm trương', 'mmHg', false)]}
                >
                  <InputNumber min={30} max={160} placeholder="80" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  name="pulse"
                  label="Mạch (nhịp/phút)"
                  rules={[checkNumberRange(30, 220, 'mạch', 'nhịp/phút', false)]}
                >
                  <InputNumber min={30} max={220} placeholder="80" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  name="temperature"
                  label="Thân nhiệt (°C)"
                  rules={[checkNumberRange(34, 43, 'thân nhiệt', '°C', false)]}
                >
                  <InputNumber min={34} max={43} step={0.1} placeholder="37" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  name="height"
                  label="Chiều cao (cm)"
                  rules={[checkNumberRange(30, 250, 'chiều cao', 'cm', false)]}
                >
                  <InputNumber min={30} max={250} placeholder="165" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  name="weight"
                  label="Cân nặng (kg)"
                  rules={[checkNumberRange(1, 300, 'cân nặng', 'kg', false)]}
                >
                  <InputNumber min={1} max={300} step={0.5} placeholder="58" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={editLoading}
              style={{ background: '#0284c7', borderColor: '#0284c7' }}
            >
              Lưu Cập Nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientRecordsPage;

