package com.spring.temp.domain.mapper;

import com.spring.temp.domain.dto.clinical.*;
import com.spring.temp.domain.model.ImagingResult;
import com.spring.temp.domain.model.LabTestResult;
import com.spring.temp.domain.model.MedicalAttachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClinicalInvestigationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    LabTestResult toLabTestEntity(LabTestResultRequest request);

    @Mapping(target = "medicalRecordId", source = "medicalRecord.id")
    LabTestResultResponse toLabTestResponse(LabTestResult entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    ImagingResult toImagingEntity(ImagingResultRequest request);

    @Mapping(target = "medicalRecordId", source = "medicalRecord.id")
    ImagingResultResponse toImagingResponse(ImagingResult entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    @Mapping(target = "uploadedByUserId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    MedicalAttachment toAttachmentEntity(MedicalAttachmentRequest request);

    @Mapping(target = "medicalRecordId", source = "medicalRecord.id")
    MedicalAttachmentResponse toAttachmentResponse(MedicalAttachment entity);
}
