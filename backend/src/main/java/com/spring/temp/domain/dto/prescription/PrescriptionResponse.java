package com.spring.temp.domain.dto.prescription;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Chi tiết đơn thuốc điều trị")
public class PrescriptionResponse {

    private Long id;
    private Long medicalRecordId;
    private String medicalRecordCode;
    private Long profileId;
    private String profileFullName;
    private String prescriptionCode;
    private String prescribingDoctor;
    private LocalDate prescriptionDate;
    private String diagnosisSummary;
    private String notes;

    private List<PrescriptionItemResponse> items;

    @Schema(description = "Cảnh báo nếu có bất kỳ loại thuốc nào trong đơn trùng dị ứng của người bệnh")
    private boolean hasAnyAllergyWarning;

    @Schema(description = "Danh sách chi tiết các thông điệp cảnh báo dị ứng thuốc")
    private List<String> allergyWarnings;
}
