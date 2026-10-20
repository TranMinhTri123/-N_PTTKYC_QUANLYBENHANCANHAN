package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.ProfileShare;
import com.spring.temp.domain.model.enums.ShareStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileShareRepository extends JpaRepository<ProfileShare, Long> {

    Optional<ProfileShare> findByShareToken(String shareToken);

    List<ProfileShare> findByProfileIdAndStatus(Long profileId, ShareStatus status);

    List<ProfileShare> findByDoctorUserId(Long doctorUserId);
}
