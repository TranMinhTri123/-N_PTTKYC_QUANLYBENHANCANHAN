package com.spring.temp.domain.mapper;

import com.spring.temp.domain.dto.medicalrecord.*;
import com.spring.temp.domain.model.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface MedicalRecordMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "vitalSigns", ignore = true)
    @Mapping(target = "departmentTransfers", ignore = true)
    @Mapping(target = "internalDetail", ignore = true)
    @Mapping(target = "surgicalDetail", ignore = true)
    @Mapping(target = "pediatricDetail", ignore = true)
    @Mapping(target = "obstetricDetail", ignore = true)
    @Mapping(target = "prescriptions", ignore = true)
    @Mapping(target = "labTestResults", ignore = true)
    @Mapping(target = "imagingResults", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "doctorNotes", ignore = true)
    MedicalRecord toEntity(MedicalRecordRequest request);

    @Mapping(target = "profileId", source = "profile.id")
    @Mapping(target = "profileFullName", source = "profile.fullName")
    @Mapping(target = "prescriptionCount", expression = "java(record.getPrescriptions() != null ? record.getPrescriptions().size() : 0)")
    @Mapping(target = "labTestCount", expression = "java(record.getLabTestResults() != null ? record.getLabTestResults().size() : 0)")
    @Mapping(target = "attachmentCount", expression = "java(record.getAttachments() != null ? record.getAttachments().size() : 0)")
    MedicalRecordResponse toResponse(MedicalRecord record);

    @Mapping(target = "profileId", source = "profile.id")
    @Mapping(target = "profileFullName", source = "profile.fullName")
    MedicalRecordSummaryResponse toSummaryResponse(MedicalRecord record);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "vitalSigns", ignore = true)
    @Mapping(target = "departmentTransfers", ignore = true)
    @Mapping(target = "internalDetail", ignore = true)
    @Mapping(target = "surgicalDetail", ignore = true)
    @Mapping(target = "pediatricDetail", ignore = true)
    @Mapping(target = "obstetricDetail", ignore = true)
    @Mapping(target = "prescriptions", ignore = true)
    @Mapping(target = "labTestResults", ignore = true)
    @Mapping(target = "imagingResults", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "doctorNotes", ignore = true)
    void updateEntityFromRequest(MedicalRecordRequest request, @MappingTarget MedicalRecord record);

    // VitalSigns mappings
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    VitalSigns toVitalSignsEntity(VitalSignsDto dto);

    VitalSignsDto toVitalSignsDto(VitalSigns entity);

    // DepartmentTransfer mappings
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    DepartmentTransfer toDepartmentTransferEntity(DepartmentTransferDto dto);

    DepartmentTransferDto toDepartmentTransferDto(DepartmentTransfer entity);

    // InternalRecordDetail mappings
    @Mapping(target = "recordId", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    InternalRecordDetail toInternalDetailEntity(InternalRecordDetailDto dto);

    InternalRecordDetailDto toInternalDetailDto(InternalRecordDetail entity);

    // SurgicalRecordDetail mappings
    @Mapping(target = "recordId", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    @Mapping(target = "procedures", ignore = true)
    SurgicalRecordDetail toSurgicalDetailEntity(SurgicalRecordDetailDto dto);

    SurgicalRecordDetailDto toSurgicalDetailDto(SurgicalRecordDetail entity);

    // PediatricRecordDetail mappings
    @Mapping(target = "recordId", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    PediatricRecordDetail toPediatricDetailEntity(PediatricRecordDetailDto dto);

    PediatricRecordDetailDto toPediatricDetailDto(PediatricRecordDetail entity);

    // ObstetricRecordDetail mappings
    @Mapping(target = "recordId", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    @Mapping(target = "prenatalVisits", ignore = true)
    ObstetricRecordDetail toObstetricDetailEntity(ObstetricRecordDetailDto dto);

    ObstetricRecordDetailDto toObstetricDetailDto(ObstetricRecordDetail entity);
}
