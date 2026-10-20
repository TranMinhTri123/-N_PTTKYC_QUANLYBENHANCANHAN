package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.SurgicalProcedure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SurgicalProcedureRepository extends JpaRepository<SurgicalProcedure, Long> {

    List<SurgicalProcedure> findBySurgicalRecord_RecordId(Long surgicalRecordId);
}
