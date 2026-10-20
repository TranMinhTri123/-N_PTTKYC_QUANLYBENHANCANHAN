package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.clinical.*;
import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.service.ClinicalInvestigationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("clinical")
@RequiredArgsConstructor
@Tag(name = "5. Cận Lâm Sàng & Tệp Đính Kèm Y Tế", 
     description = "Các API ghi nhận kết quả xét nghiệm sinh hóa/huyết học, chẩn đoán hình ảnh (X-quang, CT, MRI, Siêu âm) và tệp đính kèm y tế")
public class ClinicalInvestigationController {

    private final ClinicalInvestigationService clinicalService;

    // ==========================================
    // 1. KẾT QUẢ XÉT NGHIỆM
    // ==========================================

    @PostMapping("lab-tests")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "5.1 Thêm kết quả xét nghiệm cận lâm sàng", 
               description = "Lưu kết quả xét nghiệm máu, sinh hóa, nước tiểu kèm khoảng tham chiếu và đánh giá bất thường")
    public ResponseEntity<ApiResponse<LabTestResultResponse>> addLabTest(
            @RequestBody @Valid LabTestResultRequest request,
            Principal connectedUser
    ) {
        LabTestResultResponse response = clinicalService.addLabTest(request, connectedUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Thêm kết quả xét nghiệm thành công!"));
    }

    @GetMapping("lab-tests/record/{medicalRecordId}")
    @Operation(summary = "5.2 Danh sách kết quả xét nghiệm theo bệnh án", 
               description = "Lấy toàn bộ các xét nghiệm được thực hiện trong đợt khám bệnh án")
    public ResponseEntity<ApiResponse<List<LabTestResultResponse>>> getLabTestsByMedicalRecord(
            @PathVariable Long medicalRecordId,
            Principal connectedUser
    ) {
        List<LabTestResultResponse> response = clinicalService.getLabTestsByMedicalRecord(medicalRecordId, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách xét nghiệm thành công!"));
    }

    @DeleteMapping("lab-tests/{id}")
    @Operation(summary = "5.3 Xóa kết quả xét nghiệm", 
               description = "Xóa một chỉ số xét nghiệm")
    public ResponseEntity<ApiResponse<Void>> deleteLabTest(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        clinicalService.deleteLabTest(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa kết quả xét nghiệm thành công!"));
    }

    // ==========================================
    // 2. CHẨN ĐOÁN HÌNH ẢNH
    // ==========================================

    @PostMapping("imaging")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "5.4 Thêm kết quả chẩn đoán hình ảnh (CĐHA)", 
               description = "Ghi nhận kết quả X-quang, Siêu âm, CT Scanner, MRI, Điện tim (ECG) kèm mô tả tổn thương và kết luận")
    public ResponseEntity<ApiResponse<ImagingResultResponse>> addImagingResult(
            @RequestBody @Valid ImagingResultRequest request,
            Principal connectedUser
    ) {
        ImagingResultResponse response = clinicalService.addImagingResult(request, connectedUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Thêm kết quả chẩn đoán hình ảnh thành công!"));
    }

    @GetMapping("imaging/record/{medicalRecordId}")
    @Operation(summary = "5.5 Danh sách chẩn đoán hình ảnh theo bệnh án", 
               description = "Lấy toàn bộ các kết quả chụp chiếu trong đợt khám")
    public ResponseEntity<ApiResponse<List<ImagingResultResponse>>> getImagingResultsByMedicalRecord(
            @PathVariable Long medicalRecordId,
            Principal connectedUser
    ) {
        List<ImagingResultResponse> response = clinicalService.getImagingResultsByMedicalRecord(medicalRecordId, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách chẩn đoán hình ảnh thành công!"));
    }

    @DeleteMapping("imaging/{id}")
    @Operation(summary = "5.6 Xóa kết quả chẩn đoán hình ảnh", 
               description = "Xóa một kết quả chụp chiếu")
    public ResponseEntity<ApiResponse<Void>> deleteImagingResult(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        clinicalService.deleteImagingResult(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa kết quả chẩn đoán hình ảnh thành công!"));
    }

    // ==========================================
    // 3. TỆP ĐÍNH KÈM Y TẾ
    // ==========================================

    @PostMapping("attachments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "5.7 Đính kèm tệp kết quả y tế", 
               description = "Lưu thông tin metadata của tài liệu y tế (hình ảnh X-quang, phiếu kết quả PDF)")
    public ResponseEntity<ApiResponse<MedicalAttachmentResponse>> addAttachment(
            @RequestBody @Valid MedicalAttachmentRequest request,
            Principal connectedUser
    ) {
        MedicalAttachmentResponse response = clinicalService.addAttachment(request, connectedUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Đính kèm tệp y tế thành công!"));
    }

    @GetMapping("attachments/record/{medicalRecordId}")
    @Operation(summary = "5.8 Danh sách tệp đính kèm theo bệnh án", 
               description = "Lấy toàn bộ các tài liệu, hình ảnh, phiếu kết quả đã đính kèm vào bệnh án")
    public ResponseEntity<ApiResponse<List<MedicalAttachmentResponse>>> getAttachmentsByMedicalRecord(
            @PathVariable Long medicalRecordId,
            Principal connectedUser
    ) {
        List<MedicalAttachmentResponse> response = clinicalService.getAttachmentsByMedicalRecord(medicalRecordId, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách tệp đính kèm thành công!"));
    }

    @DeleteMapping("attachments/{id}")
    @Operation(summary = "5.9 Xóa mềm tệp đính kèm", 
               description = "Đánh dấu xóa mềm tệp đính kèm (deleted = true)")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable Long id,
            Principal connectedUser
    ) {
        clinicalService.deleteAttachment(id, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa tệp đính kèm thành công!"));
    }
}
