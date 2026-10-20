package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.MedicalAppointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MedicalAppointmentRepository extends JpaRepository<MedicalAppointment, Long> {

    List<MedicalAppointment> findByProfileIdOrderByAppointmentTimeAsc(Long profileId);

    Page<MedicalAppointment> findByProfileIdOrderByAppointmentTimeDesc(Long profileId, Pageable pageable);

    List<MedicalAppointment> findByProfileIdInOrderByAppointmentTimeAsc(List<Long> profileIds);

    Page<MedicalAppointment> findByProfileIdInOrderByAppointmentTimeDesc(List<Long> profileIds, Pageable pageable);

    List<MedicalAppointment> findAllByOrderByAppointmentTimeAsc();

    Page<MedicalAppointment> findAllByOrderByAppointmentTimeDesc(Pageable pageable);

    List<MedicalAppointment> findByReminderEnabledTrueAndAppointmentTimeBetween(
            LocalDateTime startTime, LocalDateTime endTime);
}
