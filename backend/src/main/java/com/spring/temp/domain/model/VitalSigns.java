package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "vital_signs")
public class VitalSigns {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false, unique = true)
    @JsonIgnore
    private MedicalRecord medicalRecord;

    private Integer pulse; // Mạch (lần/phút)

    @Column(precision = 4, scale = 1)
    private BigDecimal temperature; // Nhiệt độ (°C)

    private Integer systolicBp; // Huyết áp tâm thu (mmHg)

    private Integer diastolicBp; // Huyết áp tâm trương (mmHg)

    private Integer respiratoryRate; // Nhịp thở (lần/phút)

    @Column(precision = 4, scale = 1)
    private BigDecimal spo2; // SpO2 (%)

    @Column(precision = 5, scale = 2)
    private BigDecimal weightKg; // Cân nặng (kg)

    @Column(precision = 5, scale = 1)
    private BigDecimal heightCm; // Chiều cao (cm)

    @Column(precision = 4, scale = 1)
    private BigDecimal bmi; // BMI (tự tính)

    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();
}
