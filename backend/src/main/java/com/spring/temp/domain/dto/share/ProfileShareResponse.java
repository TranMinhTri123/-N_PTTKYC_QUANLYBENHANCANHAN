package com.spring.temp.domain.dto.share;

import com.spring.temp.domain.model.enums.SharePermissionScope;
import com.spring.temp.domain.model.enums.ShareStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileShareResponse {

    private Long id;
    private Long profileId;
    private String profileFullName;
    private Long doctorUserId;
    private String doctorName;
    private String doctorEmail;
    private String shareToken;
    private SharePermissionScope permissionScope;
    private LocalDateTime expiresAt;
    private ShareStatus status;
    private LocalDateTime createdAt;
    private Boolean isExpired;
}
