package com.spring.temp.domain.model.enums;

public enum AppointmentStatus {
    PENDING,     // Bệnh nhân gửi yêu cầu - Chờ bác sĩ tiếp nhận & xác nhận
    CONFIRMED,   // Bác sĩ đã chấp nhận xếp lịch hẹn
    SCHEDULED,   // Đã xếp lịch
    RESCHEDULED, // Bác sĩ hẹn lại ngày/giờ khác kèm lời nhắn
    CANCELLED,   // Bác sĩ từ chối hoặc người bệnh hủy
    COMPLETED    // Đã khám xong
}
