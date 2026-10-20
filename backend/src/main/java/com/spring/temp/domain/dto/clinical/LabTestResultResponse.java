package com.spring.temp.domain.dto.clinical;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Thông tin kết quả xét nghiệm cận lâm sàng")
public class LabTestResultResponse {

    private Long id;
    private Long medicalRecordId;
    private String testName;
    private String testCategory;
    private String testValue;
    private String referenceRange;
    private String unit;
    private boolean abnormal;
    private String evaluation;
    private LocalDate testDate;
}
