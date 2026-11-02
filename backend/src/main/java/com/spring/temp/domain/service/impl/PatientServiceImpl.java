package com.spring.temp.domain.service.impl;

import com.spring.temp.domain.dto.patient.CreatePatientRequest;
import com.spring.temp.domain.dto.patient.LinkPatientRequest;
import com.spring.temp.domain.dto.patient.PatientResponse;
import com.spring.temp.domain.model.Patient;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.model.UserPatientLink;
import com.spring.temp.domain.repository.PatientRepository;
import com.spring.temp.domain.repository.UserPatientLinkRepository;
import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.domain.service.AuditLogService;
import com.spring.temp.domain.service.PatientService;
import com.spring.temp.exception.BadRequestException;
import com.spring.temp.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserPatientLinkRepository userPatientLinkRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    // Bộ nhớ kiểm soát chống brute-force (Rate Limiting 5 lần sai -> Khóa 30 phút)
    private static class AttemptCounter {
        int count = 0;
        LocalDateTime lockedUntil = null;
    }
    private static final Map<Long, AttemptCounter> userAttemptMap = new ConcurrentHashMap<>();

    public static void resetRateLimits() {
        userAttemptMap.clear();
    }

    @Override
    @Transactional
    public PatientResponse linkPatient(Long userId, LinkPatientRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tài khoản người dùng"));

        if (userPatientLinkRepository.existsByUserId(userId)) {
            throw new BadRequestException("Tài khoản này đã được liên kết với một hồ sơ bệnh nhân!");
        }

        // Kiểm tra số lần nhập sai
        AttemptCounter counter = userAttemptMap.computeIfAbsent(userId, k -> new AttemptCounter());
        if (counter.lockedUntil != null) {
            if (LocalDateTime.now().isBefore(counter.lockedUntil)) {
                throw new BadRequestException("Bạn đã nhập sai thông tin quá 5 lần. Tính năng liên kết bị tạm khóa để bảo vệ hồ sơ đến: "
                        + counter.lockedUntil.toLocalTime().toString().substring(0, 5));
            } else {
                // Hết thời gian phạt -> reset
                counter.count = 0;
                counter.lockedUntil = null;
            }
        }

        String mrn = request.getMrn() != null ? request.getMrn().trim().toUpperCase() : "";
        Optional<Patient> optPatient = patientRepository.findByMrn(mrn);

        // Kiểm tra khớp 3 tiêu chí: MRN + Ngày sinh + 4 số cuối CCCD hoặc SĐT
        boolean verified = false;
        Patient patient = null;

        if (optPatient.isPresent()) {
            patient = optPatient.get();
            boolean dobMatch = request.getDateOfBirth() != null && request.getDateOfBirth().equals(patient.getDateOfBirth());
            String last4 = request.getVerificationLast4() != null ? request.getVerificationLast4().trim() : "";
            
            boolean cccdMatch = patient.getNationalId() != null && patient.getNationalId().endsWith(last4);
            boolean phoneMatch = patient.getPhone() != null && patient.getPhone().endsWith(last4);

            if (dobMatch && (cccdMatch || phoneMatch)) {
                verified = true;
            }
        }

        if (!verified) {
            counter.count++;
            if (counter.count >= 5) {
                counter.lockedUntil = LocalDateTime.now().plusMinutes(30);
                auditLogService.recordLog(userId, "LINK_PATIENT_LOCKED", "PATIENT", null, "127.0.0.1", "Tài khoản bị khóa 30 phút do nhập sai thông tin liên kết 5 lần");
                throw new BadRequestException("Bạn đã nhập sai thông tin quá 5 lần. Tính năng liên kết bị tạm khóa trong 30 phút!");
            }
            // Thông báo chung để chống dò quét sự tồn tại của MRN
            throw new BadRequestException("Thông tin xác thực hoặc Mã bệnh nhân không chính xác. Vui lòng kiểm tra lại!");
        }

        // Kiểm tra xem hồ sơ này đã có ai liên kết chưa
        if (userPatientLinkRepository.existsByPatientId(patient.getId())) {
            throw new BadRequestException("Hồ sơ bệnh nhân này đã được liên kết với một tài khoản khác trong hệ thống!");
        }

        // Thành công: Xóa đếm lỗi
        userAttemptMap.remove(userId);

        UserPatientLink link = UserPatientLink.builder()
                .user(user)
                .patient(patient)
                .build();
        userPatientLinkRepository.save(link);

        auditLogService.recordLog(userId, "LINK_PATIENT_MRN", "PATIENT", patient.getId(), "127.0.0.1", "Liên kết tài khoản thành công với bệnh nhân MRN: " + mrn);

        return mapToResponse(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getLinkedPatient(Long userId) {
        return userPatientLinkRepository.findByUserId(userId)
                .map(link -> mapToResponse(link.getPatient()))
                .orElse(null);
    }

    @Override
    @Transactional
    public void unlinkPatient(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người dùng"));

        UserPatientLink link = userPatientLinkRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Tài khoản chưa liên kết với hồ sơ bệnh nhân nào"));

        Long patientId = link.getPatient().getId();
        userPatientLinkRepository.delete(link);

        auditLogService.recordLog(userId, "UNLINK_PATIENT_MRN", "PATIENT", patientId, "127.0.0.1", "Gỡ liên kết hồ sơ bệnh nhân khỏi tài khoản");
    }

    @Override
    @Transactional
    public PatientResponse createPatient(CreatePatientRequest request) {
        String mrn = request.getMrn().trim().toUpperCase();
        if (patientRepository.existsByMrn(mrn)) {
            throw new BadRequestException("Mã bệnh nhân MRN '" + mrn + "' đã tồn tại trong hệ thống");
        }

        Patient patient = Patient.builder()
                .mrn(mrn)
                .fullName(request.getFullName().trim())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .nationalId(request.getNationalId())
                .phone(request.getPhone())
                .bloodType(request.getBloodType())
                .allergies(request.getAllergies())
                .address(request.getAddress())
                .build();

        Patient saved = patientRepository.save(patient);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientByMrn(String mrn) {
        return patientRepository.findByMrn(mrn.trim().toUpperCase())
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bệnh nhân với MRN: " + mrn));
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        return patientRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ bệnh nhân ID: " + id));
    }

    private PatientResponse mapToResponse(Patient p) {
        return PatientResponse.builder()
                .id(p.getId())
                .mrn(p.getMrn())
                .fullName(p.getFullName())
                .dateOfBirth(p.getDateOfBirth())
                .gender(p.getGender())
                .nationalId(p.getNationalId())
                .phone(p.getPhone())
                .bloodType(p.getBloodType())
                .allergies(p.getAllergies())
                .address(p.getAddress())
                .build();
    }
}
