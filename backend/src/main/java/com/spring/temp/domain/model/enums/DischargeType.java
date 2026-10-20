package com.spring.temp.domain.model.enums;

public enum DischargeType {
    RECOVERED,              // 1. Ra viện (khỏi/đỡ)
    DISCHARGE_REQUEST,      // 2. Xin về
    ABSCONDED,              // 3. Bỏ về
    TERMINAL_DISCHARGE,     // 4. Đưa về (tiên lượng tử vong)
    TRANSFERRED,            // Chuyển viện
    DECEASED                // Tử vong
}
