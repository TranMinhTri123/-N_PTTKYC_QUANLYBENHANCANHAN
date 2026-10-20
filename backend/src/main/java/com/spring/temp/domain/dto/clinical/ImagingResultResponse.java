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
@Schema(description = "Kết quả chẩn đoán hình ảnh")
public class ImagingResultResponse {

    private Long id;
    private Long medicalRecordId;
    private String imagingModality;
    private String anatomicalRegion;
    private String findingsDescription;
    private String conclusion;
    private LocalDate procedureDate;
}
