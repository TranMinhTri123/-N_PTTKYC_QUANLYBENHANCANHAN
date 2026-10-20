package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.LabTestResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabTestResultRepository extends JpaRepository<LabTestResult, Long> {

    List<LabTestResult> findByMedicalRecordId(Long medicalRecordId);
}
