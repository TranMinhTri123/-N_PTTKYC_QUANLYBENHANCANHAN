# HƯỚNG DẪN TEST VÀ DANH SÁCH TÍNH NĂNG CÁC TRANG TRÊN HỆ THỐNG PHR

---

## 1. Trang Giới Thiệu / Trang Chủ (`/`)
### Các tính năng
- Giới thiệu giải pháp Sổ sức khỏe điện tử cá nhân (PHR).
- Hiển thị danh mục thống kê: người dùng, bác sĩ liên kết, đợt khám bảo mật.
- Hiển thị danh sách bác sĩ chuyên khoa tiêu biểu (khoa khám, số năm kinh nghiệm, học hàm/học vị, ảnh bác sĩ).
- Hiển thị phản hồi/câu chuyện trải nghiệm của bệnh nhân.
- Nút điều hướng nhanh đến Đăng ký (`/register`) và Đăng nhập (`/login`).

### Hướng dẫn test
- **Case 1.1: Truy cập trang chủ khi chưa đăng nhập**
  - *Bước thực hiện*: Mở trình duyệt, truy cập `http://localhost:5173/`.
  - *Kết quả mong đợi*: Trang tải đầy đủ banner, thông tin giới thiệu, danh sách bác sĩ, phản hồi khách hàng; không bị lỗi hiển thị hình ảnh.
- **Case 1.2: Điều hướng đến Đăng ký / Đăng nhập**
  - *Bước thực hiện*: Bấm nút "Đăng ký ngay" hoặc "Đăng nhập".
  - *Kết quả mong đợi*: Chuyển hướng chính xác sang trang `/register` hoặc `/login`.

---

## 2. Trang Đăng Nhập (`/login`)
### Các tính năng
- Form đăng nhập tài khoản bằng Email và Mật khẩu.
- Validate tính hợp lệ của định dạng Email và độ dài mật khẩu.
- Lưu trữ JWT Token và phân quyền theo Role (`ROLE_USER`, `ROLE_DOCTOR`, `ROLE_ADMIN`).
- Liên kết chuyển tiếp sang trang Đăng ký (`/register`) và Quên mật khẩu (`/forgot-password`).

### Hướng dẫn test
- **Case 2.1: Đăng nhập thành công với tài khoản Admin**
  - *Dữ liệu*: Email: `admin@phr.vn`, Mật khẩu: `![alt text](image.png)`.
  - *Kết quả mong đợi*: Thông báo thành công, chuyển hướng vào `/dashboard`, menu bên trái hiển thị đầy đủ các mục Quản trị (Người dùng, Danh mục, Audit Logs).
- **Case 2.2: Đăng nhập thành công với tài khoản Bác sĩ**
  - *Dữ liệu*: Email: `doctor@phr.vn`, Mật khẩu: `Doctor@123`.
  - *Kết quả mong đợi*: Chuyển hướng vào `/dashboard`, menu hiển thị mục "Bàn làm việc Bác sĩ".
- **Case 2.3: Đăng nhập thành công với tài khoản Người bệnh**
  - *Dữ liệu*: Email: `minhtri210595@gmail.com`, Mật khẩu: `Password@123`.
  - *Kết quả mong đợi*: Chuyển hướng vào `/dashboard`, chỉ hiển thị các chức năng của bệnh nhân.
- **Case 2.4: Đăng nhập sai mật khẩu**
  - *Dữ liệu*: Email: `admin@phr.vn`, Mật khẩu: `SaiMatKhau123`.
  - *Kết quả mong đợi*: Hiển thị thông báo lỗi từ chối đăng nhập, ở lại trang login.
- **Case 2.5: Validate trường bỏ trống hoặc sai định dạng**
  - *Dữ liệu*: Bỏ trống email hoặc nhập email không có `@`.
  - *Kết quả mong đợi*: Hệ thống báo lỗi đỏ ngay dưới ô nhập liệu và chặn submit.

---

## 3. Trang Đăng Ký Tài Khoản (`/register`)
### Các tính năng
- Đăng ký tài khoản người dùng mới.
- Validate ràng buộc nghiêm ngặt:
  - Họ và tên: Tối thiểu 2 ký tự, không chứa ký tự đặc biệt vô lý.
  - Số điện thoại: Đúng định dạng 10 số di động Việt Nam (đầu 03, 05, 07, 08, 09).
  - Ngày sinh: Không được chọn ngày trong tương lai, tuổi từ 0 đến 120.
  - Mật khẩu: Tối thiểu 6 ký tự, có xác nhận mật khẩu trùng khớp.

### Hướng dẫn test
- **Case 3.1: Đăng ký tài khoản hợp lệ**
  - *Dữ liệu*: Họ tên: "Nguyễn Văn Test", Email: "testuser01@phr.vn", SĐT: "0912345678", Ngày sinh: "15/05/1995", Mật khẩu: "Test@123", Xác nhận: "Test@123".
  - *Kết quả mong đợi*: Thông báo đăng ký thành công, tự động chuyển về trang đăng nhập.
