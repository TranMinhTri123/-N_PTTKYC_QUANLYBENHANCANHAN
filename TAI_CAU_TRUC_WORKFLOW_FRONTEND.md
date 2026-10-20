# 🏥 THIẾT KẾ LẠI KIẾN TRÚC & WORKFLOW FRONTEND HỆ THỐNG PHR
## HỆ THỐNG QUẢN LÝ BỆNH ÁN CÁ NHÂN & SỨC KHỎE GIA ĐÌNH

> **Mục tiêu**: Xóa bỏ sự lằng ngoằng, rời rạc của giao diện hiện tại; chuyển đổi sang mô hình **Patient-Centric (Lấy Người Bệnh Làm Trung Tâm)** và **All-in-One Encounter (Gói Gọn Đợt Khám)** giúp người dùng thao tác trực quan, nhanh chóng, đúng với thói quen thực tế khi đi khám bệnh.

---

## 📌 I. PHÂN TÍCH NGUYÊN NHÂN GIAO DIỆN HIỆN TẠI BỊ "LẰNG NGOẰNG"

```mermaid
graph TD
    subgraph Hiện_Tại_Rời_Rạc["❌ HIỆN TẠI: Chia theo từng bảng CSDL (Data-centric)"]
        M1[Menu: Hồ Sơ] -->|Chọn bệnh nhân| P[Tạo Profile]
        M2[Menu: Bệnh Án] -->|Phải chọn lại bệnh nhân + 4 bước phức tạp| R[Tạo Bệnh Án]
        M3[Menu: Đơn Thuốc] -->|Lại phải chọn người bệnh riêng| RX[Nhập Thuốc]
        M4[Menu: Cận Lâm Sàng] -->|Lại phải chọn bệnh án riêng| CL[Upload File]
        M5[Menu: Lịch Hẹn] -->|Lại chọn người riêng| AP[Đặt Hẹn]
    end

    subgraph Đề_Xuất_Mới["✅ ĐỀ XUẤT MỚI: Lấy Người Bệnh Làm Trung Tâm (Patient-Centric)"]
        TOP[Thanh chọn Người Bệnh Toàn Cục: Minh Trí / Vợ / Con] --> HUB[Trung Tâm Sức Khỏe Thành Viên]
        HUB --> ENCOUNTER[Quy trình Khám Bệnh 1-Chạm: Chẩn đoán + Đơn thuốc + File kết quả + Hẹn tái khám]
        HUB --> DAILY[Theo dõi hàng ngày: Đo huyết áp / Uống thuốc hôm nay]
    end
```

### 4 Điểm yếu chí mạng của giao diện hiện tại:
1. **Thiếu liên kết đợt khám (Encounter Isolation)**: 
   - Đi khám về người bệnh có: *Giấy khám + Đơn thuốc + Phiếu xét nghiệm + Giấy hẹn*. 
   - Nhưng web hiện tại bắt vào **4 trang khác nhau** ở menu để nhập 4 thứ riêng rẽ.
2. **Lặp lại việc chọn người bệnh (Repetitive Profile Selection)**: 
   - Mỗi trang đều có 1 dropdown chọn người bệnh, không nhớ trạng thái người đang được theo dõi.
3. **Form bệnh án quá nặng tính học thuật y khoa**: 
   - Chia 4 bước với các trường giải phẫu chuyên khoa (tuần hoàn, hô hấp, gây mê, apgar...) khiến người dùng thông thường bị ngợp và khó hoàn thành.
4. **Menu Sidebar quá dài và thiếu phân nhóm**: 
   - 10+ mục xếp hàng dọc không phân cấp rõ ràng theo mục đích sử dụng.

---

## 🧭 II. TỔ CHỨC LẠI CẤU TRÚC GIAO DIỆN (NEW INFORMATION ARCHITECTURE)

### 1. Thanh Điều Hướng Trên Cùng (Global Topbar Hub)
* **Bộ chọn Người Bệnh Toàn Cục (Global Patient Switcher)**: 
  * Chọn `Minh Trí (Bản thân)` ➔ Toàn bộ trang Dashboard, Bệnh án, Đơn thuốc, Chỉ số sẽ tự động đồng bộ theo Minh Trí.
  * Đổi sang `Con: Nguyễn Minh An` ➔ Toàn bộ giao diện chuyển sang dữ liệu của con mà không cần chọn lại ở từng trang.
