package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.ImagingResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImagingResultRepository extends JpaRepository<ImagingResult, Long> {

    List<ImagingResult> findByMedicalRecordId(Long medicalRecordId);
}