- **Case 3.2: Validate ngày sinh trong tương lai**
  - *Thao tác*: Chọn ngày sinh là ngày mai hoặc bất kỳ ngày nào trong tương lai.
  - *Kết quả mong đợi*: Ô chọn ngày bị vô hiệu hóa (disabled) hoặc form báo lỗi "Ngày sinh không thể ở tương lai!".
- **Case 3.3: Validate mật khẩu xác nhận không khớp**
  - *Dữ liệu*: Mật khẩu: "Test@123", Xác nhận mật khẩu: "Test@456".
  - *Kết quả mong đợi*: Form báo lỗi "Hai mật khẩu bạn đã nhập không khớp!" và không cho gửi form.
- **Case 3.4: Đăng ký với Email đã tồn tại**
  - *Dữ liệu*: Dùng lại email `admin@phr.vn`.
  - *Kết quả mong đợi*: Hệ thống hiển thị thông báo lỗi email đã được sử dụng.

---

## 4. Trang Quên Mật Khẩu (`/forgot-password`)
### Các tính năng
- Quy trình khôi phục 3 bước:
  - Bước 1: Nhập email tài khoản cần lấy lại mật khẩu để nhận mã OTP 6 số.
  - Bước 2: Nhập và xác thực mã OTP.
  - Bước 3: Thiết lập mật khẩu mới.

### Hướng dẫn test
- **Case 4.1: Gửi yêu cầu với Email không tồn tại**
  - *Dữ liệu*: Email: `emailkhongtontai@abc.xyz`.
  - *Kết quả mong đợi*: Hệ thống hiển thị cảnh báo không tìm thấy tài khoản.
- **Case 4.2: Quy trình khôi phục mật khẩu chuẩn**
  - *Bước thực hiện*:
    1. Nhập email đã đăng ký (ví dụ: `minhtri210595@gmail.com`), bấm "Gửi mã OTP".
    2. Nhập mã OTP nhận được (6 chữ số).
    3. Nhập mật khẩu mới (tối thiểu 6 ký tự), xác nhận và bấm "Lưu mật khẩu mới".
  - *Kết quả mong đợi*: Hiển thị màn hình thành công, có nút dẫn về Đăng nhập. Dùng mật khẩu mới đăng nhập thành công.

---

## 5. Bảng Điều Khiển / Dashboard (`/dashboard`)
### Các tính năng
- Thẻ thống kê tổng quan: Tổng số hồ sơ thành viên, tổng số đợt bệnh án, chỉ số huyết áp gần nhất, số lịch hẹn sắp tới.
- Hiển thị trung thực trạng thái trống: Nếu chưa đo huyết áp sẽ hiển thị "Chưa có số đo" thay vì số liệu ảo.
- Danh sách 5 bệnh án khám gần nhất kèm trạng thái và thời gian.
- Danh sách lịch hẹn khám sắp tới.
- Phím tắt hành động nhanh: Tạo hồ sơ mới, Tạo bệnh án mới, Ghi nhận chỉ số sinh hiệu, Đặt lịch khám.

### Hướng dẫn test
- **Case 5.1: Kiểm tra hiển thị số liệu thực tế**
  - *Bước thực hiện*: Đăng nhập tài khoản mới chưa có dữ liệu.
  - *Kết quả mong đợi*: Các thẻ hiển thị 0; thẻ Huyết áp hiển thị "Chưa có số đo"; danh sách bệnh án và lịch khám hiển thị thông báo "Chưa có dữ liệu".
- **Case 5.2: Kiểm tra các nút hành động nhanh**
  - *Bước thực hiện*: Bấm lần lượt các nút "Tạo hồ sơ người thân", "Thêm bệnh án mới", "Ghi chỉ số".
  - *Kết quả mong đợi*: Chuyển hướng chính xác đến từng trang chức năng tương ứng mà không bị màn hình trắng.

---

## 6. Trang Quản Lý Hồ Sơ Người Thân (`/profiles`)
### Các tính năng
- Hiển thị danh sách hồ sơ sức khỏe cá nhân và người thân dưới dạng lưới Card hoặc Bảng.
- Tự động che mờ (masking) thông tin nhạy cảm: CCCD (hiển thị `0010******89`), Mã BHYT (hiển thị `DN401******789`).
- Nút "Thêm hồ sơ thành viên mới":
  - Modal form nhập: Họ tên, Quan hệ (Bản thân, Bố, Mẹ, Con, Vợ/Chồng, Khác), Ngày sinh, Giới tính, Nhóm máu, CCCD, Mã BHYT, Địa chỉ, Thông tin liên hệ khẩn cấp.
  - Validate: Ngày sinh không được ở tương lai; CCCD đủ 12 số; BHYT đủ 15 ký tự.
- Nút "Xem chi tiết hồ sơ" chuyển sang `/profiles/:id`.
- Nút "Xóa hồ sơ" (kèm xác nhận xóa).

