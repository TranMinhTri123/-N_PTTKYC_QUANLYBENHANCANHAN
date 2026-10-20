import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Upload,
} from 'antd';
import {
  ExperimentOutlined,
  PlusOutlined,
  FileImageOutlined,
  PaperClipOutlined,
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import clinicalService from '../../services/clinicalService';
import medicalRecordService from '../../services/medicalRecordService';
import profileService from '../../services/profileService';
import { formatVnDate } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ClinicalInvestigationsPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [labTests, setLabTests] = useState([]);
  const [imagingList, setImagingList] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isImagingModalOpen, setIsImagingModalOpen] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [labForm] = Form.useForm();
  const [imagingForm] = Form.useForm();
  const [attachForm] = Form.useForm();

  // Load records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await medicalRecordService.getMedicalRecords({ size: 100 });
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

  // Load clinical data when selected record changes
  const loadClinicalData = async (recordId) => {
    if (!recordId) return;
    setLoading(true);
    try {
      const [resLab, resImg, resAtt] = await Promise.all([
        clinicalService.getLabTestsByRecord(recordId),
        clinicalService.getImagingByRecord(recordId),
        clinicalService.getAttachmentsByRecord(recordId),
      ]);
      setLabTests(Array.isArray(resLab?.data) ? resLab.data : (resLab?.data?.content || []));
      setImagingList(Array.isArray(resImg?.data) ? resImg.data : (resImg?.data?.content || []));
      setAttachments(Array.isArray(resAtt?.data) ? resAtt.data : (resAtt?.data?.content || []));
    } catch (err) {
      message.error('Không thể tải dữ liệu cận lâm sàng của đợt khám: ' + (err.message || 'Lỗi'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRecordId) {
      loadClinicalData(selectedRecordId);
    }
  }, [selectedRecordId]);

  // Handle Lab Test submit
  const handleAddLab = async (values) => {
    setSubmitting(true);
    try {
      await clinicalService.addLabTest({
        medicalRecordId: selectedRecordId,
        testCategory: values.testCategory,
        testName: values.testName,
        resultValue: values.resultValue,
        unit: values.unit,
        referenceRange: values.referenceRange,
        isAbnormal: values.isAbnormal === 'true' || values.isAbnormal === true,
        notes: values.notes,
        testedAt: values.testedAt ? values.testedAt.format('YYYY-MM-DDTHH:mm:ss') : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      });
      message.success('Thêm kết quả xét nghiệm thành công!');
      setIsLabModalOpen(false);
      labForm.resetFields();
      loadClinicalData(selectedRecordId);
    } catch (err) {
      message.error(err.message || 'Lỗi khi thêm xét nghiệm');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Imaging submit
  const handleAddImaging = async (values) => {
    setSubmitting(true);
    try {
      await clinicalService.addImaging({
        medicalRecordId: selectedRecordId,
        modality: values.modality,
        bodyPart: values.bodyPart,
        findings: values.findings,
        conclusion: values.conclusion,
        performedAt: values.performedAt ? values.performedAt.format('YYYY-MM-DDTHH:mm:ss') : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      });
      message.success('Thêm kết quả chẩn đoán hình ảnh thành công!');
      setIsImagingModalOpen(false);
      imagingForm.resetFields();
      loadClinicalData(selectedRecordId);
    } catch (err) {
      message.error(err.message || 'Lỗi khi thêm kết quả CĐHA');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Attachment submit
  const handleAddAttachment = async (values) => {
    setSubmitting(true);
    try {
      await clinicalService.addAttachment({
        medicalRecordId: selectedRecordId,
        fileName: values.fileName,
        fileType: values.fileType,
        fileUrl: values.fileUrl,
        fileSizeMb: Number(values.fileSizeMb || 1),
        description: values.description,
      });
      message.success('Đính kèm tài liệu y tế thành công!');
      setIsAttachModalOpen(false);
      attachForm.resetFields();
      loadClinicalData(selectedRecordId);
    } catch (err) {
      message.error(err.message || 'Lỗi khi đính kèm tài liệu');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete helpers
  const handleDeleteLab = async (id) => {
    try {
      await clinicalService.deleteLabTest(id);
      message.success('Đã xóa chỉ số xét nghiệm');
      loadClinicalData(selectedRecordId);
    } catch (err) {
      message.error('Không thể xóa xét nghiệm');
    }
  };

  const handleDeleteImaging = async (id) => {
    try {
      await clinicalService.deleteImaging(id);
      message.success('Đã xóa kết quả chụp chiếu');
      loadClinicalData(selectedRecordId);
    } catch (err) {
      message.error('Không thể xóa chẩn đoán hình ảnh');
    }
  };

  const handleDeleteAttachment = async (id) => {
    try {
      await clinicalService.deleteAttachment(id);
      message.success('Đã xóa tệp đính kèm');
      loadClinicalData(selectedRecordId);
    } catch (err) {
      message.error('Không thể xóa tệp');
    }
  };

  // Table columns
  const labColumns = [
    {
      title: 'Nhóm xét nghiệm',
      dataIndex: 'testCategory',
      key: 'testCategory',
      render: (cat) => <Tag color="blue">{cat || 'Huyết học / Sinh hóa'}</Tag>,
    },
    {
      title: 'Tên chỉ số',
      dataIndex: 'testName',
      key: 'testName',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Kết quả',
      dataIndex: 'resultValue',
      key: 'resultValue',
      render: (val, r) => (
        <span>
          <strong style={{ color: r.isAbnormal ? '#dc2626' : 'inherit', fontSize: 16 }}>
            {val}
          </strong>{' '}
          {r.unit}
        </span>
      ),
    },
    {
      title: 'Khoảng tham chiếu',
      dataIndex: 'referenceRange',
      key: 'referenceRange',
      render: (ref) => ref || <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'isAbnormal',
      key: 'isAbnormal',
      render: (isAbnormal) =>
        isAbnormal ? (
          <Tag color="error" icon={<AlertOutlined />}>
            Bất thường (Cảnh báo)
          </Tag>
        ) : (
          <Tag color="success">Bình thường</Tag>
        ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        <Popconfirm
          title="Xác nhận xóa chỉ số xét nghiệm này?"
          onConfirm={() => handleDeleteLab(r.id)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const imagingColumns = [
    {
      title: 'Phương pháp chụp',
      dataIndex: 'modality',
      key: 'modality',
      render: (m) => <Tag color="purple">{m}</Tag>,
    },
    {
      title: 'Vị trí giải phẫu',
      dataIndex: 'bodyPart',
      key: 'bodyPart',
      render: (bp) => <strong>{bp}</strong>,
    },
    {
      title: 'Mô tả hình ảnh',
      dataIndex: 'findings',
      key: 'findings',
      ellipsis: true,
    },
    {
      title: 'Kết luận bác sĩ CĐHA',
      dataIndex: 'conclusion',
      key: 'conclusion',
      render: (c) => <span style={{ color: '#0369a1', fontWeight: 600 }}>{c}</span>,
    },
    {
      title: 'Thời gian thực hiện',
      dataIndex: 'performedAt',
      key: 'performedAt',
      render: (date) => (date ? dayjs(date).format('HH:mm - DD/MM/YYYY') : 'N/A'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        <Popconfirm
          title="Xác nhận xóa kết quả chụp chiếu này?"
          onConfirm={() => handleDeleteImaging(r.id)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const attachColumns = [
    {
      title: 'Tên tài liệu',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (name, r) => (
        <Space>
          <PaperClipOutlined style={{ color: '#0284c7' }} />
          <strong>{name}</strong>
        </Space>
      ),
    },
    {
      title: 'Định dạng',
      dataIndex: 'fileType',
      key: 'fileType',
      render: (t) => <Tag>{t || 'DOCUMENT'}</Tag>,
    },
    {
      title: 'Dung lượng',
      dataIndex: 'fileSizeMb',
      key: 'fileSizeMb',
      render: (sz) => `${sz || 1} MB`,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        <Space>
          {r.fileUrl && (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => window.open(r.fileUrl, '_blank')}
            >
              Xem tệp
            </Button>
          )}
          <Popconfirm
            title="Xác nhận xóa tệp đính kèm này?"
            onConfirm={() => handleDeleteAttachment(r.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <ExperimentOutlined style={{ color: '#0284c7', marginRight: 10 }} />
            Cận Lâm Sàng & Tệp Đính Kèm Y Tế
          </Title>
          <Text type="secondary">
            Quản lý kết quả xét nghiệm sinh hóa, hình ảnh X-quang, CT, MRI và tài liệu y khoa
          </Text>
        </Col>
      </Row>

      {/* Thông báo nếu chưa có bệnh án */}
      {records.length === 0 && (
        <Card style={{ marginBottom: 20, borderRadius: 12, border: '1px dashed #93c5fd', background: '#eff6ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Text strong style={{ color: '#1e40af', fontSize: 15, display: 'block' }}>
                Bạn chưa có đợt khám bệnh án nào được ghi nhận
              </Text>
              <Text style={{ color: '#3b82f6', fontSize: 13 }}>
                Các kết quả xét nghiệm, chẩn đoán hình ảnh và tài liệu y khoa cần được gán với một đợt khám bệnh án cụ thể.
              </Text>
            </div>
            <Button type="primary" onClick={() => navigate('/records/create')}>
              + Tạo Bệnh Án Mới Ngay
            </Button>
          </div>
        </Card>
      )}

      {/* Bộ chọn bệnh án */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <Row align="middle" gutter={16}>
          <Col xs={24} md={6}>
            <Text strong>Chọn đợt khám / Bệnh án:</Text>
          </Col>
          <Col xs={24} md={18}>
            <Select
              style={{ width: '100%' }}
              value={selectedRecordId}
              onChange={(val) => setSelectedRecordId(val)}
              placeholder={records.length > 0 ? "Chọn đợt khám để xem cận lâm sàng" : "Chưa có đợt khám nào (Vui lòng tạo bệnh án trước)"}
              disabled={records.length === 0}
            >
              {(Array.isArray(records) ? records : []).map((r) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.medicalRecordCode || r.recordCode || `BA-${r.id}`} - {r.profileFullName || 'Bệnh nhân'} ({r.hospitalName || 'Bệnh viện'} - {formatVnDate(r.visitDate)})
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs
          defaultActiveKey="lab"
          items={[
            {
              key: 'lab',
              label: (
                <span>
                  <ExperimentOutlined />
                  Kết quả xét nghiệm ({labTests.length})
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsLabModalOpen(true)}
                      disabled={!selectedRecordId}
                    >
                      Thêm chỉ số xét nghiệm
                    </Button>
                  </div>
                  <div className="table-responsive-container">
                    <Table
                      columns={labColumns}
                      dataSource={Array.isArray(labTests) ? labTests : []}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      locale={{ emptyText: 'Chưa có kết quả xét nghiệm cho bệnh án này' }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'imaging',
              label: (
                <span>
                  <FileImageOutlined />
                  Chẩn đoán hình ảnh ({Array.isArray(imagingList) ? imagingList.length : 0})
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsImagingModalOpen(true)}
                      disabled={!selectedRecordId}
                    >
                      Thêm kết quả CĐHA
                    </Button>
                  </div>
                  <div className="table-responsive-container">
                    <Table
                      columns={imagingColumns}
                      dataSource={Array.isArray(imagingList) ? imagingList : []}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      locale={{ emptyText: 'Chưa có kết quả chẩn đoán hình ảnh cho bệnh án này' }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'attachments',
              label: (
                <span>
                  <PaperClipOutlined />
                  Tài liệu & Tệp đính kèm ({Array.isArray(attachments) ? attachments.length : 0})
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => setIsAttachModalOpen(true)}
                      disabled={!selectedRecordId}
                    >
                      Đính kèm tài liệu y tế
                    </Button>
                  </div>
                  <div className="table-responsive-container">
                    <Table
                      columns={attachColumns}
                      dataSource={Array.isArray(attachments) ? attachments : []}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      locale={{ emptyText: 'Chưa có tài liệu đính kèm cho bệnh án này' }}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal thêm xét nghiệm */}
      <Modal
        title="Thêm kết quả xét nghiệm cận lâm sàng"
        open={isLabModalOpen}
        onCancel={() => setIsLabModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={labForm} layout="vertical" onFinish={handleAddLab}>
          <Form.Item
            name="testCategory"
            label="Nhóm xét nghiệm"
            rules={[{ required: true, message: 'Chọn nhóm xét nghiệm' }]}
          >
            <Select placeholder="Chọn nhóm">
              <Select.Option value="Huyết học">Huyết học (CBC)</Select.Option>
              <Select.Option value="Sinh hóa máu">Sinh hóa máu (Glucose, Men gan, Creatinine...)</Select.Option>
              <Select.Option value="Nước tiểu">Tổng phân tích nước tiểu</Select.Option>
              <Select.Option value="Miễn dịch">Miễn dịch & Vi sinh</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={12}>
            <Col span={14}>
              <Form.Item
                name="testName"
                label="Tên chỉ số xét nghiệm"
                rules={[{ required: true, message: 'Nhập tên chỉ số' }]}
              >
                <Input placeholder="Ví dụ: Glucose, HbA1c, SGPT, RBC..." />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="unit" label="Đơn vị đo">
                <Input placeholder="mmol/L, mg/dL, %..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="resultValue"
                label="Kết quả đo được"
                rules={[{ required: true, message: 'Nhập giá trị kết quả' }]}
              >
                <Input placeholder="Ví dụ: 7.2" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="referenceRange" label="Khoảng tham chiếu chuẩn">
                <Input placeholder="Ví dụ: 3.9 - 6.4" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isAbnormal"
            label="Đánh giá chỉ số bất thường"
            rules={[{ required: true, message: 'Vui lòng chọn đánh giá' }]}
          >
            <Select placeholder="Chọn đánh giá">
              <Select.Option value="false">Bình thường (Trong ngưỡng an toàn)</Select.Option>
              <Select.Option value="true">Bất thường (Cần theo dõi/Cảnh báo)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú lâm sàng">
            <TextArea rows={2} placeholder="Nhận định của bác sĩ hoặc kỹ thuật viên xét nghiệm..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsLabModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Lưu kết quả
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal thêm chẩn đoán hình ảnh */}
      <Modal
        title="Thêm kết quả chẩn đoán hình ảnh"
        open={isImagingModalOpen}
        onCancel={() => setIsImagingModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={imagingForm} layout="vertical" onFinish={handleAddImaging}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="modality"
                label="Phương pháp chụp chiếu"
                rules={[{ required: true, message: 'Chọn phương pháp' }]}
              >
                <Select placeholder="Chọn phương pháp">
                  <Select.Option value="X-quang">X-quang kỹ thuật số (X-Ray)</Select.Option>
                  <Select.Option value="Siêu âm">Siêu âm màu (Ultrasound)</Select.Option>
                  <Select.Option value="CT Scanner">Cắt lớp vi tính (CT Scanner)</Select.Option>
                  <Select.Option value="MRI">Cộng hưởng từ (MRI)</Select.Option>
                  <Select.Option value="ECG">Điện tâm đồ (ECG)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bodyPart"
                label="Vị trí chụp chiếu"
                rules={[{ required: true, message: 'Nhập vị trí giải phẫu' }]}
              >
                <Input placeholder="Ví dụ: Lồng ngực thẳng, Ổ bụng tổng quát..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="findings" label="Mô tả tổn thương / Hình ảnh phát hiện">
            <TextArea rows={3} placeholder="Mô tả chi tiết hình ảnh quan sát được..." />
          </Form.Item>

          <Form.Item
            name="conclusion"
            label="Kết luận của bác sĩ CĐHA"
            rules={[{ required: true, message: 'Nhập kết luận' }]}
          >
            <Input placeholder="Ví dụ: Viêm phế quản co thắt, Gan nhiễm mỡ độ 1..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsImagingModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Lưu kết quả CĐHA
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal đính kèm tài liệu */}
      <Modal
        title="Đính kèm tài liệu / Tệp y tế (Tối đa 10MB)"
        open={isAttachModalOpen}
        onCancel={() => setIsAttachModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={attachForm} layout="vertical" onFinish={handleAddAttachment}>
          <Form.Item
            name="fileName"
            label="Tên tài liệu / Phiếu khám"
            rules={[{ required: true, message: 'Nhập tên tài liệu' }]}
          >
            <Input placeholder="Ví dụ: Phieu_sieu_am_bung.pdf, XQuang_phoi.png" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="fileType"
                label="Định dạng tệp"
                rules={[{ required: true, message: 'Chọn loại tệp' }]}
              >
                <Select placeholder="Chọn định dạng">
                  <Select.Option value="PDF">Tài liệu PDF</Select.Option>
                  <Select.Option value="IMAGE">Hình ảnh y tế (JPG/PNG)</Select.Option>
                  <Select.Option value="DICOM">Dữ liệu DICOM</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fileSizeMb"
                label="Dung lượng (MB - max 10MB)"
                rules={[{ required: true, message: 'Nhập dung lượng' }]}
              >
                <Input type="number" min={0.1} max={10} step={0.1} placeholder="Ví dụ: 2.5" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="fileUrl"
            label="Đường dẫn lưu trữ hoặc xem tài liệu"
            rules={[{ required: true, message: 'Nhập liên kết tệp' }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả ghi chú">
            <TextArea rows={2} placeholder="Phiếu kết quả chụp tại BV..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAttachModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Lưu tài liệu
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ClinicalInvestigationsPage;
