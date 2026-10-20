package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "surgical_procedures")
public class SurgicalProcedure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surgical_record_id", nullable = false)
    @JsonIgnore
    private SurgicalRecordDetail surgicalRecord;

    @Column(nullable = false, length = 255)
    private String procedureName; // Tên phẫu thuật / thủ thuật

    @Column(nullable = false, length = 30)
    private String procedureType; // EMERGENCY (Cấp cứu), ELECTIVE (Chương trình)

    @Column(length = 150)
    private String leadSurgeon; // Phẫu thuật viên chính

    private LocalDateTime startTime; // Bắt đầu mổ

    private LocalDateTime endTime; // Kết thúc mổ

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String operativeReport; // Tường trình phẫu thuật

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String intraOpComplications; // Biến chứng trong mổ

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String postOpComplications; // Biến chứng sau mổ
}
