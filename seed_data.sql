USE HETHONGQUANLYBENHANCANHAN;
GO

SET NOCOUNT ON;

-- 1. Xóa dữ liệu cũ của các bảng con
DELETE FROM doctor_notes;
DELETE FROM prescription_items;
DELETE FROM prescriptions;
DELETE FROM internal_record_details;
DELETE FROM surgical_record_details;
DELETE FROM pediatric_record_details;
DELETE FROM obstetric_record_details;
DELETE FROM vital_signs;
DELETE FROM lab_test_results;
DELETE FROM imaging_results;
DELETE FROM surgical_procedures;
DELETE FROM medical_attachments;
DELETE FROM department_transfers;
DELETE FROM medical_appointments;
DELETE FROM medical_records;
DELETE FROM health_metrics;
DELETE FROM allergies;
DELETE FROM chronic_diseases;
DELETE FROM vaccination_records;
DELETE FROM profile_shares;
DELETE FROM pediatric_growth_records;
DELETE FROM prenatal_visits;
DELETE FROM health_profiles;

-- Reset Identity cho các bảng
DBCC CHECKIDENT ('health_profiles', RESEED, 0);
DBCC CHECKIDENT ('medical_records', RESEED, 0);
DBCC CHECKIDENT ('prescriptions', RESEED, 0);
DBCC CHECKIDENT ('prescription_items', RESEED, 0);
DBCC CHECKIDENT ('health_metrics', RESEED, 0);
DBCC CHECKIDENT ('medical_appointments', RESEED, 0);
DBCC CHECKIDENT ('allergies', RESEED, 0);
DBCC CHECKIDENT ('chronic_diseases', RESEED, 0);
DBCC CHECKIDENT ('doctor_notes', RESEED, 0);
GO

-- 2. Đảm bảo 3 tài khoản chuẩn tồn tại với tên tiếng Việt Unicode
UPDATE users SET first_name = N'Quản trị viên', last_name = N'Hệ thống' WHERE email = 'admin@phr.vn';
UPDATE users SET first_name = N'BS. CK1', last_name = N'Trần Văn Bình', department = N'Khoa Tim Mạch & Lão Khoa' WHERE email = 'doctor@phr.vn';
UPDATE users SET first_name = N'Minh', last_name = N'Trí', phone = '0912345678' WHERE email = 'minhtri210595@gmail.com';
GO

-- 3. Tạo 5 hồ sơ thành viên gia đình cho user minhtri210595@gmail.com
DECLARE @Uid BIGINT = (SELECT TOP 1 id FROM users WHERE email = 'minhtri210595@gmail.com');

-- Profile 1: Bản thân (Nguyễn Minh Trí)
INSERT INTO health_profiles (user_id, full_name, relationship, date_of_birth, gender, blood_type, cccd, bhyt_number, insurance_type, insurance_valid_until, nationality, ethnicity, occupation, workplace, address_detail, ward, district, province, emergency_contact_name, emergency_contact_phone, emergency_contact_address, deleted, created_at, updated_at)
VALUES (@Uid, N'Nguyễn Minh Trí', 'SELF', '1995-05-21', 'MALE', 'O+', '079095001234', 'DN4790123456789', 'BHYT', '2028-12-31', N'Việt Nam', N'Kinh', N'Kỹ sư phần mềm', N'FPT Software', N'123 Nguyễn Huệ', N'Phường Bến Nghé', N'Quận 1', N'TP. Hồ Chí Minh', N'Trần Thị Thu Trang', '0987654321', N'123 Nguyễn Huệ, Quận 1', 0, GETDATE(), GETDATE());

-- Profile 2: Vợ (Trần Thị Thu Trang)
INSERT INTO health_profiles (user_id, full_name, relationship, date_of_birth, gender, blood_type, cccd, bhyt_number, insurance_type, insurance_valid_until, nationality, ethnicity, occupation, workplace, address_detail, ward, district, province, emergency_contact_name, emergency_contact_phone, emergency_contact_address, deleted, created_at, updated_at)
VALUES (@Uid, N'Trần Thị Thu Trang', 'SPOUSE', '1997-08-15', 'FEMALE', 'A+', '079197005678', 'GD4790987654321', 'BHYT', '2027-12-31', N'Việt Nam', N'Kinh', N'Giáo viên', N'THPT Marie Curie', N'123 Nguyễn Huệ', N'Phường Bến Nghé', N'Quận 1', N'TP. Hồ Chí Minh', N'Nguyễn Minh Trí', '0912345678', N'123 Nguyễn Huệ, Quận 1', 0, GETDATE(), GETDATE());

