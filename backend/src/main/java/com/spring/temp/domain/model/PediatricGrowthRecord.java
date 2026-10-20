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
@Table(name = "pediatric_growth_records")
public class PediatricGrowthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private HealthProfile profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id")
    @JsonIgnore
    private MedicalRecord record;

    @Column(nullable = false)
    private LocalDate measuredDate;

    @Column(nullable = false)
    private Integer ageMonths; // Tháng tuổi

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal weightKg; // Cân nặng (kg)

    @Column(nullable = false, precision = 5, scale = 1)
    private BigDecimal heightCm; // Chiều cao (cm)

    @Column(precision = 4, scale = 1)
    private BigDecimal headCircumferenceCm; // Vòng đầu (cm)
}
