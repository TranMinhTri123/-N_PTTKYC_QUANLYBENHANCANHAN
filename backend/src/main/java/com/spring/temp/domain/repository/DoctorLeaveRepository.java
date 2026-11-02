package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {
    List<DoctorLeave> findByDoctorIdOrderByLeaveDateAsc(Long doctorId);
    List<DoctorLeave> findByDoctorIdAndLeaveDateGreaterThanEqualOrderByLeaveDateAsc(Long doctorId, LocalDate fromDate);
    Optional<DoctorLeave> findByDoctorIdAndLeaveDate(Long doctorId, LocalDate leaveDate);
    boolean existsByDoctorIdAndLeaveDate(Long doctorId, LocalDate leaveDate);
}