-- Profile 3: Con trai (Nguyễn Minh Khang)
INSERT INTO health_profiles (user_id, full_name, relationship, date_of_birth, gender, blood_type, cccd, bhyt_number, insurance_type, insurance_valid_until, nationality, ethnicity, occupation, workplace, address_detail, ward, district, province, emergency_contact_name, emergency_contact_phone, emergency_contact_address, deleted, created_at, updated_at)
VALUES (@Uid, N'Nguyễn Minh Khang', 'CHILD', '2021-10-10', 'MALE', 'O+', '079221008899', 'TE1790112233445', 'BHYT', '2027-10-10', N'Việt Nam', N'Kinh', N'Trẻ em', N'Mầm non Họa Mi', N'123 Nguyễn Huệ', N'Phường Bến Nghé', N'Quận 1', N'TP. Hồ Chí Minh', N'Nguyễn Minh Trí', '0912345678', N'123 Nguyễn Huệ, Quận 1', 0, GETDATE(), GETDATE());

-- Profile 4: Bố (Nguyễn Văn Hùng)
INSERT INTO health_profiles (user_id, full_name, relationship, date_of_birth, gender, blood_type, cccd, bhyt_number, insurance_type, insurance_valid_until, nationality, ethnicity, occupation, workplace, address_detail, ward, district, province, emergency_contact_name, emergency_contact_phone, emergency_contact_address, deleted, created_at, updated_at)
VALUES (@Uid, N'Nguyễn Văn Hùng', 'PARENT', '1962-03-12', 'MALE', 'B+', '079062009876', 'HT3790556677889', 'BHYT', '2029-12-31', N'Việt Nam', N'Kinh', N'Hưu trí', N'Công ty CP Vận tải Sài Gòn', N'45 Lê Duẩn', N'Phường Bến Nghé', N'Quận 1', N'TP. Hồ Chí Minh', N'Nguyễn Minh Trí', '0912345678', N'123 Nguyễn Huệ, Quận 1', 0, GETDATE(), GETDATE());

-- Profile 5: Mẹ (Lê Thị Mai)
INSERT INTO health_profiles (user_id, full_name, relationship, date_of_birth, gender, blood_type, cccd, bhyt_number, insurance_type, insurance_valid_until, nationality, ethnicity, occupation, workplace, address_detail, ward, district, province, emergency_contact_name, emergency_contact_phone, emergency_contact_address, deleted, created_at, updated_at)
VALUES (@Uid, N'Lê Thị Mai', 'PARENT', '1966-09-25', 'FEMALE', 'O+', '079166004321', 'HT3790998877665', 'BHYT', '2029-12-31', N'Việt Nam', N'Kinh', N'Nội trợ', N'Tại nhà', N'45 Lê Duẩn', N'Phường Bến Nghé', N'Quận 1', N'TP. Hồ Chí Minh', N'Nguyễn Minh Trí', '0912345678', N'123 Nguyễn Huệ, Quận 1', 0, GETDATE(), GETDATE());

-- Lấy IDs vừa tạo
DECLARE @P1_Tri BIGINT = (SELECT TOP 1 id FROM health_profiles WHERE full_name = N'Nguyễn Minh Trí' AND deleted = 0);
DECLARE @P2_Trang BIGINT = (SELECT TOP 1 id FROM health_profiles WHERE full_name = N'Trần Thị Thu Trang' AND deleted = 0);
DECLARE @P3_Khang BIGINT = (SELECT TOP 1 id FROM health_profiles WHERE full_name = N'Nguyễn Minh Khang' AND deleted = 0);
DECLARE @P4_Hung BIGINT = (SELECT TOP 1 id FROM health_profiles WHERE full_name = N'Nguyễn Văn Hùng' AND deleted = 0);
DECLARE @P5_Mai BIGINT = (SELECT TOP 1 id FROM health_profiles WHERE full_name = N'Lê Thị Mai' AND deleted = 0);

