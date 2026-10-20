import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Table,
  Typography,
  Space,
  Row,
  Col,
  message,
  Timeline,
  Tag,
  Divider,
} from 'antd';
import {
  MedicineBoxOutlined,
  PlusOutlined,
  FileDoneOutlined,
  UserOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import doctorNoteService from '../../services/doctorNoteService';
import medicalRecordService from '../../services/medicalRecordService';
import { useAuth } from '../../context/AuthContext';
import { formatVnDate } from '../../utils/medicalCalculators';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const DoctorWorkspacePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Load all records in the system that doctor can view
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await medicalRecordService.getRecords({ size: 100 });
        const list = res?.data?.content || (Array.isArray(res?.data) ? res.data : []);
        setRecords(list);
        if (list.length > 0) {
          setSelectedRecordId(list[0].id);
        }
      } catch (err) {
        message.error('Không thể tải danh sách bệnh án: ' + (err.message || 'Lỗi'));
      }
    };
    fetchRecords();
  }, []);

  // Load doctor notes for record
  const loadNotes = async (recordId) => {
    if (!recordId) return;
    setLoading(true);
    try {
      const res = await doctorNoteService.getNotesByRecord(recordId);
      const list = res?.data?.content || (Array.isArray(res?.data) ? res.data : []);
      setNotes(list);
    } catch (err) {
      message.error('Không thể tải lịch sử ghi chú bác sĩ: ' + (err.message || 'Lỗi'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRecordId) {
      loadNotes(selectedRecordId);
    }
  }, [selectedRecordId]);

  const handleAddNote = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        medicalRecordId: selectedRecordId,
        doctorName: values.doctorName || user?.fullName || 'Bác sĩ điều trị',
        department: values.department,
        evaluationNote: values.evaluationNote,
        clinicalAdvice: values.clinicalAdvice,
        followupPlan: values.followupPlan,
      };
      await doctorNoteService.addNote(payload);
      message.success('Thêm nhận xét chuyên môn thành công!');
      form.resetFields();
      loadNotes(selectedRecordId);
    } catch (err) {
      message.error(err.message || 'Lỗi khi lưu nhận xét bác sĩ');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRecord = records.find((r) => r.id === selectedRecordId);

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ margin: 0, color: '#0f766e' }}>
            Bàn Khám Bệnh & Hội Chẩn
          </Title>
        </Col>
      </Row>

      {/* Bộ chọn bệnh án */}
      <Card style={{ marginBottom: 20 }}>
        <Row align="middle" gutter={16}>
          <Col xs={24} md={6}>
            <Text strong>Chọn bệnh án hội chẩn:</Text>
          </Col>
          <Col xs={24} md={18}>
            <Select
              style={{ width: '100%' }}
              value={selectedRecordId}
              onChange={(val) => setSelectedRecordId(val)}
              placeholder="Chọn đợt khám bệnh nhân"
              disabled={records.length === 0}
            >
              {(Array.isArray(records) ? records : []).map((r) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.medicalRecordCode || r.recordCode || `BA-${r.id}`} - Bệnh nhân: {r.profileFullName || 'Bệnh nhân'} ({r.hospitalName || 'Bệnh viện'} - {formatVnDate(r.visitDate)})
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {selectedRecord && (
        <Card
          title={
            <span>
              <UserOutlined /> Thông tin tóm tắt đợt khám: <strong>{selectedRecord.recordCode}</strong>
            </span>
          }
          style={{ marginBottom: 20, background: '#f8fafc' }}
        >
          <Row gutter={[16, 8]}>
            <Col xs={24} md={8}>
              <Text type="secondary">Bệnh nhân: </Text>
              <strong>{selectedRecord.profileFullName}</strong>
            </Col>
            <Col xs={24} md={8}>
              <Text type="secondary">Cơ sở khám: </Text>
              <strong>{selectedRecord.hospitalName}</strong>
            </Col>
            <Col xs={24} md={8}>
              <Text type="secondary">Chuyên khoa: </Text>
              <strong>{selectedRecord.departmentType}</strong>
            </Col>
            <Col xs={24} md={12}>
              <Text type="secondary">Lý do khám: </Text>
              <span>{selectedRecord.chiefComplaint || 'Không có'}</span>
            </Col>
            <Col xs={24} md={12}>
              <Text type="secondary">Chẩn đoán: </Text>
              <strong style={{ color: '#0284c7' }}>
                {selectedRecord.provisionalDiagnosis}
              </strong>
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={20}>
        {/* Form thêm nhận xét */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <PlusOutlined style={{ color: '#0284c7' }} /> Nhập nhận xét & tư vấn chuyên môn
              </span>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddNote}
              initialValues={{
                doctorName: user?.fullName || '',
                department: selectedRecord?.departmentType || 'Nội khoa',
              }}
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="doctorName"
                    label="Họ tên Bác sĩ"
                    rules={[{ required: true, message: 'Nhập họ tên bác sĩ' }]}
                  >
                    <Input placeholder="BS. Nguyễn Văn A" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="department"
                    label="Chuyên khoa"
                    rules={[{ required: true, message: 'Nhập chuyên khoa' }]}
                  >
                    <Input placeholder="Khoa Tim mạch..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="evaluationNote"
                label="Đánh giá tình trạng lâm sàng & Diễn biến"
                rules={[{ required: true, message: 'Vui lòng nhập đánh giá tình trạng' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Ghi nhận đánh giá chuyên môn: mạch, huyết áp, triệu chứng thực thể, mức độ đáp ứng thuốc..."
                />
              </Form.Item>

              <Form.Item
                name="clinicalAdvice"
                label="Lời dặn & Tư vấn điều trị cho bệnh nhân"
              >
                <TextArea
                  rows={3}
                  placeholder="Chế độ ăn giảm muối, uống nhiều nước, nghỉ ngơi, theo dõi triệu chứng..."
                />
              </Form.Item>

              <Form.Item
                name="followupPlan"
                label="Kế hoạch theo dõi & Tái khám"
              >
                <Input placeholder="Ví dụ: Tái khám sau 2 tuần mang theo xét nghiệm men gan..." />
              </Form.Item>

              <div style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={submitting}
                  icon={<FileDoneOutlined />}
                  disabled={!selectedRecordId}
                >
                  Lưu nhận xét chuyên môn
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* Lịch sử nhận xét của các bác sĩ */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <CommentOutlined style={{ color: '#0284c7' }} /> Lịch sử ghi chú của Bác sĩ ({notes.length})
              </span>
            }
          >
            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                Chưa có ghi chú bác sĩ nào cho đợt khám này
              </div>
            ) : (
              <Timeline
                style={{ marginTop: 10 }}
                items={notes.map((n) => ({
                  color: '#0284c7',
                  children: (
                    <Card
                      size="small"
                      style={{
                        marginBottom: 16,
                        borderRadius: 8,
                        background: '#f8fafc',
                        borderLeft: '4px solid #0284c7',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{n.doctorName}</strong>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(n.createdAt).format('HH:mm - DD/MM/YYYY')}
                        </Text>
                      </div>
                      <Tag color="cyan" style={{ marginTop: 4, marginBottom: 8 }}>
                        Khoa: {n.department || 'Đa khoa'}
                      </Tag>
                      <div>
                        <Text strong>Đánh giá: </Text>
                        <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{n.evaluationNote}</Paragraph>
                      </div>
                      {n.clinicalAdvice && (
                        <div style={{ marginTop: 8 }}>
                          <Text strong>Lời dặn: </Text>
                          <Text>{n.clinicalAdvice}</Text>
                        </div>
                      )}
                      {n.followupPlan && (
                        <div style={{ marginTop: 8 }}>
                          <Text strong>Kế hoạch tái khám: </Text>
                          <Tag color="orange">{n.followupPlan}</Tag>
                        </div>
                      )}
                    </Card>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorWorkspacePage;
