package com.spring.temp.domain.service;

import com.spring.temp.domain.dto.clinical.*;
import com.spring.temp.domain.mapper.ClinicalInvestigationMapper;
import com.spring.temp.domain.model.*;
import com.spring.temp.domain.model.enums.EncounterStatus;
import com.spring.temp.domain.repository.*;
import com.spring.temp.exception.BadRequestException;
import com.spring.temp.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClinicalInvestigationService {

    private final LabTestResultRepository labTestResultRepository;
    private final ImagingResultRepository imagingResultRepository;
    private final MedicalAttachmentRepository medicalAttachmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ClinicalInvestigationMapper mapper;
    private final AuditLogService auditLogService;

    // Quản lý Signed Access Ticket có thời hạn 15 phút
    public static class FileTicketInfo {
        public Long attachmentId;
        public Long userId;
        public LocalDateTime expireAt;
    }
    private static final Map<String, FileTicketInfo> ticketStore = new ConcurrentHashMap<>();

    // ==========================================
    // 1. KẾT QUẢ XÉT NGHIỆM (LAB TEST RESULTS)
    // ==========================================

    @Transactional
    public LabTestResultResponse addLabTest(LabTestResultRequest request, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(request.getMedicalRecordId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + request.getMedicalRecordId()));

        checkProfileAccess(record.getProfile(), user);

        LabTestResult labTest = mapper.toLabTestEntity(request);
        labTest.setMedicalRecord(record);

        LabTestResult saved = labTestResultRepository.save(labTest);
        log.info("Added lab test id={}, name='{}' for record id={}", saved.getId(), saved.getTestName(), record.getId());
        return mapper.toLabTestResponse(saved);
    }

    public List<LabTestResultResponse> getLabTestsByMedicalRecord(Long medicalRecordId, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + medicalRecordId));

        checkProfileAccess(record.getProfile(), user);

        if (isPatient(user) && record.getStatus() != EncounterStatus.PUBLISHED) {
            throw new NotFoundException("Kết quả xét nghiệm không tồn tại hoặc chưa được phát hành chính thức");
        }

        return labTestResultRepository.findByMedicalRecordId(medicalRecordId)
                .stream()
                .map(mapper::toLabTestResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteLabTest(Long id, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        LabTestResult labTest = labTestResultRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy kết quả xét nghiệm id=" + id));

        checkProfileAccess(labTest.getMedicalRecord().getProfile(), user);
        labTestResultRepository.delete(labTest);
        log.info("Deleted lab test id={}", id);
    }

    // ==========================================
    // 2. CHẨN ĐOÁN HÌNH ẢNH (IMAGING RESULTS)
    // ==========================================

    @Transactional
    public ImagingResultResponse addImagingResult(ImagingResultRequest request, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(request.getMedicalRecordId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + request.getMedicalRecordId()));

        checkProfileAccess(record.getProfile(), user);

        ImagingResult imaging = mapper.toImagingEntity(request);
        imaging.setMedicalRecord(record);

        ImagingResult saved = imagingResultRepository.save(imaging);
        log.info("Added imaging result id={}, modality='{}' for record id={}", 
                saved.getId(), saved.getImagingModality(), record.getId());
        return mapper.toImagingResponse(saved);
    }

    public List<ImagingResultResponse> getImagingResultsByMedicalRecord(Long medicalRecordId, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + medicalRecordId));

        checkProfileAccess(record.getProfile(), user);

        if (isPatient(user) && record.getStatus() != EncounterStatus.PUBLISHED) {
            throw new NotFoundException("Kết quả chẩn đoán hình ảnh không tồn tại hoặc chưa được phát hành chính thức");
        }

        return imagingResultRepository.findByMedicalRecordId(medicalRecordId)
                .stream()
                .map(mapper::toImagingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteImagingResult(Long id, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        ImagingResult imaging = imagingResultRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy kết quả CĐHA id=" + id));

        checkProfileAccess(imaging.getMedicalRecord().getProfile(), user);
        imagingResultRepository.delete(imaging);
        log.info("Deleted imaging result id={}", id);
    }

    // ==========================================
    // 3. TỆP ĐÍNH KÈM Y TẾ & SIGNED TICKET ACCESS
    // ==========================================

    @Transactional
    public MedicalAttachmentResponse addAttachment(MedicalAttachmentRequest request, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(request.getMedicalRecordId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + request.getMedicalRecordId()));

        checkProfileAccess(record.getProfile(), user);

        // Kiểm tra loại file an toàn y tế
        String fileType = request.getFileType() != null ? request.getFileType().toLowerCase() : "";
        if (!fileType.contains("pdf") && !fileType.contains("image") && !fileType.contains("jpeg") && !fileType.contains("png")) {
            throw new BadRequestException("Chỉ chấp nhận tệp định dạng PDF hoặc hình ảnh (PNG, JPG, JPEG)!");
        }

        // Giới hạn dung lượng tối đa 10MB (10 * 1024 * 1024 bytes)
        if (request.getFileSizeBytes() != null && request.getFileSizeBytes() > 10 * 1024 * 1024) {
            throw new BadRequestException("Dung lượng tệp đính kèm vượt quá giới hạn cho phép (tối đa 10MB)!");
        }

        MedicalAttachment attachment = mapper.toAttachmentEntity(request);
        attachment.setMedicalRecord(record);
        attachment.setUploadedByUserId(user.getId());
        attachment.setDeleted(false);

        MedicalAttachment saved = medicalAttachmentRepository.save(attachment);
        log.info("Added attachment id={}, file='{}' for record id={}", 
                saved.getId(), saved.getFileName(), record.getId());
        return mapper.toAttachmentResponse(saved);
    }

    public List<MedicalAttachmentResponse> getAttachmentsByMedicalRecord(Long medicalRecordId, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + medicalRecordId));

        checkProfileAccess(record.getProfile(), user);

        if (isPatient(user) && record.getStatus() != EncounterStatus.PUBLISHED) {
            throw new NotFoundException("Tệp cận lâm sàng không tồn tại hoặc chưa được phát hành chính thức");
        }

        return medicalAttachmentRepository.findByMedicalRecordIdAndDeletedFalse(medicalRecordId)
                .stream()
                .map(mapper::toAttachmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAttachment(Long id, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalAttachment attachment = medicalAttachmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tệp đính kèm id=" + id));

        checkProfileAccess(attachment.getMedicalRecord().getProfile(), user);
        attachment.setDeleted(true);
        medicalAttachmentRepository.save(attachment);
        log.info("Soft-deleted attachment id={}", id);
    }

    // Sinh Signed Ticket có thời hạn 15 phút
    public String generateAttachmentTicket(Long attachmentId, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalAttachment attachment = medicalAttachmentRepository.findByIdAndDeletedFalse(attachmentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tệp đính kèm id=" + attachmentId));

        checkProfileAccess(attachment.getMedicalRecord().getProfile(), user);

        if (isPatient(user) && attachment.getMedicalRecord().getStatus() != EncounterStatus.PUBLISHED) {
            throw new NotFoundException("Tệp cận lâm sàng chưa được phát hành chính thức");
        }

        String ticket = UUID.randomUUID().toString();
        FileTicketInfo info = new FileTicketInfo();
        info.attachmentId = attachmentId;
        info.userId = user.getId();
        info.expireAt = LocalDateTime.now().plusMinutes(15);
        ticketStore.put(ticket, info);

        auditLogService.recordLog(user.getId(), "GENERATE_FILE_TICKET", "CLINICAL_FILE", attachmentId, "127.0.0.1", "Cấp Ticket tải tệp có thời hạn 15 phút: " + attachment.getFileName());
        return ticket;
    }

    // Kiểm tra Ticket khi tải file
    public MedicalAttachment validateTicketAndGetAttachment(String ticket) {
        if (ticket == null || !ticketStore.containsKey(ticket)) {
            throw new AccessDeniedException("Ticket truy cập tệp không hợp lệ hoặc đã hết hạn!");
        }
        FileTicketInfo info = ticketStore.get(ticket);
        if (LocalDateTime.now().isAfter(info.expireAt)) {
            ticketStore.remove(ticket);
            throw new AccessDeniedException("Ticket truy cập tệp đã hết hạn sau 15 phút!");
        }

        return medicalAttachmentRepository.findByIdAndDeletedFalse(info.attachmentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tệp đính kèm"));
    }

    // ==========================================
    // HÀM TIỆN ÍCH KIỂM TRA BẢO MẬT
    // ==========================================

    private void checkProfileAccess(HealthProfile profile, User user) {
        if (isAdmin(user)) {
            throw new AccessDeniedException("Quản trị viên hệ thống (IT) không có thẩm quyền truy cập kết quả cận lâm sàng y tế!");
        }
        if (isDoctor(user)) {
            return;
        }
        if (!profile.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập hoặc chỉnh sửa thông tin này!");
        }
    }

    private boolean isAdmin(User user) {
        if (user.getRoles() == null) return false;
        return user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
    }

    private boolean isDoctor(User user) {
        if (user.getRoles() == null) return false;
        return user.getRoles().stream().anyMatch(r -> "ROLE_DOCTOR".equals(r.getName()));
    }

    private boolean isPatient(User user) {
        return !isDoctor(user) && !isAdmin(user);
    }

    private User getAuthenticatedUser(Principal connectedUser) {
        if (connectedUser == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                return (User) authentication.getPrincipal();
            }
            throw new AccessDeniedException("Người dùng chưa được xác thực!");
        }
        return (User) ((UsernamePasswordAuthenticationToken) connectedUser).getPrincipal();
    }
}
