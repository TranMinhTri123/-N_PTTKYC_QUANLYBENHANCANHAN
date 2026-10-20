package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.FamilyMedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FamilyMedicalHistoryRepository extends JpaRepository<FamilyMedicalHistory, Long> {

    List<FamilyMedicalHistory> findByProfileIdAndDeletedFalse(Long profileId);

    Optional<FamilyMedicalHistory> findByIdAndDeletedFalse(Long id);
}
