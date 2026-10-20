package com.spring.temp.domain.service;

import com.spring.temp.domain.dto.common.PageResponse;
import com.spring.temp.domain.dto.prescription.*;
import com.spring.temp.domain.mapper.PrescriptionMapper;
import com.spring.temp.domain.model.*;
import com.spring.temp.domain.repository.*;
import com.spring.temp.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicineCatalogRepository medicineCatalogRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final PrescriptionMapper mapper;

    // ==========================================
    // 1. TRA CỨU DANH MỤC THUỐC (YÊU CẦU 8.3)
    // ==========================================

    public PageResponse<MedicineCatalogDto> searchMedicineCatalog(String query, Pageable pageable) {
        Page<MedicineCatalog> page;
        if (query != null && !query.isBlank()) {
            page = medicineCatalogRepository
                    .findByBrandNameContainingIgnoreCaseOrActiveIngredientContainingIgnoreCase(
                            query.trim(), query.trim(), pageable);
        } else {
            page = medicineCatalogRepository.findAll(pageable);
        }
        return PageResponse.of(page.map(mapper::toCatalogDto));
    }

    // ==========================================
    // 2. KÊ ĐƠN THUỐC & CẢNH BÁO DỊ ỨNG CHÉO (8.1, 8.2, 8.4)
    // ==========================================

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(request.getMedicalRecordId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + request.getMedicalRecordId()));

        HealthProfile profile = record.getProfile();
        checkProfileAccess(profile, user);

        Prescription prescription = mapper.toEntity(request);
        prescription.setMedicalRecord(record);
        prescription.setDeleted(false);

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Lấy danh sách dị ứng của người bệnh để đối chiếu cảnh báo chéo (Yêu cầu 8.4)
        List<Allergy> patientAllergies = profile.getAllergies() != null 
                ? profile.getAllergies().stream().filter(a -> !a.isDeleted()).collect(Collectors.toList())
                : List.of();

        List<PrescriptionItem> savedItems = new ArrayList<>();
        List<String> allergyWarningMessages = new ArrayList<>();

        for (PrescriptionItemRequest itemReq : request.getItems()) {
            PrescriptionItem item = mapper.toItemEntity(itemReq);
            item.setPrescription(savedPrescription);

            if (itemReq.getMedicineId() != null) {
                medicineCatalogRepository.findById(itemReq.getMedicineId())
                        .ifPresent(item::setMedicine);
            }

            // Kiểm tra cảnh báo dị ứng thuốc chéo
            boolean allergyMatched = false;
            String matchedAllergen = null;
            for (Allergy allergy : patientAllergies) {
                if (checkAllergyConflict(allergy.getAllergenName(), item.getMedicineName(), item.getActiveIngredient())) {
                    allergyMatched = true;
                    matchedAllergen = allergy.getAllergenName();
                    break;
                }
            }

            if (allergyMatched) {
                item.setHasAllergyWarning(true);
                String warnMsg = String.format("⚠️ CẢNH BÁO NGUY HIỂM: Bệnh nhân có tiền sử dị ứng với '%s'! Thuốc '%s' (%s) có nguy cơ gây dị ứng phản vệ!",
                        matchedAllergen, item.getMedicineName(), item.getActiveIngredient() != null ? item.getActiveIngredient() : "");
                allergyWarningMessages.add(warnMsg);
                log.warn(warnMsg);
            }

            savedItems.add(prescriptionItemRepository.save(item));
        }

        savedPrescription.setItems(savedItems);

        PrescriptionResponse response = mapper.toResponse(savedPrescription);
        response.setHasAnyAllergyWarning(!allergyWarningMessages.isEmpty());
        response.setAllergyWarnings(allergyWarningMessages);

        log.info("Created prescription id={} for medical record id={}, allergyWarningsCount={}", 
                savedPrescription.getId(), record.getId(), allergyWarningMessages.size());
        return response;
    }

    // ==========================================
    // 3. XEM DANH SÁCH & CHI TIẾT ĐƠN THUỐC
    // ==========================================

    public List<PrescriptionResponse> getPrescriptionsByMedicalRecord(Long medicalRecordId, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + medicalRecordId));

        checkProfileAccess(record.getProfile(), user);

        return prescriptionRepository.findByMedicalRecordIdAndDeletedFalse(medicalRecordId)
                .stream()
                .map(p -> {
                    PrescriptionResponse res = mapper.toResponse(p);
                    boolean hasWarning = p.getItems() != null && p.getItems().stream().anyMatch(PrescriptionItem::isHasAllergyWarning);
                    res.setHasAnyAllergyWarning(hasWarning);
                    return res;
                })
                .collect(Collectors.toList());
    }

    public PrescriptionResponse getPrescriptionDetail(Long id, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        Prescription prescription = prescriptionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn thuốc id=" + id));

        checkProfileAccess(prescription.getMedicalRecord().getProfile(), user);

        PrescriptionResponse response = mapper.toResponse(prescription);
        boolean hasWarning = prescription.getItems() != null && prescription.getItems().stream().anyMatch(PrescriptionItem::isHasAllergyWarning);
        response.setHasAnyAllergyWarning(hasWarning);
        return response;
    }

    // ==========================================
    // 4. DANH SÁCH THUỐC ĐANG DÙNG (YÊU CẦU 8.5)
    // ==========================================

    public List<ActiveMedicationResponse> getActiveMedications(Long profileId, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        HealthProfile profile = healthProfileRepository.findByIdAndDeletedFalse(profileId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe id=" + profileId));

        checkProfileAccess(profile, user);

        LocalDate today = LocalDate.now();
        List<ActiveMedicationResponse> activeList = new ArrayList<>();

        List<MedicalRecord> records = medicalRecordRepository.findByProfileIdAndDeletedFalse(profileId, Pageable.unpaged()).getContent();
        for (MedicalRecord rec : records) {
            List<Prescription> prescriptions = prescriptionRepository.findByMedicalRecordIdAndDeletedFalse(rec.getId());
            for (Prescription p : prescriptions) {
                if (p.getItems() != null) {
                    for (PrescriptionItem item : p.getItems()) {
                        LocalDate startDate = p.getPrescriptionDate();
                        LocalDate endDate = startDate.plusDays(item.getDaysCount() != null ? item.getDaysCount() : 1);

                        // Nếu ngày hiện tại chưa vượt quá ngày kết thúc thuốc
                        if (!today.isAfter(endDate)) {
                            long remainingDays = ChronoUnit.DAYS.between(today, endDate);
                            activeList.add(ActiveMedicationResponse.builder()
                                    .prescriptionId(p.getId())
                                    .medicalRecordId(rec.getId())
                                    .medicineName(item.getMedicineName())
                                    .activeIngredient(item.getActiveIngredient())
                                    .dosageAmount(item.getDosageAmount())
                                    .dosageUnit(item.getDosageUnit())
                                    .frequencyPerDay(item.getFrequencyPerDay())
                                    .administrationRoute(item.getAdministrationRoute())
                                    .startDate(startDate)
                                    .endDate(endDate)
                                    .remainingDays((int) remainingDays)
                                    .usageInstructions(item.getUsageInstructions())
                                    .prescribingDoctor(p.getPrescribingDoctor())
                                    .hasAllergyWarning(item.isHasAllergyWarning())
                                    .build());
                        }
                    }
                }
            }
        }

        return activeList;
    }

    // ==========================================
    // 5. XÓA MỀM ĐƠN THUỐC
    // ==========================================

    @Transactional
    public void deletePrescription(Long id, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        Prescription prescription = prescriptionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn thuốc id=" + id));

        checkProfileAccess(prescription.getMedicalRecord().getProfile(), user);
        prescription.setDeleted(true);
        prescriptionRepository.save(prescription);
        log.info("Soft-deleted prescription id={}", id);
    }

    // ==========================================
    // HÀM TIỆN ÍCH KIỂM TRA DỊ ỨNG & BẢO MẬT
    // ==========================================

    private boolean checkAllergyConflict(String allergenName, String medicineName, String activeIngredient) {
        if (allergenName == null) return false;
        String allergenLower = allergenName.trim().toLowerCase();

        if (medicineName != null && medicineName.toLowerCase().contains(allergenLower)) {
            return true;
        }

        if (activeIngredient != null && activeIngredient.toLowerCase().contains(allergenLower)) {
            return true;
        }

        // Nhận diện tương đồng nhóm Penicillin / Amoxicillin / Ampicillin
        if (allergenLower.contains("penicillin") || allergenLower.contains("kháng sinh beta-lactam")) {
            String combined = ((medicineName != null ? medicineName : "") + " " + (activeIngredient != null ? activeIngredient : "")).toLowerCase();
            if (combined.contains("amoxicillin") || combined.contains("ampicillin") || combined.contains("penicillin") || combined.contains("augmentin")) {
                return true;
            }
        }

        return false;
    }

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