### Hướng dẫn test
- **Case 6.1: Thêm hồ sơ người thân hợp lệ**
  - *Dữ liệu*: Họ tên: "Trần Thị Bé", Quan hệ: "Con", Ngày sinh: "10/10/2020", Giới tính: "Nữ", Nhóm máu: "O".
  - *Kết quả mong đợi*: Thông báo tạo thành công, danh sách xuất hiện thẻ hồ sơ mới.
- **Case 6.2: Validate ngày sinh con ở tương lai**
  - *Thao tác*: Chọn ngày sinh sau ngày hiện tại.
  - *Kết quả mong đợi*: Bị chặn không cho chọn ngày tương lai hoặc báo lỗi đỏ.
- **Case 6.3: Kiểm tra che mờ số CCCD và BHYT**
  - *Dữ liệu*: Nhập CCCD "079201001234".
  - *Kết quả mong đợi*: Trên giao diện hiển thị dạng `079201****34`, bảo mật dữ liệu theo quy định.

---

## 7. Trang Chi Tiết Hồ Sơ & Tiền Sử Bệnh (`/profiles/:id`)
### Các tính năng
- Thông tin định danh y tế đầy đủ của người bệnh.
- Nút tạo nhanh bệnh án cho người này: `/medical-records/create?profileId={id}`.
- Cảnh báo sốc phản vệ: Banner đỏ nổi bật tự động bật lên nếu người bệnh có dị ứng mức độ "SEVERE" (Nguy kịch / Sốc phản vệ).
- 3 Tab tiền sử y tế:
  - Tab 1 - Tiền sử Dị ứng: Thêm/Xóa dị ứng (Thuốc, Thực phẩm, Môi trường, Khác), mức độ (Nhẹ, Trung bình, Nguy kịch), triệu chứng.
  - Tab 2 - Bệnh Mạn Tính Nền: Thêm/Xóa bệnh nền, năm chẩn đoán, tình trạng điều trị, phác đồ thuốc duy trì.
  - Tab 3 - Tiền Sử Bệnh Gia Đình: Thêm/Xóa bệnh lý di truyền của người thân, quan hệ huyết thống, độ tuổi khởi phát.

### Hướng dẫn test
- **Case 7.1: Thêm dị ứng thuốc nguy kịch và kiểm tra kích hoạt Banner đỏ**
  - *Thao tác*: Bấm "Thêm Tiền Sử Dị Ứng", chọn Loại: "Thuốc", Tên: "Penicillin", Mức độ: "Nguy kịch / Sốc phản vệ", bấm Lưu.
  - *Kết quả mong đợi*: Danh sách dị ứng thêm dòng Penicillin; phía trên đầu trang xuất hiện ngay Banner đỏ cảnh báo nguy cơ sốc phản vệ.
- **Case 7.2: Xóa tiền sử dị ứng**
  - *Thao tác*: Bấm nút "Xóa" tại dòng Penicillin, chọn xác nhận trong hộp thoại.
  - *Kết quả mong đợi*: Dòng dị ứng bị xóa, banner cảnh báo đỏ biến mất.
- **Case 7.3: Validate năm chẩn đoán bệnh mạn tính**
  - *Thao tác*: Bấm "Thêm Bệnh Mạn Tính", nhập năm chẩn đoán là năm tương lai (ví dụ: `2099`).
  - *Kết quả mong đợi*: Báo lỗi năm chẩn đoán phải từ 1920 đến năm hiện tại.

---

## 8. Trang Quản Lý Đợt Khám Bệnh Án (`/medical-records`)
### Các tính năng
- Bảng danh sách các đợt khám/điều trị bệnh án theo từng thành viên.
- Lọc theo hồ sơ người bệnh, tìm kiếm theo mã bệnh án, chẩn đoán, tên bác sĩ.
- Hiển thị phân loại đợt khám (Ngoại trú, Nội trú, Cấp cứu), ngày khám, chẩn đoán ICD-10.
- Thao tác:
  - "Xem chi tiết": Dẫn đến `/medical-records/:id`.
  - "Xuất PDF (A4)": Tải tệp PDF tóm tắt bệnh án chuẩn Quốc hiệu - Tiêu ngữ Bộ Y Tế.
  - "Thêm đợt khám mới": Dẫn đến `/medical-records/create`.

### Hướng dẫn test
- **Case 8.1: Lọc bệnh án theo thành viên**
  - *Thao tác*: Chọn một người bệnh cụ thể từ dropdown lọc.
  - *Kết quả mong đợi*: Bảng chỉ hiển thị các bệnh án thuộc về người bệnh đó.
- **Case 8.2: Tải PDF bệnh án chuẩn Bộ Y Tế**
  - *Thao tác*: Bấm nút "Xuất PDF" tại một bệnh án bất kỳ.
  - *Kết quả mong đợi*: Trình duyệt tải về tệp `.pdf`. Mở tệp hiển thị đúng định dạng A4, có Quốc hiệu - Tiêu ngữ, chẩn đoán và thông tin điều trị.

---

