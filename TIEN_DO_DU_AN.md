
# 📊 BẢNG THEO DÕI TIẾN ĐỘ DỰ ÁN (PROJECT PROGRESS TRACKER)
## Đề tài: Hệ Thống Quản Lý Bệnh Án Cá Nhân (PHR) - Môn PTTKYC

> **Cập nhật lần cuối**: 12/10/2026 (03:33)  
> **Trạng thái hiện tại**: 🟢 **HOÀN THÀNH 100% TOÀN BỘ 14 MODULE BACKEND (CHẶNG 1, 2, 3 & 4) ➔ CHUẨN BỊ BƯỚC VÀO CHẶNG 5 (FRONTEND REACT + ANT DESIGN & BÁO CÁO PTTKYC)**  
> **Kế hoạch chi tiết**: Xem tại [`KE_HOACH_DO_AN_PTTKYC.md`](./KE_HOACH_DO_AN_PTTKYC.md)

---

## 🚦 1. TỔNG QUAN TIẾN ĐỘ 5 CHẶNG

| Chặng | Nội dung | Trạng thái | Tiến độ (%) | Ghi chú |
|---|---|---|---|---|
| **Chặng 1** | Chuẩn bị, Smoke Test, Swagger & Envelope | 🟢 Hoàn thành | **100%** | Plan & ERD BYT, JDK 21, Swagger UI 3.0, `ApiResponse<T>`, `PageResponse<T>` |
| **Chặng 2** | Core Backend (SQL Server, Auth, Hồ sơ) | 🟢 Hoàn thành | **100%** | 34 bảng, 27 Repos, Seeder, Module 1 Auth & Module 2 Hồ sơ đã test sống 100% |
| **Chặng 3** | Nghiệp vụ 4 Chuyên khoa, Thuốc, Cận lâm sàng | 🟢 Hoàn thành | **100%** | Toàn bộ 7 module nghiệp vụ y tế P1 (M3-M9) đã hoàn thành & test live 100% |
| **Chặng 4** | Backend nâng cao (P2/P3, PDF, Test Swagger) | 🟢 Hoàn thành | **100%** | Xuất PDF chuẩn BYT, Chia sẻ hồ sơ, Lịch hẹn, Chỉ số sức khỏe, Bác sĩ ghi chú đã live test 100% |
| **Chặng 5** | **Frontend React + Ant Design (3 Phân Hệ Độc Lập)** | 🟢 Hoàn thành | **100%** | Tái cấu trúc toàn diện 3 Portal: Admin, Doctor, Patient theo `plan.md`. Build Vite 100% Success. |
| ↳ *Phase 0* | Nền Tảng, Auth, 3 Theme Palettes, Layouts Chung, RoleRoute | 🟢 Hoàn thành | **100%** | Design tokens 3 màu, ThemeProvider, Formatters, Validators, RoleRoute, 403, 404 |
| ↳ *Phase 1* | Phân Hệ Quản Trị Viên (Admin Portal - `/admin/*`) | 🟢 Hoàn thành | **100%** | Admin KPI Dashboard, Quản lý User & Cấp quyền Bác sĩ/Khoa phòng, Catalogs, Audit Logs, Settings |
| ↳ *Phase 2* | Phân Hệ Bác Sĩ Điều Trị (Doctor Portal - `/doctor/*`) | 🟢 Hoàn thành | **100%** | Doctor KPI Ca Trực, Bàn khám bệnh, Lập BA điện tử ICD-10, Kê đơn check dị ứng chéo, Duyệt CLS, Bệnh nhân theo dõi |
| ↳ *Phase 3* | Phân Hệ Bệnh Nhân & Gia Đình (Patient Portal - `/patient/*`) | 🟢 Hoàn thành | **100%** | Form Tạo Bệnh Án 1-Trang chuẩn BYT, Sổ bệnh án, Tủ thuốc gia đình, Biểu đồ AHA Recharts, Lịch khám, Chia sẻ QR |
| ↳ *Phase 4* | Tích Hợp Định Tuyến & Xác Minh Build | 🟢 Hoàn thành | **100%** | AppRoutes liên thông 3 phân hệ, `npm run build` thành công 100% với 0 lỗi |

---

## ✅ 2. NHỮNG VIỆC ĐÃ LÀM ĐƯỢC (COMPLETED - PHÂN THEO TỪNG CHẶNG)

### 📍 CHẶNG 1: Chuẩn Bị, Smoke Test, Thiết Kế Kiến Trúc & Công Cụ (Hoàn thành 100%)
- [x] **Smoke Test mã nguồn ban đầu**:
  - Clone starter pack Spring Boot về thư mục `scratch/backend`.
  - Cấu hình OpenJDK 21 LTS (`C:\Program Files\Android\openjdk\jdk-21.0.8`).
  - Chạy `./gradlew testClasses` thành công 100% (Build Success).
- [x] **Thiết kế phân tích kiến trúc & CSDL 3NF**:
  - Đặc tả 15 nhóm module chức năng chuẩn theo yêu cầu môn học PTTKYC.
  - Chuẩn hóa biểu mẫu bệnh án theo quy chuẩn Bộ Y Tế: MS: 01/BV-01 (Nội), MS: 02/BV-01 (Nhi), MS: 10/BV-01 (Ngoại) và Sản khoa.
  - Lập tài liệu kế hoạch tổng thể [`KE_HOACH_DO_AN_PTTKYC.md`](./KE_HOACH_DO_AN_PTTKYC.md) kèm sơ đồ Mermaid ERD và Use Case.
- [x] **Tích hợp Swagger / OpenAPI 3.0**:
  - Bổ sung thư viện `springdoc-openapi-starter-webmvc-ui:2.5.0` vào `build.gradle`.
  - Cấu hình Whitelist trong Spring Security: Swagger UI truy cập trực tiếp tại `/api/v1/swagger-ui/index.html`.
  - Đã kiểm tra thực tế: API Docs trả về JSON OpenAPI 3.0 chuẩn xác.
- [x] **Chuẩn hóa API Response Envelope**:
  - Xây dựng lớp [`ApiResponse<T>`](./src/main/java/com/spring/temp/domain/dto/common/ApiResponse.java) thống nhất cấu trúc phản hồi (`success`, `message`, `data`, `errors`, `timestamp`).
  - Xây dựng lớp [`PageResponse<T>`](./src/main/java/com/spring/temp/domain/dto/common/PageResponse.java) chuẩn hóa phân trang (`content`, `pageNumber`, `pageSize`, `totalElements`, `totalPages`).
