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
@Table(name = "imaging_results")
public class ImagingResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    @JsonIgnore
    private MedicalRecord medicalRecord;

    @Column(nullable = false, length = 50)
    private String imagingModality; // XRAY, ULTRASOUND, CT_SCAN, MRI, ECG (Điện tim)

    @Column(nullable = false, length = 150)
    private String anatomicalRegion; // Vị trí chụp: Ngực thẳng, Ổ bụng, Khớp gối...

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String findingsDescription; // Mô tả hình ảnh

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String conclusion; // Kết luận

    @Column(nullable = false)
    private LocalDate procedureDate; // Ngày thực hiện
}