## 9. Trang Tạo Đợt Bệnh Án Mới (`/medical-records/create`)
### Các tính năng
- Biểu mẫu tạo đợt bệnh án chuẩn Bộ Y Tế:
  - Thông tin chung: Người bệnh, Loại đợt khám (Ngoại trú, Nội trú, Cấp cứu), Cơ sở y tế, Khoa điều trị, Bác sĩ khám, Ngày giờ vào viện.
  - Khám lâm sàng: Lý do vào viện, Quá trình bệnh lý, Chẩn đoán ban đầu, Chẩn đoán xác định, Mã bệnh ICD-10 chính & phụ.
  - Chỉ số sinh hiệu vào viện: Mạch, Nhiệt độ, Huyết áp tâm thu/tâm trương, Nhịp thở, Cân nặng, Chiều cao (tự động tính BMI).
  - Phân hệ chuyên khoa động (theo Tab):
    - Nội khoa: Tuần hoàn, Hô hấp, Tiêu hóa...
    - Ngoại khoa: Chẩn đoán trước/sau mổ, Phương pháp phẫu thuật, Vô cảm...
    - Sản khoa: Ngày kinh cuối (LMP), tự động tính Ngày dự sinh (EDD theo công thức Naegele), Tuổi thai.
    - Nhi khoa: Cân nặng lúc sinh, Chỉ số Apgar 1 phút & 5 phút, Dinh dưỡng.
- Validate: Ngày vào viện không được ở tương lai; Huyết áp tâm thu phải lớn hơn huyết áp tâm trương; Chiều cao/cân nặng hợp lý.

### Hướng dẫn test
- **Case 9.1: Tạo bệnh án Nội trú thành công**
  - *Dữ liệu*: Chọn người bệnh, Loại: "Nội trú", Bệnh viện: "BV Đa khoa Quốc tế", Bác sĩ: "BS. Lê Văn C", Lý do: "Đau đầu chóng mặt kéo dài", Chẩn đoán: "Tăng huyết áp vô căn (I10)", Huyết áp: "135/85", Cân nặng: "65", Chiều cao: "170".
  - *Kết quả mong đợi*: BMI tự động tính xấp xỉ 22.5; lưu bệnh án thành công và tự động chuyển về trang danh sách bệnh án.
- **Case 9.2: Test công thức Naegele tự động tính ngày dự sinh (Sản khoa)**
  - *Thao tác*: Vào tab Chuyên khoa Sản, chọn Ngày kinh cuối (LMP) là `01/01/2026`.
  - *Kết quả mong đợi*: Hệ thống tự động tính và điền Ngày dự sinh (EDD) là `08/10/2026` (+7 ngày, +9 tháng).
- **Case 9.3: Validate huyết áp bất hợp lý**
  - *Dữ liệu*: Nhập Huyết áp tâm thu `70`, Huyết áp tâm trương `120` (tâm thu nhỏ hơn tâm trương).
  - *Kết quả mong đợi*: Form báo lỗi đỏ: Huyết áp tâm thu phải lớn hơn huyết áp tâm trương.

---

## 10. Trang Chi Tiết Bệnh Án (`/medical-records/:id`)
### Các tính năng
- Thẻ thông tin tổng quan: Mã bệnh án, Bác sĩ điều trị, Chẩn đoán, Mã ICD-10, Ngày khám, Số ngày điều trị.
- Nút "Xuất Bệnh Án PDF Chuẩn Bộ Y Tế (A4)".
- 3 Tab dữ liệu chi tiết:
  - Tab Sinh Hiệu Lâm Sàng: Bảng lịch sử các lần đo Mạch, Nhiệt độ, Huyết áp, SpO2, BMI.
  - Tab Chi Tiết Chuyên Khoa: Hiển thị các khối chuyên khoa tương ứng (Nội/Ngoại/Sản/Nhi).
  - Tab Luân Chuyển Khoa & Timeline: Dòng thời gian chuyển khoa phòng và diễn biến điều trị.

### Hướng dẫn test
- **Case 10.1: Xem chi tiết bệnh án và chuyên khoa**
  - *Thao tác*: Bấm xem chi tiết một bệnh án sản khoa hoặc ngoại khoa.
  - *Kết quả mong đợi*: Tab Chuyên khoa hiển thị đúng thông tin phẫu thuật hoặc ngày dự sinh Naegele đã nhập.
- **Case 10.2: Tải PDF trực tiếp từ trang chi tiết**
  - *Thao tác*: Bấm nút xanh "Xuất Bệnh Án PDF Chuẩn Bộ Y Tế (A4)".
  - *Kết quả mong đợi*: Tải file PDF về máy thành công, không gặp lỗi HTTP 404/500.

---

