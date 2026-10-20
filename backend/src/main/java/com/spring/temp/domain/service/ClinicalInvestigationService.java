package com.spring.temp.domain.service;

import com.spring.temp.domain.dto.clinical.*;
import com.spring.temp.domain.mapper.ClinicalInvestigationMapper;
import com.spring.temp.domain.model.*;
import com.spring.temp.domain.repository.*;
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
import java.util.List;
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
    // 3. TỆP ĐÍNH KÈM Y TẾ (ATTACHMENTS)
    // ==========================================

    @Transactional
    public MedicalAttachmentResponse addAttachment(MedicalAttachmentRequest request, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(request.getMedicalRecordId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + request.getMedicalRecordId()));

        checkProfileAccess(record.getProfile(), user);

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

    // ==========================================
    // HÀM TIỆN ÍCH KIỂM TRA BẢO MẬT
    // ==========================================

    private void checkProfileAccess(HealthProfile profile, User user) {
        if (!profile.getUser().getId().equals(user.getId()) && !isAdminOrDoctor(user)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập hoặc chỉnh sửa thông tin này!");
        }
    }

    private boolean isAdminOrDoctor(User user) {
        if (user.getRoles() == null) return false;
        return user.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_DOCTOR".equals(r.getName()));
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