* **Nút Tác Vụ Nhanh (Quick Action Button) luôn xuất hiện**:
  * `[+ Ghi nhận đợt khám mới]` (Tích hợp chẩn đoán, thuốc, xét nghiệm)
  * `[+ Nhập số đo sinh hiệu]` (Huyết áp, đường huyết, SpO2)

### 2. Tinh Gọn Menu Bên Trái (Sidebar 4 Nhóm Trực Quan)
* **NHÓM 1: TỔNG QUAN**
  * `Bảng Điều Khiển` (`/dashboard`): Dashboard thông minh theo người bệnh đang chọn.
  * `Thành Viên Gia Đình` (`/profiles`): Quản lý danh sách người thân & tiền sử dị ứng/bệnh nền.
* **NHÓM 2: KHÁM CHỮA BỆNH & ĐIỀU TRỊ**
  * `Hồ Sơ Đợt Khám` (`/records`): Dòng thời gian các lần đi viện/khám bệnh, kết hợp xem đơn thuốc & xét nghiệm của từng đợt.
  * `Tủ Thuốc & Đơn Thuốc` (`/prescriptions`): Nhắc nhở uống thuốc và kiểm tra an toàn dị ứng.
  * `Kết Quả Cận Lâm Sàng` (`/clinical`): Kho lưu trữ ảnh X-quang, CT, MRI, kết quả xét nghiệm.
* **NHÓM 3: THEO DÕI SỨC KHỎE TẠI NHÀ**
  * `Chỉ Số Sức Khỏe` (`/metrics`): Biểu đồ huyết áp, đường huyết, BMI, cảnh báo AHA.
  * `Lịch Khám & Tái Khám` (`/appointments`): Lịch hẹn và nhắc nhở ngày đi khám.
* **NHÓM 4: KẾT NỐI & TIỆN ÍCH**
  * `Chia Sẻ Y Tế & QR Khẩn Cấp` (`/shares`): Tạo link/mã QR cho bác sĩ ngoài xem hồ sơ.
  * `Cài Đặt Tài Khoản` (`/settings`): Đổi mật khẩu, thông tin cá nhân.
* *(Phần Quản Trị & Bác Sĩ chỉ hiển thị khi có quyền ROLE_DOCTOR hoặc ROLE_ADMIN)*.

---

## 🔄 III. WORKFLOW CHI TIẾT TỪNG CHỨC NĂNG HỆ THỐNG

---

### 1. WORKFLOW QUẢN LÝ HỒ SƠ THÀNH VIÊN GIA ĐÌNH (PROFILE HUB)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as Giao diện Hồ Sơ
    participant Modal as Modal Thành Viên
    participant API as Backend API
    participant DB as CSDL

    User->>UI: Vào trang "Thành Viên Gia Đình"
    UI->>API: Lấy danh sách hồ sơ thuộc tài khoản
    API-->>UI: Trả về danh sách (Bản thân, Vợ, Con, Bố mẹ)
    UI-->>User: Hiển thị Thẻ thành viên (Avatar, Tuổi, Nhóm máu, Nhãn dị ứng)
    
    alt Thêm người thân mới
        User->>UI: Bấm "+ Thêm người thân"
        UI->>Modal: Mở Form đơn giản (Tên, Mối quan hệ, Ngày sinh, Giới tính, Nhóm máu)
        User->>Modal: Nhập thông tin & Lưu
        Modal->>API: POST /api/v1/profiles
        API->>DB: Lưu hồ sơ
        API-->>UI: Thành công
        UI-->>User: Tự động cập nhật thẻ mới & chọn làm thành viên hiện tại
    else Xem chi tiết tiền sử sức khỏe
        User->>UI: Bấm vào thẻ thành viên
        UI->>API: GET /api/v1/profiles/{id}
        API-->>UI: Chi tiết Dị ứng + Bệnh mạn tính + Tiền sử gia đình
        UI-->>User: Hiển thị bảng cảnh báo đỏ nếu có dị ứng sốc phản vệ
    end