## 11. Trang Cận Lâm Sàng & Kết Quả Xét Nghiệm (`/clinical`)
### Các tính năng
- Lựa chọn đợt bệnh án cần quản lý cận lâm sàng.
- Hiển thị banner hướng dẫn nếu chưa chọn hoặc chưa có bệnh án.
- Quản lý 3 nhóm danh mục cận lâm sàng:
  - Nhóm 1 - Xét nghiệm máu / Sinh hóa: Thêm/Xóa chỉ số (Glucose, Ure, Creatinine, AST, ALT...), Khoảng tham chiếu, đánh dấu chỉ số bất thường (tự động bôi đỏ cảnh báo).
  - Nhóm 2 - Chẩn đoán hình ảnh: X-Quang, CT Scanner, MRI, Siêu âm, Nội soi (Kỹ thuật chụp, Kết luận, Khuyến nghị).
  - Nhóm 3 - Tệp đính kèm y tế: Tải lên và lưu trữ link tệp PDF kết quả, ảnh X-quang/MRI; có nút mở xem tệp trực tiếp.

### Hướng dẫn test
- **Case 11.1: Thêm chỉ số xét nghiệm bất thường**
  - *Thao tác*: Bấm "Thêm Chỉ Số Xét Nghiệm", nhập Tên: "Đường huyết lúc đói", Kết quả: "8.5", Đơn vị: "mmol/L", Tham chiếu: "3.9 - 6.4", tick chọn "Kết quả bất thường", bấm Lưu.
  - *Kết quả mong đợi*: Bảng xét nghiệm hiển thị chỉ số, số liệu 8.5 hiển thị màu đỏ cảnh báo.
- **Case 11.2: Thêm kết quả chẩn đoán hình ảnh**
  - *Thao tác*: Chọn loại hình ảnh: "Siêu âm tim", Kết luận: "Hở van 2 lá nhẹ 1/4", bấm Lưu.
  - *Kết quả mong đợi*: Kết quả hiển thị đầy đủ trong danh sách chẩn đoán hình ảnh.

---

## 12. Trang Đơn Thuốc & Dược Phẩm (`/prescriptions`)
### Các tính năng
- Tủ thuốc đang dùng: Liệt kê các thuốc người bệnh đang sử dụng theo đơn, liều lượng, cách dùng, cảnh báo dị ứng.
- Tra cứu danh mục thuốc quốc gia: Ô tìm kiếm trực tiếp theo tên biệt dược hoặc hoạt chất (ví dụ: Paracetamol, Amlodipine).
- Hiển thị thông tin dược thư: Hàm lượng, đường dùng, chỉ định.

### Hướng dẫn test
- **Case 12.1: Tra cứu thuốc trong danh mục quốc gia**
  - *Thao tác*: Nhập từ khóa "Amlodipine" vào ô tra cứu và bấm nút "Tìm kiếm".
  - *Kết quả mong đợi*: Bảng kết quả hiển thị các loại thuốc có chứa hoạt chất Amlodipine, dạng bào chế và hàm lượng.
- **Case 12.2: Xem tủ thuốc đang dùng của người bệnh**
  - *Thao tác*: Chọn hồ sơ một người bệnh đã có đơn thuốc được kê.
  - *Kết quả mong đợi*: Bảng hiển thị danh sách các thuốc đang dùng kèm hướng dẫn uống trước hay sau ăn.

---

## 13. Trang Theo Dõi Chỉ Số Sức Khỏe & Biểu Đồ (`/metrics`)
### Các tính năng
- Biểu mẫu ghi nhận số đo sức khỏe tại nhà: Huyết áp, Đường huyết, Nhịp tim, SpO2, Cân nặng, Chiều cao.
- Phân loại y khoa tự động theo tiêu chuẩn Hội Tim Mạch Việt Nam / AHA:
  - Huyết áp < 120/80: Bình thường (Màu xanh).
  - Huyết áp 120-129/<80: Tiền tăng huyết áp (Màu vàng).
  - Huyết áp 130-139 hoặc 80-89: Tăng huyết áp Độ 1 (Màu cam).
  - Huyết áp >= 140 hoặc >= 90: Tăng huyết áp Độ 2 (Màu đỏ).
  - Huyết áp > 180 và/hoặc > 120: Cơn tăng huyết áp khẩn cấp (Cảnh báo nguy kịch).
- Biểu đồ đường trực quan (Recharts): Theo dõi biến thiên huyết áp tâm thu và tâm trương qua các mốc thời gian.
- Bảng lịch sử các lần đo kèm đánh giá y khoa.

### Hướng dẫn test
- **Case 13.1: Nhập số đo huyết áp độ 2**
  - *Dữ liệu*: Huyết áp tâm thu `145`, Huyết áp tâm trương `95`, bấm "Lưu số đo".
  - *Kết quả mong đợi*: Thông báo lưu thành công kèm đánh giá "Tăng huyết áp độ 2"; dòng lịch sử hiển thị tag màu đỏ.
- **Case 13.2: Kiểm tra cập nhật biểu đồ**
  - *Thao tác*: Nhập liên tiếp 2-3 số đo ở các thời điểm.
  - *Kết quả mong đợi*: Biểu đồ đường tự động vẽ các điểm mới tương ứng cho 2 đường tâm thu và tâm trương.
- **Case 13.3: Validate số đo âm hoặc phi thực tế**
  - *Dữ liệu*: Nhập huyết áp `-10` hoặc `500`.
  - *Kết quả mong đợi*: Hệ thống báo lỗi số đo không hợp lệ.

