# Hệ Thống Quản Lý Bệnh Án Cá Nhân (PHR - Personal Health Record)

Hệ thống quản lý bệnh án cá nhân điện tử toàn diện theo tiêu chuẩn Bộ Y Tế, phục vụ 3 phân hệ người dùng chính: **Người Dân / Bệnh Nhân**, **Bác Sĩ Điều Trị**, và **Quản Trị Viên Hệ Thống (Admin)**.

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án gồm 2 phần độc lập:
1. **Backend**: Spring Boot 3.2.5 (Java 21), Spring Security 6, JWT Authentication, Spring Data JPA, Hibernate, MS SQL Server.
2. **Frontend**: React 19, Vite, Ant Design (Antd), Recharts, Axios, React Router v7.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cơ sở dữ liệu (Database)
- Hệ quản trị CSDL: **Microsoft SQL Server**
- Cổng kết nối mặc định: `1433`
- Tên Database: `HETHONGQUANLYBENHANCANHAN`
- Tài khoản: `sa` / Mật khẩu cấu hình tại `backend/src/main/resources/application-dev.properties`
- Chạy file `seed_data.sql` nếu cần nạp dữ liệu mẫu ban đầu.

### 2. Khởi chạy Backend (Spring Boot)
```bash
cd backend
./gradlew bootRun
```
*Backend sẽ lắng nghe tại:* `http://localhost:8088/api/v1/`

### 3. Khởi chạy Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend sẽ chạy tại:* `http://localhost:5173/`

---

## 👥 Tài Khoản Mặc Định

| Phân hệ | Email | Mật khẩu mặc định |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@phr.vn` | `Admin@123` |
| **Bác sĩ (Doctor)** | `doctor@phr.vn` | `Doctor@123` |
| **Bệnh nhân (Patient)** | Tự đăng ký qua màn hình `/register` | Tùy chọn |

---

## 🔒 Bản Quyền & Giấy Phép
Dự án phục vụ đồ án môn học Phân Tích Thiết Kế Yêu Cầu (PTTKYC).
