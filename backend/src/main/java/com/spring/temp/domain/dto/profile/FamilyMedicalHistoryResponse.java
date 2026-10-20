package com.spring.temp.domain.dto.profile;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FamilyMedicalHistoryResponse {
    private Long id;
    private Long profileId;
    private String relativeRelationship;
    private String diseaseName;
    private String notes;
}
