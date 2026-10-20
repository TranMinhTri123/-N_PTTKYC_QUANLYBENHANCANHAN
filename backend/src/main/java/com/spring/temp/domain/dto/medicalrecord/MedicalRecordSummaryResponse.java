package com.spring.temp.domain.dto.medicalrecord;

import com.spring.temp.domain.model.enums.AdmissionType;
import com.spring.temp.domain.model.enums.DischargeType;
import com.spring.temp.domain.model.enums.RecordType;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Thông tin tóm tắt bệnh án (Danh sách / Tìm kiếm)")
public class MedicalRecordSummaryResponse {

    private Long id;
    private Long profileId;
    private String profileFullName;
    private RecordType recordType;
    private String hospitalName;
    private String medicalRecordCode;
    private String patientMedicalCode;
    private String departmentName;
    private LocalDate visitDate;
    private AdmissionType admissionType;
    private String primaryDiagnosis;
    private String primaryIcd10;
    private String attendingDoctor;
    private DischargeType dischargeType;
    private Integer totalTreatmentDays;
    private String tags;
    private LocalDateTime createdAt;
}
