package com.spring.temp.domain.service;

import com.spring.temp.domain.dto.common.PageResponse;
import com.spring.temp.domain.dto.medicalrecord.*;
import com.spring.temp.domain.mapper.MedicalRecordMapper;
import com.spring.temp.domain.model.*;
import com.spring.temp.domain.model.enums.Gender;
import com.spring.temp.domain.model.enums.RecordType;
import com.spring.temp.domain.repository.*;
import com.spring.temp.exception.NotFoundException;
import com.spring.temp.exception.SomethingWentWrongException;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.Principal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final VitalSignsRepository vitalSignsRepository;
    private final DepartmentTransferRepository departmentTransferRepository;
    private final InternalRecordDetailRepository internalRecordDetailRepository;
    private final SurgicalRecordDetailRepository surgicalRecordDetailRepository;
    private final PediatricRecordDetailRepository pediatricRecordDetailRepository;
    private final ObstetricRecordDetailRepository obstetricRecordDetailRepository;
    private final MedicalRecordMapper mapper;

    // ==========================================
    // 1. TẠO MỚI BỆNH ÁN (HỖ TRỢ 4 CHUYÊN KHOA)
    // ==========================================

    @Transactional
    public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        HealthProfile profile = healthProfileRepository.findByIdAndDeletedFalse(request.getProfileId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe id=" + request.getProfileId()));

        checkProfileAccess(profile, user);

        // Nghiệp vụ Sản khoa: Ràng buộc hồ sơ giới tính Nữ
        if (request.getRecordType() == RecordType.OBSTETRIC && profile.getGender() != Gender.FEMALE) {
            throw new SomethingWentWrongException("Bệnh án Sản khoa chỉ áp dụng cho hồ sơ có giới tính Nữ!");
        }

        // Tự động tính tổng số ngày điều trị nếu có ngày vào và ra viện
        autoCalculateTreatmentDays(request);

        // Tự động tính chỉ số BMI nếu có thông số sinh hiệu
        if (request.getVitalSigns() != null) {
            autoCalculateBmi(request.getVitalSigns());
        }

        // Tự động tính ngày dự sinh theo công thức Naegele cho Sản khoa
        if (request.getRecordType() == RecordType.OBSTETRIC && request.getObstetricDetail() != null) {
            autoCalculateObstetricDates(request.getObstetricDetail());
        }

        MedicalRecord record = mapper.toEntity(request);
        record.setProfile(profile);
        record.setDeleted(false);

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // Lưu sinh hiệu đi kèm
        if (request.getVitalSigns() != null) {
            VitalSigns vitalSigns = mapper.toVitalSignsEntity(request.getVitalSigns());
            vitalSigns.setMedicalRecord(savedRecord);
            savedRecord.setVitalSigns(vitalSignsRepository.save(vitalSigns));
        }

        // Lưu chi tiết chuyên khoa
        saveSpecialtyDetail(savedRecord, request);

        log.info("Created medical record id={}, type={} for profile id={}", 
                savedRecord.getId(), savedRecord.getRecordType(), profile.getId());
        return mapper.toResponse(savedRecord);
    }

    // ==========================================
    // 2. XEM DANH SÁCH & TÌM KIẾM BỆNH ÁN
    // ==========================================

    public PageResponse<MedicalRecordSummaryResponse> getAllMedicalRecords(
            Long profileId, RecordType recordType, Pageable pageable, Principal connectedUser) {
        if (profileId != null) {
            return getMedicalRecordsByProfile(profileId, recordType, pageable, connectedUser);
        }

        User user = getAuthenticatedUser(connectedUser);
        Page<MedicalRecord> page;

        if (isAdminOrDoctor(user)) {
            if (recordType != null) {
                page = medicalRecordRepository.findByRecordTypeAndDeletedFalse(recordType, pageable);
            } else {
                page = medicalRecordRepository.findByDeletedFalse(pageable);
            }
        } else {
            List<HealthProfile> userProfiles = healthProfileRepository.findByUserIdAndDeletedFalse(user.getId());
            if (userProfiles.isEmpty()) {
                return PageResponse.of(Page.empty(pageable));
            }
            List<Long> profileIds = userProfiles.stream().map(HealthProfile::getId).collect(Collectors.toList());
            if (recordType != null) {
                page = medicalRecordRepository.findByProfileIdInAndRecordTypeAndDeletedFalse(profileIds, recordType, pageable);
            } else {
                page = medicalRecordRepository.findByProfileIdInAndDeletedFalse(profileIds, pageable);
            }
        }

        return PageResponse.of(page.map(mapper::toSummaryResponse));
    }

    public PageResponse<MedicalRecordSummaryResponse> getMedicalRecordsByProfile(
            Long profileId, RecordType recordType, Pageable pageable, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        HealthProfile profile = healthProfileRepository.findByIdAndDeletedFalse(profileId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe id=" + profileId));

        checkProfileAccess(profile, user);

        Page<MedicalRecord> page;
        if (recordType != null) {
            page = medicalRecordRepository.findByProfileIdAndRecordTypeAndDeletedFalse(profileId, recordType, pageable);
        } else {
            page = medicalRecordRepository.findByProfileIdAndDeletedFalse(profileId, pageable);
        }

        return PageResponse.of(page.map(mapper::toSummaryResponse));
    }

    public MedicalRecordResponse getMedicalRecordDetail(Long id, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + id));

        checkProfileAccess(record.getProfile(), user);
        return mapper.toResponse(record);
    }

    // ==========================================
    // 3. CẬP NHẬT BỆNH ÁN
    // ==========================================

    @Transactional
    public MedicalRecordResponse updateMedicalRecord(Long id, MedicalRecordRequest request, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + id));

        checkProfileAccess(record.getProfile(), user);

        autoCalculateTreatmentDays(request);
        mapper.updateEntityFromRequest(request, record);

        // Cập nhật sinh hiệu nếu có truyền
        if (request.getVitalSigns() != null) {
            autoCalculateBmi(request.getVitalSigns());
            VitalSigns existingVs = record.getVitalSigns();
            if (existingVs != null) {
                existingVs.setPulse(request.getVitalSigns().getPulse());
                existingVs.setTemperature(request.getVitalSigns().getTemperature());
                existingVs.setSystolicBp(request.getVitalSigns().getSystolicBp());
                existingVs.setDiastolicBp(request.getVitalSigns().getDiastolicBp());
                existingVs.setRespiratoryRate(request.getVitalSigns().getRespiratoryRate());
                existingVs.setSpo2(request.getVitalSigns().getSpo2());
                existingVs.setWeightKg(request.getVitalSigns().getWeightKg());
                existingVs.setHeightCm(request.getVitalSigns().getHeightCm());
                existingVs.setBmi(request.getVitalSigns().getBmi());
                vitalSignsRepository.save(existingVs);
            } else {
                VitalSigns newVs = mapper.toVitalSignsEntity(request.getVitalSigns());
                newVs.setMedicalRecord(record);
                record.setVitalSigns(vitalSignsRepository.save(newVs));
            }
        }

        // Cập nhật chuyên khoa
        saveSpecialtyDetail(record, request);

        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        log.info("Updated medical record id={}", savedRecord.getId());
        return mapper.toResponse(savedRecord);
    }

    // ==========================================
    // 4. XÓA MỀM BỆNH ÁN
    // ==========================================

    @Transactional
    public void deleteMedicalRecord(Long id, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + id));

        checkProfileAccess(record.getProfile(), user);
        record.setDeleted(true);
        medicalRecordRepository.save(record);
        log.info("Soft-deleted medical record id={}", id);
    }

    // ==========================================
    // 5. SINH HIỆU LÂM SÀNG (VITAL SIGNS)
    // ==========================================

    @Transactional
    public VitalSignsDto addOrUpdateVitalSigns(Long medicalRecordId, VitalSignsDto dto, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + medicalRecordId));

        checkProfileAccess(record.getProfile(), user);
        autoCalculateBmi(dto);

        VitalSigns vs = vitalSignsRepository.findByMedicalRecordId(medicalRecordId)
                .orElseGet(() -> {
                    VitalSigns newVs = new VitalSigns();
                    newVs.setMedicalRecord(record);
                    return newVs;
                });

        vs.setPulse(dto.getPulse());
        vs.setTemperature(dto.getTemperature());
        vs.setSystolicBp(dto.getSystolicBp());
        vs.setDiastolicBp(dto.getDiastolicBp());
        vs.setRespiratoryRate(dto.getRespiratoryRate());
        vs.setSpo2(dto.getSpo2());
        vs.setWeightKg(dto.getWeightKg());
        vs.setHeightCm(dto.getHeightCm());
        vs.setBmi(dto.getBmi());

        VitalSigns saved = vitalSignsRepository.save(vs);
        return mapper.toVitalSignsDto(saved);
    }

    // ==========================================
    // 6. LUÂN CHUYỂN KHOA (DEPARTMENT TRANSFER)
    // ==========================================

    @Transactional
    public DepartmentTransferDto addDepartmentTransfer(Long medicalRecordId, DepartmentTransferDto dto, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + medicalRecordId));

        checkProfileAccess(record.getProfile(), user);

        DepartmentTransfer transfer = mapper.toDepartmentTransferEntity(dto);
        transfer.setMedicalRecord(record);

        DepartmentTransfer saved = departmentTransferRepository.save(transfer);
        log.info("Added transfer from '{}' to '{}' for record id={}", 
                saved.getFromDepartment(), saved.getToDepartment(), medicalRecordId);
        return mapper.toDepartmentTransferDto(saved);
    }

    public List<DepartmentTransferDto> getDepartmentTransfers(Long medicalRecordId, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        MedicalRecord record = medicalRecordRepository.findByIdAndDeletedFalse(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án id=" + medicalRecordId));

        checkProfileAccess(record.getProfile(), user);

        return departmentTransferRepository.findByMedicalRecordIdOrderByTransferredAtAsc(medicalRecordId)
                .stream()
                .map(mapper::toDepartmentTransferDto)
                .collect(Collectors.toList());
    }

    // ==========================================
    // 7. TIMELINE LỊCH SỬ KHÁM (CHỨC NĂNG 3.13)
    // ==========================================

    public List<MedicalRecordSummaryResponse> getTimeline(Long profileId, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        HealthProfile profile = healthProfileRepository.findByIdAndDeletedFalse(profileId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe id=" + profileId));

        checkProfileAccess(profile, user);

        // Lấy toàn bộ bệnh án sắp xếp giảm dần theo ngày khám
        return medicalRecordRepository.findByProfileIdAndDeletedFalse(profileId, Pageable.unpaged())
                .stream()
                .sorted((a, b) -> b.getVisitDate().compareTo(a.getVisitDate()))
                .map(mapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    // ==========================================
    // HÀM TIỆN ÍCH TỰ ĐỘNG & KIỂM TRA BẢO MẬT
    // ==========================================

    private void autoCalculateTreatmentDays(MedicalRecordRequest request) {
        if (request.getTotalTreatmentDays() == null && request.getDischargeDateTime() != null) {
            LocalDate startDate = request.getAdmissionDateTime() != null 
                    ? request.getAdmissionDateTime().toLocalDate() 
                    : request.getVisitDate();

            if (startDate != null) {
                LocalDate endDate = request.getDischargeDateTime().toLocalDate();
                long days = ChronoUnit.DAYS.between(startDate, endDate);
                request.setTotalTreatmentDays(days <= 0 ? 1 : (int) days);
            }
        }
    }

    private void autoCalculateBmi(VitalSignsDto dto) {
        if (dto.getWeightKg() != null && dto.getHeightCm() != null 
                && dto.getHeightCm().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal heightInMeters = dto.getHeightCm().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            BigDecimal heightSquared = heightInMeters.multiply(heightInMeters);
            if (heightSquared.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal bmi = dto.getWeightKg().divide(heightSquared, 1, RoundingMode.HALF_UP);
                dto.setBmi(bmi);
            }
        }
    }

    private void autoCalculateObstetricDates(ObstetricRecordDetailDto dto) {
        if (dto.getLmpDate() != null) {
            // Công thức Naegele: Dự sinh = LMP + 7 ngày - 3 tháng + 1 năm
            if (dto.getEddDate() == null) {
                LocalDate edd = dto.getLmpDate().plusDays(7).minusMonths(3).plusYears(1);
                dto.setEddDate(edd);
            }
            // Tuổi thai tuần = số ngày từ LMP đến hiện tại chia cho 7
            if (dto.getGestationalAgeWeeks() == null) {
                long days = ChronoUnit.DAYS.between(dto.getLmpDate(), LocalDate.now());
                if (days > 0) {
                    BigDecimal weeks = BigDecimal.valueOf(days).divide(BigDecimal.valueOf(7), 1, RoundingMode.HALF_UP);
                    dto.setGestationalAgeWeeks(weeks);
                }
            }
        }
    }

    private void saveSpecialtyDetail(MedicalRecord record, MedicalRecordRequest request) {
        if (record.getRecordType() == null) return;

        switch (record.getRecordType()) {
            case INTERNAL -> {
                if (request.getInternalDetail() != null) {
                    InternalRecordDetail detail = mapper.toInternalDetailEntity(request.getInternalDetail());
                    detail.setMedicalRecord(record);
                    record.setInternalDetail(internalRecordDetailRepository.save(detail));
                }
            }
            case SURGICAL -> {
                if (request.getSurgicalDetail() != null) {
                    SurgicalRecordDetail detail = mapper.toSurgicalDetailEntity(request.getSurgicalDetail());
                    detail.setMedicalRecord(record);
                    record.setSurgicalDetail(surgicalRecordDetailRepository.save(detail));
                }
            }
            case PEDIATRIC -> {
                if (request.getPediatricDetail() != null) {
                    PediatricRecordDetail detail = mapper.toPediatricDetailEntity(request.getPediatricDetail());
                    detail.setMedicalRecord(record);
                    record.setPediatricDetail(pediatricRecordDetailRepository.save(detail));
                }
            }
            case OBSTETRIC -> {
                if (request.getObstetricDetail() != null) {
                    ObstetricRecordDetail detail = mapper.toObstetricDetailEntity(request.getObstetricDetail());
                    detail.setMedicalRecord(record);
                    record.setObstetricDetail(obstetricRecordDetailRepository.save(detail));
                }
            }
        }
    }

    private void checkProfileAccess(HealthProfile profile, User user) {
        if (!profile.getUser().getId().equals(user.getId()) && !isAdminOrDoctor(user)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập hoặc chỉnh sửa hồ sơ này!");
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