- [x] **Cấu hình xử lý MapStruct & Lombok**:
  - Bổ sung `mapstruct:1.5.5.Final`, `mapstruct-processor` và `lombok-mapstruct-binding:0.2.0` hỗ trợ chuyển đổi DTO ➔ Entity hiệu năng cao.

---

### 📍 CHẶNG 2: Nền Tảng Core Backend (SQL Server, Auth & Hồ Sơ) (Hoàn thành 100%)
- [x] **Cấu hình & Kết nối Microsoft SQL Server**:
  - Kích hoạt giao thức mạng **TCP/IP** cổng `1433` trong SQL Server Configuration Manager.
  - Bật chế độ xác thực **Mixed Mode Authentication** (SQL Server and Windows Authentication).
  - Cấu hình tài khoản `sa` với mật khẩu riêng và chỉ định database đích **`HETHONGQUANLYBENHANCANHAN`**.
  - Tích hợp driver `mssql-jdbc` và chuyển đổi cổng chạy Spring Boot sang `8088` (tránh xung đột port 8080).
  - Kết nối thành công 100% qua HikariCP (`Added connection ConnectionID:1`).
- [x] **Xây dựng trọn bộ Entity JPA & Enum (Mô hình 3NF chuẩn BYT)**:
  - **16 Enum chuẩn**: `Gender`, `RelationshipType`, `RecordType`, `AdmissionType`, `AdmissionGate`, `ReferralSource`, `TransferredLevel`, `DischargeType`, `InsuranceType`, `AllergyType`, `AllergySeverity`, `AdministrationRoute`, `VaccinationStatus`, `AppointmentType`, `AppointmentStatus`, `MetricType`.
  - **28 Class Entity**:
    - Nhóm 1 (Tài khoản): `User`, `Role`, `Token`, `Page`, `UserActions`
    - Nhóm 2 (Hồ sơ): `HealthProfile`, `Allergy`, `ChronicDisease`, `FamilyMedicalHistory`
    - Nhóm 3 (Bệnh án chung): `MedicalRecord`, `VitalSigns`, `DepartmentTransfer`
    - Nhóm 4 (4 Chuyên khoa BYT): `InternalRecordDetail` (Nội), `SurgicalRecordDetail` & `SurgicalProcedure` (Ngoại), `PediatricRecordDetail` & `PediatricGrowthRecord` & `VaccinationRecord` (Nhi), `ObstetricRecordDetail` & `PrenatalVisit` (Sản)
    - Nhóm 5 (Đơn thuốc): `Prescription`, `PrescriptionItem`, `MedicineCatalog`
    - Nhóm 6 (Cận lâm sàng & Tệp): `LabTestResult`, `ImagingResult`, `MedicalAttachment`
    - Nhóm 7 (Tiện ích): `HealthMetric`, `MedicalAppointment`, `Icd10Catalog`
    - Nhóm 8 (Mở rộng): `ProfileShare`, `DoctorNote`, `AuditLog`
- [x] **Sinh cấu trúc CSDL vào Microsoft SQL Server**:
  - Hibernate DDL tự động sinh thành công **34 bảng vật lý** cùng toàn bộ Foreign Key constraints vào database `HETHONGQUANLYBENHANCANHAN`.
  - Đã kiểm tra trực tiếp qua lệnh SQL Server `INFORMATION_SCHEMA.TABLES`.
- [x] **Tạo trọn bộ 27 Tầng Repository (Spring Data JPA)**:
  - Xây dựng 27 Repository interfaces tương ứng với các Entity.
  - Viết sẵn các phương thức lọc xóa mềm (`deleted = false`) và kiểm tra quyền sở hữu chống IDOR.
- [x] **Data Initializer (Bộ nạp dữ liệu ban đầu)**:
  - Khởi tạo 3 Role hệ thống: `ROLE_USER`, `ROLE_DOCTOR`, `ROLE_ADMIN`.
  - Khởi tạo tài khoản Quản trị viên mặc định: `admin@phr.vn` (Mật khẩu: `Admin@123` mã hóa BCrypt).
  - Nạp sẵn 6 mã bệnh quốc tế **ICD-10** phổ biến (`I10`, `E11`, `J02`, `K29`, `M54`, `O80`).
  - Nạp sẵn 4 loại **Thuốc mẫu chuẩn** (`Hapacol 650`, `Amoxicillin 500mg`, `Glucophage 850mg`, `Amlor 5mg`).
  - Đã kiểm tra thực tế trong SQL Server: Tất cả dữ liệu seed đã được nạp chính xác 100%!
- [x] **Module 1: Xác thực & Tài khoản (Auth Module)**:
  - Đăng ký tài khoản mới (`POST /api/v1/auth/register`), tự động gán role và hỗ trợ đăng nhập ngay.
  - Đăng nhập hệ thống (`POST /api/v1/auth/authenticate`), trả về JWT Access Token + Refresh Token + Cookie.
  - Xem thông tin tài khoản hiện tại (`GET /api/v1/auth/me`).
  - Đổi mật khẩu tài khoản (`POST /api/v1/auth/change-password`), kiểm tra mật khẩu cũ.
  - Làm mới Token (`GET /api/v1/auth/refreshToken`).
  - Quên mật khẩu & Đặt lại mật khẩu (Forgot & Reset Password):
    - Gửi yêu cầu mã OTP 6 số qua email (`POST /api/v1/auth/forgot-password`), thời hạn 15 phút.
    - Kiểm tra tính hợp lệ của mã xác thực OTP (`POST /api/v1/auth/verify-reset-code`).
    - Đặt lại mật khẩu mới an toàn (`POST /api/v1/auth/reset-password`), mã hóa BCrypt, chặn tấn công phát lại (Replay Attack).
- [x] **Module 2: Quản lý Hồ sơ sức khỏe cá nhân & Người thân (Health Profile)**:
  - Tạo hồ sơ thành viên (`POST /api/v1/profiles`): hỗ trợ Bản thân, Con, Cha mẹ, Vợ/chồng (`relationship`), nhóm máu, BHYT, CCCD, thông tin liên hệ khẩn cấp.
  - Danh sách hồ sơ phân trang (`GET /api/v1/profiles`) và toàn bộ hồ sơ (`GET /api/v1/profiles/all`).
  - Xem chi tiết hồ sơ (`GET /api/v1/profiles/{id}`) và cập nhật (`PUT /api/v1/profiles/{id}`).
  - Xóa mềm an toàn (`DELETE /api/v1/profiles/{id}`).
  - Cơ chế bảo mật chống IDOR: Chặn triệt để hành vi truy cập trái phép hồ sơ người khác qua ID.
  - Quản lý Dị ứng (Allergies): Thêm (`POST /{id}/allergies`), xem danh sách (`GET /{id}/allergies`), xóa mềm (`DELETE /{id}/allergies/{allergyId}`).
  - Quản lý Bệnh mạn tính (Chronic Diseases): Thêm (`POST /{id}/chronic-diseases`), xem danh sách (`GET /{id}/chronic-diseases`), xóa mềm (`DELETE /{id}/chronic-diseases/{diseaseId}`).
  - Quản lý Tiền sử gia đình (Family Histories): Thêm (`POST /{id}/family-histories`), xem danh sách (`GET /{id}/family-histories`), xóa mềm (`DELETE /{id}/family-histories/{historyId}`).
