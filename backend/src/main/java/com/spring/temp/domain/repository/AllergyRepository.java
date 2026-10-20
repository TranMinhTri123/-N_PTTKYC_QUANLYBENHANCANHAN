package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AllergyRepository extends JpaRepository<Allergy, Long> {

    List<Allergy> findByProfileIdAndDeletedFalse(Long profileId);

    Optional<Allergy> findByIdAndDeletedFalse(Long id);
}
