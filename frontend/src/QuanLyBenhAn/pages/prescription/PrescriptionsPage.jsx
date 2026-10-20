import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Tabs, Alert, Input, Space, Button, notification } from 'antd';
import { MedicineBoxOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import prescriptionService from '../../services/prescriptionService';
import profileService from '../../services/profileService';
import { formatVnDate } from '../../utils/medicalCalculators';

const { Title, Text } = Typography;

export const PrescriptionsPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [activeMeds, setActiveMeds] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);

  // Tra cứu thuốc
  const [searchKeyword, setSearchKeyword] = useState('');
  const [drugResults, setDrugResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await profileService.getProfiles();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        setProfiles(list);
        if (list.length > 0) {
          setSelectedProfileId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (selectedProfileId) {
      const fetchMeds = async () => {
        setLoadingMeds(true);
        try {
          const res = await prescriptionService.getActiveMedications(selectedProfileId);
          const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
          setActiveMeds(list);
        } catch (err) {
          console.error(err);
          setActiveMeds([]);
        } finally {
          setLoadingMeds(false);
        }
      };
      fetchMeds();
    }
  }, [selectedProfileId]);

  const handleSearchDrugs = async () => {
    if (!searchKeyword.trim()) return;
    setSearching(true);
    try {
      const res = await prescriptionService.searchMedicines(searchKeyword.trim());
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      setDrugResults(list);
    } catch (err) {
      notification.error({ message: 'Lỗi tra cứu', description: err.message });
      setDrugResults([]);
    } finally {
      setSearching(false);
    }
  };

  const medColumns = [
    {
      title: 'Tên Thuốc (Biệt Dược)',
      dataIndex: 'medicineName',
      key: 'medicineName',
      render: (name) => <strong style={{ color: '#0284c7' }}>{name}</strong>,
    },
    {
      title: 'Hoạt Chất Chính',
      dataIndex: 'activeIngredient',
      key: 'activeIngredient',
      render: (text) => text || '—',
    },
    {
      title: 'Liều Lượng & Đường Dùng',
      key: 'dosage',
      render: (_, r) => `${r.dosageAmount || ''} ${r.dosageUnit || ''} (${r.administrationRoute || 'Uống'})`,
    },
    {
      title: 'Tần Suất / Ngày',
      dataIndex: 'frequencyPerDay',
      key: 'frequencyPerDay',
      render: (freq) => (freq ? `${freq} lần/ngày` : '—'),
    },
    {
      title: 'Hướng Dẫn Sử Dụng',
      dataIndex: 'usageInstructions',
      key: 'usageInstructions',
      render: (text) => text || 'Uống sau ăn',
    },
    {
      title: 'Cảnh Báo An Toàn',
      dataIndex: 'hasAllergyWarning',
      key: 'hasAllergyWarning',
      render: (warn) => {
        if (warn) {
          return <Tag color="error" className="badge-severe-allergy">CẢNH BÁO DỊ ỨNG CHÉO</Tag>;
        }
        return <Tag color="success">An toàn</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Quản Lý Đơn Thuốc & Tủ Thuốc Gia Đình
        </Title>
        <Text type="secondary">
          Theo dõi các thuốc đang sử dụng hàng ngày và thuật toán tự động phát hiện phản ứng dị ứng thuốc chéo
        </Text>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <MedicineBoxOutlined /> Thuốc Đang Sử Dụng Hàng Ngày ({activeMeds.length})
                </span>
              ),
              children: (
                <div>
                  {profiles.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <Text strong style={{ marginRight: 10 }}>Xem tủ thuốc của thành viên:</Text>
                      <Space wrap>
                        {(Array.isArray(profiles) ? profiles : []).map((p) => (
                          <Button
                            key={p.id}
                            type={selectedProfileId === p.id ? 'primary' : 'default'}
                            onClick={() => setSelectedProfileId(p.id)}
                          >
                            {p.fullName} ({p.relationship})
                          </Button>
                        ))}
                      </Space>
                    </div>
                  )}

                  <Alert
                    type="info"
                    message="Tính năng An Toàn Dược: Hệ thống tự động đối chiếu các loại thuốc kê đơn với tiền sử dị ứng đã lưu để cảnh báo nguy cơ sốc phản vệ."
                    style={{ marginBottom: 16 }}
                    showIcon
                  />

                  <div className="table-responsive-container">
                    <Table
                      columns={medColumns}
                      dataSource={Array.isArray(activeMeds) ? activeMeds : []}
                      rowKey="id"
                      loading={loadingMeds}
                      pagination={false}
                      locale={{ emptyText: 'Hiện tại người bệnh không có thuốc nào đang phải uống duy trì' }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <SearchOutlined /> Tra Cứu Danh Mục Thuốc Quốc Gia
                </span>
              ),
              children: (
                <div>
                  <Space.Compact style={{ width: '100%', maxWidth: 500, marginBottom: 20 }}>
                    <Input
                      placeholder="Nhập tên thuốc hoặc hoạt chất (VD: Paracetamol, Amoxicillin...)"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onPressEnter={handleSearchDrugs}
                      size="large"
                    />
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      size="large"
                      loading={searching}
                      onClick={handleSearchDrugs}
                    >
                      Tìm Kiếm
                    </Button>
                  </Space.Compact>

                  <div className="table-responsive-container">
                    <Table
                      columns={[
                        { title: 'Tên Biệt Dược', dataIndex: 'brandName', key: 'brandName', render: (t) => <strong>{t}</strong> },
                        { title: 'Hoạt Chất', dataIndex: 'activeIngredient', key: 'activeIngredient' },
                        { title: 'Hàm Lượng', dataIndex: 'strength', key: 'strength' },
                        { title: 'Dạng Bào Chế', dataIndex: 'dosageForm', key: 'dosageForm' },
                        { title: 'Hãng Sản Xuất', dataIndex: 'manufacturer', key: 'manufacturer' },
                      ]}
                      dataSource={Array.isArray(drugResults) ? drugResults : []}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      locale={{ emptyText: 'Gõ từ khóa để tra cứu danh mục dược phẩm' }}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default PrescriptionsPage;