```

* **Điểm cải tiến**:
  * Chỉ cần nhập thông tin cơ bản là xong, không bắt buộc nhập CCCD/BHYT ngay (nhập sau khi cần).
  * Tiền sử dị ứng hiển thị nổi bật bằng thẻ cảnh báo màu đỏ/cam.

---

### 2. WORKFLOW GHI NHẬN ĐỢT KHÁM BỆNH ÁN (ENCOUNTER MANAGEMENT)

> **Cải tiến lớn nhất**: Cho phép **2 Chế độ nhập liệu**:
> * **Chế độ 1 - Nhập Nhanh Cho Người Dùng (Quick Record)**: Chỉ cần 1 màn hình duy nhất (Tên viện, Ngày khám, Chẩn đoán, kèm chụp ảnh đơn thuốc/kết quả).
> * **Chế độ 2 - Chi Tiết Chuẩn Bộ Y Tế (Full Clinical)**: Dành cho bác sĩ hoặc khi cần lưu trữ chi tiết 7 hệ cơ quan, phẫu thuật, sản khoa.

```mermaid
flowchart TD
    Start([Người dùng bấm: Tạo Đợt Khám Mới]) --> ChooseMode{Chọn chế độ ghi nhận}
    
    %% Chế độ nhanh
    ChooseMode -->|Người dùng tự lưu đơn giản| Quick[CHẾ ĐỘ NHẬP NHANH - 1 MÀN HÌNH]
    Quick --> Q1[1. Bệnh viện & Ngày khám]
    Q1 --> Q2[2. Bác sĩ & Chẩn đoán bệnh]
    Q2 --> Q3[3. Tải ảnh: Đơn thuốc / Giấy ra viện / Phiếu xét nghiệm]
    Q3 --> QSave[Lưu đợt khám thành công]
    
    %% Chế độ chi tiết
    ChooseMode -->|Cần chi tiết y khoa chuẩn Bộ Y Tế| Full[CHẾ ĐỘ CHI TIẾT - TÍCH HỢP ĐỒNG BỘ]
    Full --> F1[Bước 1: Hành chính & Lý do khám]
    F1 --> F2[Bước 2: Sinh hiệu - Tự tính BMI]
    F2 --> F3[Bước 3: Biểu mẫu chuyên khoa Nội/Ngoại/Nhi/Sản]
    F3 --> F4[Bước 4: Chẩn đoán ICD-10 & Phác đồ điều trị]
    F4 --> FSave[Lưu đợt khám thành công]
    
    QSave --> ViewDetail[Xem Chi Tiết Đợt Khám]
    FSave --> ViewDetail
    ViewDetail --> Actions{Tác vụ mở rộng}
    Actions --> PDF[Xuất PDF Bệnh án chuẩn A4]
    Actions --> AddMeds[Thêm thuốc vào Tủ thuốc đang dùng]
    Actions --> AddAppt[Tạo nhắc hẹn tái khám]
```

* **Điểm cải tiến**:
  * Người dùng đi khám phòng khám tư chỉ cần 1 phút là chụp ảnh đơn thuốc, ghi chẩn đoán và lưu xong.
  * Dữ liệu các bước được bảo lưu 100%, có khung tóm tắt hiển thị rõ ràng.

---

### 3. WORKFLOW QUẢN LÝ ĐƠN THUỐC & CẢNH BÁO AN TOÀN (PRESCRIPTIONS)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người bệnh
    participant UI as Trang Đơn Thuốc
    participant Engine as Bộ Kiểm Tra An Toàn (Safety Engine)
    participant API as Backend API

    User->>UI: Mở trang Đơn Thuốc & Tủ Thuốc
    UI->>API: Lấy danh sách thuốc đang uống (Active Meds)
    API-->>UI: Danh sách thuốc + Liều dùng + Thời gian
    UI-->>User: Hiển thị Thẻ tủ thuốc gia đình & Lịch uống trong ngày

    opt Thêm thuốc mới vào đơn
        User->>UI: Bấm "+ Thêm thuốc" (Gõ tên: Amoxicillin)
        UI->>Engine: Quét đối chiếu với Tiền sử Dị ứng của bệnh nhân
        alt Phát hiện trùng dị nguyên (Nhóm Penicillin)
            Engine-->>UI: CẢNH BÁO ĐỎ: Bệnh nhân có tiền sử sốc phản vệ với Penicillin!
            UI-->>User: Hiện thông báo nguy cơ cao & khuyên hỏi lại bác sĩ
        else Không phát hiện dị ứng
            Engine-->>UI: An toàn
        end
        User->>UI: Xác nhận lưu đơn thuốc
        UI->>API: POST /api/v1/prescriptions
        API-->>UI: Đã cập nhật vào Tủ thuốc
    end
```

