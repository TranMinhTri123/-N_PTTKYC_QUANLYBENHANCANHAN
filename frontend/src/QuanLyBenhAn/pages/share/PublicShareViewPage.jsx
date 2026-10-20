import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  Result,
  Button,
  Descriptions,
  Tag,
  Tabs,
  Table,
  Typography,
  Space,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  SafetyCertificateOutlined,
  HeartOutlined,
  AlertOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import shareService from '../../services/shareService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { maskIdentity, formatVnDate, calculateBmi } from '../../utils/medicalCalculators';

const { Title, Text, Paragraph } = Typography;

export const PublicShareViewPage = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const res = await shareService.verifyPublicShareToken(token);
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Liên kết chia sẻ không hợp lệ hoặc đã hết hạn truy cập');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedData();
  }, [token]);

  if (loading) {
    return <LoadingSpinner tip="Đang xác minh liên kết chia sẻ y tế..." />;
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: 800, margin: '80px auto', padding: 20 }}>
        <Card style={{ textAlign: 'center', borderRadius: 12 }}>
          <Result
            status="warning"
            title="Liên kết chia sẻ không khả dụng"
            subTitle={error || 'Thời hạn xem hồ sơ đã hết hạn hoặc bệnh nhân đã thu hồi quyền truy cập.'}
            extra={
              <Link to="/login">
                <Button type="primary">Về trang chủ PHR</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  const profile = data.profile || {};
  const allergies = data.allergies || [];
  const chronicDiseases = data.chronicDiseases || [];
  const records = data.medicalRecords || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header Ban Giám Định Y Tế */}
        <Card
          style={{
            marginBottom: 20,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center">
                <SafetyCertificateOutlined style={{ fontSize: 36, color: '#e0f2fe' }} />
                <div>
                  <h2 style={{ color: '#fff', margin: 0, fontSize: 22 }}>
                    CỔNG THÔNG TIN Y TẾ - CHẾ ĐỘ XEM BÁC SĨ
                  </h2>
                  <p style={{ color: '#bae6fd', margin: 0, fontSize: 14 }}>
                    Hồ sơ được chia sẻ có kiểm soát bảo mật theo tiêu chuẩn HIPAA & Bộ Y Tế
                  </p>
                </div>
              </Space>
            </Col>
            <Col>
              <Tag color="cyan" style={{ fontSize: 13, padding: '4px 12px' }}>
                Quyền hạn: {data.accessLevel === 'FULL_ACCESS' ? 'Toàn bộ hồ sơ' : 'Chỉ đọc'}
              </Tag>
            </Col>
          </Row>
        </Card>

        {/* Thông tin bệnh nhân */}
        <Card title="1. Thông tin định danh & Chỉ số cơ bản" style={{ marginBottom: 20 }}>
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Họ và tên bệnh nhân">
              <strong>{profile.fullName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {formatVnDate(profile.dateOfBirth)}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {profile.gender === 'MALE' ? 'Nam' : profile.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
            </Descriptions.Item>

            <Descriptions.Item label="Nhóm máu">
              <Tag color="magenta">{profile.bloodGroup || 'Chưa rõ'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số CCCD">
              {maskIdentity(profile.nationalId, 'CCCD')}
            </Descriptions.Item>
            <Descriptions.Item label="Thẻ BHYT">
              {maskIdentity(profile.healthInsuranceNumber, 'BHYT')}
            </Descriptions.Item>

            <Descriptions.Item label="Chiều cao">
              {profile.heightCm ? `${profile.heightCm} cm` : 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Cân nặng">
              {profile.weightKg ? `${profile.weightKg} kg` : 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Chỉ số BMI">
              {profile.heightCm && profile.weightKg ? (
                (() => {
                  const bmi = calculateBmi(profile.weightKg, profile.heightCm);
                  return (
                    <span>
                      <strong>{bmi.bmi}</strong> ({bmi.classificationVi})
                    </span>
                  );
                })()
              ) : (
                'Chưa có'
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Cảnh báo dị ứng nghiêm trọng */}
        {allergies.length > 0 && (
          <Card
            title={
              <Space>
                <AlertOutlined style={{ color: '#dc2626' }} />
                <span style={{ color: '#dc2626' }}>CẢNH BÁO TIỀN SỬ DỊ ỨNG THUỐC & DỊ NGUYÊN</span>
              </Space>
            }
            style={{ marginBottom: 20, borderColor: '#fca5a5', background: '#fef2f2' }}
          >
            <Row gutter={[12, 12]}>
              {allergies.map((a) => (
                <Col xs={24} sm={12} md={8} key={a.id}>
                  <Card size="small" style={{ borderRadius: 8, borderColor: '#fecaca' }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>{a.allergenName}</strong>{' '}
                      <Tag color="error">{a.severity}</Tag>
                    </div>
                    <div style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>
                      Biểu hiện: {a.reactionDescription || 'Phản vệ'}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Lịch sử bệnh án & bệnh mạn tính */}
        <Card title="2. Lịch sử khám bệnh & Bệnh mãn tính">
          <Tabs
            defaultActiveKey="records"
            items={[
              {
                key: 'records',
                label: (
                  <span>
                    <FileTextOutlined /> Lịch sử đợt khám ({records.length})
                  </span>
                ),
                children: (
                  <div className="table-responsive-container">
                    <Table
                      dataSource={Array.isArray(records) ? records : []}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                      locale={{ emptyText: 'Chưa có dữ liệu đợt khám' }}
                      columns={[
                        {
                          title: 'Mã bệnh án',
                          dataIndex: 'recordCode',
                          key: 'recordCode',
                          render: (code) => <strong>{code}</strong>,
                        },
                        {
                          title: 'Ngày khám',
                          dataIndex: 'visitDate',
                          key: 'visitDate',
                          render: (date) => formatVnDate(date),
                        },
                        {
                          title: 'Cơ sở y tế',
                          dataIndex: 'hospitalName',
                          key: 'hospitalName',
                        },
                        {
                          title: 'Bác sĩ điều trị',
                          dataIndex: 'doctorName',
                          key: 'doctorName',
                        },
                        {
                          title: 'Chẩn đoán sơ bộ / ICD-10',
                          key: 'diagnosis',
                          render: (_, r) => (
                            <div>
                              <div>{r.provisionalDiagnosis}</div>
                              {r.icd10Code && (
                                <Tag color="blue" style={{ marginTop: 4 }}>
                                  {r.icd10Code}: {r.icd10DiseaseName}
                                </Tag>
                              )}
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              },
              {
                key: 'chronic',
                label: (
                  <span>
                    <HeartOutlined /> Bệnh mãn tính ({Array.isArray(chronicDiseases) ? chronicDiseases.length : 0})
                  </span>
                ),
                children: (
                  <div className="table-responsive-container">
                    <Table
                      dataSource={Array.isArray(chronicDiseases) ? chronicDiseases : []}
                      rowKey="id"
                      pagination={false}
                      locale={{ emptyText: 'Không có ghi nhận bệnh mãn tính' }}
                      columns={[
                        {
                          title: 'Tên bệnh mãn tính',
                          dataIndex: 'diseaseName',
                          key: 'diseaseName',
                          render: (name) => <strong>{name}</strong>,
                        },
                        {
                          title: 'Mã ICD-10',
                          dataIndex: 'icd10Code',
                          key: 'icd10Code',
                          render: (code) => (code ? <Tag color="purple">{code}</Tag> : 'N/A'),
                        },
                        {
                          title: 'Thời gian phát hiện',
                          dataIndex: 'diagnosedYear',
                          key: 'diagnosedYear',
                          render: (yr) => `Năm ${yr}`,
                        },
                        {
                          title: 'Trạng thái kiểm soát',
                          dataIndex: 'status',
                          key: 'status',
                          render: (st) => <Tag color="blue">{st}</Tag>,
                        },
                      ]}
                    />
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* Footer Miễn trừ Y tế */}
        <div style={{ textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 13 }}>
          <Paragraph>
            <strong>Tuyên bố y tế:</strong> Dữ liệu trên hệ thống PHR này chỉ mang tính chất tham khảo lâm sàng.
            Bác sĩ thăm khám chịu trách nhiệm chẩn đoán và quyết định phác đồ điều trị chính thức theo chuyên môn y khoa.
          </Paragraph>
          <Text type="secondary">
            © {new Date().getFullYear()} PHR VIỆT NAM • Hệ Thống Quản Lý Bệnh Án Cá Nhân
          </Text>
        </div>
      </div>
    </div>
  );
};

export default PublicShareViewPage;
