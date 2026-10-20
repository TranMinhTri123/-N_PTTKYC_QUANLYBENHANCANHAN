package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "lab_test_results")
public class LabTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    @JsonIgnore
    private MedicalRecord medicalRecord;

    @Column(nullable = false, length = 200)
    private String testName; // Tên xét nghiệm (ví dụ: Đường huyết đói, Công thức máu...)

    @Column(length = 50)
    private String testCategory; // Nhóm xét nghiệm: Sinh hóa, Huyết học, Nước tiểu...

    @Column(nullable = false, length = 100)
    private String testValue; // Kết quả đo (ví dụ: 6.5)

    @Column(length = 100)
    private String referenceRange; // Khoảng tham chiếu bình thường (ví dụ: 3.9 - 6.4)

    @Column(length = 30)
    private String unit; // Đơn vị đo (mmol/L, g/L...)

    @Builder.Default
    private boolean abnormal = false; // Đánh giá bất thường (cao/thấp)

    @Column(length = 500)
    private String evaluation; // Nhận định của bác sĩ

    @Column(nullable = false)
    private LocalDate testDate; // Ngày thực hiện xét nghiệm
}
