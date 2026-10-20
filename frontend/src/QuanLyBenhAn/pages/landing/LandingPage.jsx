import React from 'react';
import { Button, Row, Col, Card, Typography, Space, Tag, Avatar, Rate } from 'antd';
import {
  MedicineBoxFilled,
  SafetyCertificateFilled,
  ArrowRightOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Paragraph, Text } = Typography;

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* 1. Header Navigation Bar (Glassmorphic) */}
      <nav
        className="glass-nav"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 40px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Space size={12} align="center">
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 22,
              boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.35)',
            }}
          >
            <MedicineBoxFilled />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em' }}>
              PHR VIỆT NAM
            </Title>
            <Text style={{ fontSize: 12, color: '#0284c7', fontWeight: 600 }}>
              Personal Health Record Platform
            </Text>
          </div>
        </Space>

        <Space size={16}>
          {isAuthenticated ? (
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate('/dashboard')}
              style={{ fontWeight: 600, height: 44, borderRadius: 8 }}
            >
              Vào Bảng Điều Khiển
            </Button>
          ) : (
            <>
              <Button
                size="large"
                onClick={() => navigate('/login')}
                style={{ fontWeight: 600, height: 44, borderRadius: 8, borderColor: '#cbd5e1' }}
              >
                Đăng Nhập
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/register')}
                style={{
                  fontWeight: 600,
                  height: 44,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                }}
              >
                Đăng Ký Miễn Phí
              </Button>
            </>
          )}
        </Space>
      </nav>

      {/* 2. Hero Section */}
      <section className="hero-glow-bg" style={{ padding: '64px 24px 50px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ marginBottom: 20 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 30,
                background: '#ffffff',
                border: '1px solid #bae6fd',
                color: '#0369a1',
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.08)',
              }}
            >
              <SafetyCertificateFilled style={{ color: '#0284c7', fontSize: 16 }} />
              Nền Tảng Hồ Sơ Sức Khỏe Điện Tử Toàn Diện & Chuẩn Hóa
            </span>
          </div>

          <Title
            style={{
              fontSize: '3.1rem',
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#0f172a',
              marginBottom: 20,
              letterSpacing: '-0.03em',
            }}
          >
            Quản Lý Hồ Sơ Bệnh Án Cá Nhân &{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Theo Dõi Sức Khỏe Toàn Diện
            </span>
          </Title>

          <Paragraph
            style={{
              fontSize: '1.25rem',
              color: '#475569',
              maxWidth: 780,
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            Giải pháp y tế số thông minh giúp lưu trữ tập trung lịch sử khám chữa bệnh qua 4 chuyên khoa (Nội, Ngoại, Nhi, Sản), cảnh báo an toàn dùng thuốc và đồng hành chăm sóc sức khỏe cho cả gia đình.
          </Paragraph>

          <Space size={16} wrap style={{ marginBottom: 44 }}>
            <Button
              type="primary"
              size="large"
              style={{
                height: 52,
                padding: '0 36px',
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 10px 20px -5px rgba(2, 132, 199, 0.4)',
              }}
              onClick={() => navigate('/register')}
            >
              Đăng Ký Ngay
            </Button>
            <Button
              size="large"
              style={{
                height: 52,
                padding: '0 32px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 10,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              }}
              onClick={() => navigate('/login')}
            >
              Đăng Nhập Tài Khoản
            </Button>
          </Space>

          {/* Promotional Hero Banner Image */}
          <div
            style={{
              maxWidth: 960,
              margin: '0 auto',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(2, 132, 199, 0.25)',
              border: '4px solid #ffffff',
            }}
          >
            <img
              src="/hero_doctors.jpg"
              alt="Đội ngũ bác sĩ và nền tảng hồ sơ sức khỏe điện tử PHR"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* 3. Section Giới Thiệu Về Trang Web & Sứ Mệnh */}
      <section style={{ maxWidth: 1140, margin: '70px auto', padding: '0 24px' }}>
        <Row gutter={[48, 36]} align="middle">
          <Col xs={24} md={12}>
            <Tag color="cyan" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
              Về Nền Tảng PHR Việt Nam
            </Tag>
            <Title level={2} style={{ fontWeight: 800, color: '#0f172a', marginBottom: 18 }}>
              Số Hóa Bệnh Án - Trao Quyền Kiểm Soát Sức Khỏe Cho Bạn
            </Title>
            <Paragraph style={{ fontSize: 16, color: '#475569', lineHeight: 1.7 }}>
              Trong nhiều năm, việc quản lý hồ sơ khám chữa bệnh tại Việt Nam gặp nhiều bất cập: sổ khám giấy dễ thất lạc, đơn thuốc cũ bị quên lãng, và bác sĩ thiếu dữ liệu tiền sử bệnh lý khi cấp cứu khẩn cấp.
            </Paragraph>
            <Paragraph style={{ fontSize: 16, color: '#475569', lineHeight: 1.7 }}>
              <strong>PHR Việt Nam</strong> ra đời với sứ mệnh xây dựng sổ sức khỏe điện tử cá nhân trọn đời, kết nối liền mạch giữa bệnh nhân và đội ngũ bác sĩ chuyên khoa. Bạn có thể dễ dàng quản lý hồ sơ cho mọi thế hệ trong gia đình (ông bà, cha mẹ, con cái) chỉ trên một nền tảng duy nhất.
            </Paragraph>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Space align="start">
                  <CheckCircleFilled style={{ color: '#0284c7', fontSize: 18, marginTop: 3 }} />
                  <span style={{ fontSize: 15, color: '#334155' }}>
                    <strong>Không bao giờ mất dữ liệu:</strong> Toàn bộ lịch sử đợt khám, xét nghiệm và X-quang được lưu trữ vĩnh viễn trên đám mây an toàn.
                  </span>
                </Space>
                <Space align="start">
                  <CheckCircleFilled style={{ color: '#0284c7', fontSize: 18, marginTop: 3 }} />
                  <span style={{ fontSize: 15, color: '#334155' }}>
                    <strong>Bảo vệ an toàn tính mạng:</strong> Tự động cảnh báo dị ứng thuốc chéo (Penicillin, Aspirin...) trước khi dùng thuốc mới.
                  </span>
                </Space>
                <Space align="start">
                  <CheckCircleFilled style={{ color: '#0284c7', fontSize: 18, marginTop: 3 }} />
                  <span style={{ fontSize: 15, color: '#334155' }}>
                    <strong>Chia sẻ bác sĩ 1-Click:</strong> Cho phép bác sĩ thăm khám truy cập bệnh án bằng mã bảo mật mà không cần đăng nhập.
                  </span>
                </Space>
            </div>
          </Col>

          {/* Stats Highlight Grid */}
          <Col xs={24} md={12}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card style={{ borderRadius: 16, textAlign: 'center', background: '#f0f9ff', borderColor: '#bae6fd' }}>
                  <Title level={2} style={{ color: '#0284c7', margin: 0, fontWeight: 800 }}>50.000+</Title>
                  <Text strong style={{ color: '#0369a1', fontSize: 14 }}>Hồ Sơ Được Quản Lý</Text>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Tin dùng bởi các gia đình Việt</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 16, textAlign: 'center', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <Title level={2} style={{ color: '#16a34a', margin: 0, fontWeight: 800 }}>100%</Title>
                  <Text strong style={{ color: '#15803d', fontSize: 14 }}>Bảo Mật Dữ Liệu</Text>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Mã hóa chuẩn SHA-256 & HIPAA</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 16, textAlign: 'center', background: '#fdf4ff', borderColor: '#f5d0fe' }}>
                  <Title level={2} style={{ color: '#a855f7', margin: 0, fontWeight: 800 }}>4</Title>
                  <Text strong style={{ color: '#7e22ce', fontSize: 14 }}>Chuyên Khoa Chuẩn</Text>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Nội, Ngoại, Nhi, Sản khoa</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 16, textAlign: 'center', background: '#fffbeb', borderColor: '#fde68a' }}>
                  <Title level={2} style={{ color: '#d97706', margin: 0, fontWeight: 800 }}>24/7</Title>
                  <Text strong style={{ color: '#b45309', fontSize: 14 }}>Truy Cập Liền Mạch</Text>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Xuất PDF tóm tắt mọi lúc mọi nơi</div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </section>

      {/* 4. Section Đội Ngũ Bác Sĩ Chất Lượng Cao */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '70px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 12 }}>
              Đội Ngũ Chuyên Môn Đầu Ngành
            </Tag>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
              Được Đồng Hành Bởi Các Bác Sĩ & Chuyên Gia Y Tế Uy Tín
            </Title>
            <Text type="secondary" style={{ fontSize: 16, maxWidth: 680, display: 'inline-block', marginTop: 8 }}>
              Các bác sĩ chuyên khoa luôn sẵn sàng tiếp nhận hội chẩn, theo dõi hồ sơ điều trị và tư vấn phác đồ chuẩn y khoa.
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            {/* Bác sĩ 1 */}
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ borderRadius: 16, overflow: 'hidden', height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                cover={
                  <div style={{ height: 280, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <img
                      alt="BS. CK1 Trần Văn Bình"
                      src="/doctor_tran_van_binh.jpg"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                  </div>
                }
              >
                <Tag color="cyan" style={{ marginBottom: 8, width: 'fit-content' }}>Khoa Tim Mạch & Lão Khoa</Tag>
                <Title level={4} style={{ margin: '4px 0 6px', fontWeight: 700 }}>
                  BS. CK1 Trần Văn Bình
                </Title>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 10, fontWeight: 500 }}>
                  18+ năm kinh nghiệm • Bệnh viện Tim Hà Nội & Bạch Mai
                </Text>
                <Paragraph style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, flex: 1, margin: 0 }}>
                  Chuyên gia điều trị tăng huyết áp, bệnh mạch vành, rối loạn lipid máu và tư vấn chế độ phục hồi chức năng tim mạch cho người cao tuổi.
                </Paragraph>
              </Card>
            </Col>

            {/* Bác sĩ 2 */}
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ borderRadius: 16, overflow: 'hidden', height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                cover={
                  <div style={{ height: 280, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <img
                      alt="ThS. BS Nguyễn Thị Lan"
                      src="/doctor_nguyen_thi_lan.jpg"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                  </div>
                }
              >
                <Tag color="purple" style={{ marginBottom: 8, width: 'fit-content' }}>Khoa Nhi & Dị Ứng Miễn Dịch</Tag>
                <Title level={4} style={{ margin: '4px 0 6px', fontWeight: 700 }}>
                  ThS. BS Nguyễn Thị Lan
                </Title>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 10, fontWeight: 500 }}>
                  15+ năm kinh nghiệm • Bệnh viện Nhi Trung Ương & Vinmec
                </Text>
                <Paragraph style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, flex: 1, margin: 0 }}>
                  Chuyên sâu về hô hấp nhi, sàng lọc dị ứng thuốc và thực phẩm sớm ở trẻ nhỏ, đồng hành hướng dẫn dinh dưỡng phát triển thể chất toàn diện.
                </Paragraph>
              </Card>
            </Col>

            {/* Bác sĩ 3 */}
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ borderRadius: 16, overflow: 'hidden', height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                cover={
                  <div style={{ height: 280, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <img
                      alt="BSCK2 Trần Văn Minh"
                      src="/doctor_hoang_minh_tuan.jpg"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                  </div>
                }
              >
                <Tag color="blue" style={{ marginBottom: 8, width: 'fit-content' }}>Khoa Ngoại Chấn Thương Chỉnh Hình</Tag>
                <Title level={4} style={{ margin: '4px 0 6px', fontWeight: 700 }}>
                  BSCK2 Trần Văn Minh
                </Title>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 10, fontWeight: 500 }}>
                  20+ năm kinh nghiệm • Bệnh viện Chợ Rẫy TP.HCM
                </Text>
                <Paragraph style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, flex: 1, margin: 0 }}>
                  Chuyên gia phẫu thuật khớp, điều trị thoái hóa cột sống, chấn thương thể thao và theo dõi phục hồi chức năng vận động toàn diện.
                </Paragraph>
              </Card>
            </Col>

            {/* Bác sĩ 4 */}
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ borderRadius: 16, overflow: 'hidden', height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                cover={
                  <div style={{ height: 280, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <img
                      alt="TS. BS Đặng Thu Trang"
                      src="/doctor_dang_thu_trang.jpg"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                  </div>
                }
              >
                <Tag color="volcano" style={{ marginBottom: 8, width: 'fit-content' }}>Khoa Mắt & Tai Mũi Họng</Tag>
                <Title level={4} style={{ margin: '4px 0 6px', fontWeight: 700 }}>
                  TS. BS Đặng Thu Trang
                </Title>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 10, fontWeight: 500 }}>
                  16+ năm kinh nghiệm • Bệnh viện Mắt Trung Ương & ĐHY Hà Nội
                </Text>
                <Paragraph style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, flex: 1, margin: 0 }}>
                  Chuyên khoa nhãn khoa công nghệ cao, tầm soát bệnh lý võng mạc tiểu đường, glôcôm và hội chẩn điều trị viêm xoang mạn tính.
                </Paragraph>
              </Card>
            </Col>

            {/* Bác sĩ 5 */}
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ borderRadius: 16, overflow: 'hidden', height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                cover={
                  <div style={{ height: 280, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <img
                      alt="BS. CK2 Phạm Quốc Hưng"
                      src="/doctor_pham_quoc_hung.jpg"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                  </div>
                }
              >
                <Tag color="geekblue" style={{ marginBottom: 8, width: 'fit-content' }}>Khoa Thần Kinh & Hồi Sức Cấp Cứu</Tag>
                <Title level={4} style={{ margin: '4px 0 6px', fontWeight: 700 }}>
                  BS. CK2 Phạm Quốc Hưng
                </Title>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 10, fontWeight: 500 }}>
                  19+ năm kinh nghiệm • Bệnh viện Bạch Mai & Viện 108
                </Text>
                <Paragraph style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, flex: 1, margin: 0 }}>
                  Chuyên gia điều trị rối loạn tiền đình, đau nửa đầu mãn tính, tầm soát nguy cơ đột quỵ và cấp cứu điều trị nội khoa chuyên sâu.
                </Paragraph>
              </Card>
            </Col>

            {/* Bác sĩ 6 */}
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ borderRadius: 16, overflow: 'hidden', height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                cover={
                  <div style={{ height: 280, overflow: 'hidden', backgroundColor: '#e0f2fe' }}>
                    <img
                      alt="PGS. TS. BS Lê Hoài Nam & Cộng Sự"
                      src="/hero_doctors.jpg"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                  </div>
                }
              >
                <Tag color="magenta" style={{ marginBottom: 8, width: 'fit-content' }}>Khoa Sản Phụ Khoa & Ngoại Tiêu Hóa</Tag>
                <Title level={4} style={{ margin: '4px 0 6px', fontWeight: 700 }}>
                  PGS. TS. BS Lê Hoài Nam & Cộng Sự
                </Title>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 10, fontWeight: 500 }}>
                  22+ năm kinh nghiệm • Bệnh viện Phụ Sản & Đại học Y Hà Nội
                </Text>
                <Paragraph style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, flex: 1, margin: 0 }}>
                  Cố vấn hội chẩn liên chuyên khoa, theo dõi thai kỳ chuẩn tuần, can thiệp điều trị bệnh lý dạ dày tá tràng và nội soi tiêu hóa hiện đại.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* 5. Section Câu Chuyện Nhỏ Về Khách Hàng (Customer Testimonials) */}
      <section style={{ maxWidth: 1140, margin: '70px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Tag color="green" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 12 }}>
            Trải Nghiệm Thực Tế
          </Tag>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            Những Câu Chuyện Thật Từ Người Dùng
          </Title>
          <Text type="secondary" style={{ fontSize: 16, maxWidth: 680, display: 'inline-block', marginTop: 8 }}>
            Hàng ngàn gia đình đã yên tâm hơn trong hành trình chăm sóc sức khỏe nhờ hồ sơ bệnh án điện tử PHR.
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Câu chuyện 1 */}
          <Col xs={24} md={8}>
            <Card
              className="feature-card-hover"
              style={{ borderRadius: 16, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <Rate disabled defaultValue={5} style={{ fontSize: 14, color: '#f59e0b' }} />
                </Space>
                <Paragraph style={{ fontSize: 15, color: '#334155', fontStyle: 'italic', lineHeight: 1.7 }}>
                  "Tôi bị tăng huyết áp và tiểu đường hơn 8 năm nay. Trước đây mỗi lần đi tái khám là cả một bọc giấy tờ lộn xộn. Nhờ con gái cài PHR, tôi đo huyết áp mỗi sáng là hệ thống vẽ biểu đồ ngay. Bác sĩ xem trên web là nắm rõ xu hướng cả tháng, rất an tâm!"
                </Paragraph>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 16 }}>
                <Space align="center" size={12}>
                  <Avatar size={44} style={{ backgroundColor: '#0284c7', fontSize: 16, fontWeight: 700 }}>HC</Avatar>
                  <div>
                    <strong style={{ fontSize: 15, display: 'block', color: '#0f172a' }}>Bác Hoàng Văn Cường</strong>
                    <Text type="secondary" style={{ fontSize: 13 }}>64 tuổi • Hà Nội (Bệnh nhân tim mạch)</Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>

          {/* Câu chuyện 2 */}
          <Col xs={24} md={8}>
            <Card
              className="feature-card-hover"
              style={{ borderRadius: 16, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <Rate disabled defaultValue={5} style={{ fontSize: 14, color: '#f59e0b' }} />
                </Space>
                <Paragraph style={{ fontSize: 15, color: '#334155', fontStyle: 'italic', lineHeight: 1.7 }}>
                  "Bé lớn nhà mình từng bị sốc thuốc do dị ứng Amoxicillin. Khi lưu tiền sử dị ứng lên PHR, hệ thống luôn có cờ cảnh báo đỏ nổi bật. Đợt vừa rồi đi du lịch bé bị viêm họng, bác sĩ phòng khám ngoài quét mã xem hồ sơ lập tức đổi phác đồ an toàn. Thật sự biết ơn!"
                </Paragraph>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 16 }}>
                <Space align="center" size={12}>
                  <Avatar size={44} style={{ backgroundColor: '#10b981', fontSize: 16, fontWeight: 700 }}>TT</Avatar>
                  <div>
                    <strong style={{ fontSize: 15, display: 'block', color: '#0f172a' }}>Chị Đỗ Thu Thảo</strong>
                    <Text type="secondary" style={{ fontSize: 13 }}>32 tuổi • Đà Nẵng (Mẹ của 2 bé nhỏ)</Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>

          {/* Câu chuyện 3 */}
          <Col xs={24} md={8}>
            <Card
              className="feature-card-hover"
              style={{ borderRadius: 16, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <Rate disabled defaultValue={5} style={{ fontSize: 14, color: '#f59e0b' }} />
                </Space>
                <Paragraph style={{ fontSize: 15, color: '#334155', fontStyle: 'italic', lineHeight: 1.7 }}>
                  "Mình làm việc ở nước ngoài, ở quê bố mẹ đã lớn tuổi. PHR giúp mình theo dõi từ xa từng đơn thuốc, lịch hẹn khám và kết quả xét nghiệm của bố mẹ chỉ qua một tài khoản duy nhất. Khoảng cách địa lý không còn là rào cản chăm sóc gia đình."
                </Paragraph>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 16 }}>
                <Space align="center" size={12}>
                  <Avatar size={44} style={{ backgroundColor: '#8b5cf6', fontSize: 16, fontWeight: 700 }}>ĐA</Avatar>
                  <div>
                    <strong style={{ fontSize: 15, display: 'block', color: '#0f172a' }}>Anh Vũ Đức Anh</strong>
                    <Text type="secondary" style={{ fontSize: 13 }}>38 tuổi • TP. Hồ Chí Minh (Kỹ sư phần mềm)</Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 6. Action Call-to-action Banner */}
      <section style={{ backgroundColor: '#0284c7', color: '#ffffff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Title level={2} style={{ color: '#ffffff', fontWeight: 800, marginBottom: 16 }}>
            Bắt Đầu Quản Lý Sức Khỏe Gia Đình Bạn Ngay Hôm Nay
          </Title>
          <Paragraph style={{ color: '#e0f2fe', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Đăng ký tài khoản miễn phí trong chưa đầy 1 phút. Khởi tạo sổ bệnh án điện tử chuẩn hóa và bảo vệ người thân yêu của bạn.
          </Paragraph>
          <Space size={16} wrap>
            <Button
              size="large"
              onClick={() => navigate('/register')}
              style={{
                height: 50,
                padding: '0 36px',
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 10,
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: 'none',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
              }}
            >
              Đăng Ký Tài Khoản Miễn Phí
            </Button>
            <Button
              size="large"
              ghost
              onClick={() => navigate('/login')}
              style={{
                height: 50,
                padding: '0 32px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 10,
                borderColor: '#bae6fd',
                color: '#ffffff',
              }}
            >
              Đã Có Tài Khoản? Đăng Nhập
            </Button>
          </Space>
        </div>
      </section>

      {/* 7. Professional Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <Space align="center" size={10}>
              <MedicineBoxFilled style={{ fontSize: 24, color: '#38bdf8' }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>PHR VIỆT NAM</span>
            </Space>
          </div>
          <p style={{ maxWidth: 760, margin: '0 auto 20px', fontSize: 13, lineHeight: 1.6, color: '#94a3b8' }}>
            <strong>LƯU Ý Y KHOA:</strong> Hệ Thống Quản Lý Bệnh Án Cá Nhân (PHR) có chức năng hỗ trợ lưu trữ, đối chiếu và quản lý hồ sơ sức khỏe cá nhân. Dữ liệu trên hệ thống không thay thế cho việc khám chữa bệnh, chẩn đoán và chỉ định phác đồ điều trị chuyên môn của Bác sĩ hoặc Cơ sở y tế.
          </p>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 20, fontSize: 13, color: '#64748b' }}>
            © 2026 PHR VIỆT NAM • Nền Tảng Quản Lý Bệnh Án Điện Tử & Sức Khỏe Gia Đình
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
