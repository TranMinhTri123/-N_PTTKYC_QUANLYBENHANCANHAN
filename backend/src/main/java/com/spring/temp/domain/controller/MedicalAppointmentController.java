package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.appointment.MedicalAppointmentRequest;
import com.spring.temp.domain.dto.appointment.MedicalAppointmentResponse;
import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.dto.common.PageResponse;
import com.spring.temp.domain.model.enums.AppointmentStatus;
import com.spring.temp.domain.service.MedicalAppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "12. Lịch hẹn khám (Medical Appointments)", description = "APIs đặt lịch tái khám, lịch tiêm chủng, lịch khám thai và nhắc hẹn")
public class MedicalAppointmentController {

    private final MedicalAppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Đặt lịch hẹn khám / Tái khám mới", description = "Tạo lịch hẹn khám gắn với hồ sơ người bệnh và đợt khám")
    public ResponseEntity<ApiResponse<MedicalAppointmentResponse>> createAppointment(
            @Valid @RequestBody MedicalAppointmentRequest request) {
        MedicalAppointmentResponse response = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Đặt lịch hẹn khám thành công"));
    }

    @GetMapping
    @Operation(summary = "Danh sách lịch hẹn của hồ sơ hoặc người dùng", description = "Lấy tất cả lịch hẹn nếu profileId để trống")
    public ResponseEntity<ApiResponse<List<MedicalAppointmentResponse>>> getAllAppointments(
            @RequestParam(required = false) Long profileId) {
        List<MedicalAppointmentResponse> list = appointmentService.getAllAppointments(profileId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Danh sách lịch hẹn sắp tới của người dùng", description = "Lấy các lịch hẹn trạng thái SCHEDULED")
    public ResponseEntity<ApiResponse<List<MedicalAppointmentResponse>>> getUpcomingAppointments(
            @RequestParam(required = false) Long profileId) {
        List<MedicalAppointmentResponse> list = appointmentService.getUpcomingAppointments(profileId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/profile/{profileId}")
    @Operation(summary = "Danh sách lịch hẹn của hồ sơ (Phân trang)", description = "Sắp xếp theo thời gian hẹn mới nhất")
    public ResponseEntity<ApiResponse<PageResponse<MedicalAppointmentResponse>>> getAppointments(
            @PathVariable Long profileId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<MedicalAppointmentResponse> page = appointmentService.getAppointments(profileId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }

    @GetMapping("/profile/{profileId}/upcoming")
    @Operation(summary = "Danh sách lịch hẹn sắp tới", description = "Lấy các lịch hẹn trạng thái SCHEDULED hoặc CONFIRMED")
    public ResponseEntity<ApiResponse<List<MedicalAppointmentResponse>>> getUpcomingAppointmentsByProfile(
            @PathVariable Long profileId) {
        List<MedicalAppointmentResponse> list = appointmentService.getUpcomingAppointments(profileId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @Operation(summary = "Cập nhật trạng thái lịch hẹn", description = "Đổi trạng thái sang CONFIRMED, COMPLETED, CANCELLED")
    public ResponseEntity<ApiResponse<MedicalAppointmentResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        MedicalAppointmentResponse response = appointmentService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật trạng thái lịch hẹn thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa lịch hẹn khám", description = "Xóa lịch hẹn đã hủy hoặc không còn nhu cầu")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa lịch hẹn thành công"));
    }
}
