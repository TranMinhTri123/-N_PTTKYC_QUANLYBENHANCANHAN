package com.spring.temp.domain.dto.profile;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChronicDiseaseRequest {

    @NotBlank(message = "Tên bệnh mạn tính không được để trống")
    private String diseaseName;

    private String icd10Code;
    private Integer diagnosedYear;
    private String treatmentStatus;
    private String notes;
}
