package com.spring.temp.domain.service;

import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.domain.dto.share.ProfileShareRequest;
import com.spring.temp.domain.dto.share.ProfileShareResponse;
import com.spring.temp.domain.model.HealthProfile;
import com.spring.temp.domain.model.ProfileShare;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.model.enums.ShareStatus;
import com.spring.temp.domain.repository.HealthProfileRepository;
import com.spring.temp.domain.repository.ProfileShareRepository;
import com.spring.temp.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileShareService {

    private final ProfileShareRepository profileShareRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Yêu cầu đăng nhập để thực hiện thao tác");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin tài khoản"));
    }

    private void checkProfileOwnership(HealthProfile profile, User user) {
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        if (!isAdmin && !profile.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền quản lý hồ sơ này");
        }
    }

    @Transactional
    public ProfileShareResponse createShare(ProfileShareRequest request) {
        User currentUser = getCurrentUser();
        HealthProfile profile = healthProfileRepository.findById(request.getProfileId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
        checkProfileOwnership(profile, currentUser);

        User doctor = null;
        if (request.getDoctorUserId() != null) {
            doctor = userRepository.findById(request.getDoctorUserId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản bác sĩ"));
        } else if (request.getDoctorEmail() != null && !request.getDoctorEmail().isBlank()) {
            doctor = userRepository.findByEmail(request.getDoctorEmail().trim())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy bác sĩ với email: " + request.getDoctorEmail()));
        } else {
            // Nếu không truyền bác sĩ cụ thể, gán cho tài khoản admin/system doctor
            doctor = currentUser;
        }

        int days = (request.getExpireDays() != null && request.getExpireDays() > 0) ? request.getExpireDays() : 7;
        String token = UUID.randomUUID().toString().replace("-", "");

        ProfileShare share = ProfileShare.builder()
                .profile(profile)
                .doctorUser(doctor)
                .shareToken(token)
                .permissionScope(request.getPermissionScope())
                .expiresAt(LocalDateTime.now().plusDays(days))
                .status(ShareStatus.ACTIVE)
                .build();

        ProfileShare saved = profileShareRepository.save(share);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProfileShareResponse> getSharesByProfile(Long profileId) {
        User currentUser = getCurrentUser();
        HealthProfile profile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
        checkProfileOwnership(profile, currentUser);

        return profileShareRepository.findByProfileIdAndStatus(profileId, ShareStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeShare(Long shareId) {
        User currentUser = getCurrentUser();
        ProfileShare share = profileShareRepository.findById(shareId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lượt chia sẻ"));
        checkProfileOwnership(share.getProfile(), currentUser);

        share.setStatus(ShareStatus.REVOKED);
        profileShareRepository.save(share);
    }

    @Transactional(readOnly = true)
    public List<ProfileShareResponse> getSharedWithDoctor() {
        User doctor = getCurrentUser();
        return profileShareRepository.findByDoctorUserId(doctor.getId())
                .stream()
                .filter(s -> s.getStatus() == ShareStatus.ACTIVE && s.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProfileShareResponse verifyShareToken(String token) {
        ProfileShare share = profileShareRepository.findByShareToken(token)
                .orElseThrow(() -> new NotFoundException("Mã token chia sẻ không tồn tại"));

        if (share.getStatus() != ShareStatus.ACTIVE) {
            throw new IllegalArgumentException("Lượt chia sẻ này đã bị thu hồi");
        }
        if (share.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã token chia sẻ này đã hết hạn hiệu lực");
        }
        return mapToResponse(share);
    }

    private ProfileShareResponse mapToResponse(ProfileShare share) {
        boolean isExpired = share.getExpiresAt() != null && share.getExpiresAt().isBefore(LocalDateTime.now());
        return ProfileShareResponse.builder()
                .id(share.getId())
                .profileId(share.getProfile().getId())
                .profileFullName(share.getProfile().getFullName())
                .doctorUserId(share.getDoctorUser() != null ? share.getDoctorUser().getId() : null)
                .doctorName(share.getDoctorUser() != null ? share.getDoctorUser().fullName() : null)
                .doctorEmail(share.getDoctorUser() != null ? share.getDoctorUser().getEmail() : null)
                .shareToken(share.getShareToken())
                .permissionScope(share.getPermissionScope())
                .expiresAt(share.getExpiresAt())
                .status(share.getStatus())
                .createdAt(share.getCreatedAt())
                .isExpired(isExpired)
                .build();
    }
}
