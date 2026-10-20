package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.DepartmentTransfer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentTransferRepository extends JpaRepository<DepartmentTransfer, Long> {

    List<DepartmentTransfer> findByMedicalRecordIdOrderByTransferredAtAsc(Long medicalRecordId);
}
