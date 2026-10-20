package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.audit.AuditLogResponse;
import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.dto.common.PageResponse;
import com.spring.temp.domain.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
@Tag(name = "14. Nhật ký kiểm toán (Audit Logs)", description = "APIs dành cho Quản trị viên truy vết toàn bộ thao tác trong hệ thống")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xem nhật ký kiểm toán hệ thống (Phân trang)", description = "Chỉ Quản trị viên (ROLE_ADMIN) mới có quyền truy cập nhật ký")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AuditLogResponse> page = auditLogService.getLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }
}
