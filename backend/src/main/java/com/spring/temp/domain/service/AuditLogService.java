package com.spring.temp.domain.service;

import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.domain.dto.audit.AuditLogResponse;
import com.spring.temp.domain.model.AuditLog;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void recordLog(Long userId, String action, String entityName, Long entityId, String ipAddress) {
        recordLog(userId, action, entityName, entityId, ipAddress, "Thành công");
    }

    @Transactional
    public void recordLog(Long userId, String action, String entityName, Long entityId, String ipAddress, String details) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .details(details != null ? details : "Thành công")
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getMyLogs(Long currentUserId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(currentUserId, pageable)
                .map(this::mapToResponse);
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        String username = null;
        if (log.getUser() != null) {
            String fullName = log.getUser().fullName();
            if (fullName != null && !fullName.isBlank()) {
                username = fullName.trim();
            } else {
                username = log.getUser().getEmail();
            }
        }
        if (username == null || username.isBlank()) {
            username = "Hệ thống";
        }

        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : null)
                .userFullName(log.getUser() != null ? log.getUser().fullName() : null)
                .username(username)
                .action(log.getAction())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .ipAddress(log.getIpAddress() != null ? log.getIpAddress() : "127.0.0.1")
                .details(log.getDetails() != null ? log.getDetails() : "Thao tác thực thi thành công")
                .createdAt(log.getCreatedAt())
                .build();
    }
}