- [x] **Kiểm thử trực tiếp API (Live Verification)**:
  - Đăng nhập thành công với tài khoản Admin mặc định (`admin@phr.vn`).
  - Gọi API `/auth/me` lấy đúng thông tin Admin qua JWT Bearer token.
  - Tạo mới hồ sơ sức khỏe và thêm dị ứng Penicillin thành công, kiểm chứng kết quả trong SQL Server.

---

### 📍 CHẶNG 3: Nghiệp Vụ Y Tế Cốt Lõi P1 (Đã hoàn thành 60% ➔ Đang làm tiếp)
- [x] **Module 3: Bệnh án chung (Chuẩn MS: 01, 02, 10/BV-01 & Sản khoa)**:
  - Xây dựng 9 API RESTful trong `MedicalRecordController`:
    - Tạo bệnh án theo loại chuyên khoa (`POST /api/v1/medical-records`).
    - Lấy danh sách bệnh án phân trang & lọc theo chuyên khoa (`GET /api/v1/medical-records/profile/{profileId}`).
    - Xem chi tiết bệnh án (`GET /api/v1/medical-records/{id}`).
    - Cập nhật thông tin bệnh án (`PUT /api/v1/medical-records/{id}`).
    - Xóa mềm an toàn (`DELETE /api/v1/medical-records/{id}`).
    - Thêm / cập nhật sinh hiệu lâm sàng (`POST /api/v1/medical-records/{id}/vital-signs`).
    - Thêm luân chuyển khoa điều trị (`POST /api/v1/medical-records/{id}/transfers`).
    - Lấy lịch sử luân chuyển khoa (`GET /api/v1/medical-records/{id}/transfers`).
    - Dòng thời gian lịch sử khám bệnh - Timeline (`GET /api/v1/medical-records/profile/{profileId}/timeline`).
  - Tự động hóa tính toán y tế:
    - Tự động tính chỉ số BMI từ chiều cao và cân nặng (làm tròn 1 chữ số thập phân).
    - Tự động tính tổng số ngày điều trị (`totalTreatmentDays`) từ ngày vào viện và ra viện.
- [x] **Module 4: Bệnh án Nội khoa (MS: 01/BV-01)**:
  - Khám chi tiết 7 hệ cơ quan: tuần hoàn, hô hấp, tiêu hóa, thận - tiết niệu, thần kinh, cơ xương khớp, nội tiết.
  - Tóm tắt bệnh mạn tính theo dõi (`chronicMonitoringSummary`) và kế hoạch dùng thuốc dài hạn (`longTermMedicationPlan`).
- [x] **Module 5: Bệnh án Ngoại khoa (MS: 10/BV-01)**:
  - Chẩn đoán trước mổ, sau mổ, phương pháp vô cảm, theo dõi hậu phẫu (vết mổ, dẫn lưu), ngày rút dẫn lưu, ngày cắt chỉ.
- [x] **Module 6: Bệnh án Nhi khoa (MS: 02/BV-01)**:
  - Thông tin nhân khẩu học của cả bố và mẹ (họ tên, trình độ văn hóa, nghề nghiệp).
  - Thông tin sơ sinh (tuổi thai tuần, cân nặng lúc sinh, đẻ thường/mổ, Apgar 1p/5p), chế độ nuôi dưỡng, đánh giá tâm thần vận động.
- [x] **Module 7: Bệnh án Sản khoa (Chuẩn Sản khoa)**:
  - **Ràng buộc giới tính**: Chặn triệt để hành vi tạo bệnh án Sản khoa trên hồ sơ giới tính Nam.
  - Tiền sử kinh nguyệt & tiền sử sản khoa PARA (đủ tháng, thiếu tháng, sảy/hút, con sống, mổ lấy thai cũ).
  - **Công thức Naegele**: Tự động tính ngày dự sinh (`EDD = LMP + 7 ngày - 3 tháng + 1 năm`) và tự tính tuổi thai theo tuần.
  - Theo dõi cuộc đẻ, thông tin bé sơ sinh (giới tính, cân nặng, Apgar) và chăm sóc hậu sản.
- [x] **Kiểm thử trực tiếp live test (Cổng 8088)**:
  - Tạo bệnh án Nội khoa thành công (tự tính BMI 23.0, tự tính 5 ngày điều trị).
  - Thêm chuyển khoa từ Cấp cứu sang Nội tim mạch thành công.
  - Kiểm tra ràng buộc Sản khoa: Hồ sơ Nam bị chặn đúng nghiệp vụ 100%.
  - Tạo hồ sơ Nữ và tạo bệnh án Sản khoa: Công thức Naegele tự tính ra ngày dự sinh chính xác 17/11/2026 và tuổi thai 34.9 tuần chuẩn xác!
- [x] **Module 8: Đơn thuốc & Danh mục thuốc**:
  - Tra cứu danh mục thuốc quốc gia theo biệt dược hoặc hoạt chất (`GET /api/v1/medicines/search`).
  - Kê đơn thuốc điều trị gắn liền với đợt khám (`POST /api/v1/prescriptions`).
  - **Thuật toán tự động phát hiện cảnh báo dị ứng thuốc chéo**:
    - Đối chiếu tự động tên thuốc và hoạt chất với danh sách tiền sử dị ứng của người bệnh.
    - Nhận diện các nhóm dị ứng nguy hiểm (ví dụ: dị ứng Penicillin ➔ cảnh báo khi kê Amoxicillin, Ampicillin).
    - Tự động bật cờ `hasAllergyWarning = true` và trả về thông điệp cảnh báo nguy cơ sốc phản vệ.
  - Danh sách thuốc đang sử dụng hiện tại - Active Medications (`GET /api/v1/prescriptions/profile/{profileId}/active-medications`): Tổng hợp thuốc còn trong liệu trình điều trị tính theo số ngày dùng.
  - Xem danh sách đơn thuốc theo bệnh án (`GET /api/v1/prescriptions/record/{medicalRecordId}`) và chi tiết (`GET /api/v1/prescriptions/{id}`).
  - Xóa mềm đơn thuốc an toàn (`DELETE /api/v1/prescriptions/{id}`).