-- Dị ứng
INSERT INTO allergies (profile_id, allergen_name, allergy_type, severity, reaction_symptoms, notes, deleted)
VALUES 
(@P1_Tri, N'Kháng sinh Penicillin & Amoxicillin', 'DRUG', 'SEVERE', N'Nổi mày đay toàn thân, ngứa đỏ rát da, tức ngực nhẹ sau uống 30 phút', N'Chống chỉ định tuyệt đối nhóm kháng sinh Beta-lactam', 0),
(@P1_Tri, N'Tôm cua biển', 'FOOD', 'MILD', N'Ngứa rát môi, nổi vài mảng đỏ vùng quanh cổ và cánh tay', N'Tránh ăn hải sản chưa nấu chín kĩ', 0),
(@P3_Khang, N'Đậu phộng (Lạc)', 'FOOD', 'MODERATE', N'Sưng phù môi nhẹ, phát ban đỏ hai gò má, ngứa mắt', N'Đã thông báo cho nhà trường và giáo viên mầm non', 0);

-- Bệnh mạn tính
INSERT INTO chronic_diseases (profile_id, disease_name, icd10code, diagnosed_year, treatment_status, notes, deleted)
VALUES 
(@P1_Tri, N'Bệnh tăng huyết áp vô căn (nguyên phát)', 'I10', 2023, N'Đang điều trị thuốc hạ áp Amlor 5mg hàng ngày, huyết áp duy trì ổn định quanh 120/80 mmHg', N'Theo dõi đo huyết áp tại nhà 2 lần/tuần', 0),
(@P1_Tri, N'Viêm loét dạ dày - tá tràng mạn tính', 'K29.5', 2022, N'Đã điều trị ổn định, thỉnh thoảng ợ hơi ợ chua khi thức khuya', N'Hạn chế đồ chua cay và cà phê đậm đặc', 0),
(@P4_Hung, N'Tăng huyết áp độ 2 giai đoạn ổn định', 'I10', 2018, N'Uống thuốc kiểm soát huyết áp hàng ngày (Amlor + Coversyl)', N'Kiểm tra định kỳ tim mạch và chức năng thận', 0),
(@P5_Mai, N'Bệnh đái tháo đường không phụ thuộc insulin (Type 2)', 'E11', 2020, N'Kiểm soát đường huyết bằng Metformin 850mg (ngày 2 viên)', N'Đường huyết đói mục tiêu dao động 6.0 - 7.2 mmol/L', 0);

-- Chỉ số sinh hiệu
INSERT INTO health_metrics (profile_id, metric_type, value_numeric1, value_numeric2, unit, measured_at, notes)
VALUES 
(@P1_Tri, 'BLOOD_PRESSURE', 120, 80, 'mmHg', DATEADD(HOUR, -2, GETDATE()), N'Đo tại nhà buổi sáng sau ăn, huyết áp rất tốt và ổn định'),
(@P1_Tri, 'BLOOD_PRESSURE', 124, 82, 'mmHg', DATEADD(DAY, -2, GETDATE()), N'Đo trước khi đi ngủ'),
(@P1_Tri, 'BLOOD_PRESSURE', 128, 85, 'mmHg', DATEADD(DAY, -5, GETDATE()), N'Sau khi làm việc ca tối căng thẳng'),
(@P1_Tri, 'BLOOD_PRESSURE', 118, 78, 'mmHg', DATEADD(DAY, -9, GETDATE()), N'Đo sau buổi chạy bộ nhẹ buổi sáng'),
(@P1_Tri, 'BLOOD_PRESSURE', 122, 80, 'mmHg', DATEADD(DAY, -14, GETDATE()), N'Tái khám tại phòng khám'),
(@P1_Tri, 'HEART_RATE', 72, NULL, 'bpm', DATEADD(HOUR, -2, GETDATE()), N'Nhịp tim xoang đều'),
(@P1_Tri, 'HEART_RATE', 76, NULL, 'bpm', DATEADD(DAY, -2, GETDATE()), N'Nhịp tim trạng thái nghỉ ngơi'),
(@P1_Tri, 'BLOOD_SUGAR', 5.4, NULL, 'mmol/L', DATEADD(DAY, -3, GETDATE()), N'Đo lúc đói buổi sáng'),
(@P5_Mai, 'BLOOD_SUGAR', 6.5, NULL, 'mmol/L', DATEADD(DAY, -1, GETDATE()), N'Mẹ Mai đo đường huyết buổi sáng trước ăn'),
(@P1_Tri, 'WEIGHT', 68.5, NULL, 'kg', DATEADD(DAY, -7, GETDATE()), N'Cân nặng duy trì tốt'),
(@P1_Tri, 'HEIGHT', 172.0, NULL, 'cm', DATEADD(DAY, -30, GETDATE()), N'Chiều cao thực tế (BMI = 23.1, thể trạng cân đối)'),
(@P3_Khang, 'WEIGHT', 15.2, NULL, 'kg', DATEADD(DAY, -5, GETDATE()), N'Cân nặng bé Khang phát triển chuẩn theo lứa tuổi'),
(@P3_Khang, 'HEIGHT', 98.0, NULL, 'cm', DATEADD(DAY, -5, GETDATE()), N'Chiều cao bé Khang'),
(@P1_Tri, 'SPO2', 99, NULL, '%', DATEADD(HOUR, -2, GETDATE()), N'Nồng độ oxy trong máu tối ưu'),
(@P1_Tri, 'TEMPERATURE', 36.6, NULL, '°C', DATEADD(HOUR, -2, GETDATE()), N'Thân nhiệt bình thường');

