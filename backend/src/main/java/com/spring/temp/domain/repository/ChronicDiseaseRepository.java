package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.ChronicDisease;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChronicDiseaseRepository extends JpaRepository<ChronicDisease, Long> {

    List<ChronicDisease> findByProfileIdAndDeletedFalse(Long profileId);

    Optional<ChronicDisease> findByIdAndDeletedFalse(Long id);
}
