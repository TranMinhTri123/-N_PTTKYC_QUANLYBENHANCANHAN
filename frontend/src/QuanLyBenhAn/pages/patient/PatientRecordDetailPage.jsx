import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Typography,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Divider,
  Alert,
  Spin,
  Badge,
} from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import medicalRecordService from '../../services/medicalRecordService';
import VitalsCard from '../../components/VitalsCard';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export const PatientRecordDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await medicalRecordService.getMedicalRecordById(id);
        if (res?.data) {
          setRecord(res.data);
        } else {
          setErrorMsg('Không có dữ liệu trả về cho bệnh án này.');
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết bệnh án:', err);
        setErrorMsg(err.message || 'Không thể kết nối đến máy chủ hoặc không tìm thấy bệnh án.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu hồ sơ bệnh án..." />
      </div>
    );
  }

  if (!record && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Alert
          type="warning"
          message="Không tìm thấy thông tin bệnh án"
          description={errorMsg || `Không tồn tại bản ghi bệnh án với mã #${id}.`}
          showIcon
          style={{ maxWidth: 500, margin: '0 auto 24px' }}
        />
        <Button type="primary" onClick={() => navigate('/patient/records')}>
          Quay về Sổ bệnh án
        </Button>
      </div>
    );
  }

  const {
    vitalSigns,
    surgicalDetail,
    internalDetail,
    pediatricDetail,
    obstetricDetail,
  } = record || {};

  const recordTypeBadge = () => {
    const map = {
      INTERNAL: { label: 'Bệnh Án Nội Khoa', color: 'blue' },
      SURGICAL: { label: 'Bệnh Án Ngoại Khoa (Phẫu thuật)', color: 'orange' },
      PEDIATRIC: { label: 'Bệnh Án Nhi Khoa', color: 'green' },
      OBSTETRIC: { label: 'Bệnh Án Sản Khoa', color: 'magenta' },
    };
    const t = map[record?.recordType] || { label: record?.recordType || 'Bệnh Án', color: 'cyan' };
    return <Tag color={t.color} style={{ fontSize: 13, padding: '3px 10px', borderRadius: 4 }}>{t.label}</Tag>;
  };

  return (
    <div>
      {/* Header Điều Hướng & Tải PDF */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Space size="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patient/records')}>
            Quay Về Sổ Bệnh Án
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
                Hồ Sơ Bệnh Án: {record?.medicalRecordCode || `#BA-${record?.id}`}
              </Title>
              {recordTypeBadge()}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Bệnh nhân: <strong>{record?.profileFullName || 'Người bệnh'}</strong>
              {record?.patientMedicalCode && ` • Mã YT: ${record.patientMedicalCode}`}
            </Text>
          </div>
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => medicalRecordService.downloadPdf(record?.id, record?.medicalRecordCode || `BA_${record?.id}`)}
            style={{ borderRadius: 6, fontWeight: 600, background: '#0284c7' }}
          >
            Tải Tóm Tắt Bệnh Án PDF A4
          </Button>
        </Space>
      </div>

      {/* I. Thông Tin Hành Chính & Tiếp Nhận */}
      <Card
        style={{ borderRadius: 12, marginBottom: 16 }}
        title={
          <Space>
            <UserOutlined style={{ color: '#0284c7' }} />
            <span style={{ color: '#0284c7', fontWeight: 600 }}>I. Thông Tin Hành Chính & Tiếp Nhận</span>
          </Space>
        }
      >
        <Descriptions bordered size="middle" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Họ và tên bệnh nhân">
            <strong style={{ fontSize: 15, color: '#0284c7' }}>
              {record?.profileFullName || 'Người bệnh'}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="Mã lưu trữ bệnh án">
            <Tag color="geekblue" style={{ fontWeight: 600 }}>{record?.medicalRecordCode || `#BA-${record?.id}`}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mã y tế (Mã YT)">
            {record?.patientMedicalCode || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Cơ sở khám chữa bệnh">
            <strong>{record?.hospitalName || '-'}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Khoa phòng điều trị">
            <Tag color="cyan">{record?.departmentName || 'Khoa khám'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Số giường điều trị">
            {record?.bedNumber || 'Ngoại trú'}
          </Descriptions.Item>
          <Descriptions.Item label="Bác sĩ điều trị">
            <strong>{record?.attendingDoctor || 'BS. Chuyên khoa'}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày khám / Vào viện">
            {formatDate(record?.visitDate || record?.admissionDateTime)}
          </Descriptions.Item>
          <Descriptions.Item label="Hình thức tiếp nhận">
            {record?.admissionType === 'INPATIENT' ? (
              <Tag color="orange">Điều trị nội trú</Tag>
            ) : (
              <Tag color="blue">Khám ngoại trú</Tag>
            )}
          </Descriptions.Item>
          {record?.dischargeDateTime && (
            <Descriptions.Item label="Ngày giờ ra viện">
              {formatDate(record.dischargeDateTime)}
            </Descriptions.Item>
          )}
          {record?.totalTreatmentDays > 0 && (
            <Descriptions.Item label="Tổng số ngày điều trị">
              <Badge count={`${record.totalTreatmentDays} ngày`} style={{ backgroundColor: '#10b981' }} />
            </Descriptions.Item>
          )}
          {record?.dischargeType && (
            <Descriptions.Item label="Tình trạng ra viện">
              <Tag color="green">{record.dischargeType === 'RECOVERED' ? 'Ra viện (Khỏi / Đỡ)' : record.dischargeType}</Tag>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* II. Bệnh Sử & Chẩn Đoán Y Khoa */}
      <Card
        style={{ borderRadius: 12, marginBottom: 16 }}
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#0284c7' }} />
            <span style={{ color: '#0284c7', fontWeight: 600 }}>II. Bệnh Sử & Chẩn Đoán Y Khoa</span>
          </Space>
        }
      >
        <Descriptions bordered size="middle" column={1}>
          {record?.chiefComplaint && (
            <Descriptions.Item label="Lý do vào viện">
              <Paragraph style={{ margin: 0, fontWeight: 500, color: '#dc2626' }}>
                {record.chiefComplaint}
              </Paragraph>
            </Descriptions.Item>
          )}
          {record?.historyOfIllness && (
            <Descriptions.Item label="Bệnh sử & Diễn biến quá trình bệnh lý">
              <Paragraph style={{ margin: 0, whiteSpace: 'pre-line' }}>
                {record.historyOfIllness}
              </Paragraph>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Chẩn đoán xác định chính">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Text strong style={{ fontSize: 16, color: '#0f172a' }}>
                {record?.primaryDiagnosis || '-'}
              </Text>
              {record?.primaryIcd10 && (
                <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>
                  ICD-10: {record.primaryIcd10}
                </Tag>
              )}
            </div>
          </Descriptions.Item>
          {record?.secondaryDiagnosis && (
            <Descriptions.Item label="Chẩn đoán kèm theo (bệnh phụ)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 14 }}>{record.secondaryDiagnosis}</Text>
                {record?.secondaryIcd10 && (
                  <Tag color="purple">ICD-10: {record.secondaryIcd10}</Tag>
                )}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* III. Chỉ Số Sinh Hiệu Thể Trạng (Nếu có) */}
      {vitalSigns && (
        <div style={{ marginBottom: 16 }}>
          <VitalsCard vitals={vitalSigns} />
        </div>
      )}

      {/* IV. Kế Hoạch Điều Trị & Hướng Dẫn Tái Khám */}
      <Card
        style={{ borderRadius: 12, marginBottom: 16 }}
        title={
          <Space>
            <FileTextOutlined style={{ color: '#0284c7' }} />
            <span style={{ color: '#0284c7', fontWeight: 600 }}>III. Hướng Điều Trị & Hướng Dẫn Chăm Sóc</span>
          </Space>
        }
      >
        <Descriptions bordered size="middle" column={{ xs: 1, md: 2 }}>
          {record?.treatmentPlan && (
            <Descriptions.Item label="Phương pháp điều trị" span={2}>
              <Paragraph style={{ margin: 0 }}>{record.treatmentPlan}</Paragraph>
            </Descriptions.Item>
          )}
          {record?.dietPlan && (
            <Descriptions.Item label="Chế độ dinh dưỡng & Vận động">
              <Paragraph style={{ margin: 0 }}>{record.dietPlan}</Paragraph>
            </Descriptions.Item>
          )}
          {record?.followUpInstructions && (
            <Descriptions.Item label="Lời dặn theo dõi sau ra viện">
              <Paragraph style={{ margin: 0 }}>{record.followUpInstructions}</Paragraph>
            </Descriptions.Item>
          )}
          {record?.revisitDate && (
            <Descriptions.Item label="Ngày hẹn tái khám" span={2}>
              <Tag color="volcano" icon={<CalendarOutlined />} style={{ fontSize: 14, padding: '4px 10px' }}>
                Hẹn tái khám ngày: {formatDate(record.revisitDate)}
              </Tag>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* V. Chi Tiết Ngoại Khoa (Phẫu thuật) */}
      {surgicalDetail && (
        <Card
          title={<span style={{ color: '#ea580c' }}>IV. Chi Tiết Ngoại Khoa & Phẫu Thuật (MS: 10/BV-01)</span>}
          style={{ borderRadius: 12, marginBottom: 16, borderColor: '#fdba74' }}
        >
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Chẩn đoán trước mổ">{surgicalDetail.preOpDiagnosis || '-'}</Descriptions.Item>
            <Descriptions.Item label="Chẩn đoán sau mổ">{surgicalDetail.postOpDiagnosis || '-'}</Descriptions.Item>
            <Descriptions.Item label="Phương pháp vô cảm (Gây mê)">{surgicalDetail.anesthesiaMethod || '-'}</Descriptions.Item>
            <Descriptions.Item label="Tình trạng theo dõi hậu phẫu">{surgicalDetail.postOpMonitoring || '-'}</Descriptions.Item>
            <Descriptions.Item label="Ngày rút dẫn lưu">{surgicalDetail.drainRemovalDate ? formatDate(surgicalDetail.drainRemovalDate) : '-'}</Descriptions.Item>
            <Descriptions.Item label="Ngày hẹn cắt chỉ">{surgicalDetail.sutureRemovalDate ? formatDate(surgicalDetail.sutureRemovalDate) : '-'}</Descriptions.Item>
            <Descriptions.Item label="Hướng dẫn chăm sóc vết mổ" span={2}>{surgicalDetail.postOpCareGuidelines || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* VI. Chi Tiết Nhi Khoa */}
      {pediatricDetail && (
        <Card
          title={<span style={{ color: '#16a34a' }}>IV. Chi Tiết Quản Lý Bệnh Án Nhi Khoa (MS: 03/BV-01)</span>}
          style={{ borderRadius: 12, marginBottom: 16, borderColor: '#86efac' }}
        >
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Cân nặng khi sinh">{pediatricDetail.birthWeightGrams ? `${pediatricDetail.birthWeightGrams} gram` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Tuổi thai lúc sinh">{pediatricDetail.gestationalAgeWeeks ? `${pediatricDetail.gestationalAgeWeeks} tuần` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Cách sinh">{pediatricDetail.deliveryMethod || '-'}</Descriptions.Item>
            <Descriptions.Item label="Chỉ số Apgar (1p / 5p)">{`${pediatricDetail.apgar1min || 0} / ${pediatricDetail.apgar5min || 0}`}</Descriptions.Item>
            <Descriptions.Item label="Chế độ nuôi dưỡng">{pediatricDetail.feedingRegimen || '-'}</Descriptions.Item>
            <Descriptions.Item label="Phát triển vận động & tâm thần">{pediatricDetail.psychomotorDevelopment || '-'}</Descriptions.Item>
            <Descriptions.Item label="Họ tên cha">{pediatricDetail.fatherName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nghề nghiệp cha">{pediatricDetail.fatherOccupation || '-'}</Descriptions.Item>
            <Descriptions.Item label="Học vấn cha">{pediatricDetail.fatherEducationLevel || '-'}</Descriptions.Item>
            <Descriptions.Item label="Họ tên mẹ">{pediatricDetail.motherName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nghề nghiệp mẹ">{pediatricDetail.motherOccupation || '-'}</Descriptions.Item>
            <Descriptions.Item label="Học vấn mẹ">{pediatricDetail.motherEducationLevel || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* VII. Chi Tiết Nội Khoa */}
      {internalDetail && (
        <Card
          title={<span style={{ color: '#0284c7' }}>IV. Chi Tiết Khám Chuyên Khoa Nội (MS: 01/BV-01)</span>}
          style={{ borderRadius: 12, marginBottom: 16 }}
        >
          <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }}>
            <Descriptions.Item label="Hệ tuần hoàn">{internalDetail.circulatorySystem || '-'}</Descriptions.Item>
            <Descriptions.Item label="Hệ hô hấp">{internalDetail.respiratorySystem || '-'}</Descriptions.Item>
            <Descriptions.Item label="Hệ tiêu hóa">{internalDetail.digestiveSystem || '-'}</Descriptions.Item>
            <Descriptions.Item label="Hệ nội tiết">{internalDetail.endocrineSystem || '-'}</Descriptions.Item>
            <Descriptions.Item label="Hệ thần kinh">{internalDetail.nervousSystem || '-'}</Descriptions.Item>
            <Descriptions.Item label="Hệ cơ xương khớp">{internalDetail.musculoskeletalSystem || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default PatientRecordDetailPage;
