package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByMedicalRecordIdAndDeletedFalse(Long medicalRecordId);

    Optional<Prescription> findByIdAndDeletedFalse(Long id);
}
