package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "prenatal_visits")
public class PrenatalVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obstetric_record_id", nullable = false)
    @JsonIgnore
    private ObstetricRecordDetail obstetricRecord;

    @Column(nullable = false)
    private LocalDate visitDate; // Ngày khám thai

    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal gestationalWeeks; // Tuổi thai khi khám (tuần)

    @Column(precision = 5, scale = 2)
    private BigDecimal maternalWeightKg; // Cân nặng mẹ (kg)

    @Column(length = 20)
    private String maternalBp; // Huyết áp mẹ (mmHg)

    @Column(precision = 4, scale = 1)
    private BigDecimal fundalHeightCm; // Bề cao tử cung (cm)

    private Integer fetalHeartRate; // Tim thai (nhịp/phút)

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String ultrasoundFindings; // Kết quả siêu âm

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes; // Lời dặn
}
