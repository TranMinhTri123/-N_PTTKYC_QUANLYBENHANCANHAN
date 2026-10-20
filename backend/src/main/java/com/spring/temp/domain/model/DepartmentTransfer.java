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
@Table(name = "department_transfers")
public class DepartmentTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    @JsonIgnore
    private MedicalRecord medicalRecord;

    @Column(nullable = false, length = 150)
    private String fromDepartment; // Khoa chuyển đi

    @Column(nullable = false, length = 150)
    private String toDepartment; // Khoa chuyển đến

    @Column(nullable = false)
    private LocalDateTime transferredAt; // Ngày giờ chuyển

    private Integer daysInDepartment; // Số ngày điều trị tại khoa
}