-- Bệnh án điện tử
-- Record 1: Nội khoa (Nguyễn Minh Trí)
INSERT INTO medical_records (profile_id, record_type, hospital_name, medical_record_code, patient_medical_code, department_name, bed_number, attending_doctor, visit_date, admission_type, admission_date_time, admission_gate, referral_source, discharge_date_time, discharge_type, total_treatment_days, chief_complaint, history_of_illness, primary_diagnosis, primary_icd10, secondary_diagnosis, secondary_icd10, treatment_plan, follow_up_instructions, diet_plan, revisit_date, tags, deleted, created_at, updated_at)
VALUES 
(@P1_Tri, 'INTERNAL', N'Bệnh viện Đại học Y Dược TP.HCM', 'BA-2026-00892', 'YT-09521', N'Khoa Tim Mạch Can Thiệp', N'P.402-Giường 05', N'BS. CK1 Trần Văn Bình', '2026-03-15', 'OUTPATIENT', '2026-03-15 08:00:00', 'EXAM_DEPT', 'SELF_DIRECTED', '2026-03-15 11:30:00', 'RECOVERED', 1, N'Đau đầu vùng sau gáy, chóng mặt khi làm việc mệt mỏi', N'Bệnh nhân có tiền sử tăng huyết áp 2 năm. Đợt này làm việc căng thẳng, huyết áp đo tại nhà 145/90 mmHg, hoa mắt chóng mặt nhiều nên đến khám.', N'Bệnh tăng huyết áp vô căn (nguyên phát)', 'I10', N'Rối loạn chuyển hóa lipoprotein và tăng lipid máu', 'E78', N'Điều trị nội khoa ngoại trú bằng Amlodipine 5mg kết hợp điều chỉnh lối sống.', N'Tái khám sau 30 ngày hoặc ngay khi có dấu hiệu huyết áp > 160/100 mmHg hoặc đau ngực.', N'Chế độ ăn giảm muối (< 5g muối/ngày), kiêng mỡ động vật, tăng cường rau củ quả, hạn chế rượu bia thuốc lá.', '2026-04-15', N'Tim mạch, Huyết áp, Khám định kỳ', 0, GETDATE(), GETDATE());

