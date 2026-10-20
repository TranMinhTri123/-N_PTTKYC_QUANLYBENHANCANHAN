package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.HealthProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HealthProfileRepository extends JpaRepository<HealthProfile, Long> {

    List<HealthProfile> findByUserIdAndDeletedFalse(Long userId);

    Page<HealthProfile> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);

    Optional<HealthProfile> findByIdAndDeletedFalse(Long id);

    boolean existsByIdAndUserId(Long id, Long userId);
}
