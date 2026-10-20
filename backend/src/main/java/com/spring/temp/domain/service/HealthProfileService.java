package com.spring.temp.domain.service;

import com.spring.temp.domain.dto.common.PageResponse;
import com.spring.temp.domain.dto.profile.*;
import com.spring.temp.domain.mapper.HealthProfileMapper;
import com.spring.temp.domain.model.*;
import com.spring.temp.domain.repository.*;
import com.spring.temp.exception.SomethingWentWrongException;
import com.spring.temp.exception.UserNotFoundException;
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

import com.spring.temp.domain.model.enums.Gender;
import com.spring.temp.domain.model.enums.RelationshipType;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthProfileService {

    private final HealthProfileRepository healthProfileRepository;
    private final AllergyRepository allergyRepository;
    private final ChronicDiseaseRepository chronicDiseaseRepository;
    private final FamilyMedicalHistoryRepository familyHistoryRepository;
    private final UserRepository userRepository;
    private final HealthProfileMapper mapper;

    // ==========================================
    // 1. HEALTH PROFILE CRUD
    // ==========================================

    @Transactional
    public HealthProfileResponse createProfile(HealthProfileRequest request, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        HealthProfile profile = mapper.toEntity(request);
        profile.setUser(user);
        profile.setDeleted(false);

        HealthProfile savedProfile = healthProfileRepository.save(profile);
        log.info("Created health profile id={} for user={}", savedProfile.getId(), user.getEmail());
        return mapper.toResponse(savedProfile);
    }

    @Transactional
    public PageResponse<HealthProfileResponse> getMyProfiles(Principal connectedUser, Pageable pageable) {
        User user = getAuthenticatedUser(connectedUser);
        Page<HealthProfile> page = healthProfileRepository.findByUserIdAndDeletedFalse(user.getId(), pageable);
        return PageResponse.of(page.map(mapper::toResponse));
    }

    @Transactional
    public List<HealthProfileResponse> getMyProfilesList(Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        List<HealthProfile> profiles = healthProfileRepository.findByUserIdAndDeletedFalse(user.getId());
        return profiles.stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    private HealthProfile initSelfProfileForUser(User user) {
        String fullName = (user.getFirstName() != null ? user.getFirstName() : "") +
                (user.getLastName() != null ? (user.getFirstName() != null ? " " : "") + user.getLastName() : "");
        if (fullName.trim().isEmpty()) {
            fullName = user.getEmail() != null ? user.getEmail().split("@")[0] : "Bản thân";
        }

        LocalDate dob = user.getDateOfBirth() != null ? user.getDateOfBirth() : LocalDate.of(1995, 5, 21);

        HealthProfile selfProfile = HealthProfile.builder()
                .user(user)
                .fullName(fullName.trim())
                .dateOfBirth(dob)
                .gender(Gender.MALE)
                .relationship(RelationshipType.SELF)
                .ethnicity("Kinh")
                .nationality("Việt Nam")
                .addressDetail("TP. Hồ Chí Minh")
                .deleted(false)
                .build();
        HealthProfile saved = healthProfileRepository.save(selfProfile);
        log.info("Auto-initialized default SELF health profile id={} for user={}", saved.getId(), user.getEmail());
        return saved;
    }

    public HealthProfileResponse getProfileById(Long id, Principal connectedUser) {
        HealthProfile profile = getOwnedProfile(id, connectedUser);
        return mapper.toResponse(profile);
    }

    @Transactional
    public HealthProfileResponse updateProfile(Long id, HealthProfileRequest request, Principal connectedUser) {
        HealthProfile profile = getOwnedProfile(id, connectedUser);
        mapper.updateEntityFromRequest(request, profile);
        HealthProfile updated = healthProfileRepository.save(profile);
        log.info("Updated health profile id={}", id);
        return mapper.toResponse(updated);
    }

    @Transactional
    public void deleteProfile(Long id, Principal connectedUser) {
        HealthProfile profile = getOwnedProfile(id, connectedUser);
        profile.setDeleted(true); // Soft delete
        healthProfileRepository.save(profile);
        log.info("Soft-deleted health profile id={}", id);
    }

    // ==========================================
    // 2. ALLERGIES SUB-RESOURCE
    // ==========================================

    @Transactional
    public AllergyResponse addAllergy(Long profileId, AllergyRequest request, Principal connectedUser) {
        HealthProfile profile = getOwnedProfile(profileId, connectedUser);
        Allergy allergy = mapper.toEntity(request);
        allergy.setProfile(profile);
        allergy.setDeleted(false);
        Allergy saved = allergyRepository.save(allergy);
        return mapper.toResponse(saved);
    }

    public List<AllergyResponse> getAllergies(Long profileId, Principal connectedUser) {
        getOwnedProfile(profileId, connectedUser); // Verify ownership
        List<Allergy> list = allergyRepository.findByProfileIdAndDeletedFalse(profileId);
        return list.stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteAllergy(Long profileId, Long allergyId, Principal connectedUser) {
        getOwnedProfile(profileId, connectedUser);
        Allergy allergy = allergyRepository.findByIdAndDeletedFalse(allergyId)
                .orElseThrow(() -> new SomethingWentWrongException("Không tìm thấy thông tin dị ứng!"));
        if (!allergy.getProfile().getId().equals(profileId)) {
            throw new AccessDeniedException("Dị ứng này không thuộc về hồ sơ đã chọn!");
        }
        allergy.setDeleted(true);
        allergyRepository.save(allergy);
    }

    // ==========================================
    // 3. CHRONIC DISEASES SUB-RESOURCE
    // ==========================================

    @Transactional
    public ChronicDiseaseResponse addChronicDisease(Long profileId, ChronicDiseaseRequest request, Principal connectedUser) {
        HealthProfile profile = getOwnedProfile(profileId, connectedUser);
        ChronicDisease disease = mapper.toEntity(request);
        disease.setProfile(profile);
        disease.setDeleted(false);
        ChronicDisease saved = chronicDiseaseRepository.save(disease);
        return mapper.toResponse(saved);
    }

    public List<ChronicDiseaseResponse> getChronicDiseases(Long profileId, Principal connectedUser) {
        getOwnedProfile(profileId, connectedUser);
        List<ChronicDisease> list = chronicDiseaseRepository.findByProfileIdAndDeletedFalse(profileId);
        return list.stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteChronicDisease(Long profileId, Long diseaseId, Principal connectedUser) {
        getOwnedProfile(profileId, connectedUser);
        ChronicDisease disease = chronicDiseaseRepository.findByIdAndDeletedFalse(diseaseId)
                .orElseThrow(() -> new SomethingWentWrongException("Không tìm thấy bệnh mạn tính!"));
        if (!disease.getProfile().getId().equals(profileId)) {
            throw new AccessDeniedException("Bệnh mạn tính này không thuộc về hồ sơ đã chọn!");
        }
        disease.setDeleted(true);
        chronicDiseaseRepository.save(disease);
    }

    // ==========================================
    // 4. FAMILY MEDICAL HISTORY SUB-RESOURCE
    // ==========================================

    @Transactional
    public FamilyMedicalHistoryResponse addFamilyHistory(Long profileId, FamilyMedicalHistoryRequest request, Principal connectedUser) {
        HealthProfile profile = getOwnedProfile(profileId, connectedUser);
        FamilyMedicalHistory history = mapper.toEntity(request);
        history.setProfile(profile);
        history.setDeleted(false);
        FamilyMedicalHistory saved = familyHistoryRepository.save(history);
        return mapper.toResponse(saved);
    }

    public List<FamilyMedicalHistoryResponse> getFamilyHistories(Long profileId, Principal connectedUser) {
        getOwnedProfile(profileId, connectedUser);
        List<FamilyMedicalHistory> list = familyHistoryRepository.findByProfileIdAndDeletedFalse(profileId);
        return list.stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteFamilyHistory(Long profileId, Long historyId, Principal connectedUser) {
        getOwnedProfile(profileId, connectedUser);
        FamilyMedicalHistory history = familyHistoryRepository.findByIdAndDeletedFalse(historyId)
                .orElseThrow(() -> new SomethingWentWrongException("Không tìm thấy tiền sử gia đình!"));
        if (!history.getProfile().getId().equals(profileId)) {
            throw new AccessDeniedException("Tiền sử này không thuộc về hồ sơ đã chọn!");
        }
        history.setDeleted(true);
        familyHistoryRepository.save(history);
    }

    // ==========================================
    // HELPER: OWNERSHIP CHECK & SECURITY
    // ==========================================

    private HealthProfile getOwnedProfile(Long profileId, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        HealthProfile profile = healthProfileRepository.findByIdAndDeletedFalse(profileId)
                .orElseThrow(() -> new SomethingWentWrongException("Không tìm thấy hồ sơ sức khỏe id=" + profileId));

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        if (!profile.getUser().getId().equals(user.getId()) && !isAdmin) {
            log.warn("IDOR ATTEMPT: User {} tried accessing profile {} owned by user {}", 
                    user.getEmail(), profileId, profile.getUser().getId());
            throw new AccessDeniedException("Bạn không có quyền truy cập vào hồ sơ sức khỏe này!");
        }

        return profile;
    }

    private User getAuthenticatedUser(Principal connectedUser) {
        if (connectedUser == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                return (User) authentication.getPrincipal();
            }
            throw new SomethingWentWrongException("Người dùng chưa được xác thực!");
        }
        return (User) ((UsernamePasswordAuthenticationToken) connectedUser).getPrincipal();
    }
}
