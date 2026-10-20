package com.spring.temp.domain.dto.metric;

import com.spring.temp.domain.model.enums.MetricType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HealthMetricResponse {

    private Long id;
    private Long profileId;
    private MetricType metricType;
    private BigDecimal valueNumeric1;
    private BigDecimal valueNumeric2;
    private String unit;
    private String notes;
    private LocalDateTime measuredAt;
    private String evaluation; // Tự động đánh giá: "Bình thường", "Tăng huyết áp độ 1", "Tiền đái tháo đường", v.v.
    private String statusColor; // SUCCESS, WARNING, DANGER
}
