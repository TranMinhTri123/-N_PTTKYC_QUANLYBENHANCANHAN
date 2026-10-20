package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.MedicalAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalAttachmentRepository extends JpaRepository<MedicalAttachment, Long> {

    List<MedicalAttachment> findByMedicalRecordIdAndDeletedFalse(Long medicalRecordId);

    Optional<MedicalAttachment> findByIdAndDeletedFalse(Long id);
}
