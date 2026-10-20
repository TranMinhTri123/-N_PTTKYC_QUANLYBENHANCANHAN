package com.spring.temp.domain.service;

import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.domain.dto.metric.HealthMetricRequest;
import com.spring.temp.domain.dto.metric.HealthMetricResponse;
import com.spring.temp.domain.dto.metric.MetricSummaryResponse;
import com.spring.temp.domain.model.HealthMetric;
import com.spring.temp.domain.model.HealthProfile;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.model.enums.MetricType;
import com.spring.temp.domain.repository.HealthMetricRepository;
import com.spring.temp.domain.repository.HealthProfileRepository;
import com.spring.temp.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthMetricService {

    private final HealthMetricRepository healthMetricRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Yêu cầu đăng nhập");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin tài khoản"));
    }

    private void checkProfileOwnership(HealthProfile profile, User user) {
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        if (!isAdmin && !profile.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền quản lý hồ sơ này");
        }
    }

    @Transactional
    public HealthMetricResponse recordMetric(HealthMetricRequest request) {
        User currentUser = getCurrentUser();
        HealthProfile profile = healthProfileRepository.findById(request.getProfileId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
        checkProfileOwnership(profile, currentUser);

        // Kiểm tra tính hợp lý về thời gian đo
        if (request.getMeasuredAt() != null && request.getMeasuredAt().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Thời gian đo không thể ở trong tương lai!");
        }

        // Kiểm tra tính hợp lý theo loại chỉ số
        if (request.getMetricType() == MetricType.BLOOD_PRESSURE) {
            if (request.getValueNumeric1() == null || request.getValueNumeric2() == null) {
                throw new IllegalArgumentException("Huyết áp bắt buộc phải có cả chỉ số tâm thu và tâm trương!");
            }
            if (request.getValueNumeric1().compareTo(BigDecimal.valueOf(50)) < 0 || request.getValueNumeric1().compareTo(BigDecimal.valueOf(260)) > 0) {
                throw new IllegalArgumentException("Huyết áp tâm thu không hợp lý (chỉ chấp nhận từ 50 đến 260 mmHg)!");
            }
            if (request.getValueNumeric2().compareTo(BigDecimal.valueOf(30)) < 0 || request.getValueNumeric2().compareTo(BigDecimal.valueOf(160)) > 0) {
                throw new IllegalArgumentException("Huyết áp tâm trương không hợp lý (chỉ chấp nhận từ 30 đến 160 mmHg)!");
            }
            if (request.getValueNumeric1().compareTo(request.getValueNumeric2()) <= 0) {
                throw new IllegalArgumentException("Huyết áp tâm thu (" + request.getValueNumeric1() + ") phải lớn hơn huyết áp tâm trương (" + request.getValueNumeric2() + ")!");
            }
        } else if (request.getMetricType() == MetricType.SPO2) {
            if (request.getValueNumeric1().compareTo(BigDecimal.valueOf(50)) < 0 || request.getValueNumeric1().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Nồng độ oxy SpO2 không hợp lý (phải từ 50% đến 100%)!");
            }
        } else if (request.getMetricType() == MetricType.HEART_RATE) {
            if (request.getValueNumeric1().compareTo(BigDecimal.valueOf(30)) < 0 || request.getValueNumeric1().compareTo(BigDecimal.valueOf(220)) > 0) {
                throw new IllegalArgumentException("Nhịp tim không hợp lý (phải từ 30 đến 220 lần/phút)!");
            }
        } else if (request.getMetricType() == MetricType.WEIGHT) {
            if (request.getValueNumeric1().compareTo(BigDecimal.valueOf(1)) < 0 || request.getValueNumeric1().compareTo(BigDecimal.valueOf(350)) > 0) {
                throw new IllegalArgumentException("Cân nặng không hợp lý (phải từ 1.0 đến 350.0 kg)!");
            }
        } else if (request.getMetricType() == MetricType.BLOOD_SUGAR) {
            if (request.getValueNumeric1().compareTo(BigDecimal.ZERO) <= 0 || request.getValueNumeric1().compareTo(BigDecimal.valueOf(50)) > 0) {
                throw new IllegalArgumentException("Đường huyết không hợp lý (phải từ 1.0 đến 50.0 mmol/L)!");
            }
        }

        HealthMetric metric = HealthMetric.builder()
                .profile(profile)
                .metricType(request.getMetricType())
                .valueNumeric1(request.getValueNumeric1())
                .valueNumeric2(request.getValueNumeric2())
                .unit(request.getUnit())
                .notes(request.getNotes())
                .measuredAt(request.getMeasuredAt() != null ? request.getMeasuredAt() : LocalDateTime.now())
                .build();

        HealthMetric saved = healthMetricRepository.save(metric);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<HealthMetricResponse> getMetricsByType(Long profileId, MetricType metricType, Pageable pageable) {
        User currentUser = getCurrentUser();
        HealthProfile profile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
        checkProfileOwnership(profile, currentUser);

        return healthMetricRepository.findByProfileIdAndMetricTypeOrderByMeasuredAtDesc(profileId, metricType, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<HealthMetricResponse> getAllMetricsByProfile(Long profileId) {
        User currentUser = getCurrentUser();
        HealthProfile profile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
        checkProfileOwnership(profile, currentUser);

        return healthMetricRepository.findByProfileIdOrderByMeasuredAtDesc(profileId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MetricSummaryResponse getMetricSummary(Long profileId) {
        User currentUser = getCurrentUser();
        HealthProfile profile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ sức khỏe"));
        checkProfileOwnership(profile, currentUser);

        List<HealthMetric> all = healthMetricRepository.findByProfileIdOrderByMeasuredAtDesc(profileId);

        HealthMetric bp = all.stream().filter(m -> m.getMetricType() == MetricType.BLOOD_PRESSURE).findFirst().orElse(null);
        HealthMetric bs = all.stream().filter(m -> m.getMetricType() == MetricType.BLOOD_SUGAR).findFirst().orElse(null);
        HealthMetric hr = all.stream().filter(m -> m.getMetricType() == MetricType.HEART_RATE).findFirst().orElse(null);
        HealthMetric wt = all.stream().filter(m -> m.getMetricType() == MetricType.WEIGHT).findFirst().orElse(null);
        HealthMetric spo2 = all.stream().filter(m -> m.getMetricType() == MetricType.SPO2).findFirst().orElse(null);

        List<HealthMetricResponse> recent = all.stream()
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return MetricSummaryResponse.builder()
                .profileId(profileId)
                .latestBloodPressure(bp != null ? mapToResponse(bp) : null)
                .latestBloodSugar(bs != null ? mapToResponse(bs) : null)
                .latestHeartRate(hr != null ? mapToResponse(hr) : null)
                .latestWeight(wt != null ? mapToResponse(wt) : null)
                .latestSpO2(spo2 != null ? mapToResponse(spo2) : null)
                .recentMetrics(recent)
                .build();
    }

    @Transactional
    public void deleteMetric(Long id) {
        User currentUser = getCurrentUser();
        HealthMetric metric = healthMetricRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy chỉ số sức khỏe"));
        checkProfileOwnership(metric.getProfile(), currentUser);

        healthMetricRepository.delete(metric);
    }

    public HealthMetricResponse mapToResponse(HealthMetric metric) {
        String eval = "Bình thường";
        String color = "SUCCESS";

        if (metric.getMetricType() == MetricType.BLOOD_PRESSURE && metric.getValueNumeric1() != null) {
            double sys = metric.getValueNumeric1().doubleValue();
            Double dia = metric.getValueNumeric2() != null ? metric.getValueNumeric2().doubleValue() : null;
            if (sys >= 140 || (dia != null && dia >= 90)) {
                eval = "Tăng huyết áp độ 2 (Cần tư vấn bác sĩ)";
                color = "DANGER";
            } else if (sys >= 130 || (dia != null && dia >= 80)) {
                eval = "Tăng huyết áp độ 1";
                color = "WARNING";
            } else if (sys >= 120) {
                eval = "Tiền tăng huyết áp";
                color = "WARNING";
            } else if (sys < 90) {
                eval = "Huyết áp thấp";
                color = "WARNING";
            } else {
                eval = "Huyết áp tối ưu";
                color = "SUCCESS";
            }
        } else if (metric.getMetricType() == MetricType.BLOOD_SUGAR && metric.getValueNumeric1() != null) {
            double val = metric.getValueNumeric1().doubleValue();
            if (metric.getUnit() != null && metric.getUnit().toLowerCase().contains("mmol")) {
                val = val * 18.0; // Quy đổi ra mg/dL
            }
            if (val < 70) {
                eval = "Hạ đường huyết (Nguy hiểm)";
                color = "DANGER";
            } else if (val >= 126) {
                eval = "Đường huyết cao (Nguy cơ Đái tháo đường)";
                color = "DANGER";
            } else if (val >= 100) {
                eval = "Tiền đái tháo đường";
                color = "WARNING";
            } else {
                eval = "Đường huyết bình thường";
                color = "SUCCESS";
            }
        } else if (metric.getMetricType() == MetricType.SPO2 && metric.getValueNumeric1() != null) {
            double val = metric.getValueNumeric1().doubleValue();
            if (val < 94) {
                eval = "Thiếu oxy trong máu nghiêm trọng (Cần cấp cứu)";
                color = "DANGER";
            } else if (val < 96) {
                eval = "Oxy máu giảm nhẹ (Cần theo dõi)";
                color = "WARNING";
            } else {
                eval = "Chỉ số SpO2 bình thường";
                color = "SUCCESS";
            }
        } else if (metric.getMetricType() == MetricType.HEART_RATE && metric.getValueNumeric1() != null) {
            double val = metric.getValueNumeric1().doubleValue();
            if (val < 60) {
                eval = "Nhịp tim chậm";
                color = "WARNING";
            } else if (val > 100) {
                eval = "Nhịp tim nhanh";
                color = "WARNING";
            } else {
                eval = "Nhịp tim ổn định";
                color = "SUCCESS";
            }
        }

        return HealthMetricResponse.builder()
                .id(metric.getId())
                .profileId(metric.getProfile().getId())
                .metricType(metric.getMetricType())
                .valueNumeric1(metric.getValueNumeric1())
                .valueNumeric2(metric.getValueNumeric2())
                .unit(metric.getUnit())
                .notes(metric.getNotes())
                .measuredAt(metric.getMeasuredAt())
                .evaluation(eval)
                .statusColor(color)
                .build();
    }
}
