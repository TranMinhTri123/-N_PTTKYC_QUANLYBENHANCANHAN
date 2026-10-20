import React, { useState } from 'react';
import { Card, Table, Tag, Typography, Button, Space, Row, Col, Alert, Modal, Input, notification } from 'antd';
import {
  ExperimentOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  AlertOutlined,
  FileImageOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const DoctorClinicalReviewPage = () => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [conclusion, setConclusion] = useState('');

  // Dữ liệu mẫu kết quả cận lâm sàng ca trực
  const [labTests, setLabTests] = useState([
    {
      id: 1,
      patientName: 'Trần Văn Nam (45 tuổi)',
      testName: 'Đường Huyết Đói (Glucose)',
      resultValue: '8.4',
      unit: 'mmol/L',
      referenceRange: '3.9 - 6.4',
      isAbnormal: true,
      category: 'Sinh Hóa Máu',
      status: 'PENDING',
    },
    {
      id: 2,
      patientName: 'Nguyễn Thị Hoa (52 tuổi)',
      testName: 'Men Gan (ALT / GPT)',
      resultValue: '58.2',
      unit: 'U/L',
      referenceRange: '0 - 35',
      isAbnormal: true,
      category: 'Sinh Hóa Máu',
      status: 'PENDING',
    },
    {
      id: 3,
      patientName: 'Lê Hoàng Minh (30 tuổi)',
      testName: 'Tổng Phân Tích Tế Bào Máu (CBC)',
      resultValue: 'Bình thường',
      unit: '-',
      referenceRange: 'Chuẩn',
      isAbnormal: false,
      category: 'Huyết Học',
      status: 'APPROVED',
    },
    {
      id: 4,
      patientName: 'Phạm Thị Lan (60 tuổi)',
      testName: 'Chụp X-quang Phổi Thẳng Kỹ Thuật Số',
      resultValue: 'Mờ nhẹ đáy phổi phải, không tràn dịch',
      unit: '-',
      referenceRange: 'Phim chụp',
      isAbnormal: true,
      category: 'Chẩn Đoán Hình Ảnh',
      status: 'PENDING',
    },
  ]);

  const handleOpenReview = (record) => {
    setSelectedResult(record);
    setConclusion(record.conclusion || '');
    setModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedResult) return;
    setLabTests((prev) =>
      prev.map((item) =>
        item.id === selectedResult.id ? { ...item, status: 'APPROVED', conclusion } : item
      )
    );
    notification.success({
      message: 'Ký Duyệt Thành Công',
      description: `Đã ký duyệt kết quả ${selectedResult.testName} cho bệnh nhân ${selectedResult.patientName}.`,
    });
    setModalOpen(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
          Duyệt Kết Quả Cận Lâm Sàng
        </Title>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={labTests}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Bệnh Nhân',
              dataIndex: 'patientName',
              key: 'patientName',
              render: (name) => <Text strong>{name}</Text>,
            },
            {
              title: 'Chỉ Số / Phương Pháp',
              dataIndex: 'testName',
              key: 'testName',
              render: (name, record) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{name}</div>
                  <Tag color="cyan">{record.category}</Tag>
                </div>
              ),
            },
            {
              title: 'Kết Quả Đo Được',
              dataIndex: 'resultValue',
              key: 'resultValue',
              render: (val, record) => (
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: record.isAbnormal ? 700 : 500,
                    color: record.isAbnormal ? '#ef4444' : '#0f172a',
                  }}
                >
                  {val} {record.unit !== '-' ? record.unit : ''}
                </span>
              ),
            },
            {
              title: 'Khoảng Tham Chiếu',
              dataIndex: 'referenceRange',
              key: 'referenceRange',
            },
            {
              title: 'Cảnh Báo',
              dataIndex: 'isAbnormal',
              key: 'isAbnormal',
              render: (abnormal) =>
                abnormal ? (
                  <Tag color="error" icon={<AlertOutlined />}>
                    Bất Thường
                  </Tag>
                ) : (
                  <Tag color="success">Bình Thường</Tag>
                ),
            },
            {
              title: 'Trạng Thái',
              dataIndex: 'status',
              key: 'status',
              render: (status) =>
                status === 'APPROVED' ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Đã Ký Duyệt
                  </Tag>
                ) : (
                  <Tag color="orange">Chờ Duyệt</Tag>
                ),
            },
            {
              title: 'Thao Tác',
              key: 'action',
              render: (_, record) => (
                <Button
                  type="primary"
                  size="small"
                  icon={record.status === 'APPROVED' ? <EyeOutlined /> : <CheckCircleOutlined />}
                  onClick={() => handleOpenReview(record)}
                  style={{
                    background: record.status === 'APPROVED' ? '#64748b' : '#0f766e',
                    borderColor: record.status === 'APPROVED' ? '#64748b' : '#0f766e',
                  }}
                >
                  {record.status === 'APPROVED' ? 'Xem Lại' : 'Ký Duyệt'}
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Duyệt & Ghi Nhận Kết Luận */}
      <Modal
        title={`Ký Duyệt Kết Quả: ${selectedResult?.testName || ''}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            Hủy Bỏ
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
            style={{ background: '#0f766e', borderColor: '#0f766e' }}
          >
            Xác Nhận & Ký Duyệt
          </Button>,
        ]}
      >
        {selectedResult && (
          <div style={{ paddingTop: 8 }}>
            <p><strong>Bệnh nhân:</strong> {selectedResult.patientName}</p>
            <p>
              <strong>Kết quả định lượng:</strong>{' '}
              <span style={{ color: selectedResult.isAbnormal ? '#ef4444' : '#0f172a', fontWeight: 700 }}>
                {selectedResult.resultValue} {selectedResult.unit}
              </span>{' '}
              (Khoảng bình thường: {selectedResult.referenceRange})
            </p>

            <div style={{ marginTop: 14 }}>
              <Text strong>Kết luận & Ghi chú chuyên môn của Bác sĩ:</Text>
              <TextArea
                rows={3}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Ví dụ: Chỉ số đường huyết tăng nhẹ. Hướng dẫn chế độ ăn ít tinh bột và hẹn tái khám sau 2 tuần..."
                style={{ marginTop: 6 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorClinicalReviewPage;
