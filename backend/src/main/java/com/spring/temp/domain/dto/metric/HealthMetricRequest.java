package com.spring.temp.domain.dto.metric;

import com.spring.temp.domain.model.enums.MetricType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HealthMetricRequest {

    @NotNull(message = "ID hồ sơ không được để trống")
    private Long profileId;

    @NotNull(message = "Loại chỉ số không được để trống")
    private MetricType metricType;

    @NotNull(message = "Giá trị đo không được để trống")
    private BigDecimal valueNumeric1;

    private BigDecimal valueNumeric2;

    @NotNull(message = "Đơn vị đo không được để trống")
    private String unit;

    private String notes;

    private LocalDateTime measuredAt;
}
