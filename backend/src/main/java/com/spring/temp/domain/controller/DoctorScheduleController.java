package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.model.DoctorLeave;
import com.spring.temp.domain.model.DoctorSchedule;
import com.spring.temp.domain.model.MedicalAppointment;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.repository.DoctorLeaveRepository;
import com.spring.temp.domain.repository.DoctorScheduleRepository;
import com.spring.temp.domain.repository.MedicalAppointmentRepository;
import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.exception.BadRequestException;
import com.spring.temp.exception.NotFoundException;
import com.spring.temp.exception.UserNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "17. Lịch làm việc & Ca trực Bác sĩ", description = "Quản lý ca trực tuần, đăng ký ngày nghỉ và đồng bộ chặn lịch hẹn đặt trước")
public class DoctorScheduleController {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorLeaveRepository leaveRepository;
    private final MedicalAppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Principal connectedUser) {
        if (connectedUser == null) {
            throw new UserNotFoundException("Chưa đăng nhập!");
        }
        return userRepository.findByEmail(connectedUser.getName())
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy thông tin tài khoản!"));
    }

    // =========================================================================
    // 1. CA TRỰC HÀNG TUẦN (WEEKLY SHIFTS)
    // =========================================================================

    @GetMapping("/doctor-schedules/me")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Lấy cấu hình ca trực tuần của bác sĩ hiện tại")
    public ResponseEntity<ApiResponse<List<DoctorSchedule>>> getMySchedules(Principal principal) {
        User doctor = getAuthenticatedUser(principal);
        List<DoctorSchedule> list = scheduleRepository.findByDoctorId(doctor.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PutMapping("/doctor-schedules/me")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Transactional
    @Operation(summary = "Cập nhật ca trực tuần của bác sĩ hiện tại")
    public ResponseEntity<ApiResponse<List<DoctorSchedule>>> updateMySchedules(
            @RequestBody List<DoctorSchedule> schedules,
            Principal principal
    ) {
        User doctor = getAuthenticatedUser(principal);
        scheduleRepository.deleteByDoctorId(doctor.getId());

        for (DoctorSchedule s : schedules) {
            s.setId(null);
            s.setDoctorId(doctor.getId());
        }
        List<DoctorSchedule> saved = scheduleRepository.saveAll(schedules);
        return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật ca trực hàng tuần thành công!"));
    }

    // =========================================================================
    // 2. ĐĂNG KÝ NGÀY NGHỈ / NGHỈ PHÉP (LEAVES / OFF-DAYS)
    // =========================================================================

    @GetMapping("/doctor-leaves/me")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Lấy danh sách các ngày nghỉ đã đăng ký của bác sĩ")
    public ResponseEntity<ApiResponse<List<DoctorLeave>>> getMyLeaves(Principal principal) {
        User doctor = getAuthenticatedUser(principal);
        List<DoctorLeave> list = leaveRepository.findByDoctorIdOrderByLeaveDateAsc(doctor.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/doctor-leaves")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Transactional
    @Operation(summary = "Bác sĩ đăng ký ngày nghỉ mới")
    public ResponseEntity<ApiResponse<DoctorLeave>> createLeave(
            @RequestBody DoctorLeave request,
            Principal principal
    ) {
        User doctor = getAuthenticatedUser(principal);
        LocalDate leaveDate = request.getLeaveDate();

        if (leaveDate == null) {
            throw new BadRequestException("Vui lòng chọn ngày nghỉ!");
        }
        if (leaveDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Không thể đăng ký ngày nghỉ ở trong quá khứ!");
        }
        if (leaveDate.isAfter(LocalDate.now().plusDays(30))) {
            throw new BadRequestException("Ngày nghỉ không được vượt quá 30 ngày (MAX_BOOKING_DAYS = 30)!");
        }
        if (leaveRepository.existsByDoctorIdAndLeaveDate(doctor.getId(), leaveDate)) {
            throw new BadRequestException("Ngày " + leaveDate + " đã được đăng ký nghỉ trước đó!");
        }

        DoctorLeave leave = DoctorLeave.builder()
                .doctorId(doctor.getId())
                .leaveDate(leaveDate)
                .leaveType(request.getLeaveType() != null ? request.getLeaveType() : "Nghỉ phép")
                .reason(request.getReason() != null ? request.getReason() : "Việc cá nhân")
                .build();

        DoctorLeave saved = leaveRepository.save(leave);

        // Đếm số lịch hẹn trùng để trả về cảnh báo cho bác sĩ
        LocalDateTime startOfDay = leaveDate.atStartOfDay();
        LocalDateTime endOfDay = leaveDate.atTime(23, 59, 59);
        List<MedicalAppointment> conflicts = appointmentRepository.findByDoctorIdOrDoctorName(doctor.getId(), doctor.getLastName() != null ? doctor.getLastName() : doctor.fullName())
                .stream()
                .filter(a -> a.getAppointmentTime() != null 
                        && !a.getAppointmentTime().isBefore(startOfDay) 
                        && !a.getAppointmentTime().isAfter(endOfDay)
                        && a.getStatus() != com.spring.temp.domain.model.enums.AppointmentStatus.CANCELLED)
                .toList();

        String message = "Đăng ký ngày nghỉ thành công!";
        if (!conflicts.isEmpty()) {
            message = "Đăng ký ngày nghỉ thành công! CẢNH BÁO: Có " + conflicts.size() + " bệnh nhân đã đặt lịch trong ngày này. Vui lòng dời lịch hoặc liên hệ bệnh nhân.";
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, message));
    }

    @DeleteMapping("/doctor-leaves/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Transactional
    @Operation(summary = "Hủy ngày nghỉ đã đăng ký")
    public ResponseEntity<ApiResponse<Void>> deleteLeave(@PathVariable Long id, Principal principal) {
        User doctor = getAuthenticatedUser(principal);
        DoctorLeave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin ngày nghỉ"));

        boolean isAdmin = doctor.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        if (!isAdmin && !leave.getDoctorId().equals(doctor.getId())) {
            throw new BadRequestException("Bạn chỉ có quyền xóa ngày nghỉ của chính mình!");
        }

        leaveRepository.delete(leave);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã hủy ngày nghỉ thành công!"));
    }

    // =========================================================================
    // 3. API ĐỒNG BỘ VỚI FORM ĐẶT LỊCH CỦA BỆNH NHÂN (PUBLIC / AUTHENTICATED)
    // =========================================================================

    @GetMapping("/doctor-schedules/doctor/{doctorId}")
    @Operation(summary = "Lấy cấu hình ca trực tuần của bác sĩ để hiển thị và đồng bộ ca sáng/chiều khi đặt lịch")
    public ResponseEntity<ApiResponse<List<DoctorSchedule>>> getDoctorSchedules(@PathVariable Long doctorId) {
        List<DoctorSchedule> list = scheduleRepository.findByDoctorId(doctorId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/doctor-leaves/doctor/{doctorId}")
    @Operation(summary = "Lấy danh sách các ngày nghỉ của bác sĩ để hiển thị và chặn trên DatePicker đặt lịch")
    public ResponseEntity<ApiResponse<List<String>>> getDoctorOffDates(@PathVariable Long doctorId) {
        List<DoctorLeave> leaves = leaveRepository.findByDoctorIdAndLeaveDateGreaterThanEqualOrderByLeaveDateAsc(doctorId, LocalDate.now());
        List<String> dateStrings = leaves.stream()
                .map(l -> l.getLeaveDate().toString())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dateStrings));
    }
}

