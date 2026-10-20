package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.PrenatalVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrenatalVisitRepository extends JpaRepository<PrenatalVisit, Long> {

    List<PrenatalVisit> findByObstetricRecord_RecordIdOrderByVisitDateAsc(Long obstetricRecordId);
}
