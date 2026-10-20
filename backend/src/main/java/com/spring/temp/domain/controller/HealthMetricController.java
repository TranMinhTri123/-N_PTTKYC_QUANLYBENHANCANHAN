package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.dto.common.PageResponse;
import com.spring.temp.domain.dto.metric.HealthMetricRequest;
import com.spring.temp.domain.dto.metric.HealthMetricResponse;
import com.spring.temp.domain.dto.metric.MetricSummaryResponse;
import com.spring.temp.domain.model.enums.MetricType;
import com.spring.temp.domain.service.HealthMetricService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/health-metrics", "/metrics"})
@RequiredArgsConstructor
@Tag(name = "11. Chỉ số sức khỏe tại nhà (Health Metrics)", description = "APIs theo dõi và tự động phân loại huyết áp, đường huyết, SpO2, nhịp tim, cân nặng")
public class HealthMetricController {

    private final HealthMetricService healthMetricService;

    @PostMapping
    @Operation(summary = "Ghi nhận chỉ số sức khỏe tự đo tại nhà", description = "Lưu và tự động đánh giá phân loại tình trạng sức khỏe")
    public ResponseEntity<ApiResponse<HealthMetricResponse>> recordMetric(
            @Valid @RequestBody HealthMetricRequest request) {
        HealthMetricResponse response = healthMetricService.recordMetric(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Ghi nhận chỉ số sức khỏe thành công"));
    }

    @GetMapping("/profile/{profileId}")
    @Operation(summary = "Lấy toàn bộ lịch sử chỉ số sức khỏe của hồ sơ", description = "Sắp xếp theo thời gian đo mới nhất")
    public ResponseEntity<ApiResponse<List<HealthMetricResponse>>> getAllMetrics(
            @PathVariable Long profileId) {
        List<HealthMetricResponse> list = healthMetricService.getAllMetricsByProfile(profileId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/profile/{profileId}/by-type")
    @Operation(summary = "Lấy lịch sử chỉ số theo từng loại phân trang", description = "Tra cứu riêng Huyết áp, Đường huyết, SpO2, Nhịp tim...")
    public ResponseEntity<ApiResponse<PageResponse<HealthMetricResponse>>> getMetricsByType(
            @PathVariable Long profileId,
            @RequestParam MetricType metricType,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<HealthMetricResponse> page = healthMetricService.getMetricsByType(profileId, metricType, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }

    @GetMapping("/profile/{profileId}/summary")
    @Operation(summary = "Bảng tổng hợp chỉ số sức khỏe gần nhất (Dashboard)", description = "Trả về chỉ số huyết áp, đường huyết, nhịp tim, SpO2, cân nặng mới nhất")
    public ResponseEntity<ApiResponse<MetricSummaryResponse>> getSummary(
            @PathVariable Long profileId) {
        MetricSummaryResponse summary = healthMetricService.getMetricSummary(profileId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa bản ghi chỉ số sức khỏe", description = "Xóa bản ghi chỉ số đã nhập sai")
    public ResponseEntity<ApiResponse<Void>> deleteMetric(@PathVariable Long id) {
        healthMetricService.deleteMetric(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa bản ghi chỉ số thành công"));
    }
}