-- Record 2: Ngoại khoa (Nguyễn Minh Trí - Ruột thừa)
INSERT INTO medical_records (profile_id, record_type, hospital_name, medical_record_code, patient_medical_code, department_name, bed_number, attending_doctor, visit_date, admission_type, admission_date_time, admission_gate, referral_source, discharge_date_time, discharge_type, total_treatment_days, chief_complaint, history_of_illness, primary_diagnosis, primary_icd10, secondary_diagnosis, secondary_icd10, treatment_plan, follow_up_instructions, diet_plan, revisit_date, tags, deleted, created_at, updated_at)
VALUES 
(@P1_Tri, 'SURGICAL', N'Bệnh viện Chợ Rẫy', 'BA-2025-01452', 'YT-09521', N'Khoa Ngoại Tiêu Hóa', N'Khu B - Giường 12', N'TS. BS Lê Hoàng Nam', '2025-11-20', 'INPATIENT', '2025-11-20 02:30:00', 'EMERGENCY', 'HEALTH_FACILITY', '2025-11-24 10:00:00', 'RECOVERED', 4, N'Đau âm ỉ quanh rốn sau đó khu trú vùng hố chậu phải, buồn nôn, sốt 38.2°C', N'Bệnh khởi phát cách nhập viện 10 giờ với đau bụng quanh rốn tăng dần, kèm sốt nhẹ và buồn nôn. Siêu âm ổ bụng thấy hình ảnh ruột thừa viêm đường kính 9mm đè ấn không xẹp.', N'Viêm ruột thừa cấp nung mủ', 'K35', N'Viêm dạ dày nhẹ', 'K29.5', N'Phẫu thuật nội soi ổ bụng cắt ruột thừa, kháng sinh dự phòng Cefotaxime 1g x 3 ngày, giảm đau Paracetamol tĩnh mạch.', N'Cắt chỉ sau 7 ngày tại trạm y tế địa phương. Tránh vận động mạnh, mang vác vật nặng trong 4 tuần.', N'Ăn lỏng dễ tiêu (cháo, súp) trong 3 ngày đầu, sau đó chuyển sang ăn cơm mềm, kiêng đồ chua cay.', '2025-12-05', N'Ngoại khoa, Phẫu thuật nội soi, Cấp cứu', 0, GETDATE(), GETDATE());

-- Record 3: Nhi khoa (Bé Khang)
INSERT INTO medical_records (profile_id, record_type, hospital_name, medical_record_code, patient_medical_code, department_name, bed_number, attending_doctor, visit_date, admission_type, admission_date_time, admission_gate, referral_source, discharge_date_time, discharge_type, total_treatment_days, chief_complaint, history_of_illness, primary_diagnosis, primary_icd10, treatment_plan, follow_up_instructions, diet_plan, revisit_date, tags, deleted, created_at, updated_at)
VALUES 
(@P3_Khang, 'PEDIATRIC', N'Bệnh viện Nhi Đồng 1', 'BA-2026-00311', 'YT-02188', N'Khoa Hô Hấp', N'Ngoại trú', N'BS. CKI Phạm Thu Hà', '2026-02-10', 'OUTPATIENT', '2026-02-10 09:15:00', 'EXAM_DEPT', 'SELF_DIRECTED', '2026-02-10 11:00:00', 'RECOVERED', 1, N'Bé ho đờm, khò khè, chảy mũi trong, sốt 38.3°C', N'Bé bị ho hắt hơi 2 ngày nay, sốt nhẹ về chiều, đêm ngủ hay quấy khóc do nghẹt mũi và ho đờm.', N'Viêm phế quản cấp do virus', 'J20', N'Vệ sinh mũi họng bằng nước muối sinh lý ấm, hạ sốt khi thân nhiệt >= 38.5°C, siro ho thảo dược.', N'Tái khám sau 3 ngày hoặc ngay khi bé thở nhanh rút lõm lồng ngực, bỏ ăn, li bì.', N'Chia nhỏ cữ ăn, uống nhiều nước ấm và nước trái cây giàu vitamin C.', '2026-02-13', N'Nhi khoa, Hô hấp, Sốt ho', 0, GETDATE(), GETDATE());

