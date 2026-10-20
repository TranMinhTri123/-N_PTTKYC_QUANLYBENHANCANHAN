package com.spring.temp.domain.service;

import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.domain.dto.doctornote.DoctorNoteRequest;
import com.spring.temp.domain.dto.doctornote.DoctorNoteResponse;
import com.spring.temp.domain.model.DoctorNote;
import com.spring.temp.domain.model.MedicalRecord;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.repository.DoctorNoteRepository;
import com.spring.temp.domain.repository.MedicalRecordRepository;
import com.spring.temp.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorNoteService {

    private final DoctorNoteRepository doctorNoteRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Yêu cầu đăng nhập");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin tài khoản"));
    }

    @Transactional
    public DoctorNoteResponse addNote(DoctorNoteRequest request) {
        User doctor = getCurrentUser();
        MedicalRecord record = medicalRecordRepository.findById(request.getMedicalRecordId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án"));

        DoctorNote note = DoctorNote.builder()
                .medicalRecord(record)
                .doctorUser(doctor)
                .noteContent(request.getNoteContent())
                .build();

        DoctorNote saved = doctorNoteRepository.save(note);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DoctorNoteResponse> getNotesByMedicalRecord(Long medicalRecordId) {
        if (!medicalRecordRepository.existsById(medicalRecordId)) {
            throw new NotFoundException("Không tìm thấy bệnh án");
        }
        return doctorNoteRepository.findByMedicalRecordIdOrderByCreatedAtDesc(medicalRecordId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DoctorNoteResponse mapToResponse(DoctorNote note) {
        return DoctorNoteResponse.builder()
                .id(note.getId())
                .medicalRecordId(note.getMedicalRecord().getId())
                .doctorUserId(note.getDoctorUser() != null ? note.getDoctorUser().getId() : null)
                .doctorFullName(note.getDoctorUser() != null ? note.getDoctorUser().fullName() : null)
                .doctorEmail(note.getDoctorUser() != null ? note.getDoctorUser().getEmail() : null)
                .noteContent(note.getNoteContent())
                .createdAt(note.getCreatedAt())
                .build();
    }
}