---

## 14. Trang Đặt Lịch Khám & Nhắc Hẹn (`/appointments`)
### Các tính năng
- Danh sách lịch hẹn khám của các thành viên gia đình.
- Phân loại trạng thái: Đã lên lịch (SCHEDULED), Đã khám xong (COMPLETED), Đã hủy (CANCELLED).
- Thẻ tag xanh "Sắp tới" tự động hiển thị cho các lịch hẹn trong tương lai.
- Modal đặt lịch khám mới:
  - Chọn hồ sơ người khám, Bệnh viện/Phòng khám, Chuyên khoa, Bác sĩ, Ngày giờ hẹn khám, Lý do khám, Ghi chú.
  - Validate ngày giờ: Bị khóa không cho chọn thời gian trong quá khứ.
- Thao tác: Cập nhật trạng thái thành "Đã khám" hoặc "Hủy lịch hẹn".

### Hướng dẫn test
- **Case 14.1: Đặt lịch hẹn khám thành công**
  - *Dữ liệu*: Chọn thành viên, Bệnh viện: "BV Bạch Mai", Chuyên khoa: "Nội Tim Mạch", Ngày giờ: Chọn một ngày trong tuần tới, Lý do: "Tái khám định kỳ".
  - *Kết quả mong đợi*: Lưu thành công, danh sách xuất hiện lịch hẹn có tag "Sắp tới".
- **Case 14.2: Validate không cho chọn ngày trong quá khứ**
  - *Thao tác*: Mở ô chọn ngày hẹn khám.
  - *Kết quả mong đợi*: Các ngày trước ngày hôm nay bị làm mờ (disabled) không thể click chọn.
- **Case 14.3: Đổi trạng thái lịch khám**
  - *Thao tác*: Bấm "Đã khám xong" tại lịch hẹn đang SCHEDULED.
  - *Kết quả mong đợi*: Trạng thái chuyển sang màu xanh lá COMPLETED.

---

## 15. Trang Chia Sẻ Hồ Sơ Bệnh Án (`/shares`)
### Các tính năng
- Danh sách các liên kết chia sẻ hồ sơ đang hoạt động.
- Tạo liên kết chia sẻ mới an toàn:
  - Nhập Email người nhận, Tên bác sĩ nhận, Mục đích chia sẻ (Hội chẩn, Chuyển tuyến, Khám bệnh từ xa).
  - Quyền truy cập: Chỉ xem (READ_ONLY).
  - Thời hạn truy cập (mặc định 7 ngày hoặc tự chọn ngày hết hạn).
- Tạo mã token ngẫu nhiên bảo mật 64 ký tự.
- Nút "Sao chép liên kết" (`/share/view/:token`) để gửi cho bác sĩ qua Zalo/Email.
- Nút "Thu hồi quyền truy cập" (Hủy chia sẻ ngay lập tức).

### Hướng dẫn test
- **Case 15.1: Tạo liên kết chia sẻ và copy link**
  - *Dữ liệu*: Chọn hồ sơ, Email bác sĩ: `bacsitructiep@bv.vn`, Tên bác sĩ: "BS. Trần Văn D", Mục đích: "Hội chẩn bệnh tim", Thời hạn: 7 ngày.
  - *Kết quả mong đợi*: Tạo thành công, hiển thị ô link chia sẻ dạng `http://localhost:5173/share/view/{token}`, bấm sao chép hiển thị thông báo đã copy vào clipboard.
- **Case 15.2: Thu hồi liên kết chia sẻ**
  - *Thao tác*: Bấm "Thu hồi quyền" tại một liên kết đã tạo.
  - *Kết quả mong đợi*: Trạng thái chuyển sang "Đã thu hồi", truy cập vào link đó sẽ bị chặn.

---

## 16. Trang Xem Hồ Sơ Chia Sẻ Cho Bác Sĩ (`/share/view/:token`)
### Các tính năng
- Trang xem công khai không yêu cầu bác sĩ phải tạo tài khoản/đăng nhập.
- Xác thực tính hợp lệ của token và thời hạn sử dụng.
- Hiển thị đầy đủ thông tin y tế đã được chia sẻ:
  - Thông tin định danh người bệnh (mã hóa CCCD/BHYT).
  - Danh sách tiền sử dị ứng và bệnh mạn tính.
  - Danh sách các đợt bệnh án và chẩn đoán.
- Thông báo lỗi trang nhã nếu liên kết bị thu hồi hoặc đã hết hạn.

### Hướng dẫn test
- **Case 16.1: Truy cập link chia sẻ hợp lệ**
  - *Thao tác*: Dán đường link copy từ trang `/shares` vào một trình duyệt ẩn danh (Incognito).
  - *Kết quả mong đợi*: Trang tải lên giao diện Cổng thông tin y tế chuyên dụng dành cho Bác sĩ, hiển thị đầy đủ hồ sơ bệnh nhân.
