package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.admin.UserManagementResponse;
import com.spring.temp.domain.dto.admin.UserRoleUpdateRequest;
import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.model.Role;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.repository.RoleRepository;
import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.domain.service.AuditLogService;
import com.spring.temp.exception.UserNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "16. Quản trị người dùng & Phân quyền", description = "APIs dành cho Quản trị viên (ROLE_ADMIN) để quản lý tài khoản và cấp quyền Bác sĩ / Admin")
public class UserManagementController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả người dùng trong hệ thống (Admin)")
    public ResponseEntity<ApiResponse<List<UserManagementResponse>>> getAllUsers() {
        List<UserManagementResponse> users = userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/{userId}/role")
    @Operation(summary = "Cấp quyền cho tài khoản (ROLE_DOCTOR, ROLE_ADMIN, ROLE_USER)")
    public ResponseEntity<ApiResponse<UserManagementResponse>> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequest request,
            Principal connectedUser
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        String roleName = request.getRoleName().trim();
        if (!roleName.equals("ROLE_USER") && !roleName.equals("ROLE_DOCTOR") && !roleName.equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Quyền không hợp lệ! Chỉ chấp nhận ROLE_USER, ROLE_DOCTOR hoặc ROLE_ADMIN");
        }

        Role newRole = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));

        // Cập nhật danh sách quyền và khoa chuyên môn cho tài khoản
        user.setRoles(List.of(newRole));
        if ("ROLE_DOCTOR".equals(roleName)) {
            user.setDepartment(request.getDepartment() != null && !request.getDepartment().isBlank() 
                    ? request.getDepartment().trim() 
                    : "Khoa Nội Tổng Hợp");
        } else if ("ROLE_USER".equals(roleName)) {
            user.setDepartment(null);
        } else if ("ROLE_ADMIN".equals(roleName) && request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        User saved = userRepository.save(user);

        // Ghi nhận nhật ký kiểm toán (Audit Trail)
        auditLogService.recordLog(
                user.getId(),
                "UPDATE_ROLE_" + roleName + (user.getDepartment() != null ? "_DEPT_" + user.getDepartment() : ""),
                "USER",
                user.getId(),
                "127.0.0.1"
        );

        return ResponseEntity.ok(ApiResponse.success(mapToResponse(saved), "Cập nhật quyền và chuyên khoa thành công cho người dùng!"));
    }

    @PutMapping("/{userId}/toggle-lock")
    @Operation(summary = "Khóa hoặc mở khóa tài khoản người dùng")
    public ResponseEntity<ApiResponse<UserManagementResponse>> toggleLock(
            @PathVariable Long userId,
            Principal connectedUser
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        user.setAccountLocked(!user.isAccountLocked());
        User saved = userRepository.save(user);

        auditLogService.recordLog(
                user.getId(),
                user.isAccountLocked() ? "LOCK_USER" : "UNLOCK_USER",
                "USER",
                user.getId(),
                "127.0.0.1"
        );

        return ResponseEntity.ok(ApiResponse.success(mapToResponse(saved), "Cập nhật trạng thái tài khoản thành công!"));
    }

    private UserManagementResponse mapToResponse(User user) {
        List<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
                : List.of("ROLE_USER");

        return UserManagementResponse.builder()
                .id(user.getId())
                .fullName(user.fullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .roles(roleNames)
                .department(user.getDepartment())
                .enabled(user.isEnabled())
                .accountLocked(user.isAccountLocked())
                .createdDate(user.getCreatedDate())
                .build();
    }
}
