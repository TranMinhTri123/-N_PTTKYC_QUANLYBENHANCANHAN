package com.spring.temp.domain.model.enums;

public enum EncounterStatus {
    DRAFT,      // Đang lập - Bác sĩ đang nhập liệu, bệnh nhân không thấy
    COMPLETED,  // Khám xong - Chờ kiểm duyệt hoặc hoàn tất kết quả CLS
    PUBLISHED   // Đã phát hành chính thức - Bệnh nhân xem được trên Cổng thông tin
}

