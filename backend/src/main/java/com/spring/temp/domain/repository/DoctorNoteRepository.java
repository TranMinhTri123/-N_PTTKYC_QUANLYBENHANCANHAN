package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.DoctorNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorNoteRepository extends JpaRepository<DoctorNote, Long> {

    List<DoctorNote> findByMedicalRecordIdOrderByCreatedAtDesc(Long medicalRecordId);
}
