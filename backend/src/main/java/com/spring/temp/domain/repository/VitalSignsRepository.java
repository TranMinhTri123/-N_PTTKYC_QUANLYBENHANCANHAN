package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.VitalSigns;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VitalSignsRepository extends JpaRepository<VitalSigns, Long> {

    Optional<VitalSigns> findByMedicalRecordId(Long medicalRecordId);
}
