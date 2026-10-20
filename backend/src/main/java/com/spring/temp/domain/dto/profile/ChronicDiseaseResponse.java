package com.spring.temp.domain.dto.profile;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChronicDiseaseResponse {
    private Long id;
    private Long profileId;
    private String diseaseName;
    private String icd10Code;
    private Integer diagnosedYear;
    private String treatmentStatus;
    private String notes;
}
