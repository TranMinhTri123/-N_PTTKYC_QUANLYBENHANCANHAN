package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.HealthMetric;
import com.spring.temp.domain.model.enums.MetricType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {

    List<HealthMetric> findByProfileIdOrderByMeasuredAtDesc(Long profileId);

    Page<HealthMetric> findByProfileIdAndMetricTypeOrderByMeasuredAtDesc(
            Long profileId, MetricType metricType, Pageable pageable);
}
