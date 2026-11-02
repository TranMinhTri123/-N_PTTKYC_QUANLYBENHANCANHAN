package com.spring.temp.domain.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalDiseaseResponse {
    private String id;
    private String icd11Code;
    private String icd10Code;
    private String diseaseNameEn;
    private String diseaseNameVi;
    private String chapter;
    private String description;
    private String source; // "WHO_ICD11", "NIH_ICD10", "NATIONAL_CATALOG"
}
