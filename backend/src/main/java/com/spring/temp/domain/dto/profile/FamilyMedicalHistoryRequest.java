package com.spring.temp.domain.dto.profile;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FamilyMedicalHistoryRequest {

    @NotBlank(message = "Mối quan hệ nhân thân không được để trống (VD: Bố, Mẹ, Ông, Bà)")
    private String relativeRelationship;

    @NotBlank(message = "Tên bệnh di truyền/gia đình không được để trống")
    private String diseaseName;

    private String notes;
}
