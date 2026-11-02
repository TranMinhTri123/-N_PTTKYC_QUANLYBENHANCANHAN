package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.MedicalAppointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    List<MedicalAppointment> findByDoctorIdOrderByAppointmentTimeAsc(Long doctorId);

    @Query("SELECT a FROM MedicalAppointment a WHERE a.doctorId = :doctorId OR LOWER(a.doctorName) LIKE LOWER(CONCAT('%', :doctorName, '%')) ORDER BY a.appointmentTime ASC")
    List<MedicalAppointment> findByDoctorIdOrDoctorName(@Param("doctorId") Long doctorId, @Param("doctorName") String doctorName);

    List<MedicalAppointment> findByPatientIdOrderByAppointmentTimeDesc(Long patientId);

    @Query("SELECT COUNT(a) FROM MedicalAppointment a WHERE a.doctorId = :doctorId AND a.appointmentTime = :appointmentTime AND a.status IN (com.spring.temp.domain.model.enums.AppointmentStatus.PENDING, com.spring.temp.domain.model.enums.AppointmentStatus.CONFIRMED)")
    long countSlotCollisions(@Param("doctorId") Long doctorId, @Param("appointmentTime") LocalDateTime appointmentTime);

    boolean existsByDoctorIdAndPatientIdAndStatus(Long doctorId, Long patientId, com.spring.temp.domain.model.enums.AppointmentStatus status);
}
