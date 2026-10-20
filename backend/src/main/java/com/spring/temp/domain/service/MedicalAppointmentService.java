package com.spring.temp.domain.service;

import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.domain.dto.appointment.MedicalAppointmentRequest;
import com.spring.temp.domain.dto.appointment.MedicalAppointmentResponse;
import com.spring.temp.domain.model.HealthProfile;
import com.spring.temp.domain.model.MedicalAppointment;
import com.spring.temp.domain.model.MedicalRecord;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.model.enums.AppointmentStatus;
import com.spring.temp.domain.repository.HealthProfileRepository;
import com.spring.temp.domain.repository.MedicalAppointmentRepository;
import com.spring.temp.domain.repository.MedicalRecordRepository;
import com.spring.temp.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalAppointmentService {

    private final MedicalAppointmentRepository appointmentRepository;
    private final HealthProfileRepository healthProfileRepository;
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

    private void checkProfileOwnership(HealthProfile profile, User user) {
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        if (!isAdmin && !profile.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập hồ sơ này");
        }
    }

    @Transactional
    public MedicalAppointmentResponse createAppointment(MedicalAppointmentRequest request) {
        User currentUser = getCurrentUser();
        HealthProfile profile = healthProfileRepository.findById(request.getProfileId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
        checkProfileOwnership(profile, currentUser);

        MedicalRecord record = null;
        if (request.getMedicalRecordId() != null) {
            record = medicalRecordRepository.findById(request.getMedicalRecordId()).orElse(null);
        }

        MedicalAppointment appointment = MedicalAppointment.builder()
                .profile(profile)
                .medicalRecord(record)
                .title(request.getTitle())
                .facilityName(request.getFacilityName())
                .doctorName(request.getDoctorName())
                .appointmentTime(request.getAppointmentTime())
                .appointmentType(request.getAppointmentType())
                .status(request.getStatus() != null ? request.getStatus() : AppointmentStatus.SCHEDULED)
                .reminderEnabled(request.getReminderEnabled() != null ? request.getReminderEnabled() : true)
                .notes(request.getNotes())
                .build();

        MedicalAppointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicalAppointmentResponse> getAllAppointments(Long profileId) {
        if (profileId != null) {
            User currentUser = getCurrentUser();
            HealthProfile profile = healthProfileRepository.findById(profileId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
            checkProfileOwnership(profile, currentUser);
            return appointmentRepository.findByProfileIdOrderByAppointmentTimeAsc(profileId)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        User currentUser = getCurrentUser();
        boolean isAdminOrDoctor = currentUser.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_DOCTOR".equals(r.getName()));

        if (isAdminOrDoctor) {
            return appointmentRepository.findAllByOrderByAppointmentTimeAsc()
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        List<HealthProfile> userProfiles = healthProfileRepository.findByUserIdAndDeletedFalse(currentUser.getId());
        if (userProfiles.isEmpty()) {
            return List.of();
        }
        List<Long> profileIds = userProfiles.stream().map(HealthProfile::getId).collect(Collectors.toList());
        return appointmentRepository.findByProfileIdInOrderByAppointmentTimeAsc(profileIds)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MedicalAppointmentResponse> getAppointments(Long profileId, Pageable pageable) {
        User currentUser = getCurrentUser();
        HealthProfile profile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
        checkProfileOwnership(profile, currentUser);

        return appointmentRepository.findByProfileIdOrderByAppointmentTimeDesc(profileId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<MedicalAppointmentResponse> getUpcomingAppointments(Long profileId) {
        if (profileId != null) {
            User currentUser = getCurrentUser();
            HealthProfile profile = healthProfileRepository.findById(profileId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
            checkProfileOwnership(profile, currentUser);

            return appointmentRepository.findByProfileIdOrderByAppointmentTimeAsc(profileId)
                    .stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        User currentUser = getCurrentUser();
        boolean isAdminOrDoctor = currentUser.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_DOCTOR".equals(r.getName()));

        List<MedicalAppointment> list;
        if (isAdminOrDoctor) {
            list = appointmentRepository.findAllByOrderByAppointmentTimeAsc();
        } else {
            List<HealthProfile> userProfiles = healthProfileRepository.findByUserIdAndDeletedFalse(currentUser.getId());
            if (userProfiles.isEmpty()) {
                return List.of();
            }
            List<Long> profileIds = userProfiles.stream().map(HealthProfile::getId).collect(Collectors.toList());
            list = appointmentRepository.findByProfileIdInOrderByAppointmentTimeAsc(profileIds);
        }

        return list.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicalAppointmentResponse updateStatus(Long id, AppointmentStatus status) {
        User currentUser = getCurrentUser();
        MedicalAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn"));
        checkProfileOwnership(appointment.getProfile(), currentUser);

        appointment.setStatus(status);
        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public void deleteAppointment(Long id) {
        User currentUser = getCurrentUser();
        MedicalAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn"));
        checkProfileOwnership(appointment.getProfile(), currentUser);

        appointmentRepository.delete(appointment);
    }

    private MedicalAppointmentResponse mapToResponse(MedicalAppointment a) {
        return MedicalAppointmentResponse.builder()
                .id(a.getId())
                .profileId(a.getProfile().getId())
                .profileFullName(a.getProfile().getFullName())
                .medicalRecordId(a.getMedicalRecord() != null ? a.getMedicalRecord().getId() : null)
                .medicalRecordCode(a.getMedicalRecord() != null ? a.getMedicalRecord().getMedicalRecordCode() : null)
                .title(a.getTitle())
                .facilityName(a.getFacilityName())
                .doctorName(a.getDoctorName())
                .appointmentTime(a.getAppointmentTime())
                .appointmentType(a.getAppointmentType())
                .status(a.getStatus())
                .reminderEnabled(a.getReminderEnabled())
                .notes(a.getNotes())
                .build();
    }
}
