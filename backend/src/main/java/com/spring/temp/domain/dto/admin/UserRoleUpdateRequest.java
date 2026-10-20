package com.spring.temp.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRoleUpdateRequest {
    @NotBlank(message = "Tên quyền không được để trống (ROLE_USER, ROLE_DOCTOR, ROLE_ADMIN)")
    private String roleName;

    private String department; // Khoa công tác nếu cấp quyền ROLE_DOCTOR
}
