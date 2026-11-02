package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.UserPatientLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPatientLinkRepository extends JpaRepository<UserPatientLink, Long> {
    Optional<UserPatientLink> findByUserId(Long userId);
    Optional<UserPatientLink> findByPatientId(Long patientId);
    boolean existsByUserId(Long userId);
    boolean existsByPatientId(Long patientId);
    void deleteByUserId(Long userId);
}