-- Record 4: Nội khoa (Mẹ Mai)
INSERT INTO medical_records (profile_id, record_type, hospital_name, medical_record_code, patient_medical_code, department_name, bed_number, attending_doctor, visit_date, admission_type, admission_date_time, admission_gate, referral_source, discharge_date_time, discharge_type, total_treatment_days, chief_complaint, history_of_illness, primary_diagnosis, primary_icd10, secondary_diagnosis, secondary_icd10, treatment_plan, follow_up_instructions, diet_plan, revisit_date, tags, deleted, created_at, updated_at)
VALUES 
(@P5_Mai, 'INTERNAL', N'Bệnh viện Nội Tiết Trung Ương', 'BA-2026-00428', 'YT-06699', N'Khoa Đái Tháo Đường', N'Ngoại trú', N'BS. CK2 Nguyễn Thị Lan', '2026-04-01', 'OUTPATIENT', '2026-04-01 07:30:00', 'EXAM_DEPT', 'SELF_DIRECTED', '2026-04-01 10:45:00', 'RECOVERED', 1, N'Tái khám kiểm tra chỉ số đường huyết định kỳ 3 tháng', N'Bệnh nhân điều trị ĐTĐ type 2 được 4 năm. Xét nghiệm HbA1c hôm nay đạt 6.8%, đường huyết đói 6.4 mmol/L, chức năng gan thận bình thường.', N'Bệnh đái tháo đường không phụ thuộc insulin (Type 2)', 'E11', N'Tăng huyết áp vô căn', 'I10', N'Tiếp tục phác đồ Metformin 850mg (sáng 1 viên, tối 1 viên sau ăn). Duy trì chỉ số HbA1c < 7.0%.', N'Tái khám sau 3 tháng kèm làm xét nghiệm sinh hóa máu đầy đủ.', N'Ăn giảm tinh bột hấp thu nhanh (cơm trắng, bánh mì trắng), tăng cường chất xơ từ rau củ quả, đi bộ 30 phút mỗi ngày.', '2026-07-01', N'Nội tiết, Đái tháo đường, Mãn tính', 0, GETDATE(), GETDATE());

-- Lấy ID các records
DECLARE @Rec1_Id BIGINT = (SELECT TOP 1 id FROM medical_records WHERE medical_record_code = 'BA-2026-00892');
DECLARE @Rec2_Id BIGINT = (SELECT TOP 1 id FROM medical_records WHERE medical_record_code = 'BA-2025-01452');
DECLARE @Rec3_Id BIGINT = (SELECT TOP 1 id FROM medical_records WHERE medical_record_code = 'BA-2026-00311');

-- Chi tiết ngoại khoa & nhi khoa
INSERT INTO surgical_record_details (record_id, pre_op_diagnosis, post_op_diagnosis, anesthesia_method, post_op_monitoring, suture_removal_date, drain_removal_date, post_op_care_guidelines)
VALUES (@Rec2_Id, N'Viêm ruột thừa cấp giờ thứ 10', N'Viêm ruột thừa nung mủ chưa vỡ', N'Gây mê nội khí quản', N'Mạch, huyết áp, nhiệt độ ổn định. Vết mổ nội soi 3 lỗ sạch, không rỉ dịch.', '2025-11-27', '2025-11-22', N'Thay băng rửa vết mổ mỗi ngày một lần bằng dung dịch Betadine, giữ khô vết mổ khi tắm.');

INSERT INTO pediatric_record_details (record_id, birth_weight_grams, gestational_age_weeks, delivery_method, apgar1min, apgar5min, feeding_regimen, psychomotor_development, father_name, father_occupation, father_education_level, mother_name, mother_occupation, mother_education_level)
VALUES (@Rec3_Id, 3400, 39.5, N'Sinh thường', 9, 10, N'Ăn dặm kết hợp sữa tươi thanh trùng', N'Phát triển thể chất và vận động bình thường theo chuẩn WHO', N'Nguyễn Minh Trí', N'Kỹ sư phần mềm', N'Đại học', N'Trần Thị Thu Trang', N'Giáo viên', N'Đại học');

-- Đơn thuốc
INSERT INTO prescriptions (medical_record_id, prescription_code, prescribing_doctor, prescription_date, diagnosis_summary, notes, deleted)
VALUES (@Rec1_Id, 'DT-2026-0981', N'BS. CK1 Trần Văn Bình', '2026-03-15', N'Tăng huyết áp vô căn (I10) - Rối loạn lipid máu (E78)', N'Uống thuốc đúng giờ mỗi ngày sau bữa ăn sáng', 0);

DECLARE @Presc1_Id BIGINT = SCOPE_IDENTITY();

INSERT INTO prescription_items (prescription_id, medicine_name, active_ingredient, dosage_amount, dosage_unit, frequency_per_day, days_count, administration_route, usage_instructions, has_allergy_warning)
VALUES 
(@Presc1_Id, N'Amlor 5mg', N'Amlodipine', N'1 viên', N'viên', N'1 lần/ngày', 30, 'ORAL', N'Uống 1 viên vào mỗi buổi sáng sau khi ăn', 0),
(@Presc1_Id, N'Lipitor 20mg', N'Atorvastatin', N'1 viên', N'viên', N'1 lần/ngày', 30, 'ORAL', N'Uống 1 viên vào buổi tối trước khi đi ngủ', 0);

