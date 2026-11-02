package com.spring.temp.domain.dto.appointment;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAppointmentActionRequest {

    @NotBlank(message = "Hành động xử lý lịch hẹn không được để trống (CONFIRM, RESCHEDULE, REJECT)")
    private String action; // "CONFIRM", "RESCHEDULE", "REJECT"

    private String doctorNote; // Lời nhắn hoặc lý do hẹn lại / từ chối

    private LocalDateTime rescheduledTime; // Ngày giờ đề xuất mới nếu chọn RESCHEDULE
}