* **Điểm cải tiến**:
  * Tách biệt rõ: **Thuốc đang uống hằng ngày** (hiển thị to, rõ liều sáng/trưa/chiều/tối) và **Lịch sử các đơn thuốc cũ**.
  * Cảnh báo dị ứng tự động kích hoạt ngay khi gõ tên thuốc.

---

### 4. WORKFLOW KẾT QUẢ XÉT NGHIỆM & CHẨN ĐOÁN HÌNH ẢNH (CLINICAL & LABS)

```mermaid
flowchart LR
    Upload[Bệnh nhân tải lên Kết Quả] --> Type{Phân loại kết quả}
    
    Type -->|Xét nghiệm máu / sinh hóa / nước tiểu| Lab[Phiếu Xét Nghiệm]
    Lab --> LabFields[Nhập chỉ số: Glucose, Men gan, Axit Uric...]
    LabFields --> Compare[Hệ thống so sánh với Khoảng Tham Chiếu]
    Compare --> Flag{Chỉ số bất thường?}
    Flag -->|Vượt ngưỡng| RedTag[Đánh dấu Đỏ cảnh báo nguy cơ]
    Flag -->|Bình thường| GreenTag[Đánh dấu Xanh an toàn]
    
    Type -->|X-quang, Siêu âm, CT, MRI, ECG| Img[Chẩn Đoán Hình Ảnh]
    Img --> Attach[Đính kèm tệp ảnh / PDF / DICOM]
    Attach --> Preview[Xem trước hình ảnh trực tiếp trên Web]
    
    RedTag --> Hub[Lưu vào Hồ Sơ Cận Lâm Sàng]
    GreenTag --> Hub
    Preview --> Hub
```

* **Điểm cải tiến**:
  * Các chỉ số xét nghiệm bất thường tự động được làm nổi bật (màu đỏ) kèm giải thích khoảng an toàn để người bệnh dễ hiểu mà không cần phải có kiến thức chuyên môn sâu.
  * Hỗ trợ xem ảnh trực tiếp (Image Previewer) dạng phóng to/thu nhỏ.

---

### 5. WORKFLOW THEO DÕI CHỈ SỐ SINH HIỆU & CẢNH BÁO SỚM (METRICS)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người bệnh
    participant UI as Trang Chỉ Số Sức Khỏe
    participant Calc as Thuật Toán Phân Loại AHA / ADA
    participant API as Backend API

    User->>UI: Nhập số đo tại nhà (Ví dụ: Huyết áp 145 / 95 mmHg)
    UI->>Calc: Đánh giá theo chuẩn Hiệp hội Tim mạch Hoa Kỳ (AHA)
    Calc-->>UI: Phân loại: TĂNG HUYẾT ÁP ĐỘ 2 (Nguy cơ)
    UI-->>User: Hiển thị nhãn cảnh báo vàng cam & Lời khuyên nghỉ ngơi, đo lại
    User->>UI: Bấm "Lưu Số Đo"
    UI->>API: POST /api/v1/metrics
    API-->>UI: Lưu thành công
    UI->>UI: Tự động vẽ thêm điểm mới lên Biểu đồ diễn tiến (Recharts)
