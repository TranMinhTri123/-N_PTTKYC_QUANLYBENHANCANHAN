import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Tag, Typography, Space, Row, Col, Table, Timeline, Alert, notification } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, MedicineBoxOutlined, HeartOutlined, HistoryOutlined } from '@ant-design/icons';
import medicalRecordService from '../../services/medicalRecordService';
import { formatVnDate, formatVnDateTime } from '../../utils/medicalCalculators';

const { Title, Text, Paragraph } = Typography;

export const MedicalRecordDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await medicalRecordService.getMedicalRecordById(id);
        setRecord(res?.data || null);

        try {
          const timeRes = await medicalRecordService.getTimeline(id);
          const tData = Array.isArray(timeRes?.data) ? timeRes.data : (timeRes?.data?.content || []);
          setTimeline(tData);
        } catch {
          // ignore
        }
      } catch (err) {
        notification.error({
          message: 'Lỗi tải chi tiết bệnh án',
          description: err.message || 'Không thể tải thông tin bệnh án.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      notification.info({
        message: 'Đang khởi tạo tài liệu PDF...',
        description: 'Tài liệu A4 chuẩn Quốc hiệu - Tiêu ngữ Bộ Y Tế đang được xuất bản.',
      });
      await medicalRecordService.downloadPdf(id, record?.medicalRecordCode || 'BENH_AN');
      notification.success({
        message: 'Tải thành công!',
        description: 'Đã tải về tệp PDF tóm tắt bệnh án.',
      });
    } catch (err) {
      notification.error({
        message: 'Lỗi tải PDF',
        description: err.message || 'Không thể tải tệp PDF.',
      });
    } finally {
      setDownloading(false);
    }
  };

  if (!record && !loading) {
    return <Alert type="warning" message="Không tìm thấy đợt bệnh án này." showIcon />;
  }

  const vitalsColumns = [
    { title: 'Thời Điểm Đo', dataIndex: 'recordedAt', key: 'recordedAt', render: (d) => formatVnDateTime(d) },
    { title: 'Mạch', dataIndex: 'pulse', key: 'pulse', render: (v) => (v ? `${v} l/p` : '—') },
    { title: 'Nhiệt Độ', dataIndex: 'temperature', key: 'temperature', render: (v) => (v ? `${v} °C` : '—') },
    {
      title: 'Huyết Áp',
      key: 'bp',
      render: (_, r) => (r.systolicBp && r.diastolicBp ? `${r.systolicBp}/${r.diastolicBp} mmHg` : '—'),
    },
    { title: 'SpO2', dataIndex: 'spo2', key: 'spo2', render: (v) => (v ? `${v}%` : '—') },
    { title: 'BMI', dataIndex: 'bmi', key: 'bmi', render: (v) => (v ? <Tag color="blue">{v}</Tag> : '—') },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/medical-records')}>
          Quay lại danh sách bệnh án
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="large"
          loading={downloading}
          style={{ height: 44, fontWeight: 700, backgroundColor: '#0284c7' }}
          onClick={handleDownloadPdf}
        >
          Xuất Bệnh Án PDF Chuẩn Bộ Y Tế (A4)
        </Button>
      </div>

      {/* Overview Card */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Space align="center" size={10}>
              <Title level={3} style={{ margin: 0, color: '#0284c7' }}>
                {record?.medicalRecordCode}
              </Title>
              <Tag color="cyan" style={{ fontSize: 13, padding: '2px 8px' }}>
                {record?.recordType}
              </Tag>
            </Space>
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              Bệnh nhân: <strong>{record?.profileName}</strong> • Bác sĩ điều trị: <strong>{record?.treatingDoctor || 'Chưa phân công'}</strong>
            </Text>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Text type="secondary">Ngày khám: </Text>
            <strong>{formatVnDate(record?.visitDate)}</strong>
            {record?.totalTreatmentDays > 0 && (
              <div style={{ marginTop: 4 }}>
                <Tag color="purple">Số ngày điều trị: {record?.totalTreatmentDays} ngày</Tag>
              </div>
            )}
          </div>
        </div>

        <Row gutter={[16, 16]} style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
          <Col xs={24} md={12}>
            <Text type="secondary">Lý do vào viện / Triệu chứng:</Text>
            <Paragraph style={{ margin: '4px 0 0', fontWeight: 500 }}>{record?.chiefComplaint || '—'}</Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary">Chẩn đoán xác định:</Text>
            <Paragraph style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}>
              {record?.primaryDiagnosis || 'Đang theo dõi'}
              {record?.primaryIcd10 && <Tag color="geekblue" style={{ marginLeft: 8 }}>ICD-10: {record?.primaryIcd10}</Tag>}
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <HeartOutlined style={{ color: '#ef4444' }} /> Sinh Hiệu Lâm Sàng ({Array.isArray(record?.vitalSigns) ? record.vitalSigns.length : (record?.vitalSigns ? 1 : 0)})
                </span>
              ),
              children: (
                <div className="table-responsive-container">
                  <Table
                    columns={vitalsColumns}
                    dataSource={Array.isArray(record?.vitalSigns) ? record.vitalSigns : (record?.vitalSigns ? [record.vitalSigns] : [])}
                    rowKey="id"
                    pagination={false}
                    locale={{ emptyText: 'Chưa có bản ghi sinh hiệu nào' }}
                  />
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <MedicineBoxOutlined style={{ color: '#0284c7' }} /> Chi Tiết Chuyên Khoa
                </span>
              ),
              children: (
                <div>
                  {record?.internalDetail && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Alert message="Khám chuyên khoa Nội (MS: 01/BV-01 Bộ Y Tế)" type="info" showIcon />
                      <div>
                        <Text strong>Tuần hoàn: </Text>
                        <span>{record.internalDetail.circulatorySystem || 'Bình thường'}</span>
                      </div>
                      <div>
                        <Text strong>Hô hấp: </Text>
                        <span>{record.internalDetail.respiratorySystem || 'Bình thường'}</span>
                      </div>
                      <div>
                        <Text strong>Tiêu hóa: </Text>
                        <span>{record.internalDetail.digestiveSystem || 'Bình thường'}</span>
                      </div>
                      <div>
                        <Text strong>Bệnh mạn tính kết hợp: </Text>
                        <span>{record.internalDetail.chronicConditionSummary || 'Không ghi nhận'}</span>
                      </div>
                    </div>
                  )}

                  {record?.surgicalDetail && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Alert message="Khám chuyên khoa Ngoại (MS: 10/BV-01 Bộ Y Tế)" type="warning" showIcon />
                      <div>
                        <Text strong>Chẩn đoán trước mổ: </Text>
                        <span>{record.surgicalDetail.preOpDiagnosis || '—'}</span>
                      </div>
                      <div>
                        <Text strong>Chẩn đoán sau mổ: </Text>
                        <span>{record.surgicalDetail.postOpDiagnosis || '—'}</span>
                      </div>
                      <div>
                        <Text strong>Phương pháp vô cảm: </Text>
                        <span>{record.surgicalDetail.anesthesiaMethod || '—'}</span>
                      </div>
                      <div>
                        <Text strong>Theo dõi vết mổ/dẫn lưu: </Text>
                        <span>{record.surgicalDetail.postOpMonitoring || '—'}</span>
                      </div>
                    </div>
                  )}

                  {record?.pediatricDetail && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Alert message="Khám chuyên khoa Nhi (MS: 02/BV-01 Bộ Y Tế)" type="success" showIcon />
                      <div>
                        <Text strong>Cân nặng lúc sinh: </Text>
                        <span>{record.pediatricDetail.birthWeightGrams ? `${record.pediatricDetail.birthWeightGrams} gram` : '—'}</span>
                      </div>
                      <div>
                        <Text strong>Chỉ số Apgar: </Text>
                        <span>1 phút: {record.pediatricDetail.apgar1min || '—'} | 5 phút: {record.pediatricDetail.apgar5min || '—'}</span>
                      </div>
                      <div>
                        <Text strong>Chế độ dinh dưỡng: </Text>
                        <span>{record.pediatricDetail.feedingRegimen || '—'}</span>
                      </div>
                    </div>
                  )}

                  {record?.obstetricDetail && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Alert message="Quy chuẩn Sản khoa & Công thức Naegele" type="error" showIcon />
                      <div>
                        <Text strong>Ngày kinh cuối (LMP): </Text>
                        <span>{formatVnDate(record.obstetricDetail.lmpDate)}</span>
                      </div>
                      <div>
                        <Text strong>Ngày dự sinh (EDD - Naegele): </Text>
                        <Tag color="magenta" style={{ fontWeight: 600 }}>{formatVnDate(record.obstetricDetail.eddDate)}</Tag>
                      </div>
                      <div>
                        <Text strong>Tuổi thai: </Text>
                        <span>{record.obstetricDetail.gestationalAgeWeeks ? `${record.obstetricDetail.gestationalAgeWeeks} tuần` : '—'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <span>
                  <HistoryOutlined style={{ color: '#8b5cf6' }} /> Luân Chuyển Khoa & Timeline
                </span>
              ),
              children: (
                <div style={{ padding: '16px 8px' }}>
                  {timeline.length > 0 ? (
                    <Timeline
                      items={timeline.map((item) => ({
                        color: 'blue',
                        children: (
                          <div>
                            <strong>{item.title}</strong>
                            <p style={{ margin: '4px 0', color: '#64748b' }}>{item.description}</p>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatVnDateTime(item.timestamp)}</span>
                          </div>
                        ),
                      }))}
                    />
                  ) : (
                    <Text type="secondary">Chưa có lịch sử luân chuyển khoa phòng cho đợt điều trị này.</Text>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default MedicalRecordDetailPage;
