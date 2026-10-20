package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.dto.common.PageResponse;
import com.spring.temp.domain.dto.profile.*;
import com.spring.temp.domain.service.HealthProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("profiles")
@RequiredArgsConstructor
@Tag(name = "2. Hồ Sơ Sức Khỏe Cá Nhân & Người Thân", description = "Các API quản lý hồ sơ sức khỏe, dị ứng, bệnh nền và tiền sử gia đình theo chuẩn Bộ Y Tế")
public class HealthProfileController {

    private final HealthProfileService profileService;

    // ==========================================
    // 1. HỒ SƠ SỨC KHỎE (CRUD)
    // ==========================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "2.1 Tạo hồ sơ sức khỏe mới", description = "Tạo hồ sơ cho bản thân, cha mẹ, con cái, vợ/chồng với đầy đủ thông tin BHYT, CCCD, nhóm máu")
    public ResponseEntity<ApiResponse<HealthProfileResponse>> createProfile(
            @RequestBody @Valid HealthProfileRequest request,
            Principal connectedUser
    ) {
        HealthProfileResponse response = profileService.createProfile(request, connectedUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo hồ sơ sức khỏe thành công!"));
    }

    @GetMapping
    @Operation(summary = "2.2 Lấy danh sách hồ sơ có phân trang", description = "Danh sách các thành viên trong gia đình theo định dạng phân trang")
    public ResponseEntity<ApiResponse<PageResponse<HealthProfileResponse>>> getMyProfiles(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Principal connectedUser
    ) {
        PageResponse<HealthProfileResponse> response = profileService.getMyProfiles(connectedUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách hồ sơ thành công!"));
    }

    @GetMapping("/all")
    @Operation(summary = "2.3 Lấy toàn bộ hồ sơ (dạng danh sách)", description = "Lấy toàn bộ hồ sơ của người dùng dùng cho giao diện chọn nhanh hoặc Card")
    public ResponseEntity<ApiResponse<List<HealthProfileResponse>>> getMyProfilesList(
            Principal connectedUser
    ) {
        List<HealthProfileResponse> response = profileService.getMyProfilesList(connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách hồ sơ thành công!"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "2.4 Xem chi tiết hồ sơ sức khỏe", description = "Lấy chi tiết hồ sơ theo ID (bảo vệ chống IDOR)")
    public ResponseEntity<ApiResponse<HealthProfileResponse>> getProfileById(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        HealthProfileResponse response = profileService.getProfileById(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy thông tin hồ sơ thành công!"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "2.5 Cập nhật hồ sơ sức khỏe", description = "Sửa đổi thông tin nhân khẩu, BHYT, thông tin liên hệ khẩn cấp")
    public ResponseEntity<ApiResponse<HealthProfileResponse>> updateProfile(
            @PathVariable Long id,
            @RequestBody @Valid HealthProfileRequest request,
            Principal connectedUser
    ) {
        HealthProfileResponse response = profileService.updateProfile(id, request, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật hồ sơ thành công!"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "2.6 Xóa mềm hồ sơ sức khỏe", description = "Đánh dấu xóa hồ sơ mà không làm mất dữ liệu lịch sử y tế")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        profileService.deleteProfile(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa hồ sơ thành công!"));
    }

    // ==========================================
    // 2. DỊ ỨNG (ALLERGIES)
    // ==========================================

    @PostMapping("/{id}/allergies")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "2.7 Thêm dị ứng vào hồ sơ", description = "Ghi nhận dị ứng thuốc, thực phẩm, côn trùng với mức độ nghiêm trọng")
    public ResponseEntity<ApiResponse<AllergyResponse>> addAllergy(
            @PathVariable Long id,
            @RequestBody @Valid AllergyRequest request,
            Principal connectedUser
    ) {
        AllergyResponse response = profileService.addAllergy(id, request, connectedUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Thêm thông tin dị ứng thành công!"));
    }

    @GetMapping("/{id}/allergies")
    @Operation(summary = "2.8 Danh sách dị ứng của hồ sơ", description = "Lấy toàn bộ các dị ứng đã ghi nhận của hồ sơ")
    public ResponseEntity<ApiResponse<List<AllergyResponse>>> getAllergies(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        List<AllergyResponse> list = profileService.getAllergies(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách dị ứng thành công!"));
    }

    @DeleteMapping("/{id}/allergies/{allergyId}")
    @Operation(summary = "2.9 Xóa dị ứng", description = "Xóa mềm thông tin dị ứng khỏi hồ sơ")
    public ResponseEntity<ApiResponse<Void>> deleteAllergy(
            @PathVariable Long id,
            @PathVariable Long allergyId,
            Principal connectedUser
    ) {
        profileService.deleteAllergy(id, allergyId, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa thông tin dị ứng thành công!"));
    }

    // ==========================================
    // 3. BỆNH MẠN TÍNH (CHRONIC DISEASES)
    // ==========================================

    @PostMapping("/{id}/chronic-diseases")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "2.10 Thêm bệnh mạn tính/nền", description = "Ghi nhận bệnh mạn tính đang điều trị, mã ICD-10, năm chẩn đoán")
    public ResponseEntity<ApiResponse<ChronicDiseaseResponse>> addChronicDisease(
            @PathVariable Long id,
            @RequestBody @Valid ChronicDiseaseRequest request,
            Principal connectedUser
    ) {
        ChronicDiseaseResponse response = profileService.addChronicDisease(id, request, connectedUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Thêm bệnh mạn tính thành công!"));
    }

    @GetMapping("/{id}/chronic-diseases")
    @Operation(summary = "2.11 Danh sách bệnh mạn tính", description = "Lấy danh sách các bệnh nền đang theo dõi")
    public ResponseEntity<ApiResponse<List<ChronicDiseaseResponse>>> getChronicDiseases(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        List<ChronicDiseaseResponse> list = profileService.getChronicDiseases(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách bệnh mạn tính thành công!"));
    }

    @DeleteMapping("/{id}/chronic-diseases/{diseaseId}")
    @Operation(summary = "2.12 Xóa bệnh mạn tính", description = "Xóa mềm thông tin bệnh mạn tính")
    public ResponseEntity<ApiResponse<Void>> deleteChronicDisease(
            @PathVariable Long id,
            @PathVariable Long diseaseId,
            Principal connectedUser
    ) {
        profileService.deleteChronicDisease(id, diseaseId, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa bệnh mạn tính thành công!"));
    }

    // ==========================================
    // 4. TIỀN SỬ GIA ĐÌNH (FAMILY MEDICAL HISTORY)
    // ==========================================

    @PostMapping("/{id}/family-histories")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "2.13 Thêm tiền sử bệnh gia đình", description = "Ghi nhận bệnh lý di truyền từ người thân (tiểu đường, tim mạch, ung thư)")
    public ResponseEntity<ApiResponse<FamilyMedicalHistoryResponse>> addFamilyHistory(
            @PathVariable Long id,
            @RequestBody @Valid FamilyMedicalHistoryRequest request,
            Principal connectedUser
    ) {
        FamilyMedicalHistoryResponse response = profileService.addFamilyHistory(id, request, connectedUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Thêm tiền sử gia đình thành công!"));
    }

    @GetMapping("/{id}/family-histories")
    @Operation(summary = "2.14 Danh sách tiền sử gia đình", description = "Lấy toàn bộ tiền sử bệnh lý của người thân")
    public ResponseEntity<ApiResponse<List<FamilyMedicalHistoryResponse>>> getFamilyHistories(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        List<FamilyMedicalHistoryResponse> list = profileService.getFamilyHistories(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách tiền sử gia đình thành công!"));
    }

    @DeleteMapping("/{id}/family-histories/{historyId}")
    @Operation(summary = "2.15 Xóa tiền sử gia đình", description = "Xóa mềm thông tin tiền sử bệnh gia đình")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyHistory(
            @PathVariable Long id,
            @PathVariable Long historyId,
            Principal connectedUser
    ) {
        profileService.deleteFamilyHistory(id, historyId, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa tiền sử gia đình thành công!"));
    }
}
