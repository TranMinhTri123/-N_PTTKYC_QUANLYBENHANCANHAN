package com.spring.temp.domain.dto.share;

import com.spring.temp.domain.model.enums.SharePermissionScope;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileShareRequest {

    @NotNull(message = "ID hồ sơ không được để trống")
    private Long profileId;

    private Long doctorUserId;

    private String doctorEmail;

    @Builder.Default
    private SharePermissionScope permissionScope = SharePermissionScope.READ_ONLY;

    @Builder.Default
    private Integer expireDays = 7;
}