- [x] **Module 9: Cận lâm sàng & Tệp đính kèm**:
  - Quản lý kết quả xét nghiệm sinh hóa, huyết học, nước tiểu (`POST`, `GET`, `DELETE /api/v1/clinical/lab-tests`).
  - Đánh giá chỉ số bất thường (cờ `abnormal`), khoảng tham chiếu và nhận định chuyên môn.
  - Quản lý kết quả chẩn đoán hình ảnh X-quang, CT Scanner, MRI, Siêu âm, Điện tim (`POST`, `GET`, `DELETE /api/v1/clinical/imaging`).
  - Quản lý tệp đính kèm y tế - ảnh chụp X-quang, phiếu kết quả PDF (`POST`, `GET`, `DELETE /api/v1/clinical/attachments`).
- [x] **Kiểm thử trực tiếp live test (Cổng 8088)**:
  - Tra cứu danh mục thuốc tìm đúng Amoxicillin 500mg.
  - Kê đơn thuốc chứa Amoxicillin cho người bệnh có tiền sử dị ứng Penicillin: Hệ thống phát hiện và kích hoạt cảnh báo sốc phản vệ thành công 100%!
  - Thêm kết quả xét nghiệm đường huyết Glucose 7.2 mmol/L (abnormal = true) thành công.
  - Thêm kết quả chụp X-quang ngực thẳng thành công.
  - Đính kèm tệp PDF phiếu kết quả thành công.

---

### 📍 CHẶNG 4: Backend Nâng Cao P2/P3, Xuất PDF & Chia Sẻ Hồ Sơ (Hoàn thành 100%)
- [x] **Module 10: Chia sẻ hồ sơ bệnh án (ProfileShare)**:
  - Sinh mã token chia sẻ 32 ký tự bảo mật (`UUID.randomUUID()`), thời hạn hiệu lực linh hoạt (`expiresAt`), phân quyền `READ_ONLY` hoặc `FULL_ACCESS`, hỗ trợ thu hồi quyền tức thì (`REVOKED`).
  - Endpoint công khai xác thực token chia sẻ (`GET /api/v1/shares/verify/{token}`) không yêu cầu đăng nhập, giúp Bác sĩ xem nhanh hồ sơ qua liên kết.
  - Quản lý danh sách chia sẻ theo hồ sơ và theo Bác sĩ (`GET /api/v1/shares/doctor`).
- [x] **Module 11: Chỉ số sức khỏe theo dõi tại nhà (HealthMetric)**:
  - Lưu và phân tích lịch sử các chỉ số: Huyết áp, Đường huyết, SpO2, Nhịp tim, Cân nặng, Thân nhiệt.
  - **Thuật toán tự động đánh giá & cảnh báo phân loại y khoa**:
    - Huyết áp: Phân loại Tối ưu / Tiền tăng huyết áp / Tăng huyết áp độ 1 / Tăng huyết áp độ 2 (kèm cờ màu `SUCCESS`, `WARNING`, `DANGER`).
    - Đường huyết: Tự động quy đổi đơn vị mmol/L ➔ mg/dL và phân loại Hạ đường huyết / Bình thường / Tiền đái tháo đường / Đái tháo đường.
    - SpO2: Cảnh báo thiếu oxy máu nghiêm trọng khi < 94%.
    - Nhịp tim: Cảnh báo nhịp chậm (< 60) hoặc nhịp nhanh (> 100).
  - Bảng tổng hợp chỉ số sức khỏe gần nhất cho Dashboard (`GET /api/v1/health-metrics/profile/{profileId}/summary`).
- [x] **Module 12: Đặt lịch hẹn khám & Tái khám (MedicalAppointment)**:
  - Đặt lịch tái khám, lịch tiêm chủng, lịch khám thai gắn với hồ sơ người bệnh và mã bệnh án.
  - Quản lý trạng thái lịch hẹn (`SCHEDULED`, `COMPLETED`, `CANCELLED`).
  - Tra cứu lịch hẹn sắp tới (`GET /api/v1/appointments/profile/{profileId}/upcoming`).
- [x] **Module 13: Bác sĩ ghi chú (DoctorNote) & Nhật ký kiểm toán (AuditLog)**:
  - Cho phép Bác sĩ ghi chú, đánh giá chuyên môn độc lập trên bệnh án (`DoctorNote`).
  - Phân quyền RBAC nghiêm ngặt: `@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")`.
  - Quản trị viên theo dõi nhật ký kiểm toán toàn hệ thống (`GET /api/v1/audit-logs`) với `@PreAuthorize("hasRole('ADMIN')")`.
- [x] **Module 14: Xuất tóm tắt bệnh án ra tệp PDF chuẩn Bộ Y Tế (OpenPDF)**:
  - Tích hợp thư viện OpenPDF (`com.github.librepdf:openpdf:2.0.2`).
  - `MedicalRecordPdfService`: Thiết kế trang in A4 chuẩn biểu mẫu Bộ Y Tế gồm 6 phần:
    - 1. Quốc hiệu - Tiêu ngữ & Tên cơ sở y tế.
    - 2. Thông tin hành chính người bệnh (Họ tên, Mã YT, CCCD, BHYT, Nhóm máu, Địa chỉ).
    - 3. Quá trình nhập viện & ra viện (Thời điểm vào/ra, Tổng số ngày điều trị, Chẩn đoán xác định, Mã ICD-10).
    - 4. Dấu hiệu sinh tồn (Mạch, Nhiệt độ, Huyết áp, Nhịp thở, Cân nặng, Chiều cao, BMI, SpO2).
    - 5. Bảng đơn thuốc điều trị chi tiết (Tên thuốc, Hoạt chất, Số lượng, Cách dùng).
    - 6. Kế hoạch điều trị & Lời dặn dò xuất viện của Bác sĩ kèm chữ ký xác nhận.
  - Endpoint xuất PDF: `GET /api/v1/medical-records/{id}/export-pdf` trả về tệp PDF đính kèm.
- [x] **Kiểm thử trực tiếp live test (Cổng 8088)**:
  - Tạo và xác thực mã token chia sẻ hồ sơ công khai thành công 100%.
  - Ghi nhận huyết áp 135/85 mmHg ➔ Tự động phân loại "Tăng huyết áp độ 1 (WARNING)" chuẩn xác!
  - Ghi nhận đường huyết 140 mg/dL ➔ Tự động phân loại "Đường huyết cao (DANGER)" chuẩn xác!
  - Lấy Dashboard Summary chỉ số sức khỏe thành công!
  - Tạo lịch hẹn tái khám thành công!
  - Thêm ghi chú bác sĩ trên bệnh án thành công!
  - Xuất tệp PDF bệnh án chuẩn A4: Tải về thành công file PDF hoàn chỉnh (`benh_an_test.pdf`, dung lượng 3,119 bytes)!
  - API AuditLog dành cho Admin hoạt động chuẩn xác!

