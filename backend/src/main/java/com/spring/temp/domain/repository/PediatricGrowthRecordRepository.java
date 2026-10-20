package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.PediatricGrowthRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PediatricGrowthRecordRepository extends JpaRepository<PediatricGrowthRecord, Long> {

    List<PediatricGrowthRecord> findByProfileIdOrderByAgeMonthsAsc(Long profileId);
}
