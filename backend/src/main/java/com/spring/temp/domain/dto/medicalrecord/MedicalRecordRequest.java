package com.spring.temp.domain.dto.medicalrecord;

import com.spring.temp.domain.model.enums.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Yêu cầu tạo hoặc cập nhật hồ sơ bệnh án (Medical Record)")
public class MedicalRecordRequest {

    @NotNull(message = "ID hồ sơ sức khỏe không được để trống")
    @Schema(description = "ID hồ sơ sức khỏe cá nhân người bệnh", example = "1")
    private Long profileId;

    @NotNull(message = "Loại bệnh án không được để trống")
    @Schema(description = "Loại bệnh án chuyên khoa: INTERNAL (Nội), SURGICAL (Ngoại), PEDIATRIC (Nhi), OBSTETRIC (Sản)", example = "INTERNAL")
    private RecordType recordType;

    @NotBlank(message = "Tên cơ sở y tế / Bệnh viện không được để trống")
    @Schema(description = "Tên cơ sở khám chữa bệnh", example = "Bệnh viện Bạch Mai")
    private String hospitalName;

    @Schema(description = "Số lưu trữ bệnh án", example = "BA-2026-00123")
    private String medicalRecordCode;

    @Schema(description = "Mã Y Tế (Mã YT của bệnh nhân tại viện)", example = "YT987654")
    private String patientMedicalCode;

    @Schema(description = "Khoa khám bệnh / điều trị", example = "Khoa Nội Tim Mạch")
    private String departmentName;

    @Schema(description = "Số giường bệnh", example = "G-12")
    private String bedNumber;

    @Schema(description = "Bác sĩ điều trị chính", example = "BS.CKII Trần Văn Minh")
    private String attendingDoctor;

    @NotNull(message = "Ngày khám không được để trống")
    @PastOrPresent(message = "Ngày khám / vào viện không được ở trong tương lai")
    @Schema(description = "Ngày khám / vào viện", example = "2026-10-09")
    private LocalDate visitDate;

    @NotNull(message = "Hình thức điều trị không được để trống")
    @Schema(description = "Hình thức điều trị: INPATIENT (Nội trú), OUTPATIENT (Ngoại trú), EMERGENCY (Cấp cứu)", example = "INPATIENT")
    private AdmissionType admissionType;

    // Luồng tiếp nhận (Admission Tracking)
    @Schema(description = "Thời điểm tiếp nhận vào viện")
    private LocalDateTime admissionDateTime;

    @Schema(description = "Cổng vào viện (KKB, Cấp cứu, Khoa ĐT)", example = "OPD")
    private AdmissionGate admissionGate;

    @Schema(description = "Nơi giới thiệu vào viện (Tự đến, Trạm y tế, Bệnh viện khác)", example = "SELF")
    private ReferralSource referralSource;

    @Builder.Default
    @Schema(description = "Số lần vào viện do cùng một bệnh", example = "1")
    private Integer admissionCountForDisease = 1;

    // Chuyển viện
    @Schema(description = "Tuyến chuyển viện (Tuyến trên, Tuyến dưới, Chuyên khoa)", example = "NONE")
    private TransferredLevel transferredLevel;

    @Schema(description = "Bệnh viện chuyển đến", example = "Bệnh viện Tim Hà Nội")
    private String transferredToFacility;

    // Ra viện (Discharge Tracking)
    @Schema(description = "Thời điểm ra viện")
    private LocalDateTime dischargeDateTime;

    @Schema(description = "Hình thức ra viện (Ra viện, Xin về, Chuyển viện, Tử vong)", example = "DISCHARGED")
    private DischargeType dischargeType;

    @Schema(description = "Tổng số ngày điều trị (Hệ thống tự tính nếu để trống)", example = "5")
    private Integer totalTreatmentDays;

    // Bệnh sử & Khám
    @Schema(description = "Lý do vào viện (Chief Complaint)", example = "Đau tức ngực trái kéo dài, khó thở khi gắng sức")
    private String chiefComplaint;

    @Schema(description = "Bệnh sử (Diễn biến bệnh qua các ngày)")
    private String historyOfIllness;

    // Chẩn đoán đa giai đoạn (ICD-10)
    @Schema(description = "Chẩn đoán nơi chuyển đến")
    private String referralDiagnosis;

    @Schema(description = "Mã ICD-10 nơi chuyển đến", example = "I20")
    private String referralIcd10;

    @Schema(description = "Chẩn đoán vào Khoa Khám Bệnh / Cấp cứu")
    private String admissionDiagnosis;

    @Schema(description = "Mã ICD-10 vào viện", example = "I10")
    private String admissionIcd10;

    @Schema(description = "Chẩn đoán khi vào khoa điều trị")
    private String deptAdmissionDiagnosis;

    @Schema(description = "Mã ICD-10 khi vào khoa", example = "I10")
    private String deptAdmissionIcd10;

    @Schema(description = "Chẩn đoán ra viện - Bệnh chính", example = "Tăng huyết áp nguyên phát giai đoạn 2")
    private String primaryDiagnosis;

    @Schema(description = "Mã ICD-10 bệnh chính", example = "I10")
    private String primaryIcd10;

    @Schema(description = "Chẩn đoán ra viện - Bệnh kèm theo (Biến chứng)", example = "Đái tháo đường không phụ thuộc insulin")
    private String secondaryDiagnosis;

    @Schema(description = "Mã ICD-10 bệnh kèm theo", example = "E11")
    private String secondaryIcd10;

    // Điều trị & Chăm sóc
    @Schema(description = "Hướng điều trị / Phương pháp điều trị")
    private String treatmentPlan;

    @Schema(description = "Chế độ chăm sóc (Cấp 1, Cấp 2, Cấp 3)")
    private String carePlan;

    @Schema(description = "Chế độ dinh dưỡng / ăn uống")
    private String dietPlan;

    @Schema(description = "Lời dặn của bác sĩ khi ra viện")
    private String followUpInstructions;

    @Schema(description = "Ngày hẹn tái khám", example = "2026-11-09")
    private LocalDate revisitDate;

    @Schema(description = "Ghi chú thêm")
    private String notes;

    @Schema(description = "Thẻ gắn phân loại (Tags)", example = "#tim_mach, #nam_2026")
    private String tags;

    // Các thành phần chi tiết đi kèm
    @Schema(description = "Thông tin sinh hiệu lâm sàng (Mạch, nhiệt, huyết áp, BMI)")
    private VitalSignsDto vitalSigns;

    @Schema(description = "Chi tiết chuyên khoa Nội khoa (khi recordType == INTERNAL)")
    private InternalRecordDetailDto internalDetail;

    @Schema(description = "Chi tiết chuyên khoa Ngoại khoa (khi recordType == SURGICAL)")
    private SurgicalRecordDetailDto surgicalDetail;

    @Schema(description = "Chi tiết chuyên khoa Nhi khoa (khi recordType == PEDIATRIC)")
    private PediatricRecordDetailDto pediatricDetail;

    @Schema(description = "Chi tiết chuyên khoa Sản khoa (khi recordType == OBSTETRIC)")
    private ObstetricRecordDetailDto obstetricDetail;
}
