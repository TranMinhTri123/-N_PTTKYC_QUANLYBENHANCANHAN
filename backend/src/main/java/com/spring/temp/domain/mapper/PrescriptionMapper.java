package com.spring.temp.domain.mapper;

import com.spring.temp.domain.dto.prescription.*;
import com.spring.temp.domain.model.MedicineCatalog;
import com.spring.temp.domain.model.Prescription;
import com.spring.temp.domain.model.PrescriptionItem;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PrescriptionMapper {

    MedicineCatalogDto toCatalogDto(MedicineCatalog catalog);

    @Mapping(target = "id", ignore = true)
    MedicineCatalog toCatalogEntity(MedicineCatalogDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    Prescription toEntity(PrescriptionRequest request);

    @Mapping(target = "medicalRecordId", source = "medicalRecord.id")
    @Mapping(target = "medicalRecordCode", source = "medicalRecord.medicalRecordCode")
    @Mapping(target = "profileId", source = "medicalRecord.profile.id")
    @Mapping(target = "profileFullName", source = "medicalRecord.profile.fullName")
    @Mapping(target = "hasAnyAllergyWarning", ignore = true)
    @Mapping(target = "allergyWarnings", ignore = true)
    PrescriptionResponse toResponse(Prescription prescription);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "prescription", ignore = true)
    @Mapping(target = "medicine", ignore = true)
    @Mapping(target = "hasAllergyWarning", ignore = true)
    PrescriptionItem toItemEntity(PrescriptionItemRequest request);

    @Mapping(target = "medicineId", expression = "java(item.getMedicine() != null ? item.getMedicine().getId() : null)")
    @Mapping(target = "allergyWarningNote", ignore = true)
    PrescriptionItemResponse toItemResponse(PrescriptionItem item);

    List<PrescriptionItemResponse> toItemResponseList(List<PrescriptionItem> items);
}