- **Case 16.2: Truy cập link đã bị thu hồi hoặc sai token**
  - *Thao tác*: Nhập link với token ngẫu nhiên không đúng: `/share/view/token_sai_123`.
  - *Kết quả mong đợi*: Hiển thị trang thông báo cảnh báo màu cam: "Liên kết chia sẻ không khả dụng hoặc đã hết hạn truy cập".

---

## 17. Trang Cài Đặt Tài Khoản & Bảo Mật (`/settings`)
### Các tính năng
- Hiển thị thông tin tài khoản: Họ tên, Email, Vai trò phân quyền (USER, DOCTOR, ADMIN).
- Đổi mật khẩu tài khoản:
  - Nhập Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
  - Validate: Mật khẩu mới tối thiểu 6 ký tự, mật khẩu xác nhận phải trùng khớp.

### Hướng dẫn test
- **Case 17.1: Đổi mật khẩu thành công**
  - *Dữ liệu*: Mật khẩu hiện tại: `Password@123`, Mật khẩu mới: `NewPass@123`, Xác nhận: `NewPass@123`.
  - *Kết quả mong đợi*: Thông báo đổi mật khẩu thành công; dùng mật khẩu mới đăng nhập thành công.
- **Case 17.2: Nhập sai mật khẩu hiện tại**
  - *Dữ liệu*: Mật khẩu hiện tại: `SaiPass123`.
  - *Kết quả mong đợi*: Báo lỗi mật khẩu hiện tại không chính xác.

---

## 18. Trang Bàn Làm Việc Bác Sĩ (`/doctor/workspace`)
*(Quyền truy cập: `ROLE_DOCTOR` hoặc `ROLE_ADMIN`)*
### Các tính năng
- Chọn đợt bệnh án của người bệnh đang tiếp nhận điều trị.
- Xem tóm tắt chẩn đoán, lý do khám, chỉ số sinh hiệu vào viện của bệnh nhân.
- Ghi nhận diễn biến điều trị hàng ngày (Doctor Notes / Lệnh y khoa):
  - Nội dung diễn biến bệnh, xử trí, chỉ định thuốc.
  - Lưu và hiển thị danh sách diễn biến theo thứ tự thời gian.
- Nút xuất file PDF bệnh án A4 trực tiếp tại bàn làm việc.

### Hướng dẫn test
- **Case 18.1: Truy cập bằng tài khoản Bác sĩ**
  - *Thao tác*: Đăng nhập `doctor@phr.vn`, vào mục "Bàn làm việc Bác sĩ".
  - *Kết quả mong đợi*: Truy cập thành công, giao diện hiển thị danh sách bệnh án phân công.
- **Case 18.2: Thêm ghi chú diễn biến điều trị**
  - *Thao tác*: Chọn một bệnh án, nhập diễn biến: "Bệnh nhân đỡ đau đầu, huyết áp hạ về 125/80 mmHg, duy trì đơn thuốc", bấm Lưu diễn biến.
  - *Kết quả mong đợi*: Ghi chú xuất hiện ngay trong dòng lịch sử theo dõi của đợt bệnh án.
- **Case 18.3: Truy cập bằng tài khoản Người bệnh thường (USER)**
  - *Thao tác*: Đăng nhập `minhtri210595@gmail.com`, gõ trực tiếp URL `/doctor/workspace`.
  - *Kết quả mong đợi*: Bị từ chối quyền truy cập và chuyển hướng về trang lỗi `/403`.

---

## 19. Trang Quản Lý Người Dùng & Phân Quyền Bác Sĩ (`/admin/users`)
*(Quyền truy cập: `ROLE_ADMIN`)*
### Các tính năng
- Danh sách toàn bộ tài khoản trong hệ thống: Họ tên, Email, Số điện thoại, Vai trò (ADMIN, DOCTOR, USER), Trạng thái hoạt động, Chuyên khoa bác sĩ.
- Lọc theo vai trò, tìm kiếm theo tên hoặc email.
- Khóa / Mở khóa tài khoản (Active / Inactive).
- Phân quyền & Chỉ định Chuyên khoa Bác sĩ:
  - Bấm nút "Phân quyền".
  - Chọn vai trò `ROLE_DOCTOR`.
  - Chọn Chuyên khoa phân công (Khoa Tim Mạch, Khoa Nội Tổng Hợp, Khoa Ngoại, Khoa Sản, Khoa Nhi, Khoa Cấp Cứu...).
  - Lưu và cập nhật quyền ngay lập tức.

### Hướng dẫn test
- **Case 19.1: Cấp quyền Bác sĩ và gán chuyên khoa**
  - *Thao tác*: Tìm tài khoản một người dùng thường, bấm "Phân quyền", chọn vai trò `ROLE_DOCTOR`, chọn Khoa "Khoa Tim Mạch", bấm Lưu.
  - *Kết quả mong đợi*: Cột vai trò đổi thành Bác sĩ (DOCTOR), cột chuyên khoa hiển thị "Khoa Tim Mạch".
