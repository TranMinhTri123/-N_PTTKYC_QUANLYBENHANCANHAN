package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.MedicalRecord;
import com.spring.temp.domain.model.enums.RecordType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    Page<MedicalRecord> findByProfileIdAndDeletedFalse(Long profileId, Pageable pageable);

    Optional<MedicalRecord> findByIdAndDeletedFalse(Long id);

    Page<MedicalRecord> findByProfileIdAndRecordTypeAndDeletedFalse(Long profileId, RecordType recordType, Pageable pageable);

    long countByProfileIdAndDeletedFalse(Long profileId);

    Page<MedicalRecord> findByDeletedFalse(Pageable pageable);

    Page<MedicalRecord> findByRecordTypeAndDeletedFalse(RecordType recordType, Pageable pageable);

    Page<MedicalRecord> findByProfileIdInAndDeletedFalse(java.util.List<Long> profileIds, Pageable pageable);

    Page<MedicalRecord> findByProfileIdInAndRecordTypeAndDeletedFalse(java.util.List<Long> profileIds, RecordType recordType, Pageable pageable);
}
