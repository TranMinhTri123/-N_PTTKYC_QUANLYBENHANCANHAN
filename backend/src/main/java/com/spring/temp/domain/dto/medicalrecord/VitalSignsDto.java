package com.spring.temp.domain.dto.medicalrecord;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Thông tin chỉ số sinh hiệu lâm sàng")
public class VitalSignsDto {

    private Long id;

    @Schema(description = "Mạch (lần/phút)", example = "78")
    private Integer pulse;

    @DecimalMin(value = "30.0", message = "Nhiệt độ không hợp lệ")
    @DecimalMax(value = "45.0", message = "Nhiệt độ không hợp lệ")
    @Schema(description = "Nhiệt độ cơ thể (°C)", example = "36.8")
    private BigDecimal temperature;

    @Schema(description = "Huyết áp tâm thu (mmHg)", example = "120")
    private Integer systolicBp;

    @Schema(description = "Huyết áp tâm trương (mmHg)", example = "80")
    private Integer diastolicBp;

    @Schema(description = "Nhịp thở (lần/phút)", example = "18")
    private Integer respiratoryRate;

    @DecimalMin(value = "50.0")
    @DecimalMax(value = "100.0")
    @Schema(description = "Nồng độ oxy trong máu SpO2 (%)", example = "98.5")
    private BigDecimal spo2;

    @Schema(description = "Cân nặng (kg)", example = "65.5")
    private BigDecimal weightKg;

    @Schema(description = "Chiều cao (cm)", example = "170.0")
    private BigDecimal heightCm;

    @Schema(description = "Chỉ số khối cơ thể BMI (Hệ thống tự tính nếu để trống)", example = "22.7")
    private BigDecimal bmi;

    @Schema(description = "Thời điểm đo sinh hiệu")
    private LocalDateTime recordedAt;
}