```

* **Điểm cải tiến**:
  * Form đo sinh hiệu đặt ngay đầu trang, to rõ, dễ bấm trên cả điện thoại và máy tính.
  * Biểu đồ đường biến thiên có mốc chuẩn rõ ràng (vùng an toàn xanh lá, vùng cảnh báo đỏ).

---

### 6. WORKFLOW ĐẶT LỊCH HẸN & NHẮC TÁI KHÁM (APPOINTMENTS)

```mermaid
flowchart TD
    A[Vào trang Lịch Hẹn] --> B{Hành động}
    B -->|Tạo lịch hẹn mới| C[Chọn Người bệnh, Bệnh viện, Bác sĩ, Ngày giờ, Lý do]
    C --> D[Ghi chú chuẩn bị: Nhịn ăn sáng, mang phim X-quang cũ]
    D --> E[Lưu lịch hẹn: Trạng thái SCHEDULED]
    
    B -->|Xem lịch sắp tới| F[Thẻ đếm ngược: Còn X ngày nữa đến lịch khám]
    F --> G[Nút: Đã khám xong ➔ Chuyển thành COMPLETED]
    F --> H[Nút: Hủy lịch hẹn ➔ Chuyển thành CANCELLED]
    
    G --> LinkRecord[Gợi ý: Bạn có muốn tạo Bệnh án cho đợt khám này ngay không?]
```

* **Điểm cải tiến**:
  * Sau khi bấm "Đã khám xong", hệ thống hỏi người dùng có muốn tạo bệnh án cho lần khám đó ngay không, giúp kết nối liền mạch từ Lịch hẹn ➔ Đợt khám bệnh.

---

### 7. WORKFLOW CHIA SẺ HỒ SƠ & MÃ QR CHO BÁC SĨ (SHARING & EMERGENCY QR)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người bệnh
    participant UI as Quản Lý Chia Sẻ
    actor Doctor as Bác Sĩ Bên Ngoài
    participant PubUI as Cổng Xem Công Khai (Public View)
    participant API as Backend API

    User->>UI: Chọn hồ sơ cần chia sẻ (Minh Trí) & Thời hạn (7 ngày)
    UI->>API: POST /api/v1/shares (Sinh token ngẫu nhiên 32 ký tự)
    API-->>UI: Trả về Link chia sẻ + Mã QR code
    UI-->>User: Hiển thị Link rút gọn & Nút "Sao chép" hoặc "Tải ảnh QR"
    
    Note over User,Doctor: Người bệnh gửi Link hoặc đưa mã QR cho Bác sĩ quét
    Doctor->>PubUI: Mở link /share/view/{token} (Không cần đăng nhập)
    PubUI->>API: GET /api/v1/shares/view/{token}
    API-->>PubUI: Dữ liệu hồ sơ (Đã che bảo mật CCCD/BHYT, hiện rõ Dị ứng + Bệnh án + Đơn thuốc)
    PubUI-->>Doctor: Giao diện chuyên nghiệp dành cho Bác sĩ điều trị
```

* **Điểm cải tiến**:
  * Bác sĩ không cần tạo tài khoản, chỉ cần quét QR là nắm toàn bộ tiền sử dị ứng và các đợt khám trước của bệnh nhân trong 5 giây.

---

## 🏗️ IV. LỘ TRÌNH TRIỂN KHAI TỔ CHỨC LẠI FRONTEND

| Giai Đoạn | Nhiệm Vụ Cụ Thể | Mục Tiêu Đạt Được |
| :--- | :--- | :--- |
| **Giai đoạn 1** | Tinh gọn Sidebar Menu & Thêm Global Profile Switcher | Giao diện gọn gàng, người dùng chọn bệnh nhân 1 lần là áp dụng toàn app. |
| **Giai đoạn 2** | Nâng cấp trang Tạo Bệnh Án với 2 chế độ: Nhập Nhanh & Chi Tiết | Người dùng không còn cảm thấy "lằng ngoằng", hoàn thành tạo bệnh án trong 1 phút. |
| **Giai đoạn 3** | Tích hợp liên kết thông minh giữa các trang | Từ Lịch hẹn bấm 1 click sang Bệnh án; từ Bệnh án bấm 1 click thêm Thuốc và File xét nghiệm. |
| **Giai đoạn 4** | Tối ưu Dashboard thành Trung Tâm Điều Phối Y Tế | Trang chủ hiển thị ngay trạng thái sức khỏe của người bệnh đang chọn. |

---
*Tài liệu được xây dựng để làm kim chỉ nam tối ưu hóa toàn diện trải nghiệm người dùng (UX) cho Hệ Thống PHR Việt Nam.*
