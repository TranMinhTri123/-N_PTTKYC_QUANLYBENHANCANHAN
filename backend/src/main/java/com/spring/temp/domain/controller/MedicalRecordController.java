package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.dto.common.PageResponse;
import com.spring.temp.domain.dto.medicalrecord.*;
import com.spring.temp.domain.model.enums.RecordType;
import com.spring.temp.domain.service.MedicalRecordService;
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
@RequestMapping("medical-records")
@RequiredArgsConstructor
@Tag(name = "3. Bệnh Án Chung & 4 Chuyên Khoa (MS: 01, 02, 10/BV-01 & Sản Khoa)", 
     description = "Quản lý bệnh án điện tử, phân loại chuyên khoa Nội, Ngoại, Nhi, Sản, sinh hiệu, luân chuyển khoa và dòng thời gian khám bệnh")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;
    private final com.spring.temp.domain.service.MedicalRecordPdfService medicalRecordPdfService;

    // ==========================================
    // 1. QUẢN LÝ BỆNH ÁN CỐT LÕI (CRUD)
    // ==========================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "3.1 Tạo bệnh án mới theo chuyên khoa", 
               description = "Tạo bệnh án Nội, Ngoại, Nhi hoặc Sản khoa. Tự động tính BMI, ngày điều trị và dự sinh theo công thức Naegele.")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> createMedicalRecord(
            @RequestBody @Valid MedicalRecordRequest request,
            Principal connectedUser
    ) {
        MedicalRecordResponse response = medicalRecordService.createMedicalRecord(request, connectedUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tạo bệnh án thành công!"));
    }

    @GetMapping
    @Operation(summary = "3.0 Danh sách bệnh án (Phân trang và bộ lọc)", 
               description = "Lấy danh sách bệnh án của người dùng hoặc theo hồ sơ, lọc theo chuyên khoa")
    public ResponseEntity<ApiResponse<PageResponse<MedicalRecordSummaryResponse>>> getMedicalRecords(
            @RequestParam(required = false) Long profileId,
            @Parameter(description = "Lọc theo loại bệnh án (để trống nếu muốn lấy tất cả)")
            @RequestParam(required = false) RecordType recordType,
            @PageableDefault(size = 10, sort = "visitDate", direction = Sort.Direction.DESC) Pageable pageable,
            Principal connectedUser
    ) {
        PageResponse<MedicalRecordSummaryResponse> response = 
                medicalRecordService.getAllMedicalRecords(profileId, recordType, pageable, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách bệnh án thành công!"));
    }

    @GetMapping("/profile/{profileId}")
    @Operation(summary = "3.2 Danh sách bệnh án theo hồ sơ (Phân trang)", 
               description = "Lấy danh sách tóm tắt bệnh án của người bệnh, hỗ trợ lọc theo loại chuyên khoa (INTERNAL, SURGICAL, PEDIATRIC, OBSTETRIC)")
    public ResponseEntity<ApiResponse<PageResponse<MedicalRecordSummaryResponse>>> getMedicalRecordsByProfile(
            @PathVariable Long profileId,
            @Parameter(description = "Lọc theo loại bệnh án (để trống nếu muốn lấy tất cả)")
            @RequestParam(required = false) RecordType recordType,
            @PageableDefault(size = 10, sort = "visitDate", direction = Sort.Direction.DESC) Pageable pageable,
            Principal connectedUser
    ) {
        PageResponse<MedicalRecordSummaryResponse> response = 
                medicalRecordService.getMedicalRecordsByProfile(profileId, recordType, pageable, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách bệnh án thành công!"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "3.3 Xem chi tiết bệnh án", 
               description = "Xem toàn bộ thông tin hành chính, bệnh sử, chẩn đoán ICD-10, sinh hiệu, luân chuyển khoa và chi tiết chuyên khoa")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getMedicalRecordDetail(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        MedicalRecordResponse response = medicalRecordService.getMedicalRecordDetail(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết bệnh án thành công!"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "3.4 Cập nhật bệnh án", 
               description = "Cập nhật các trường thông tin bệnh án, chẩn đoán ra viện, chế độ điều trị và chuyên khoa")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> updateMedicalRecord(
            @PathVariable Long id,
            @RequestBody @Valid MedicalRecordRequest request,
            Principal connectedUser
    ) {
        MedicalRecordResponse response = medicalRecordService.updateMedicalRecord(id, request, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật bệnh án thành công!"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "3.5 Xóa mềm bệnh án", 
               description = "Đánh dấu xóa mềm bệnh án (deleted = true), giữ toàn vẹn dữ liệu cho việc kiểm toán")
    public ResponseEntity<ApiResponse<Void>> deleteMedicalRecord(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        medicalRecordService.deleteMedicalRecord(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa bệnh án thành công!"));
    }

    // ==========================================
    // 2. SINH HIỆU LÂM SÀNG & LUÂN CHUYỂN KHOA
    // ==========================================

    @PostMapping("/{id}/vital-signs")
    @Operation(summary = "3.6 Cập nhật sinh hiệu lâm sàng", 
               description = "Cập nhật chỉ số Mạch, Nhiệt độ, Huyết áp, Nhịp thở, SpO2, Cân nặng, Chiều cao và tự tính BMI")
    public ResponseEntity<ApiResponse<VitalSignsDto>> addOrUpdateVitalSigns(
            @PathVariable Long id,
            @RequestBody @Valid VitalSignsDto dto,
            Principal connectedUser
    ) {
        VitalSignsDto response = medicalRecordService.addOrUpdateVitalSigns(id, dto, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật sinh hiệu thành công!"));
    }

    @PostMapping("/{id}/transfers")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "3.7 Thêm luân chuyển khoa điều trị", 
               description = "Ghi nhận việc chuyển bệnh nhân từ khoa này sang khoa khác trong cùng đợt điều trị nội trú")
    public ResponseEntity<ApiResponse<DepartmentTransferDto>> addDepartmentTransfer(
            @PathVariable Long id,
            @RequestBody @Valid DepartmentTransferDto dto,
            Principal connectedUser
    ) {
        DepartmentTransferDto response = medicalRecordService.addDepartmentTransfer(id, dto, connectedUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Thêm luân chuyển khoa thành công!"));
    }

    @GetMapping("/{id}/transfers")
    @Operation(summary = "3.8 Lấy lịch sử luân chuyển khoa", 
               description = "Danh sách các lần chuyển khoa của bệnh án sắp xếp theo thứ tự thời gian chuyển")
    public ResponseEntity<ApiResponse<List<DepartmentTransferDto>>> getDepartmentTransfers(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        List<DepartmentTransferDto> response = medicalRecordService.getDepartmentTransfers(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy lịch sử luân chuyển khoa thành công!"));
    }

    // ==========================================
    // 3. TIMELINE DÒNG THỜI GIAN LỊCH SỬ KHÁM
    // ==========================================

    @GetMapping("/profile/{profileId}/timeline")
    @Operation(summary = "3.9 Dòng thời gian lịch sử khám bệnh (Timeline)", 
               description = "Toàn bộ lịch sử các đợt khám của hồ sơ theo trình tự thời gian từ mới nhất đến cũ nhất")
    public ResponseEntity<ApiResponse<List<MedicalRecordSummaryResponse>>> getTimeline(
            @PathVariable Long profileId,
            Principal connectedUser
    ) {
        List<MedicalRecordSummaryResponse> response = medicalRecordService.getTimeline(profileId, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy dòng thời gian khám bệnh thành công!"));
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "3.9b Dòng thời gian lịch sử khám theo bệnh án ID", 
               description = "Tìm hồ sơ tương ứng của bệnh án và lấy toàn bộ dòng thời gian điều trị")
    public ResponseEntity<ApiResponse<List<MedicalRecordSummaryResponse>>> getTimelineByRecordId(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        MedicalRecordResponse record = medicalRecordService.getMedicalRecordDetail(id, connectedUser);
        List<MedicalRecordSummaryResponse> response = medicalRecordService.getTimeline(record.getProfileId(), connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy dòng thời gian khám bệnh thành công!"));
    }

    // ==========================================
    // 4. XUẤT BỆNH ÁN RA TỆP PDF
    // ==========================================

    @GetMapping("/{id}/export-pdf")
    @Operation(summary = "3.10 Xuất tóm tắt bệnh án ra tệp PDF (Chuẩn Bộ Y Tế)", 
               description = "Sinh tệp PDF tóm tắt bệnh án chuẩn A4 với đầy đủ thông tin hành chính, quá trình điều trị, sinh hiệu và đơn thuốc")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        byte[] pdfBytes = medicalRecordPdfService.generateMedicalRecordPdf(id);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment().filename("benh_an_" + id + ".pdf").build());
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}

