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
    private final HealthProfileService healthProfileService;
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

        // Nghiệp vụ Sản khoa: Ràng buộc hồ sơ giới tính Nữ và thông tin thai sản bắt buộc
        if (request.getRecordType() == RecordType.OBSTETRIC) {
            if (profile.getGender() != Gender.FEMALE) {
                throw new SomethingWentWrongException("Bệnh án Sản khoa chỉ áp dụng cho hồ sơ có giới tính Nữ!");
            }
            if (request.getObstetricDetail() == null ||
                (request.getObstetricDetail().getLmpDate() == null &&
                 request.getObstetricDetail().getGestationalAgeWeeks() == null &&
                 request.getObstetricDetail().getEddDate() == null)) {
                throw new SomethingWentWrongException("Bệnh án Sản khoa bắt buộc phải có thông tin thai sản (Ngày đầu kinh cuối LMP hoặc Tuổi thai / Ngày dự sinh)!");
            }
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

        if (isAdmin(user)) {
            if (recordType != null) {
                page = medicalRecordRepository.findByRecordTypeAndDeletedFalse(recordType, pageable);
            } else {
                page = medicalRecordRepository.findByDeletedFalse(pageable);
            }
        } else if (isDoctor(user)) {
            List<Long> assignedProfileIds = healthProfileService.getDoctorAssignedProfileIds(user);
            if (assignedProfileIds.isEmpty()) {
                return PageResponse.of(Page.empty(pageable));
            }
            if (recordType != null) {
                page = medicalRecordRepository.findByProfileIdInAndRecordTypeAndDeletedFalse(assignedProfileIds, recordType, pageable);
            } else {
                page = medicalRecordRepository.findByProfileIdInAndDeletedFalse(assignedProfileIds, pageable);
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

        // Bệnh nhân chỉ xem được bản ghi PUBLISHED và bản mới nhất
        if (isPatient(user)) {
            if (record.getStatus() != com.spring.temp.domain.model.enums.EncounterStatus.PUBLISHED || (record.getIsLatest() != null && !record.getIsLatest())) {
                throw new NotFoundException("Bệnh án không tồn tại hoặc chưa được phát hành chính thức");
            }
        }

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

        if (request.getRecordType() == RecordType.OBSTETRIC) {
            if (record.getProfile().getGender() != Gender.FEMALE) {
                throw new SomethingWentWrongException("Bệnh án Sản khoa chỉ áp dụng cho hồ sơ có giới tính Nữ!");
            }
            if (request.getObstetricDetail() == null ||
                (request.getObstetricDetail().getLmpDate() == null &&
                 request.getObstetricDetail().getGestationalAgeWeeks() == null &&
                 request.getObstetricDetail().getEddDate() == null)) {
                throw new SomethingWentWrongException("Bệnh án Sản khoa bắt buộc phải có thông tin thai sản (Ngày đầu kinh cuối LMP hoặc Tuổi thai / Ngày dự sinh)!");
            }
            autoCalculateObstetricDates(request.getObstetricDetail());
        }

        autoCalculateTreatmentDays(request);

        // NGUYÊN TẮC BẢO MẬT: Nếu đợt khám đã PUBLISHED, sửa đổi phải tạo phiên bản mới (Version 2)
        if (record.getStatus() == com.spring.temp.domain.model.enums.EncounterStatus.PUBLISHED) {
            record.setIsLatest(false);
            medicalRecordRepository.save(record);

            MedicalRecord newVersion = mapper.toEntity(request);
            newVersion.setProfile(record.getProfile());
            newVersion.setPatient(record.getPatient());
            newVersion.setDoctor(user);
            newVersion.setVersion(record.getVersion() != null ? record.getVersion() + 1 : 2);
            newVersion.setIsLatest(true);
            newVersion.setStatus(com.spring.temp.domain.model.enums.EncounterStatus.PUBLISHED);
            newVersion.setPublishedAt(java.time.LocalDateTime.now());
            newVersion.setDeleted(false);

            if (request.getVitalSigns() != null) {
                VitalSigns newVs = mapper.toVitalSignsEntity(request.getVitalSigns());
                newVs.setMedicalRecord(newVersion);
                newVersion.setVitalSigns(vitalSignsRepository.save(newVs));
            }
            saveSpecialtyDetail(newVersion, request);
            MedicalRecord saved = medicalRecordRepository.save(newVersion);
            log.info("Created new version {} for medical record id={}", saved.getVersion(), saved.getId());
            return mapper.toResponse(saved);
        }

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
            case GENERAL, INTERNAL -> {
                if (request.getInternalDetail() != null) {
                    InternalRecordDetail detail = record.getInternalDetail();
                    if (detail == null) {
                        detail = mapper.toInternalDetailEntity(request.getInternalDetail());
                        detail.setMedicalRecord(record);
                        record.setInternalDetail(internalRecordDetailRepository.save(detail));
                    } else {
                        detail.setCirculatorySystem(request.getInternalDetail().getCirculatorySystem());
                        detail.setRespiratorySystem(request.getInternalDetail().getRespiratorySystem());
                        detail.setDigestiveSystem(request.getInternalDetail().getDigestiveSystem());
                        detail.setUrinarySystem(request.getInternalDetail().getUrinarySystem());
                        detail.setNervousSystem(request.getInternalDetail().getNervousSystem());
                        detail.setMusculoskeletalSystem(request.getInternalDetail().getMusculoskeletalSystem());
                        detail.setEndocrineSystem(request.getInternalDetail().getEndocrineSystem());
                        detail.setOtherOrgans(request.getInternalDetail().getOtherOrgans());
                        detail.setChronicMonitoringSummary(request.getInternalDetail().getChronicMonitoringSummary());
                        detail.setLongTermMedicationPlan(request.getInternalDetail().getLongTermMedicationPlan());
                    }
                }
            }
            case SURGICAL -> {
                if (request.getSurgicalDetail() != null) {
                    SurgicalRecordDetail detail = record.getSurgicalDetail();
                    if (detail == null) {
                        detail = mapper.toSurgicalDetailEntity(request.getSurgicalDetail());
                        detail.setMedicalRecord(record);
                        record.setSurgicalDetail(surgicalRecordDetailRepository.save(detail));
                    } else {
                        detail.setPreOpDiagnosis(request.getSurgicalDetail().getPreOpDiagnosis());
                        detail.setPostOpDiagnosis(request.getSurgicalDetail().getPostOpDiagnosis());
                        detail.setAnesthesiaMethod(request.getSurgicalDetail().getAnesthesiaMethod());
                        detail.setPostOpMonitoring(request.getSurgicalDetail().getPostOpMonitoring());
                        detail.setDrainRemovalDate(request.getSurgicalDetail().getDrainRemovalDate());
                        detail.setSutureRemovalDate(request.getSurgicalDetail().getSutureRemovalDate());
                        detail.setPostOpCareGuidelines(request.getSurgicalDetail().getPostOpCareGuidelines());
                    }
                }
            }
            case PEDIATRIC -> {
                if (request.getPediatricDetail() != null) {
                    PediatricRecordDetail detail = record.getPediatricDetail();
                    if (detail == null) {
                        detail = mapper.toPediatricDetailEntity(request.getPediatricDetail());
                        detail.setMedicalRecord(record);
                        record.setPediatricDetail(pediatricRecordDetailRepository.save(detail));
                    } else {
                        detail.setFatherName(request.getPediatricDetail().getFatherName());
                        detail.setFatherOccupation(request.getPediatricDetail().getFatherOccupation());
                        detail.setMotherName(request.getPediatricDetail().getMotherName());
                        detail.setMotherOccupation(request.getPediatricDetail().getMotherOccupation());
                        detail.setGestationalAgeWeeks(request.getPediatricDetail().getGestationalAgeWeeks());
                        detail.setBirthWeightGrams(request.getPediatricDetail().getBirthWeightGrams());
                        detail.setDeliveryMethod(request.getPediatricDetail().getDeliveryMethod());
                        detail.setApgar1min(request.getPediatricDetail().getApgar1min());
                        detail.setApgar5min(request.getPediatricDetail().getApgar5min());
                        detail.setFeedingRegimen(request.getPediatricDetail().getFeedingRegimen());
                        detail.setPsychomotorDevelopment(request.getPediatricDetail().getPsychomotorDevelopment());
                    }
                }
            }
            case OBSTETRIC -> {
                if (request.getObstetricDetail() != null) {
                    ObstetricRecordDetail detail = record.getObstetricDetail();
                    if (detail == null) {
                        detail = mapper.toObstetricDetailEntity(request.getObstetricDetail());
                        detail.setMedicalRecord(record);
                        record.setObstetricDetail(obstetricRecordDetailRepository.save(detail));
                    } else {
                        detail.setMenarcheAge(request.getObstetricDetail().getMenarcheAge());
                        detail.setMenstrualCycleDays(request.getObstetricDetail().getMenstrualCycleDays());
                        detail.setLmpDate(request.getObstetricDetail().getLmpDate());
                        detail.setEddDate(request.getObstetricDetail().getEddDate());
                        detail.setGestationalAgeWeeks(request.getObstetricDetail().getGestationalAgeWeeks());
                        detail.setParaTerm(request.getObstetricDetail().getParaTerm());
                        detail.setParaPreterm(request.getObstetricDetail().getParaPreterm());
                        detail.setParaAbortion(request.getObstetricDetail().getParaAbortion());
                        detail.setParaLiving(request.getObstetricDetail().getParaLiving());
                        detail.setDeliveryMethod(request.getObstetricDetail().getDeliveryMethod());
                        detail.setDeliveryComplications(request.getObstetricDetail().getDeliveryComplications());
                        detail.setNewbornWeightGrams(request.getObstetricDetail().getNewbornWeightGrams());
                        detail.setPostpartumCondition(request.getObstetricDetail().getPostpartumCondition());
                    }
                }
            }
        }
    }

    private void checkProfileAccess(HealthProfile profile, User user) {
        if (isAdmin(user)) {
            throw new AccessDeniedException("Quản trị viên hệ thống không có thẩm quyền truy cập nội dung bệnh án y tế!");
        }
        if (isDoctor(user)) {
            List<Long> assignedIds = healthProfileService.getDoctorAssignedProfileIds(user);
            if (!assignedIds.contains(profile.getId())) {
                throw new AccessDeniedException("Bác sĩ không phụ trách bệnh nhân này hoặc chưa có lịch hẹn tiếp nhận!");
            }
            return;
        }
        if (!profile.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập hoặc chỉnh sửa hồ sơ này!");
        }
    }

    public boolean isPatient(User user) {
        return !isDoctor(user) && !isAdmin(user);
    }

    public boolean isAdmin(User user) {
        if (user.getRoles() == null) return false;
        return user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
    }

    public boolean isDoctor(User user) {
        if (user.getRoles() == null) return false;
        return user.getRoles().stream().anyMatch(r -> "ROLE_DOCTOR".equals(r.getName()));
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
