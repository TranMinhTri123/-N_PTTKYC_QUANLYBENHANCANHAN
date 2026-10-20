package com.spring.temp.domain.dto.profile;

import com.spring.temp.domain.model.enums.AllergySeverity;
import com.spring.temp.domain.model.enums.AllergyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllergyRequest {

    @NotNull(message = "Loại dị ứng không được để trống")
    private AllergyType allergyType;

    @NotBlank(message = "Tên tác nhân dị ứng không được để trống")
    private String allergenName;

    @NotNull(message = "Mức độ dị ứng không được để trống")
    private AllergySeverity severity;

    private String reactionSymptoms;
    private String notes;
}
