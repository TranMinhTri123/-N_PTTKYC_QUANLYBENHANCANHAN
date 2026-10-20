package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.spring.temp.domain.model.enums.MetricType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "health_metrics")
public class HealthMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private HealthProfile profile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MetricType metricType; // BLOOD_PRESSURE, BLOOD_SUGAR, HEART_RATE, WEIGHT...

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal valueNumeric1; // Giá trị 1 (hoặc huyết áp tâm thu)

    @Column(precision = 8, scale = 2)
    private BigDecimal valueNumeric2; // Giá trị 2 (huyết áp tâm trương, nếu có)

    @Column(nullable = false, length = 30)
    private String unit; // mmHg, mg/dL, bpm, kg, °C...

    @Column(length = 255)
    private String notes; // Ghi chú (Đo lúc đói, sau khi tập thể dục...)

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime measuredAt = LocalDateTime.now();
}
