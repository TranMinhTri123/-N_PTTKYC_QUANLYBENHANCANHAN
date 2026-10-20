package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "obstetric_record_details")
public class ObstetricRecordDetail {

    @Id
    private Long recordId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "record_id")
    @JsonIgnore
    private MedicalRecord medicalRecord;

    // Tiền sử kinh nguyệt
    private Integer menarcheAge; // Tuổi có kinh
    private Integer menstrualCycleDays; // Chu kỳ kinh nguyệt (ngày)
    private LocalDate lmpDate; // Ngày đầu kỳ kinh cuối (Last Menstrual Period)
    private LocalDate eddDate; // Ngày dự sinh (Estimated Due Date - tính Naegele)

    @Column(precision = 4, scale = 1)
    private BigDecimal gestationalAgeWeeks; // Tuổi thai hiện tại (tuần)

    // Tiền sử sản khoa PARA
    @Builder.Default
    private Integer paraTerm = 0; // Đủ tháng

    @Builder.Default
    private Integer paraPreterm = 0; // Đẻ non

    @Builder.Default
    private Integer paraAbortion = 0; // Sảy / Hút thai

    @Builder.Default
    private Integer paraLiving = 0; // Con sống

    @Builder.Default
    private Integer cesareanHistoryCount = 0; // Số lần mổ đẻ cũ

    // Cuộc đẻ
    private LocalDateTime deliveryDateTime; // Ngày giờ sinh

    @Column(length = 50)
    private String deliveryMethod; // Đẻ thường / Mổ lấy thai / Forceps

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String deliveryComplications; // Biến chứng cuộc đẻ

    // Sơ sinh
    @Column(length = 10)
    private String newbornGender; // Giới tính bé

    private Integer newbornWeightGrams; // Cân nặng bé (gram)

    private Integer newbornApgar; // Điểm Apgar của bé

    // Hậu sản
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String postpartumCondition; // Tình trạng hậu sản (co tử cung, sản dịch)

    private LocalDate postpartumRevisitDate; // Hẹn khám hậu sản (6 tuần)

    @OneToMany(mappedBy = "obstetricRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PrenatalVisit> prenatalVisits;
}
