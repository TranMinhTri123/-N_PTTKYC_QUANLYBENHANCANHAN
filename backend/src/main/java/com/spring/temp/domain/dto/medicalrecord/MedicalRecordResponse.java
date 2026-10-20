package com.spring.temp.domain.dto.medicalrecord;

import com.spring.temp.domain.model.enums.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Chi tiết đầy đủ bệnh án (Medical Record Details)")
public class MedicalRecordResponse {

    private Long id;
    private Long profileId;
    private String profileFullName;
    private RecordType recordType;
    private String hospitalName;
    private String medicalRecordCode;
    private String patientMedicalCode;
    private String departmentName;
    private String bedNumber;
    private String attendingDoctor;
    private LocalDate visitDate;
    private AdmissionType admissionType;

    // Tiếp nhận
    private LocalDateTime admissionDateTime;
    private AdmissionGate admissionGate;
    private ReferralSource referralSource;
    private Integer admissionCountForDisease;

    // Chuyển viện
    private TransferredLevel transferredLevel;
    private String transferredToFacility;

    // Ra viện
    private LocalDateTime dischargeDateTime;
    private DischargeType dischargeType;
    private Integer totalTreatmentDays;

    // Bệnh sử & Khám
    private String chiefComplaint;
    private String historyOfIllness;

    // Chẩn đoán đa giai đoạn (ICD-10)
    private String referralDiagnosis;
    private String referralIcd10;
    private String admissionDiagnosis;
    private String admissionIcd10;
    private String deptAdmissionDiagnosis;
    private String deptAdmissionIcd10;
    private String primaryDiagnosis;
    private String primaryIcd10;
    private String secondaryDiagnosis;
    private String secondaryIcd10;

    // Điều trị & Chăm sóc
    private String treatmentPlan;
    private String carePlan;
    private String dietPlan;
    private String followUpInstructions;
    private LocalDate revisitDate;
    private String notes;
    private String tags;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Chi tiết liên kết
    private VitalSignsDto vitalSigns;
    private List<DepartmentTransferDto> departmentTransfers;
    private InternalRecordDetailDto internalDetail;
    private SurgicalRecordDetailDto surgicalDetail;
    private PediatricRecordDetailDto pediatricDetail;
    private ObstetricRecordDetailDto obstetricDetail;

    private Integer prescriptionCount;
    private Integer labTestCount;
    private Integer attachmentCount;
}
