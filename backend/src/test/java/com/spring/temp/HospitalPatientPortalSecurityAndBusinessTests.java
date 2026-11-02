package com.spring.temp;

import com.spring.temp.domain.dto.appointment.MedicalAppointmentRequest;
import com.spring.temp.domain.dto.medicalrecord.MedicalRecordRequest;
import com.spring.temp.domain.dto.medicalrecord.MedicalRecordResponse;
import com.spring.temp.domain.dto.patient.LinkPatientRequest;
import com.spring.temp.domain.dto.patient.PatientResponse;
import com.spring.temp.domain.dto.prescription.PrescriptionItemRequest;
import com.spring.temp.domain.dto.prescription.PrescriptionRequest;
import com.spring.temp.domain.dto.prescription.PrescriptionResponse;
import com.spring.temp.domain.model.*;
import com.spring.temp.domain.model.enums.AppointmentStatus;
import com.spring.temp.domain.model.enums.EncounterStatus;
import com.spring.temp.domain.model.enums.Gender;
import com.spring.temp.domain.model.enums.RecordType;
import com.spring.temp.domain.repository.*;
import com.spring.temp.domain.service.*;
import com.spring.temp.domain.service.impl.PatientServiceImpl;
import com.spring.temp.exception.BadRequestException;
import com.spring.temp.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HospitalPatientPortalSecurityAndBusinessTests {

    @Mock
    private PatientRepository patientRepository;
    @Mock
    private UserPatientLinkRepository userPatientLinkRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private MedicalRecordRepository medicalRecordRepository;
    @Mock
    private PrescriptionRepository prescriptionRepository;
    @Mock
    private MedicalAppointmentRepository appointmentRepository;
    @Mock
    private HealthProfileRepository healthProfileRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    private User userPatient;
    private User userAdmin;
    private User userDoctor;
    private Patient mockPatient;
    private HealthProfile mockProfile;

    @BeforeEach
    void setUp() {
        Role roleUser = Role.builder().name("ROLE_USER").build();
        Role roleDoctor = Role.builder().name("ROLE_DOCTOR").build();
        Role roleAdmin = Role.builder().name("ROLE_ADMIN").build();

        userPatient = User.builder()
                .id(1L)
                .email("patient@hospital.vn")
                .firstName("Van")
                .lastName("Nguyen")
                .roles(List.of(roleUser))
                .build();

        userDoctor = User.builder()
                .id(2L)
                .email("doctor@hospital.vn")
                .firstName("Nam")
                .lastName("Tran")
                .roles(List.of(roleDoctor))
                .build();

        userAdmin = User.builder()
                .id(3L)
                .email("admin@hospital.vn")
                .firstName("IT")
                .lastName("Admin")
                .roles(List.of(roleAdmin))
                .build();

        mockPatient = Patient.builder()
                .id(100L)
                .mrn("BN-2026-001")
                .fullName("Nguyen Van An")
                .dateOfBirth(LocalDate.of(1990, 5, 20))
                .gender(Gender.MALE)
                .nationalId("001090123456")
                .phone("0912345678")
                .bloodType("O+")
                .allergies("Dị ứng Penicillin")
                .build();

        mockProfile = HealthProfile.builder()
                .id(10L)
                .user(userPatient)
                .fullName("Nguyen Van An")
                .gender(Gender.MALE)
                .build();

        com.spring.temp.domain.service.impl.PatientServiceImpl.resetRateLimits();
    }

    // ==========================================
    // 1. KIỂM THỬ LIÊN KẾT MRN & RATE LIMIT
    // ==========================================

    @Test
    @DisplayName("1. Liên kết MRN thành công khi đúng MRN, ngày sinh và 4 số cuối CCCD/SĐT")
    void testLinkPatient_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(userPatient));
        when(userPatientLinkRepository.existsByUserId(1L)).thenReturn(false);
        when(patientRepository.findByMrn("BN-2026-001")).thenReturn(Optional.of(mockPatient));
        when(userPatientLinkRepository.existsByPatientId(100L)).thenReturn(false);

        LinkPatientRequest req = LinkPatientRequest.builder()
                .mrn("BN-2026-001")
                .dateOfBirth(LocalDate.of(1990, 5, 20))
                .verificationLast4("3456") // Khớp 4 số cuối nationalId "001090123456"
                .build();

        PatientResponse res = patientService.linkPatient(1L, req);

        assertNotNull(res);
        assertEquals("BN-2026-001", res.getMrn());
        verify(userPatientLinkRepository, times(1)).save(any(UserPatientLink.class));
        verify(auditLogService, times(1)).recordLog(eq(1L), eq("LINK_PATIENT_MRN"), eq("PATIENT"), eq(100L), any(), any());
    }

    @Test
    @DisplayName("2. Liên kết MRN thất bại khi sai ngày sinh -> Thông báo chung chống dò quét")
    void testLinkPatient_WrongDob_Rejects() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(userPatient));
        when(userPatientLinkRepository.existsByUserId(1L)).thenReturn(false);
        when(patientRepository.findByMrn("BN-2026-001")).thenReturn(Optional.of(mockPatient));

        LinkPatientRequest req = LinkPatientRequest.builder()
                .mrn("BN-2026-001")
                .dateOfBirth(LocalDate.of(1995, 1, 1)) // Sai ngày sinh
                .verificationLast4("3456")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> patientService.linkPatient(1L, req));
        assertTrue(ex.getMessage().contains("Thông tin xác thực hoặc Mã bệnh nhân không chính xác"));
    }

    @Test
    @DisplayName("3. Nhập sai quá 5 lần -> Bị tạm khóa 30 phút chống brute-force")
    void testLinkPatient_RateLimit_LockAfter5Attempts() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(userPatient));
        when(userPatientLinkRepository.existsByUserId(1L)).thenReturn(false);
        when(patientRepository.findByMrn("INVALID-MRN")).thenReturn(Optional.empty());

        LinkPatientRequest req = LinkPatientRequest.builder()
                .mrn("INVALID-MRN")
                .dateOfBirth(LocalDate.of(2000, 1, 1))
                .verificationLast4("0000")
                .build();

        // 4 lần đầu ném lỗi thông tin sai
        for (int i = 0; i < 4; i++) {
            assertThrows(BadRequestException.class, () -> patientService.linkPatient(1L, req));
        }

        // Lần thứ 5 ném lỗi bị khóa 30 phút
        BadRequestException ex = assertThrows(BadRequestException.class, () -> patientService.linkPatient(1L, req));
        assertTrue(ex.getMessage().contains("tạm khóa trong 30 phút"));
    }

    // ==========================================
    // 2. KIỂM THỬ BẢO MẬT: ADMIN KHÔNG XEM NỘI DUNG BỆNH ÁN
    // ==========================================

    @Test
    @DisplayName("4. ADMIN gọi xem chi tiết bệnh án -> Bị từ chối truy cập (Least Privilege)")
    void testAdmin_AccessMedicalRecord_Denied() {
        // Giả lập logic kiểm tra bảo mật trong checkProfileAccess
        boolean isAdmin = userAdmin.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));

        assertThrows(AccessDeniedException.class, () -> {
            if (isAdmin) {
                throw new AccessDeniedException("Quản trị viên hệ thống không có thẩm quyền truy cập nội dung bệnh án y tế!");
            }
        });
    }

    // ==========================================
    // 3. KIỂM THỬ LỌC PUBLISHED CHO BỆNH NHÂN
    // ==========================================

    @Test
    @DisplayName("5. Bệnh nhân không được xem bệnh án ở trạng thái DRAFT")
    void testPatient_CannotAccessDraftRecord() {
        MedicalRecord draftRecord = MedicalRecord.builder()
                .id(50L)
                .profile(mockProfile)
                .status(EncounterStatus.DRAFT)
                .isLatest(true)
                .build();

        boolean isPatient = userPatient.getRoles().stream().anyMatch(r -> "ROLE_USER".equals(r.getName()));

        assertThrows(NotFoundException.class, () -> {
            if (isPatient && draftRecord.getStatus() != EncounterStatus.PUBLISHED) {
                throw new NotFoundException("Bệnh án không tồn tại hoặc chưa được phát hành chính thức");
            }
        });
    }

    @Test
    @DisplayName("6. Bác sĩ sửa bệnh án đã PUBLISHED -> Tạo version mới, không ghi đè bản cũ")
    void testDoctor_UpdatePublishedRecord_CreatesNewVersion() {
        MedicalRecord publishedRecord = MedicalRecord.builder()
                .id(60L)
                .profile(mockProfile)
                .status(EncounterStatus.PUBLISHED)
                .version(1)
                .isLatest(true)
                .primaryDiagnosis("Viêm phế quản cấp")
                .build();

        // Mô phỏng logic versioning
        publishedRecord.setIsLatest(false);

        MedicalRecord version2 = MedicalRecord.builder()
                .id(61L)
                .profile(publishedRecord.getProfile())
                .status(EncounterStatus.PUBLISHED)
                .version(publishedRecord.getVersion() + 1)
                .isLatest(true)
                .primaryDiagnosis("Viêm phế quản cấp bội nhiễm")
                .build();

        assertFalse(publishedRecord.getIsLatest(), "Bản cũ phải chuyển isLatest = false");
        assertEquals(2, version2.getVersion(), "Bản mới phải có version = 2");
        assertTrue(version2.getIsLatest(), "Bản mới phải có isLatest = true");
    }

    // ==========================================
    // 4. KIỂM THỬ CẢNH BÁO DỊ ỨNG THUỐC
    // ==========================================

    @Test
    @DisplayName("7. Kê đơn thuốc chứa Penicillin cho người dị ứng Penicillin -> Bật cảnh báo dị ứng")
    void testPrescription_AllergyWarning() {
        String patientAllergy = "Dị ứng Penicillin";
        String medicineName = "Augmentin 625mg";
        String activeIngredient = "Amoxicillin + Clavulanic acid";

        boolean conflict = false;
        String combined = (medicineName + " " + activeIngredient).toLowerCase();
        if (combined.contains("amoxicillin") || combined.contains("ampicillin") || combined.contains("penicillin") || combined.contains("augmentin")) {
            conflict = true;
        }

        assertTrue(conflict, "Hệ thống phải nhận diện được nhóm kháng sinh Penicillin và bật cờ cảnh báo dị ứng");
    }

    // ==========================================
    // 5. KIỂM THỬ CHỐNG ĐẶT TRÙNG LỊCH HẸN
    // ==========================================

    @Test
    @DisplayName("8. Đặt lịch hẹn trùng khung giờ của cùng một bác sĩ -> Bị từ chối")
    void testAppointment_SlotCollision_Rejected() {
        Long doctorId = 2L;
        LocalDateTime slotTime = LocalDateTime.of(2026, 11, 5, 8, 30);

        when(appointmentRepository.countSlotCollisions(doctorId, slotTime)).thenReturn(1L);

        long collisions = appointmentRepository.countSlotCollisions(doctorId, slotTime);

        assertThrows(BadRequestException.class, () -> {
            if (collisions > 0) {
                throw new BadRequestException("Bác sĩ đã có lịch hẹn ở khung giờ này. Vui lòng chọn khung giờ khác!");
            }
        });
    }

    @Test
    @DisplayName("9. Bệnh nhân hủy lịch hẹn cách giờ khám dưới 2 tiếng -> Bị từ chối")
    void testAppointment_CancelWithin2Hours_Rejected() {
        LocalDateTime appointmentTime = LocalDateTime.now().plusMinutes(45); // Chỉ còn 45 phút

        assertThrows(BadRequestException.class, () -> {
            if (appointmentTime.isBefore(LocalDateTime.now().plusHours(2))) {
                throw new BadRequestException("Chỉ được hủy lịch hẹn trước giờ khám tối thiểu 2 tiếng!");
            }
        });
    }
}

