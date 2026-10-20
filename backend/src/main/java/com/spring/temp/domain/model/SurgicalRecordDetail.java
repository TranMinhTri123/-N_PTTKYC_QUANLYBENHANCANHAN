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
@Table(name = "surgical_record_details")
public class SurgicalRecordDetail {

    @Id
    private Long recordId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "record_id")
    @JsonIgnore
    private MedicalRecord medicalRecord;

    @Column(length = 500)
    private String preOpDiagnosis; // Chẩn đoán trước mổ

    @Column(length = 500)
    private String postOpDiagnosis; // Chẩn đoán sau mổ

    @Column(length = 50)
    private String anesthesiaMethod; // Phương pháp vô cảm (Mê nội khí quản, tê tủy...)

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String postOpMonitoring; // Theo dõi hậu phẫu (vết mổ, dẫn lưu...)

    private LocalDate drainRemovalDate; // Ngày rút dẫn lưu

    private LocalDate sutureRemovalDate; // Ngày cắt chỉ

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String postOpCareGuidelines; // Hướng dẫn chăm sóc sau mổ

    @OneToMany(mappedBy = "surgicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SurgicalProcedure> procedures;
}
