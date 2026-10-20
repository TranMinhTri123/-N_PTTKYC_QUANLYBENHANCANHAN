package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.VaccinationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, Long> {

    List<VaccinationRecord> findByProfileIdOrderByAdministeredDateAsc(Long profileId);
}