INSERT INTO prescriptions (medical_record_id, prescription_code, prescribing_doctor, prescription_date, diagnosis_summary, notes, deleted)
VALUES (@Rec3_Id, 'DT-2026-0344', N'BS. CKI Phạm Thu Hà', '2026-02-10', N'Viêm phế quản cấp ở trẻ nhỏ (J20)', N'Cho bé uống nhiều nước ấm, theo dõi sát thân nhiệt', 0);

DECLARE @Presc3_Id BIGINT = SCOPE_IDENTITY();

INSERT INTO prescription_items (prescription_id, medicine_name, active_ingredient, dosage_amount, dosage_unit, frequency_per_day, days_count, administration_route, usage_instructions, has_allergy_warning)
VALUES 
(@Presc3_Id, N'Hapacol 250mg', N'Paracetamol', N'1 gói', N'gói', N'Khi sốt >= 38.5 độ', 5, 'ORAL', N'Pha với 10-15ml nước ấm, mỗi lần cách nhau tối thiểu 4-6 tiếng', 0),
(@Presc3_Id, N'Siro Prospan 100ml', N'Cao khô lá thường xuân', N'2.5 ml', N'ml', N'3 lần/ngày', 7, 'ORAL', N'Uống 2.5ml x 3 lần/ngày sau khi ăn no', 0);

-- Ghi chú bác sĩ
DECLARE @DocId BIGINT = (SELECT TOP 1 id FROM users WHERE email = 'doctor@phr.vn');
IF @DocId IS NOT NULL AND @Rec1_Id IS NOT NULL
BEGIN
    INSERT INTO doctor_notes (doctor_user_id, medical_record_id, note_content, created_at)
    VALUES 
    (@DocId, @Rec1_Id, N'Bệnh nhân tuân thủ phác đồ điều trị tốt, huyết áp kiểm soát ổn định trong ngưỡng 120/80 mmHg. Men gan và Creatinine thận hoàn toàn bình thường. Đã dặn dò duy trì lối sống lành mạnh và giảm stress.', GETDATE());
END

-- Lịch hẹn khám
INSERT INTO medical_appointments (profile_id, medical_record_id, title, doctor_name, facility_name, appointment_time, appointment_type, status, reminder_enabled, notes)
VALUES 
(@P1_Tri, @Rec1_Id, N'Tái khám định kỳ Tim Mạch & Huyết Áp', N'BS. CK1 Trần Văn Bình', N'Bệnh viện Đại học Y Dược TP.HCM - Khoa Tim Mạch', '2026-11-05 08:30:00', 'FOLLOW_UP', 'SCHEDULED', 1, N'Tái khám định kỳ 6 tháng một lần để đo điện tâm đồ và đánh giá chức năng thận.'),
(@P3_Khang, NULL, N'Tiêm chủng nhắc lại Vắc xin 6 trong 1 cho bé Khang', N'Bác sĩ tư vấn tiêm chủng', N'Trung tâm Tiêm Chủng VNVC Hoàng Văn Thụ', '2026-11-12 09:00:00', 'VACCINE', 'SCHEDULED', 1, N'Mang theo sổ tiêm chủng của bé và theo dõi thân nhiệt trước khi đi.'),
(@P5_Mai, NULL, N'Khám mắt định kỳ tầm soát biến chứng võng mạc tiểu đường', N'BS. CK2 Lê Thị Thu', N'Bệnh viện Mắt TP.HCM', '2026-11-20 14:00:00', 'FOLLOW_UP', 'SCHEDULED', 1, N'Khám mắt hàng năm cho bệnh nhân đái tháo đường Type 2.'),
(@P1_Tri, @Rec2_Id, N'Tái khám sau phẫu thuật nội soi ruột thừa', N'TS. BS Lê Hoàng Nam', N'Bệnh viện Chợ Rẫy - Khoa Ngoại Tiêu Hóa', '2025-12-05 09:00:00', 'FOLLOW_UP', 'COMPLETED', 0, N'Vết mổ liền sẹo đẹp, bụng mềm không đau, phục hồi hoàn toàn.');
GO

PRINT N'=== NẠP DỮ LIỆU MẪU Y TẾ THÀNH CÔNG ===';
GO
