package com.spring.temp.domain.dto.profile;

import com.spring.temp.domain.model.enums.AllergySeverity;
import com.spring.temp.domain.model.enums.AllergyType;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllergyResponse {
    private Long id;
    private Long profileId;
    private AllergyType allergyType;
    private String allergenName;
    private AllergySeverity severity;
    private String reactionSymptoms;
    private String notes;
}
