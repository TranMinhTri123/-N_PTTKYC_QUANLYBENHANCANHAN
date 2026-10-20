package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.dto.common.PageResponse;
import com.spring.temp.domain.dto.prescription.*;
import com.spring.temp.domain.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "4. Đơn Thuốc & Danh Mục Dược Phẩm", 
     description = "Các API kê đơn thuốc, tra cứu danh mục thuốc quốc gia, phát hiện cảnh báo dị ứng thuốc chéo và theo dõi thuốc đang dùng")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    // ==========================================
    // 1. TRA CỨU DANH MỤC THUỐC
    // ==========================================

    @GetMapping("medicines/search")
    @Operation(summary = "4.1 Tra cứu danh mục thuốc quốc gia", 
               description = "Tìm kiếm thuốc theo tên biệt dược hoặc hoạt chất để gợi ý nhanh khi kê đơn")
    public ResponseEntity<ApiResponse<PageResponse<MedicineCatalogDto>>> searchMedicineCatalog(
            @Parameter(description = "Từ khóa tìm kiếm (tên biệt dược hoặc hoạt chất)")
            @RequestParam(required = false) String query,
            @PageableDefault(size = 10, sort = "brandName", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        PageResponse<MedicineCatalogDto> response = prescriptionService.searchMedicineCatalog(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Tra cứu danh mục thuốc thành công!"));
    }

    // ==========================================
    // 2. KÊ ĐƠN THUỐC (VỚI CẢNH BÁO DỊ ỨNG CHÉO)
    // ==========================================

    @PostMapping("prescriptions")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "4.2 Kê đơn thuốc mới (Tự động phát hiện dị ứng)", 
               description = "Tạo đơn thuốc cho đợt khám. Hệ thống tự động đối chiếu tiền sử dị ứng người bệnh và gắn cờ cảnh báo nếu thuốc trùng dị ứng.")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(
            @RequestBody @Valid PrescriptionRequest request,
            Principal connectedUser
    ) {
        PrescriptionResponse response = prescriptionService.createPrescription(request, connectedUser);
        String msg = response.isHasAnyAllergyWarning() 
                ? "Đơn thuốc đã được tạo kèm CẢNH BÁO DỊ ỨNG THUỐC!" 
                : "Tạo đơn thuốc thành công!";
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, msg));
    }

    @GetMapping("prescriptions/record/{medicalRecordId}")
    @Operation(summary = "4.3 Lấy danh sách đơn thuốc theo đợt khám / bệnh án", 
               description = "Xem toàn bộ các đơn thuốc được kê trong một đợt khám bệnh án")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> getPrescriptionsByMedicalRecord(
            @PathVariable Long medicalRecordId,
            Principal connectedUser
    ) {
        List<PrescriptionResponse> response = prescriptionService.getPrescriptionsByMedicalRecord(medicalRecordId, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách đơn thuốc thành công!"));
    }

    @GetMapping("prescriptions/{id}")
    @Operation(summary = "4.4 Xem chi tiết đơn thuốc", 
               description = "Xem chi tiết các loại thuốc, liều dùng, đường dùng, hướng dẫn và cảnh báo an toàn")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescriptionDetail(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        PrescriptionResponse response = prescriptionService.getPrescriptionDetail(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết đơn thuốc thành công!"));
    }

    @GetMapping("prescriptions/profile/{profileId}/active-medications")
    @Operation(summary = "4.5 Danh sách thuốc đang sử dụng hiện tại (Active Medications)", 
               description = "Tổng hợp toàn bộ các thuốc còn trong thời gian điều trị để người bệnh và bác sĩ theo dõi liên tục")
    public ResponseEntity<ApiResponse<List<ActiveMedicationResponse>>> getActiveMedications(
            @PathVariable Long profileId,
            Principal connectedUser
    ) {
        List<ActiveMedicationResponse> response = prescriptionService.getActiveMedications(profileId, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách thuốc đang dùng thành công!"));
    }

    @DeleteMapping("prescriptions/{id}")
    @Operation(summary = "4.6 Xóa mềm đơn thuốc", 
               description = "Đánh dấu xóa mềm đơn thuốc (deleted = true)")
    public ResponseEntity<ApiResponse<Void>> deletePrescription(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        prescriptionService.deletePrescription(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa đơn thuốc thành công!"));
    }
}
