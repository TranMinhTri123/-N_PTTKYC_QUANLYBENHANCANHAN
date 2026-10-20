package com.spring.temp.domain.dto.profile;

import com.spring.temp.domain.model.enums.Gender;
import com.spring.temp.domain.model.enums.InsuranceType;
import com.spring.temp.domain.model.enums.RelationshipType;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HealthProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String bloodType;
    private String cccd;
    private String bhytNumber;
    private InsuranceType insuranceType;
    private LocalDate insuranceValidUntil;
    private RelationshipType relationship;
    private String ethnicity;
    private String nationality;
    private String occupation;
    private String workplace;
    private String addressDetail;
    private String ward;
    private String district;
    private String province;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactAddress;
    private int allergyCount;
    private int chronicDiseaseCount;
    private int medicalRecordCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
