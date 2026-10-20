package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.dto.share.ProfileShareRequest;
import com.spring.temp.domain.dto.share.ProfileShareResponse;
import com.spring.temp.domain.service.ProfileShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shares")
@RequiredArgsConstructor
@Tag(name = "10. Chia sẻ hồ sơ (Profile Sharing)", description = "APIs chia sẻ hồ sơ bệnh án cho Bác sĩ, cấp quyền và xác thực token")
public class ProfileShareController {

    private final ProfileShareService profileShareService;

    @PostMapping
    @Operation(summary = "Tạo mã chia sẻ hồ sơ bệnh án cho Bác sĩ", description = "Sinh token truy cập bảo mật với thời hạn hết hạn cụ thể")
    public ResponseEntity<ApiResponse<ProfileShareResponse>> createShare(
            @Valid @RequestBody ProfileShareRequest request) {
        ProfileShareResponse response = profileShareService.createShare(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Khởi tạo liên kết chia sẻ hồ sơ thành công"));
    }

    @GetMapping("/profile/{profileId}")
    @Operation(summary = "Danh sách liên kết chia sẻ của một hồ sơ", description = "Xem các liên kết chia sẻ đang hoạt động")
    public ResponseEntity<ApiResponse<List<ProfileShareResponse>>> getSharesByProfile(
            @PathVariable Long profileId) {
        List<ProfileShareResponse> list = profileShareService.getSharesByProfile(profileId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Thu hồi quyền chia sẻ hồ sơ", description = "Vô hiệu hóa ngay lập tức liên kết chia sẻ")
    public ResponseEntity<ApiResponse<Void>> revokeShare(@PathVariable Long id) {
        profileShareService.revokeShare(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Thu hồi quyền chia sẻ hồ sơ thành công"));
    }

    @GetMapping("/doctor")
    @Operation(summary = "Danh sách hồ sơ bệnh nhân chia sẻ cho Bác sĩ hiện tại", description = "Dành cho Bác sĩ tra cứu các hồ sơ được bệnh nhân cấp quyền")
    public ResponseEntity<ApiResponse<List<ProfileShareResponse>>> getSharedWithDoctor() {
        List<ProfileShareResponse> list = profileShareService.getSharedWithDoctor();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/verify/{token}")
    @Operation(summary = "Xác thực mã token chia sẻ", description = "Kiểm tra tính hợp lệ và thời hạn của mã token chia sẻ")
    public ResponseEntity<ApiResponse<ProfileShareResponse>> verifyToken(@PathVariable String token) {
        ProfileShareResponse response = profileShareService.verifyShareToken(token);
        return ResponseEntity.ok(ApiResponse.success(response, "Token chia sẻ hợp lệ"));
    }
}
