package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "pediatric_record_details")
public class PediatricRecordDetail {

    @Id
    private Long recordId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "record_id")
    @JsonIgnore
    private MedicalRecord medicalRecord;

    // Thông tin nhân khẩu phụ huynh (Mẫu MS: 02/BV-01)
    @Column(length = 150)
    private String fatherName; // Họ tên bố

    @Column(length = 100)
    private String fatherEducationLevel; // Trình độ văn hóa của bố

    @Column(length = 150)
    private String fatherOccupation; // Nghề nghiệp của bố

    @Column(length = 150)
    private String motherName; // Họ tên mẹ

    @Column(length = 100)
    private String motherEducationLevel; // Trình độ văn hóa của mẹ

    @Column(length = 150)
    private String motherOccupation; // Nghề nghiệp của mẹ

    // Thông tin sơ sinh
    @Column(precision = 4, scale = 1)
    private BigDecimal gestationalAgeWeeks; // Tuổi thai khi sinh (tuần)

    private Integer birthWeightGrams; // Cân nặng lúc sinh (gram)

    @Column(length = 30)
    private String deliveryMethod; // Đẻ thường / Đẻ mổ

    private Integer apgar1min; // Apgar 1 phút

    private Integer apgar5min; // Apgar 5 phút

    // Nuôi dưỡng & Phát triển
    @Column(length = 50)
    private String feedingRegimen; // Sữa mẹ, Sữa công thức, Ăn dặm

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String psychomotorDevelopment; // Đánh giá tâm thần vận động (lật, ngồi, bò, đi, nói)
}
