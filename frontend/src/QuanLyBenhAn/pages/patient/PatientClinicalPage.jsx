import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Tabs,
  Table,
  Typography,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Image,
  Select,
  Input,
  Checkbox,
  Badge,
  Spin,
  Empty,
  Avatar,
  Descriptions,
  Tooltip,
} from 'antd';
import {
  ExperimentOutlined,
  FileImageOutlined,
  AlertOutlined,
  SearchOutlined,
  UserOutlined,
  FilterOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import clinicalService from '../../services/clinicalService';
import profileService from '../../services/profileService';
import medicalRecordService from '../../services/medicalRecordService';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const PatientClinicalPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('ALL');
  const [labTests, setLabTests] = useState([]);
  const [imagings, setImagings] = useState([]);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAbnormalOnly, setShowAbnormalOnly] = useState(false);

  // Khởi tạo và nạp dữ liệu từ Backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profRes, recRes] = await Promise.allSettled([
          profileService.getProfiles(),
          medicalRecordService.getRecords({ size: 100 }),
        ]);

        const profList = profRes.status === 'fulfilled' && profRes.value?.data ? profRes.value.data : [];
        const recList = recRes.status === 'fulfilled' && recRes.value?.data
          ? (Array.isArray(recRes.value.data) ? recRes.value.data : (recRes.value.data.content || []))
          : [];

        setProfiles(profList);
        setRecords(recList);

        // Nạp kết quả xét nghiệm và CĐHA cho từng bệnh án
        const allLabs = [];
        const allImgs = [];

        for (const rec of recList) {
          const prof = profList.find((p) => p.id === rec.profileId);
          const profName = rec.profileFullName || prof?.fullName || 'Người bệnh';
          const profRel = prof?.relationship || 'SELF';

          try {
            const [labRes, imgRes] = await Promise.allSettled([
              clinicalService.getLabTestsByRecord(rec.id),
              clinicalService.getImagingByRecord(rec.id),
            ]);

            if (labRes.status === 'fulfilled' && Array.isArray(labRes.value?.data)) {
              labRes.value.data.forEach((item) => {
                allLabs.push({
                  ...item,
                  profileId: rec.profileId,
                  profileName,
                  relationship: profRel,
                  hospitalName: rec.hospitalName,
                  recordCode: rec.medicalRecordCode || `#BA-${rec.id}`,
                  primaryDiagnosis: rec.primaryDiagnosis,
                });
              });
            }

            if (imgRes.status === 'fulfilled' && Array.isArray(imgRes.value?.data)) {
              imgRes.value.data.forEach((item) => {
                // Link ảnh mẫu minh họa y khoa sinh động
                let sampleImgUrl = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80';
                if (item.imagingModality?.includes('Siêu Âm')) {
                  sampleImgUrl = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80';
                } else if (item.imagingModality?.includes('Điện Tâm Đồ')) {
                  sampleImgUrl = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80';
                }

                allImgs.push({
                  ...item,
                  imageUrl: item.imageUrl || sampleImgUrl,
                  profileId: rec.profileId,
                  profileName,
                  relationship: profRel,
                  hospitalName: rec.hospitalName,
                  recordCode: rec.medicalRecordCode || `#BA-${rec.id}`,
                  primaryDiagnosis: rec.primaryDiagnosis,
                });
              });
            }
          } catch (e) {
            console.error('Lỗi khi tải cận lâm sàng cho bệnh án #' + rec.id, e);
          }
        }

        setLabTests(allLabs);
        setImagings(allImgs);
      } catch (err) {
        console.error('Lỗi tổng khi nạp trang cận lâm sàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Thông tin thành viên đang chọn
  const currentProfile = useMemo(() => {
    if (selectedProfileId === 'ALL') return null;
    return profiles.find((p) => p.id === selectedProfileId) || null;
  }, [profiles, selectedProfileId]);

  // Danh mục xét nghiệm duy nhất
  const categories = useMemo(() => {
    const set = new Set();
    labTests.forEach((t) => {
      if (t.testCategory) set.add(t.testCategory);
    });
    return Array.from(set);
  }, [labTests]);

  // Lọc danh sách xét nghiệm theo thành viên, danh mục, từ khóa, bất thường
  const filteredLabTests = useMemo(() => {
    return labTests.filter((item) => {
      if (selectedProfileId !== 'ALL' && item.profileId !== selectedProfileId) return false;
      if (selectedCategory !== 'ALL' && item.testCategory !== selectedCategory) return false;
      if (showAbnormalOnly && !item.abnormal) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.testName?.toLowerCase().includes(term);
        const matchCat = item.testCategory?.toLowerCase().includes(term);
        const matchEval = item.evaluation?.toLowerCase().includes(term);
        if (!matchName && !matchCat && !matchEval) return false;
      }
      return true;
    });
  }, [labTests, selectedProfileId, selectedCategory, showAbnormalOnly, searchTerm]);

  // Lọc chẩn đoán hình ảnh theo thành viên
  const filteredImagings = useMemo(() => {
    return imagings.filter((item) => {
      if (selectedProfileId !== 'ALL' && item.profileId !== selectedProfileId) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchMod = item.imagingModality?.toLowerCase().includes(term);
        const matchReg = item.anatomicalRegion?.toLowerCase().includes(term);
        const matchConc = item.conclusion?.toLowerCase().includes(term);
        if (!matchMod && !matchReg && !matchConc) return false;
      }
      return true;
    });
  }, [imagings, selectedProfileId, searchTerm]);

  // Số lượng bất thường
  const abnormalCount = useMemo(() => {
    return filteredLabTests.filter((t) => t.abnormal).length;
  }, [filteredLabTests]);

  const renderRelationshipTag = (rel) => {
    const map = {
      SELF: { label: 'Bản thân', color: 'blue' },
      SPOUSE: { label: 'Vợ/Chồng', color: 'pink' },
      CHILD: { label: 'Con', color: 'green' },
      PARENT: { label: 'Bố/Mẹ', color: 'orange' },
      OTHER: { label: 'Người thân', color: 'purple' },
    };
    const t = map[rel] || { label: 'Gia đình', color: 'default' };
    return <Tag color={t.color} style={{ fontSize: 11, marginRight: 0 }}>{t.label}</Tag>;
  };

  return (
    <div>
      {/* Tiêu đề & Chọn hồ sơ người thân */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Xét Nghiệm & Chẩn Đoán Hình Ảnh
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý kết quả cận lâm sàng, sinh hóa máu, nước tiểu và hình ảnh chụp chiếu của các thành viên
          </Text>
        </div>

        {/* BỘ CHỌN THÀNH VIÊN TRỰC QUAN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Text strong style={{ color: '#334155' }}>
            <UserOutlined style={{ color: '#0284c7', marginRight: 6 }} />
            Xem kết quả của:
          </Text>
          <Select
            value={selectedProfileId}
            onChange={(val) => setSelectedProfileId(val)}
            style={{ width: 260 }}
            size="large"
          >
            <Option value="ALL">
              <strong> Tất cả thành viên trong gia đình ({profiles.length})</strong>
            </Option>
            {profiles.map((p) => (
              <Option key={p.id} value={p.id}>
                <Space>
                  <span>{p.fullName}</span>
                  {renderRelationshipTag(p.relationship)}
                </Space>
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* THÔNG TIN THÀNH VIÊN ĐƯỢC CHỌN (NẾU CHỌN CỤ THỂ) */}
      {currentProfile && (
        <Card
          size="small"
          style={{
            borderRadius: 12,
            marginBottom: 20,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
            borderColor: '#bae6fd',
          }}
        >
          <Row gutter={[16, 12]} align="middle">
            <Col xs={24} sm={16} md={18}>
              <Space size="middle" align="center">
                <Avatar
                  size={48}
                  style={{ backgroundColor: '#0284c7', fontSize: 18, fontWeight: 700 }}
                >
                  {currentProfile.fullName ? currentProfile.fullName.charAt(0) : 'U'}
                </Avatar>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text strong style={{ fontSize: 16, color: '#0f172a' }}>
                      {currentProfile.fullName}
                    </Text>
                    {renderRelationshipTag(currentProfile.relationship)}
                    <Tag color="cyan">Nhóm máu: {currentProfile.bloodType || 'Chưa rõ'}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>
                    Ngày sinh: {formatDate(currentProfile.dateOfBirth)} • Giới tính: {currentProfile.gender === 'MALE' ? 'Nam' : 'Nữ'} • Số thẻ BHYT: {currentProfile.bhytNumber || 'Chưa có'}
                  </div>
                </div>
              </Space>
            </Col>
            <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
              <Space>
                <Tag color="blue" style={{ padding: '4px 10px', fontSize: 13 }}>
                  🧪 {filteredLabTests.length} xét nghiệm
                </Tag>
                <Tag color="purple" style={{ padding: '4px 10px', fontSize: 13 }}>
                  🖼️ {filteredImagings.length} phim chụp
                </Tag>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* CẢNH BÁO NẾU CÓ CHỈ SỐ BẤT THƯỜNG */}
      {abnormalCount > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<AlertOutlined />}
          message={
            <span>
              Hệ thống phát hiện <strong>{abnormalCount} chỉ số xét nghiệm vượt ngưỡng bình thường</strong> cần chú ý.
            </span>
          }
          description="Các chỉ số này có thể liên quan đến đợt viêm cấp tính hoặc rối loạn chuyển hóa cần theo dõi theo phác đồ của bác sĩ."
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {/* BỘ LỌC TÌM KIẾM NHANH */}
      <Card size="small" style={{ borderRadius: 10, marginBottom: 16, background: '#f8fafc' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Tìm theo tên xét nghiệm (Cholesterol, Bạch cầu, Glucose...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={8}>
            <Select
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              style={{ width: '100%' }}
              placeholder="Chọn nhóm xét nghiệm"
            >
              <Option value="ALL">Tất cả nhóm xét nghiệm ({categories.length})</Option>
              {categories.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={6}>
            <Checkbox
              checked={showAbnormalOnly}
              onChange={(e) => setShowAbnormalOnly(e.target.checked)}
            >
              <span style={{ color: '#dc2626', fontWeight: 600 }}>Chỉ xem chỉ số bất thường</span>
            </Checkbox>
          </Col>
        </Row>
      </Card>

      {/* BẢNG KẾT QUẢ THEO TABS */}
      <Card style={{ borderRadius: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" tip="Đang tải danh sách kết quả cận lâm sàng..." />
          </div>
        ) : (
          <Tabs
            defaultActiveKey="lab"
            items={[
              {
                key: 'lab',
                label: (
                  <span>
                    <ExperimentOutlined style={{ color: '#0284c7' }} /> Kết Quả Xét Nghiệm ({filteredLabTests.length})
                  </span>
                ),
                children: (
                  <div>
                    {filteredLabTests.length === 0 ? (
                      <Empty description="Không có kết quả xét nghiệm nào phù hợp với bộ lọc hiện tại." />
                    ) : (
                      <Table
                        dataSource={filteredLabTests}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        columns={[
                          {
                            title: 'Thành Viên',
                            key: 'profile',
                            width: 170,
                            render: (_, record) => (
                              <div>
                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{record.profileName}</div>
                                {renderRelationshipTag(record.relationship)}
                              </div>
                            ),
                          },
                          {
                            title: 'Tên Chỉ Số Xét Nghiệm',
                            dataIndex: 'testName',
                            key: 'testName',
                            render: (name, record) => (
                              <div>
                                <Text strong style={{ fontSize: 14 }}>{name}</Text>
                                <div>
                                  <Tag color="blue" style={{ fontSize: 11, marginTop: 2 }}>{record.testCategory || 'Xét nghiệm'}</Tag>
                                </div>
                              </div>
                            ),
                          },
                          {
                            title: 'Kết Quả Đo Được',
                            dataIndex: 'testValue',
                            key: 'testValue',
                            render: (val, record) => (
                              <span
                                style={{
                                  fontSize: 15,
                                  fontWeight: record.abnormal ? 700 : 600,
                                  color: record.abnormal ? '#ef4444' : '#059669',
                                }}
                              >
                                {val} {record.unit}
                              </span>
                            ),
                          },
                          {
                            title: 'Khoảng Tham Chiếu Chuẩn',
                            dataIndex: 'referenceRange',
                            key: 'referenceRange',
                            render: (ref) => <Text type="secondary">{ref || '-'}</Text>,
                          },
                          {
                            title: 'Đánh Giá Lâm Sàng',
                            dataIndex: 'abnormal',
                            key: 'abnormal',
                            render: (abnormal, record) =>
                              abnormal ? (
                                <Tag color="error" icon={<AlertOutlined />}>
                                  {record.evaluation || 'Vượt Ngưỡng (Bất Thường)'}
                                </Tag>
                              ) : (
                                <Tag color="success" icon={<CheckCircleOutlined />}>
                                  {record.evaluation || 'Bình Thường'}
                                </Tag>
                              ),
                          },
                          {
                            title: 'Bệnh Án / Nơi Khám',
                            key: 'recordRef',
                            render: (_, record) => (
                              <div>
                                <Tag
                                  color="geekblue"
                                  style={{ cursor: 'pointer', fontSize: 11 }}
                                  onClick={() => navigate(`/patient/records/${record.medicalRecordId}`)}
                                >
                                  {record.recordCode}
                                </Tag>
                                <div style={{ fontSize: 11, color: '#64748b' }}>{record.hospitalName}</div>
                              </div>
                            ),
                          },
                          {
                            title: 'Ngày Làm XN',
                            dataIndex: 'testDate',
                            key: 'testDate',
                            render: (date) => (date ? formatDate(date) : '-'),
                          },
                        ]}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: 'imaging',
                label: (
                  <span>
                    <FileImageOutlined style={{ color: '#10b981' }} /> Chẩn Đoán Hình Ảnh (Phim Chụp) ({filteredImagings.length})
                  </span>
                ),
                children: (
                  <div>
                    {filteredImagings.length === 0 ? (
                      <Empty description="Không có kết quả chẩn đoán hình ảnh nào cho thành viên này." />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {filteredImagings.map((img) => (
                          <Col xs={24} md={12} key={img.id}>
                            <Card
                              size="small"
                              style={{
                                borderRadius: 12,
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                              }}
                            >
                              <Row gutter={14} align="top">
                                <Col span={8}>
                                  <Image
                                    src={img.imageUrl}
                                    alt={img.imagingModality}
                                    style={{
                                      borderRadius: 8,
                                      width: '100%',
                                      height: 125,
                                      objectFit: 'cover',
                                    }}
                                  />
                                  <div style={{ textAlign: 'center', marginTop: 4 }}>
                                    <Tag color="cyan" style={{ margin: 0, fontSize: 10 }}>{img.anatomicalRegion || 'Cơ quan'}</Tag>
                                  </div>
                                </Col>
                                <Col span={16}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Title level={5} style={{ margin: 0, color: '#0f172a' }}>
                                      {img.imagingModality}
                                    </Title>
                                    {renderRelationshipTag(img.relationship)}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 600, margin: '2px 0' }}>
                                    Bệnh nhân: {img.profileName}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#64748b' }}>
                                    <CalendarOutlined style={{ marginRight: 4 }} />
                                    Ngày chụp: {formatDate(img.procedureDate)} • {img.hospitalName}
                                  </div>
                                  <Divider style={{ margin: '8px 0' }} />
                                  <div style={{ fontSize: 12, color: '#334155' }}>
                                    <strong>Kết luận bác sĩ:</strong>{' '}
                                    <span style={{ color: '#0369a1' }}>{img.conclusion}</span>
                                  </div>
                                  {img.findingsDescription && (
                                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                      <em>Mô tả: {img.findingsDescription}</em>
                                    </div>
                                  )}
                                  <div style={{ marginTop: 8 }}>
                                    <Button
                                      size="small"
                                      icon={<EyeOutlined />}
                                      onClick={() => navigate(`/patient/records/${img.medicalRecordId}`)}
                                    >
                                      Xem bệnh án {img.recordCode}
                                    </Button>
                                  </div>
                                </Col>
                              </Row>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default PatientClinicalPage;
