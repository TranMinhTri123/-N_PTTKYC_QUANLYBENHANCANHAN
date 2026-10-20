package com.spring.temp.domain.dto.audit;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String action;
    private String entityName;
    private Long entityId;
    private String ipAddress;
    private LocalDateTime createdAt;
}
