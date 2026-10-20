package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.dto.doctornote.DoctorNoteRequest;
import com.spring.temp.domain.dto.doctornote.DoctorNoteResponse;
import com.spring.temp.domain.service.DoctorNoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor-notes")
@RequiredArgsConstructor
@Tag(name = "13. Ghi chú Bác sĩ (Doctor Notes)", description = "APIs dành cho Bác sĩ ghi nhận xét, đánh giá chuyên môn trên bệnh án")
public class DoctorNoteController {

    private final DoctorNoteService doctorNoteService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Thêm ghi chú đánh giá của Bác sĩ", description = "Chỉ tài khoản có quyền DOCTOR hoặc ADMIN được thực hiện")
    public ResponseEntity<ApiResponse<DoctorNoteResponse>> addNote(
            @Valid @RequestBody DoctorNoteRequest request) {
        DoctorNoteResponse response = doctorNoteService.addNote(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Thêm ghi chú bác sĩ thành công"));
    }

    @GetMapping("/record/{medicalRecordId}")
    @Operation(summary = "Lấy danh sách ghi chú bác sĩ theo bệnh án", description = "Xem lịch sử các ghi chú, tư vấn của bác sĩ")
    public ResponseEntity<ApiResponse<List<DoctorNoteResponse>>> getNotesByRecord(
            @PathVariable Long medicalRecordId) {
        List<DoctorNoteResponse> list = doctorNoteService.getNotesByMedicalRecord(medicalRecordId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