- **Case 19.2: Khóa tài khoản người dùng**
  - *Thao tác*: Bấm nút khóa tài khoản một người dùng.
  - *Kết quả mong đợi*: Trạng thái chuyển sang "Đã khóa". Thử dùng tài khoản đó đăng nhập sẽ bị hệ thống từ chối.
- **Case 19.3: Người bệnh thường truy cập trang Admin**
  - *Thao tác*: Dùng tài khoản USER truy cập `/admin/users`.
  - *Kết quả mong đợi*: Bị chặn truy cập, chuyển hướng sang trang `/403`.

---

## 20. Trang Quản Trị Danh Mục Y Tế (`/admin/catalogs`)
*(Quyền truy cập: `ROLE_ADMIN`)*
### Các tính năng
- Quản trị 2 danh mục chuẩn y tế quốc gia:
  - Tab Danh mục ICD-10: Tra cứu mã bệnh theo mã hoặc tên tiếng Việt (I10, E11, J00...), thêm mới mã bệnh ICD-10.
  - Tab Danh mục Thuốc Quốc Gia: Tra cứu thuốc theo tên biệt dược hoặc hoạt chất, thêm mới thuốc (Tên thuốc, Hoạt chất, Hàm lượng, Đơn vị, Dạng bào chế, Đường dùng).

### Hướng dẫn test
- **Case 20.1: Tra cứu và thêm mã bệnh ICD-10 mới**
  - *Thao tác*: Bấm "Thêm Mã ICD-10", nhập Mã: "K21.0", Tên tiếng Việt: "Bệnh trào ngược dạ dày thực quản có viêm thực quản", bấm Lưu.
  - *Kết quả mong đợi*: Thông báo thêm thành công; tìm kiếm từ khóa "K21" hiển thị mã bệnh vừa thêm.
- **Case 20.2: Thêm thuốc mới vào danh mục quốc gia**
  - *Thao tác*: Bấm "Thêm Thuốc Mới", nhập Tên: "Panadol Extra", Hoạt chất: "Paracetamol 500mg + Caffeine 65mg", Đường dùng: "Uống", bấm Lưu.
  - *Kết quả mong đợi*: Thuốc mới xuất hiện trong danh mục và có thể tìm thấy khi bác sĩ kê đơn hoặc tra cứu.

---

## 21. Trang Nhật Ký Kiểm Toán Hệ Thống (`/admin/audit-logs`)
*(Quyền truy cập: `ROLE_ADMIN`)*
### Các tính năng
- Theo dõi và truy vết 100% các hành vi thay đổi dữ liệu nhạy cảm (Tuân thủ HIPAA & Bộ Y Tế).
- Bảng nhật ký ghi nhận:
  - Thời gian chính xác (Ngày, giờ, phút, giây).
  - Tài khoản thực hiện thao tác.
  - Hành động: CREATE, UPDATE, DELETE, LOGIN, SHARE... (hiển thị tag màu sắc tương ứng).
  - Đối tượng tác động (Entity Name và Entity ID).
  - Địa chỉ IP client.
  - Chi tiết mô tả thao tác.
- Phân trang tự động và nút "Làm mới" dữ liệu.

### Hướng dẫn test
- **Case 21.1: Kiểm tra ghi nhận vết thao tác**
  - *Thao tác*: Tạo mới một hồ sơ hoặc sửa thông tin bệnh án, sau đó vào trang `/admin/audit-logs`.
  - *Kết quả mong đợi*: Dòng đầu tiên trong bảng hiển thị đúng thao tác vừa thực hiện kèm tài khoản và thời gian thực.
- **Case 21.2: Chuyển trang và làm mới**
  - *Thao tác*: Bấm nút "Làm mới" hoặc bấm chuyển trang số 2.
  - *Kết quả mong đợi*: Bảng tải lại dữ liệu mượt mà, không gặp lỗi.

---

## 22. Trang Lỗi Phân Quyền & Không Tìm Thấy (`/403`, `/404`)
### Các tính năng
- Trang 403 (Không có quyền truy cập): Hiển thị khi người dùng không đủ role cố tình truy cập vào trang Admin hoặc Bác sĩ; có nút quay về Trang chủ.
- Trang 404 (Không tìm thấy trang): Hiển thị khi người dùng gõ đường dẫn sai hoặc không tồn tại trên hệ thống; có nút quay về Trang chủ.

### Hướng dẫn test
- **Case 22.1: Test trang 404**
  - *Thao tác*: Nhập đường dẫn bất kỳ không có trong hệ thống: `http://localhost:5173/duong-dan-khong-ton-tai`.
  - *Kết quả mong đợi*: Giao diện hiển thị trang 404 Result với thông báo "Trang bạn tìm kiếm không tồn tại" và nút bấm về Trang chủ.
- **Case 22.2: Test trang 403**
  - *Thao tác*: Đăng nhập tài khoản Người bệnh, truy cập `http://localhost:5173/403`.
  - *Kết quả mong đợi*: Giao diện hiển thị cảnh báo "Truy cập bị từ chối - Bạn không có quyền xem trang này".
