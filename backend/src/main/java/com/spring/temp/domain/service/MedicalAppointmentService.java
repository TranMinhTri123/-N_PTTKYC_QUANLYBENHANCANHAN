
package com.spring.temp.domain.service;

import com.spring.temp.domain.dto.appointment.DoctorAppointmentActionRequest;
import com.spring.temp.domain.dto.appointment.MedicalAppointmentRequest;
import com.spring.temp.domain.dto.appointment.MedicalAppointmentResponse;
import com.spring.temp.domain.model.HealthProfile;
import com.spring.temp.domain.model.MedicalAppointment;
import com.spring.temp.domain.model.MedicalRecord;
import com.spring.temp.domain.model.Patient;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.model.UserPatientLink;
import com.spring.temp.domain.model.enums.AppointmentStatus;
import com.spring.temp.domain.repository.HealthProfileRepository;
import com.spring.temp.domain.repository.MedicalAppointmentRepository;
import com.spring.temp.domain.repository.MedicalRecordRepository;
import com.spring.temp.domain.repository.PatientRepository;
import com.spring.temp.domain.repository.UserPatientLinkRepository;
import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.exception.BadRequestException;
import com.spring.temp.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalAppointmentService {

    private final MedicalAppointmentRepository appointmentRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final UserPatientLinkRepository userPatientLinkRepository;
    private final com.spring.temp.domain.repository.DoctorLeaveRepository doctorLeaveRepository;
    private final com.spring.temp.domain.repository.DoctorScheduleRepository doctorScheduleRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Yêu cầu đăng nhập");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin tài khoản"));
    }

    private void checkProfileOwnership(HealthProfile profile, User user) {
        if (profile == null)
            return;
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        boolean isDoctor = user.getRoles().stream().anyMatch(r -> "ROLE_DOCTOR".equals(r.getName()));
        if (!isAdmin && !isDoctor && (profile.getUser() == null || !profile.getUser().getId().equals(user.getId()))) {
            throw new AccessDeniedException("Bạn không có quyền truy cập hồ sơ này");
        }
    }

    @Transactional
    public MedicalAppointmentResponse createAppointment(MedicalAppointmentRequest request) {
        User currentUser = getCurrentUser();

        // 1. Kiểm tra ngày hẹn (không ở quá khứ, tối đa MAX_BOOKING_DAYS = 30)
        LocalDateTime now = LocalDateTime.now();
        if (request.getAppointmentTime() == null) {
            throw new BadRequestException("Thời gian hẹn khám không được để trống!");
        }
        if (request.getAppointmentTime().isBefore(now.minusMinutes(5))) {
            throw new BadRequestException("Thời gian hẹn khám phải từ thời điểm hiện tại trở đi!");
        }
        if (request.getAppointmentTime().isAfter(now.plusDays(30))) {
            throw new BadRequestException("Chỉ được đặt lịch hẹn tối đa trước 30 ngày kể từ hôm nay!");
        }

        // 2. Chống đặt vào ngày bác sĩ đăng ký nghỉ phép hoặc trùng ca
        if (request.getDoctorId() != null && request.getAppointmentTime() != null) {
            LocalDate apptDate = request.getAppointmentTime().toLocalDate();
            if (doctorLeaveRepository.existsByDoctorIdAndLeaveDate(request.getDoctorId(), apptDate)) {
                throw new BadRequestException("Bác sĩ đã đăng ký nghỉ vào ngày " + apptDate + ". Vui lòng chọn ngày khác!");
            }

            // Đồng bộ kiểm tra ca làm việc theo tuần (Weekly Shifts: Sáng / Chiều)
            String dayOfWeekName = apptDate.getDayOfWeek().name();
            Optional<com.spring.temp.domain.model.DoctorSchedule> scheduleOpt = doctorScheduleRepository.findByDoctorIdAndDayOfWeek(request.getDoctorId(), dayOfWeekName);
            if (scheduleOpt.isPresent()) {
                com.spring.temp.domain.model.DoctorSchedule schedule = scheduleOpt.get();
                if (!schedule.isActive()) {
                    throw new BadRequestException("Bác sĩ không có lịch tiếp nhận bệnh nhân vào ngày " + apptDate + "!");
                }
                int hour = request.getAppointmentTime().getHour();
                boolean isMorning = hour < 12;
                if (isMorning && !schedule.isMorningShift()) {
                    throw new BadRequestException("Bác sĩ không tiếp nhận khám ca sáng vào ngày " + apptDate + ". Vui lòng chọn ca chiều hoặc ngày khác!");
                }
                if (!isMorning && !schedule.isAfternoonShift()) {
                    throw new BadRequestException("Bác sĩ không tiếp nhận khám ca chiều vào ngày " + apptDate + ". Vui lòng chọn ca sáng hoặc ngày khác!");
                }
            }

            long collisions = appointmentRepository.countSlotCollisions(request.getDoctorId(),
                    request.getAppointmentTime());
            if (collisions > 0) {
                throw new BadRequestException("Bác sĩ đã có lịch hẹn ở khung giờ này. Vui lòng chọn khung giờ khác!");
            }
        }

        // 3. Liên kết bệnh nhân MRN (ưu tiên patientId hoặc hồ sơ MRN đã liên kết)
        Patient patient = null;
        if (request.getPatientId() != null) {
            patient = patientRepository.findById(request.getPatientId()).orElse(null);
        }
        if (patient == null) {
            Optional<UserPatientLink> linkOpt = userPatientLinkRepository.findByUserId(currentUser.getId());
            if (linkOpt.isPresent()) {
                patient = linkOpt.get().getPatient();
            }
        }

        // 4. Liên kết profile cũ (nếu có)
        HealthProfile profile = null;
        if (request.getProfileId() != null) {
            profile = healthProfileRepository.findById(request.getProfileId()).orElse(null);
            if (profile != null) {
                checkProfileOwnership(profile, currentUser);
            }
        }

        MedicalRecord record = null;
        if (request.getMedicalRecordId() != null) {
            record = medicalRecordRepository.findById(request.getMedicalRecordId()).orElse(null);
        }

        // Bác sĩ phụ trách nếu có doctorId
        User attendingDoctor = null;
        if (request.getDoctorId() != null) {
            attendingDoctor = userRepository.findById(request.getDoctorId()).orElse(null);
        }

        String phone = request.getPatientPhone() != null && !request.getPatientPhone().isBlank()
                ? request.getPatientPhone().trim()
                : (patient != null && patient.getPhone() != null ? patient.getPhone()
                        : (profile != null && profile.getEmergencyContactPhone() != null
                                ? profile.getEmergencyContactPhone()
                                : currentUser.getPhone()));

        MedicalAppointment appointment = MedicalAppointment.builder()
                .profile(profile)
                .patient(patient)
                .doctor(attendingDoctor)
                .medicalRecord(record)
                .title(request.getTitle())
                .facilityName(request.getFacilityName())
                .doctorName(request.getDoctorName())
                .doctorId(request.getDoctorId())
                .patientPhone(phone)
                .appointmentTime(request.getAppointmentTime())
                .appointmentType(request.getAppointmentType())
                .status(request.getStatus() != null ? request.getStatus() : AppointmentStatus.PENDING)
                .reminderEnabled(request.getReminderEnabled() != null ? request.getReminderEnabled() : true)
                .notes(request.getNotes())
                .doctorNote(null) // Bệnh nhân không được tự điền ghi chú của bác sĩ
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
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        boolean isDoctor = currentUser.getRoles().stream().anyMatch(r -> "ROLE_DOCTOR".equals(r.getName()));

        if (isAdmin) {
            return appointmentRepository.findAllByOrderByAppointmentTimeAsc()
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        if (isDoctor) {
            String doctorLastName = currentUser.getLastName() != null ? currentUser.getLastName()
                    : currentUser.fullName();
            return appointmentRepository.findByDoctorIdOrDoctorName(currentUser.getId(), doctorLastName)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Bệnh nhân: Tìm theo bệnh nhân MRN liên kết hoặc profile cũ
        Optional<UserPatientLink> linkOpt = userPatientLinkRepository.findByUserId(currentUser.getId());
        if (linkOpt.isPresent()) {
            return appointmentRepository.findByPatientIdOrderByAppointmentTimeDesc(linkOpt.get().getPatient().getId())
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        List<HealthProfile> userProfiles = healthProfileRepository.findByUserIdAndDeletedFalse(currentUser.getId());
        if (!userProfiles.isEmpty()) {
            List<Long> profileIds = userProfiles.stream().map(HealthProfile::getId).collect(Collectors.toList());
            return appointmentRepository.findByProfileIdInOrderByAppointmentTimeAsc(profileIds)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return List.of();
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
            return appointmentRepository.findByProfileIdOrderByAppointmentTimeAsc(profileId)
                    .stream()
                    .filter(this::isUpcoming)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        boolean isDoctor = currentUser.getRoles().stream().anyMatch(r -> "ROLE_DOCTOR".equals(r.getName()));

        List<MedicalAppointment> list;
        if (isAdmin) {
            list = appointmentRepository.findAllByOrderByAppointmentTimeAsc();
        } else if (isDoctor) {
            String doctorLastName = currentUser.getLastName() != null ? currentUser.getLastName()
                    : currentUser.fullName();
            list = appointmentRepository.findByDoctorIdOrDoctorName(currentUser.getId(), doctorLastName);
        } else {
            Optional<UserPatientLink> linkOpt = userPatientLinkRepository.findByUserId(currentUser.getId());
            if (linkOpt.isPresent()) {
                list = appointmentRepository
                        .findByPatientIdOrderByAppointmentTimeDesc(linkOpt.get().getPatient().getId());
            } else {
                List<HealthProfile> userProfiles = healthProfileRepository
                        .findByUserIdAndDeletedFalse(currentUser.getId());
                if (userProfiles.isEmpty()) {
                    return List.of();
                }
                List<Long> profileIds = userProfiles.stream().map(HealthProfile::getId).collect(Collectors.toList());
                list = appointmentRepository.findByProfileIdInOrderByAppointmentTimeAsc(profileIds);
            }
        }

        return list.stream()
                .filter(this::isUpcoming)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean isUpcoming(MedicalAppointment a) {
        return a.getStatus() == AppointmentStatus.PENDING ||
                a.getStatus() == AppointmentStatus.CONFIRMED ||
                a.getStatus() == AppointmentStatus.SCHEDULED ||
                a.getStatus() == AppointmentStatus.RESCHEDULED;
    }

    @Transactional
    public MedicalAppointmentResponse updateStatus(Long id, AppointmentStatus status) {
        User currentUser = getCurrentUser();
        MedicalAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn"));

        boolean isDoctor = currentUser.getRoles().stream().anyMatch(r -> "ROLE_DOCTOR".equals(r.getName()));
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));

        // 1. RÀNG BUỘC MÁY TRẠNG THÁI: CANCELLED và COMPLETED là trạng thái đóng
        if (appointment.getStatus() == AppointmentStatus.CANCELLED && status != AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Lịch hẹn đã bị hủy trước đó, không thể chuyển sang trạng thái " + status);
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED && status != AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Lịch hẹn đã hoàn tất khám, không thể chuyển sang trạng thái " + status);
        }

        if (!isDoctor && !isAdmin) {
            if (appointment.getProfile() != null) {
                checkProfileOwnership(appointment.getProfile(), currentUser);
            }
            if (status != AppointmentStatus.CANCELLED) {
                throw new AccessDeniedException(
                        "Bệnh nhân chỉ có quyền hủy lịch hẹn, không được tự ý đổi sang trạng thái khác!");
            }
            // Cho phép người bệnh hủy khi lịch đang ở PENDING, CONFIRMED, SCHEDULED hoặc RESCHEDULED
            if (appointment.getStatus() != AppointmentStatus.PENDING
                    && appointment.getStatus() != AppointmentStatus.CONFIRMED
                    && appointment.getStatus() != AppointmentStatus.SCHEDULED
                    && appointment.getStatus() != AppointmentStatus.RESCHEDULED) {
                throw new BadRequestException("Không thể hủy lịch hẹn đã hoàn thành hoặc đã bị hủy trước đó!");
            }
            if (appointment.getAppointmentTime() != null
                    && appointment.getAppointmentTime().isBefore(LocalDateTime.now().plusHours(2))) {
                throw new BadRequestException("Chỉ được hủy lịch hẹn trước giờ khám tối thiểu 2 tiếng!");
            }
        }

        appointment.setStatus(status);
        MedicalAppointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Transactional
    public MedicalAppointmentResponse handleDoctorAction(Long appointmentId, DoctorAppointmentActionRequest request) {
        User currentUser = getCurrentUser();
        boolean isDoctor = currentUser.getRoles().stream().anyMatch(r -> "ROLE_DOCTOR".equals(r.getName()));
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        if (!isDoctor && !isAdmin) {
            throw new AccessDeniedException(
                    "Chỉ Bác sĩ hoặc Quản trị viên mới có quyền tiếp nhận/xử lý lịch hẹn khám!");
        }

        MedicalAppointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn ID: " + appointmentId));

        // 1. IDOR DEFENSE: Bác sĩ chỉ được thao tác trên lịch hẹn của chính mình
        if (!isAdmin) {
            boolean isAssigned = false;
            if (appointment.getDoctor() != null && appointment.getDoctor().getId().equals(currentUser.getId())) {
                isAssigned = true;
            } else if (appointment.getDoctorId() != null && appointment.getDoctorId().equals(currentUser.getId())) {
                isAssigned = true;
            } else if (appointment.getDoctorName() != null && currentUser.getLastName() != null
                    && appointment.getDoctorName().toLowerCase().contains(currentUser.getLastName().toLowerCase().trim())) {
                isAssigned = true;
            } else if (appointment.getDoctor() == null && appointment.getDoctorId() == null) {
                // Tiếp nhận ca mới chưa gán bác sĩ
                appointment.setDoctor(currentUser);
                appointment.setDoctorId(currentUser.getId());
                appointment.setDoctorName(currentUser.fullName());
                isAssigned = true;
            }

            if (!isAssigned) {
                throw new AccessDeniedException("Từ chối quyền: Bạn không có quyền thao tác trên lịch hẹn của Bác sĩ khác!");
            }
        }

        // 2. MÁY TRẠNG THÁI: Chặn thao tác trên lịch đã kết thúc
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Lịch hẹn này đã bị hủy trước đó, không thể tiếp tục xử lý!");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Lịch hẹn này đã hoàn tất khám bệnh, không thể tiếp tục xử lý!");
        }

        String action = request.getAction() != null ? request.getAction().toUpperCase() : "CONFIRM";

        if ("CONFIRM".equals(action)) {
            appointment.setStatus(AppointmentStatus.CONFIRMED);
        } else if ("RESCHEDULE".equals(action)) {
            if (request.getRescheduledTime() == null) {
                throw new BadRequestException("Vui lòng cung cấp ngày giờ hẹn mới khi chọn đổi lịch!");
            }
            if (request.getRescheduledTime().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Thời gian hẹn mới không thể ở trong quá khứ!");
            }
            if (request.getRescheduledTime().isAfter(LocalDateTime.now().plusDays(30))) {
                throw new BadRequestException("Thời gian hẹn mới không được vượt quá 30 ngày (MAX_BOOKING_DAYS = 30)!");
            }
            appointment.setStatus(AppointmentStatus.RESCHEDULED);
            appointment.setAppointmentTime(request.getRescheduledTime());
            appointment.setRescheduledTime(request.getRescheduledTime());
        } else if ("REJECT".equals(action) || "CANCEL".equals(action)) {
            if (request.getDoctorNote() == null || request.getDoctorNote().trim().isEmpty()) {
                throw new BadRequestException("Vui lòng nhập lý do từ chối lịch hẹn để thông báo cho bệnh nhân!");
            }
            appointment.setStatus(AppointmentStatus.CANCELLED);
        }

        if (request.getDoctorNote() != null && !request.getDoctorNote().isBlank()) {
            appointment.setDoctorNote(request.getDoctorNote().trim());
        }

        MedicalAppointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        User currentUser = getCurrentUser();
        MedicalAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn"));
        if (appointment.getProfile() != null) {
            checkProfileOwnership(appointment.getProfile(), currentUser);
        }

        appointmentRepository.delete(appointment);
    }

    private MedicalAppointmentResponse mapToResponse(MedicalAppointment a) {
        HealthProfile p = a.getProfile();
        Patient pt = a.getPatient();
        return MedicalAppointmentResponse.builder()
                .id(a.getId())
                .profileId(p != null ? p.getId() : null)
                .profileFullName(pt != null ? pt.getFullName() : (p != null ? p.getFullName() : "Bệnh nhân"))
                .patientPhone(a.getPatientPhone() != null ? a.getPatientPhone()
                        : (pt != null && pt.getPhone() != null ? pt.getPhone()
                                : (p != null && p.getPhone() != null ? p.getPhone()
                                        : (p != null ? p.getEmergencyContactPhone() : null))))
                .patientGender(pt != null && pt.getGender() != null ? pt.getGender().name()
                        : (p != null && p.getGender() != null ? p.getGender().name() : null))
                .patientDob(pt != null ? pt.getDateOfBirth() : (p != null ? p.getDateOfBirth() : null))
                .medicalRecordId(a.getMedicalRecord() != null ? a.getMedicalRecord().getId() : null)
                .medicalRecordCode(a.getMedicalRecord() != null ? a.getMedicalRecord().getMedicalRecordCode() : null)
                .title(a.getTitle())
                .facilityName(a.getFacilityName())
                .doctorName(a.getDoctorName())
                .doctorId(a.getDoctorId())
                .appointmentTime(a.getAppointmentTime())
                .rescheduledTime(a.getRescheduledTime())
                .appointmentType(a.getAppointmentType())
                .status(a.getStatus())
                .reminderEnabled(a.getReminderEnabled())
                .notes(a.getNotes())
                .doctorNote(a.getDoctorNote())
                .build();
    }
}
