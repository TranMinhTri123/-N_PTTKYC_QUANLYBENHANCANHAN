package com.spring.temp.domain.mapper;

import com.spring.temp.domain.dto.profile.*;
import com.spring.temp.domain.model.Allergy;
import com.spring.temp.domain.model.ChronicDisease;
import com.spring.temp.domain.model.FamilyMedicalHistory;
import com.spring.temp.domain.model.HealthProfile;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface HealthProfileMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "allergies", ignore = true)
    @Mapping(target = "chronicDiseases", ignore = true)
    @Mapping(target = "familyMedicalHistories", ignore = true)
    @Mapping(target = "medicalRecords", ignore = true)
    @Mapping(target = "healthMetrics", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "profileShares", ignore = true)
    HealthProfile toEntity(HealthProfileRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "allergyCount", expression = "java(profile.getAllergies() != null ? profile.getAllergies().size() : 0)")
    @Mapping(target = "chronicDiseaseCount", expression = "java(profile.getChronicDiseases() != null ? profile.getChronicDiseases().size() : 0)")
    @Mapping(target = "medicalRecordCount", expression = "java(profile.getMedicalRecords() != null ? profile.getMedicalRecords().size() : 0)")
    HealthProfileResponse toResponse(HealthProfile profile);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "allergies", ignore = true)
    @Mapping(target = "chronicDiseases", ignore = true)
    @Mapping(target = "familyMedicalHistories", ignore = true)
    @Mapping(target = "medicalRecords", ignore = true)
    @Mapping(target = "healthMetrics", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "profileShares", ignore = true)
    void updateEntityFromRequest(HealthProfileRequest request, @MappingTarget HealthProfile profile);

    // Allergy mappings
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    Allergy toEntity(AllergyRequest request);

    @Mapping(target = "profileId", source = "profile.id")
    AllergyResponse toResponse(Allergy allergy);

    // Chronic Disease mappings
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    ChronicDisease toEntity(ChronicDiseaseRequest request);

    @Mapping(target = "profileId", source = "profile.id")
    ChronicDiseaseResponse toResponse(ChronicDisease chronicDisease);

    // Family Medical History mappings
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    FamilyMedicalHistory toEntity(FamilyMedicalHistoryRequest request);

    @Mapping(target = "profileId", source = "profile.id")
    FamilyMedicalHistoryResponse toResponse(FamilyMedicalHistory familyHistory);
}
