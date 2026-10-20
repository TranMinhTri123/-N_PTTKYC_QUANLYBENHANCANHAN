package com.spring.temp.domain.dto.metric;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MetricSummaryResponse {

    private Long profileId;
    private HealthMetricResponse latestBloodPressure;
    private HealthMetricResponse latestBloodSugar;
    private HealthMetricResponse latestHeartRate;
    private HealthMetricResponse latestWeight;
    private HealthMetricResponse latestSpO2;
    private List<HealthMetricResponse> recentMetrics;
}
