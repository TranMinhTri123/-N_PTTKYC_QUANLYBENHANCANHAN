package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "internal_record_details")
public class InternalRecordDetail {

    @Id
    private Long recordId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "record_id")
    @JsonIgnore
    private MedicalRecord medicalRecord;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String circulatorySystem; // Tuần hoàn

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String respiratorySystem; // Hô hấp

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String digestiveSystem; // Tiêu hóa

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String urinarySystem; // Thận - Tiết niệu

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String nervousSystem; // Thần kinh

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String musculoskeletalSystem; // Cơ xương khớp

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String endocrineSystem; // Nội tiết

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String otherOrgans; // Cơ quan khác

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String chronicMonitoringSummary; // Bệnh mạn tính đang theo dõi

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String longTermMedicationPlan; // Kế hoạch dùng thuốc dài hạn
}
