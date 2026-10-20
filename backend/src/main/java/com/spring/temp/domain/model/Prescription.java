package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    @JsonIgnore
    private MedicalRecord medicalRecord;

    @Column(length = 50)
    private String prescriptionCode; // Mã đơn thuốc

    @Column(length = 150)
    private String prescribingDoctor; // Bác sĩ kê đơn

    @Column(nullable = false)
    private LocalDate prescriptionDate; // Ngày kê đơn

    @Column(length = 500)
    private String diagnosisSummary; // Chẩn đoán

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes; // Lời dặn của bác sĩ

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescriptionItem> items;
}