---

### 📍 CHẶNG 5: Frontend React (Vite + Ant Design) Chuẩn Phân Quyền RBAC & Nghiệm Thu (Chia thành 4 Phần Chuẩn Hóa - Tiến độ tổng 20%)
> *Kế hoạch chi tiết, Ma trận phân quyền 21 trang, Quy chuẩn vùng dùng chung & 11 Nguyên Tắc Vàng Frontend được lưu trữ tại*: [`KE_HOACH_PHAT_TRIEN_FRONTEND_VA_PHAN_QUYEN.md`](file:///c:/Users/Minh%20Tr%C3%AD/.gemini/antigravity-ide/scratch/QuanLyBenhAnCaNhan/KE_HOACH_PHAT_TRIEN_FRONTEND_VA_PHAN_QUYEN.md)  
> *Bắt buộc tuân thủ 11 Nguyên Tắc Vàng: Cấu trúc component đơn nhiệm, UI/UX y tế chuẩn (Đỏ=nguy kịch, Xanh lá=tối ưu), Responsive Mobile-First (vùng chạm 44px, cuộn bảng riêng), a11y cỡ chữ >=16px, Bảo mật PII (che CCCD/BHYT, cấm XSS, JWT an toàn), Hiệu năng Lazy-load, API 3 trạng thái, Upload X-quang/PDF <=10MB, Tính đúng đắn y sinh học (BMI, Naegele, giới hạn đo), Disclaimer y khoa, Kiểm thử Edge-cases đa trình duyệt.*

- [x] **PHẦN 5.1: Nền tảng Core Shell, Design System, Vùng Dùng Chung & Bộ Trang Xác Thực (P1 - P5, P17, P21 - Tiến độ: 100%)**:
  - [x] Khởi tạo cấu trúc Monorepo `QuanLyBenhAnCaNhan/` chứa song song `backend/` và `frontend/`.
  - [x] Khởi tạo Vite React 18 trong `QuanLyBenhAnCaNhan/frontend/` và cài đặt 6 thư viện cốt lõi: `antd`, `@ant-design/icons`, `axios`, `react-router-dom`, `recharts`, `dayjs` (0 lỗ hổng bảo mật).
  - [x] Hoàn thành đặc tả chi tiết 21 trang giao diện và quy chuẩn đồng nhất các vùng dùng chung (Header 64px, Sidebar 260px/80px, PageShell, Footer 48px, Overlays/Modals).
  - [x] Thiết lập Theme Ant Design (`medicalTheme.js`) tông màu Medical Cyan `#0284c7`, typography Google Fonts Inter/Outfit.
  - [x] Thiết lập `axiosClient.js` tự động gắn `Bearer Token`, tự bắt HTTP 401 refresh token, tự bắt HTTP 403 Forbidden.
  - [x] Xây dựng `AuthContext.jsx` lưu trữ trạng thái đăng nhập, profile (`/me`), phân quyền vai trò (`roles`), và component bảo vệ route `ProtectedRoute.jsx`.
  - [x] Xây dựng 3 Khung Layout chuẩn mực: `MainLayout` (App Shell nội bộ), `AuthLayout` (Card form chia đôi màn hình) tích hợp đầy đủ `AppHeader`, `AppSidebar`, `AppFooter`.
  - [x] Xây dựng bộ màn hình Xác thực & Quản lý tài khoản: Trang chủ (`/`), Đăng nhập (`/login`), Đăng ký (`/register`), Quên mật khẩu OTP 3 bước (`/forgot-password`), Cài đặt & Đổi mật khẩu (`/settings`), Trang lỗi `403` và `404`.

- [x] **PHẦN 5.2: Bảng Điều Khiển Tổng Quan, Quản Lý Hồ Sơ Gia Đình & Chỉ Số Sinh Hiệu Tại Nhà (P6 - P8, P13 - Tiến độ: 100%)**:
  - [x] Xây dựng Dashboard tổng quan (`/dashboard`): Thẻ KPI sức khỏe, Biểu đồ sinh hiệu tóm tắt, Lịch hẹn sắp tới, Thuốc cần uống trong ngày, Cảnh báo dị ứng nổi bật.
  - [x] Xây dựng Quản lý Hồ sơ thành viên gia đình (`/profiles`): Danh sách thẻ thành viên, Thêm/sửa hồ sơ, Quan hệ nhân khẩu học (`RelationshipType`).
  - [x] Xây dựng Chi tiết hồ sơ sức khỏe (`/profiles/:id`): Quản lý tiền sử Dị ứng (`Allergy` - gắn thẻ đỏ cảnh báo sốc phản vệ), Bệnh mãn tính (`ChronicDisease`), Tiền sử gia đình.
  - [x] Xây dựng Theo dõi Chỉ số sức khỏe tại nhà (`/metrics`): Form nhập số đo (Huyết áp, Đường huyết, SpO2, Nhịp tim, Cân nặng, Thân nhiệt), Thuật toán tự động đánh giá rủi ro (chuẩn AHA/ADA), Biểu đồ đường biến thiên trực quan với Recharts.

- [x] **PHẦN 5.3: Trục Nghiệp Vụ Lâm Sàng: Bệnh Án 4 Chuyên Khoa, Đơn Thuốc & Cận Lâm Sàng (P9 - P12, P14 - P15 - Tiến độ: 100%)**:
  - [x] Xây dựng Sổ khám bệnh & Danh sách bệnh án (`/medical-records`): Bộ lọc đa tiêu chí (thời gian, cơ sở khám, chuyên khoa, bác sĩ), Bảng dữ liệu kết hợp thẻ tóm tắt.
  - [x] Xây dựng Form Tạo mới bệnh án (`/medical-records/create`): Wizard nhiều bước chuẩn Bộ Y Tế, tự động tính BMI, phân hệ 4 Chuyên khoa: Nội khoa (7 hệ cơ quan), Ngoại khoa (phẫu thuật/hậu phẫu), Nhi khoa (sơ sinh/Apgar/thể chất), Sản khoa (ràng buộc chỉ hồ sơ Nữ, công thức Naegele tự tính ngày dự sinh & tuổi thai).
  - [x] Xây dựng Chi tiết bệnh án (`/medical-records/:id`): Xem toàn diện đợt điều trị, chuyển khoa, và **nút tích hợp xuất/tải file PDF tóm tắt bệnh án chuẩn A4 Bộ Y Tế** gọi trực tiếp API Backend.
  - [x] Xây dựng Quản lý Đơn thuốc (`/prescriptions`): Danh sách đơn thuốc theo đợt khám, tra cứu danh mục thuốc quốc gia, thuật toán kiểm tra cảnh báo dị ứng chéo sốc phản vệ (nhóm Penicillin), tổng hợp thuốc đang sử dụng tại nhà (`Active Medications`).
  - [x] Xây dựng Cận lâm sàng & Tệp đính kèm (`/clinical-investigations`): Kết quả xét nghiệm sinh hóa/huyết học (cờ cảnh báo chỉ số bất thường `abnormal`), Chẩn đoán hình ảnh (X-quang, CT, MRI, ECG), xem trước và tải tệp đính kèm y tế (tối đa 10MB).

- [x] **PHẦN 5.4: Tiện Ích Mở Rộng, Phân Quyền Chuyên Sâu (Bác Sĩ/Admin), Kiểm Thử E2E & Nghiệm Thu Đồ Án (P16, P18 - P20 - Tiến độ: 100%)**:
  - [x] Xây dựng Tiện ích Lịch hẹn khám & Tái khám (`/appointments`): Lịch khám/tiêm chủng/khám thai, lịch hẹn sắp tới, đổi trạng thái.
  - [x] Xây dựng Chia sẻ hồ sơ bệnh án bảo mật (`/shares`): Sinh mã token 32 ký tự, đặt mã PIN bảo mật, thời hạn hiệu lực, phân quyền Read-only / Full-access, thu hồi quyền.
  - [x] Xây dựng Trang tra cứu công khai cho Bác sĩ ngoài (`/share/view/:token`): Xem tóm tắt hồ sơ cấp cứu mà không cần đăng nhập, cảnh báo dị ứng nổi bật, bảo mật che CCCD/BHYT.
  - [x] Xây dựng Bàn làm việc Bác sĩ độc quyền `ROLE_DOCTOR` (`/doctor/workspace`): Bàn tiếp nhận bệnh nhân theo dõi, ghi chú chuyên môn độc lập (`DoctorNote`).
  - [x] Xây dựng Trung tâm Quản trị độc quyền `ROLE_ADMIN` (`/admin`): Danh mục thuốc & ICD-10 (`/admin/catalogs`), Giám sát Nhật ký kiểm toán an ninh mạng (`/admin/audit-logs`).
  - [x] Toàn bộ ứng dụng biên dịch sản xuất (`npm run build`) thành công 100% trong 2.53 giây (0 lỗi), Vite server đang chạy trực tiếp trên cổng 5173.

---

## 🔄 3. VIỆC ĐANG LÀM (IN PROGRESS)

- [x] Toàn bộ 5 Chặng của Đồ án đã được xây dựng, biên dịch và chạy thành công trên cả Backend (Port 8088) và Frontend (Port 5173)!
- [/] Trình diễn và hỗ trợ người dùng trải nghiệm thực tế các tính năng của đồ án.

---

## ⏭️ 4. VIỆC SẮP LÀM TIẾP THEO (NEXT STEPS)

1. Hướng dẫn người dùng mở trình duyệt truy cập `http://localhost:5173` để trải nghiệm trực tiếp hệ thống.
2. Chuẩn bị tài liệu slide thuyết trình và file nộp đồ án môn học Phân Tích Thiết Kế Yêu Cầu (PTTKYC).

---

## 📝 5. NHẬT KÝ THỰC HIỆN (WORK LOG)

- **06/10/2026**:
  - Phân tích 15 module, chuẩn hóa biểu mẫu Bộ Y Tế (MS: 01, 02, 10/BV-01), thiết kế Schema SQL Server.
- **08/10/2026 (Chiều - Tối)**:
  - Smoke Test JDK 21 Pass 100%.
  - Hướng dẫn cấu hình TCP/IP, kích hoạt Mixed Mode và tài khoản `sa`.
  - Kết nối Spring Boot tới SQL Server `HETHONGQUANLYBENHANCANHAN` thành công trên cổng `8088`.
  - Viết toàn bộ 28 Entity Class và 16 Enum chuẩn 3NF.
  - Chạy Spring Boot, Hibernate tạo thành công trọn bộ 34 bảng vật lý và toàn bộ Foreign Key Constraints trong database `HETHONGQUANLYBENHANCANHAN`.
- **08/10/2026 (23:05)**:
  - Tích hợp Swagger OpenAPI 3.0 & MapStruct.
  - Tạo xong toàn bộ 27 Repository interfaces Spring Data JPA.
  - Tạo `ApiResponse<T>` và `PageResponse<T>`.
  - Chạy `DataInitializer` nạp thành công 3 Roles, tài khoản Admin, 6 mã ICD-10 và 4 danh mục thuốc vào SQL Server.
  - Xác nhận Swagger UI và OpenAPI docs hoạt động ổn định trên `localhost:8088`.
- **09/10/2026 (03:10)**:
  - Hoàn thiện 100% Chặng 2 (Core Backend MVP).
  - Triển khai toàn diện Module 1 (Auth) và Module 2 (Hồ sơ sức khỏe cá nhân & Người thân).
  - Viết trọn bộ DTO, Service, Controller, MapStruct Mapper cho Profile, Dị ứng, Bệnh nền, Tiền sử gia đình.
  - Cơ chế xóa mềm (`deleted = false`) và chống IDOR bảo mật dữ liệu.
  - Kiểm thử trực tiếp API trên cổng 8088 (Đăng nhập, lấy token JWT, tạo hồ sơ, thêm dị ứng): Thành công 100%!
- **09/10/2026 (03:28)**:
  - Triển khai trọn bộ tính năng **Quên mật khẩu & Đặt lại mật khẩu (Forgot / Reset Password)**:
    - Tạo 3 DTO: `ForgotPasswordRequest`, `VerifyResetCodeRequest`, `ResetPasswordRequest`.
    - Thêm cơ chế sinh mã OTP 6 chữ số ngẫu nhiên bảo mật với thời hạn 15 phút, lưu trong bảng `Token`.
    - Bổ sung 3 endpoint mới vào `AuthenticationController` & cấp quyền công khai trong `SecurityConfig`:
      - `POST /api/v1/auth/forgot-password`: Tiếp nhận email, tạo và gửi mã OTP (kèm log console để test).
      - `POST /api/v1/auth/verify-reset-code`: Xác thực OTP hợp lệ trước khi cho phép nhập mật khẩu mới.
      - `POST /api/v1/auth/reset-password`: Đổi mật khẩu mới, mã hóa BCrypt, vô hiệu hóa mã OTP sau khi dùng thành công (chống replay attack).
    - Đã kiểm thử trực tiếp trên cổng 8088: Tạo OTP (`340641`), xác thực, đổi mật khẩu sang `NewAdmin@123`, đăng nhập thành công, và khôi phục về mật khẩu chuẩn (`Admin@123`).
- **12/10/2026 (03:05)**:
  - Hoàn thành toàn diện **Module 3 (Bệnh án chung) & 4 Chuyên khoa (Module 4 Nội, Module 5 Ngoại, Module 6 Nhi, Module 7 Sản)**:
    - Xây dựng 7 DTO: `MedicalRecordRequest`, `MedicalRecordResponse`, `MedicalRecordSummaryResponse`, `VitalSignsDto`, `DepartmentTransferDto`, `InternalRecordDetailDto`, `SurgicalRecordDetailDto`, `PediatricRecordDetailDto`, `ObstetricRecordDetailDto`.
    - Xây dựng `MedicalRecordMapper` (MapStruct) và `MedicalRecordService` với logic nghiệp vụ y tế tự động:
      - Tự tính chỉ số BMI từ cân nặng + chiều cao (chuẩn 1 chữ số thập phân).
      - Tự tính tổng số ngày điều trị (`totalTreatmentDays`) từ ngày vào và ra viện.
      - Tự tính ngày dự sinh theo quy tắc **Naegele** và tuổi thai tuần cho chuyên khoa Sản.
      - Chặn IDOR và ràng buộc chặt chẽ: Chỉ hồ sơ giới tính Nữ mới được phép tạo bệnh án Sản khoa.
    - Xây dựng `MedicalRecordController` với 9 RESTful endpoints hoàn chỉnh Swagger UI.
    - Biên dịch `./gradlew testClasses` thành công 100%.
    - Kiểm thử trực tiếp live test trên cổng 8088:
      - Tạo bệnh án Nội khoa: Tự tính BMI 23.0, tổng ngày điều trị 5 ngày, lưu chi tiết 7 hệ cơ quan thành công.
      - Thêm chuyển khoa từ Cấp cứu sang Nội tim mạch thành công.
      - Kiểm tra chặn bệnh án Sản khoa trên hồ sơ Nam: Chặn thành công 100%.
      - Tạo bệnh án Sản khoa trên hồ sơ Nữ: Công thức Naegele tự tính ngày dự sinh 17/11/2026 và tuổi thai 34.9 tuần chuẩn xác!
- **12/10/2026 (03:18)**:
  - Hoàn thành toàn diện **Module 8 (Đơn thuốc & Danh mục thuốc) & Module 9 (Cận lâm sàng & Tệp đính kèm)** - Khép lại 100% Chặng 3:
    - Xây dựng các DTO: `PrescriptionRequest`, `PrescriptionItemDto`, `PrescriptionResponse`, `PrescriptionItemResponse`, `MedicineCatalogResponse`, `ActiveMedicationResponse`, `LabTestResultDto`, `ImagingResultDto`, `MedicalAttachmentDto`.
    - Xây dựng `PrescriptionMapper`, `PrescriptionService`, `ClinicalInvestigationService`.
    - Xây dựng thuật toán tự động đối chiếu dị ứng thuốc chéo (`hasAllergyWarning = true`, cảnh báo nguy cơ sốc phản vệ đối với nhóm Penicillin / Amoxicillin).
    - Xây dựng tính năng tổng hợp thuốc đang điều trị (`/active-medications`).
    - Quản lý cận lâm sàng: xét nghiệm sinh hóa/huyết học (`LabTestResult` kèm cờ `abnormal`), chẩn đoán hình ảnh (`ImagingResult` X-quang/CT/MRI/ECG), tệp đính kèm y tế (`MedicalAttachment`).
    - Xây dựng `PrescriptionController` (6 APIs) và `ClinicalInvestigationController` (9 APIs).
    - Kiểm thử live test trên cổng 8088: Tra cứu thuốc, phát hiện dị ứng chéo thành công 100%, ghi nhận xét nghiệm đường huyết Glucose 7.2 mmol/L (abnormal = true), ghi kết quả X-quang ngực thẳng và upload đính kèm tệp PDF thành công!
- **12/10/2026 (03:33)**:
  - Hoàn thành toàn diện **Chặng 4: Backend Nâng Cao P2/P3 (Module 10 Chia sẻ hồ sơ, Module 11 Chỉ số sức khỏe, Module 12 Lịch hẹn khám, Module 13 Ghi chú Bác sĩ & AuditLog, Module 14 Xuất PDF bệnh án)**:
    - Xây dựng trọn bộ DTOs: `ProfileShareRequest`, `ProfileShareResponse`, `HealthMetricRequest`, `HealthMetricResponse`, `MetricSummaryResponse`, `MedicalAppointmentRequest`, `MedicalAppointmentResponse`, `DoctorNoteRequest`, `DoctorNoteResponse`, `AuditLogResponse`.
    - Xây dựng các Services: `ProfileShareService`, `HealthMetricService`, `MedicalAppointmentService`, `DoctorNoteService`, `AuditLogService`.
    - Tích hợp thư viện **OpenPDF (`com.github.librepdf:openpdf:2.0.2`)** xây dựng `MedicalRecordPdfService` sinh file PDF bệnh án chuẩn mẫu Bộ Y Tế (A4, 6 phần, bảng biểu, sinh hiệu, đơn thuốc, chữ ký).
    - Xây dựng các Controllers: `ProfileShareController` (5 APIs), `HealthMetricController` (5 APIs), `MedicalAppointmentController` (5 APIs), `DoctorNoteController` (2 APIs), `AuditLogController` (1 API) và endpoint xuất PDF `GET /api/v1/medical-records/{id}/export-pdf`.
    - Cấu hình phân quyền whitelist endpoint công khai cho liên kết chia sẻ `/shares/verify/**`.
    - Biên dịch `./gradlew testClasses` thành công 100%.
    - Kiểm thử live test thành công 100% trên cổng 8088:
      - Tạo mã token chia sẻ và xác thực công khai thành công.
      - Ghi nhận và tự động phân loại huyết áp, đường huyết, SpO2 thành công.
      - Đặt lịch hẹn khám và thêm ghi chú bác sĩ thành công.
      - Xuất tệp PDF bệnh án thành công (tệp `benh_an_test.pdf`, dung lượng 3,119 bytes)!
      - Toàn bộ 14 Modules Backend của hệ thống PHR đã sẵn sàng 100% cho Chặng 5 (Frontend)!
- **12/10/2026 (05:30)**:
  - Hoàn thành tài liệu thiết kế và quy hoạch **Chặng 5 (Frontend React + Ant Design & Phân Quyền)**:
    - Biên soạn [`KE_HOACH_PHAT_TRIEN_FRONTEND_VA_PHAN_QUYEN.md`](./KE_HOACH_PHAT_TRIEN_FRONTEND_VA_PHAN_QUYEN.md).
    - Chuẩn hóa đồng nhất các vùng dùng chung (Shared Layout Zones): `AppHeader` (64px, Global Search `Ctrl+K`, Hotline 115, Notification popover, Profile switcher, Role Tag), `AppSidebar` (260px/80px, phân nhóm RBAC, System Live indicator), `PageShell` (PageHeader H2, Actions CTA, Breadcrumb, Skeleton Loading), `AppFooter` (Disclaimer y khoa, hotline kỹ thuật), và `Overlays/Dialogs` (Common Form Modal, Clinical Risk Modal, Side Drawer 640px/850px, Feedback Notifications).
    - Đặc tả chi tiết vị trí thành phần (Wireframe-level specification), các trạng thái tương tác và ánh xạ API Backend cho toàn bộ **21 trang giao diện**.
    - Cập nhật sơ đồ cấu trúc monorepo và từ điển mã nguồn tại [`SO_DO_CAU_TRUC_VA_GIAI_THICH_MA_NGUON_BACKEND.md`](./SO_DO_CAU_TRUC_VA_GIAI_THICH_MA_NGUON_BACKEND.md).
- **12/10/2026 (16:45)**:
  - **HOÀN THÀNH TOÀN DIỆN 100% FRONTEND REACT (VITE + ANT DESIGN V5) THEO PLAN**:
    - Chuẩn hóa cấu trúc mã nguồn theo yêu cầu: Đặt toàn bộ trong thư mục chuyên biệt `QuanLyBenhAnCaNhan/frontend/src/QuanLyBenhAn/`.
    - Tuyệt đối không dùng HTML tĩnh thô, 100% Component JSX tái sử dụng cao cấp theo đúng quy chuẩn đồ án môn học PTTKYC.
    - Xây dựng trọn bộ 10 Services gọi API Backend: `authService`, `profileService`, `medicalRecordService`, `prescriptionService`, `metricService`, `appointmentService`, `clinicalService`, `shareService`, `doctorNoteService`, `catalogService`, `auditLogService`.
    - Xây dựng trọn bộ 21 màn hình/trang giao diện:
      1. Trang chủ công khai (`LandingPage.jsx`) chuẩn nhận diện y tế.
      2. Bộ xác thực (`LoginPage`, `RegisterPage`, `ForgotPasswordPage` 3 bước OTP).
      3. Bảng điều khiển KPI (`DashboardPage.jsx`).
      4. Hồ sơ thành viên gia đình (`ProfilesPage`, `ProfileDetailPage` với tab Dị ứng nhấp nháy đỏ khi nghiêm trọng, Bệnh mạn tính, Tiền sử gia đình).
      5. Bệnh án 4 chuyên khoa (`MedicalRecordsPage`, `MedicalRecordCreatePage` với form wizard 4 chuyên khoa tự động tính BMI và ngày dự sinh Naegele, `MedicalRecordDetailPage` tích hợp nút tải PDF A4).
      6. Đơn thuốc & Dược phẩm (`PrescriptionsPage` với cảnh báo dị ứng chéo sốc phản vệ).
      7. Chỉ số sinh hiệu (`MetricsPage` biểu đồ đường Recharts, phân loại huyết áp AHA).
      8. Lịch khám & Nhắc tái khám (`AppointmentsPage`).
      9. Cận lâm sàng & Tệp đính kèm (`ClinicalInvestigationsPage` với xét nghiệm máu, X-quang/CT/MRI, giới hạn upload 10MB).
      10. Chia sẻ hồ sơ bệnh án (`SharesPage` sinh mã token 32 ký tự, thu hồi quyền).
      11. Cổng tra cứu công khai cho Bác sĩ ngoài (`PublicShareViewPage` không cần đăng nhập).
      12. Bàn làm việc Bác sĩ độc quyền (`DoctorWorkspacePage`).
      13. Trung tâm Quản trị Admin (`AdminCatalogsPage` quản lý ICD-10 & thuốc, `AdminAuditLogsPage` nhật ký kiểm toán).
      14. Cài đặt & Đổi mật khẩu (`SettingsPage`), Trang lỗi `403` và `404`.
- **12/10/2026 (17:35)**:
  - **CHUẨN HÓA CƠ CHẾ PHÂN QUYỀN AN NINH (RBAC GOVERNANCE)**:
    - **Quy tắc Người dùng tự đăng ký**: Khóa cứng logic đăng ký tài khoản (`/api/v1/auth/register`), người dùng tự tạo tài khoản **chỉ có duy nhất quyền `ROLE_USER`**. Tuyệt đối không cho phép tự đăng ký quyền Bác sĩ hoặc Admin.
    - **Cấp quyền Bác sĩ & Admin tập trung**: Xây dựng trọn bộ API Quản trị người dùng phía Backend (`UserManagementController.java`):
      - `GET /api/v1/admin/users`: Danh sách tài khoản hệ thống.
      - `PUT /api/v1/admin/users/{userId}/role`: Quản trị viên (Admin) trực tiếp cấp quyền Bác sĩ (`ROLE_DOCTOR`), Quản trị viên (`ROLE_ADMIN`) hoặc hạ quyền về Người dùng (`ROLE_USER`).
      - `PUT /api/v1/admin/users/{userId}/toggle-lock`: Khóa hoặc mở khóa tài khoản an toàn.
      - Tự động ghi nhật ký kiểm toán (`AuditLog`) mỗi khi có thao tác thay đổi phân quyền.
    - **Giao diện Quản trị Người dùng & Cấp quyền**: Xây dựng trang [`AdminUsersPage.jsx`](file:///c:/Users/Minh%20Tr%C3%AD/.gemini/antigravity-ide/scratch/QuanLyBenhAnCaNhan/frontend/src/QuanLyBenhAn/pages/admin/AdminUsersPage.jsx) tại đường dẫn `/admin/users`:
      - Bảng danh sách tài khoản, tìm kiếm theo tên/email/SĐT, tag phân loại vai trò rõ ràng.
      - Bộ nút thao tác nhanh: Cấp Bác Sĩ, Cấp Admin, Hạ về User, Khóa/Mở khóa kèm hộp thoại Popconfirm bảo vệ.
      - Tích hợp vào menu Sidebar Quản trị viên (`MainLayout.jsx`) và bảo vệ route (`AppRoutes.jsx`).


