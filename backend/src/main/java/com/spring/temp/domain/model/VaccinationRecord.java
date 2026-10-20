package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.spring.temp.domain.model.enums.VaccinationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "vaccination_records")
public class VaccinationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private HealthProfile profile;

    @Column(nullable = false, length = 200)
    private String vaccineName; // Tên vắc-xin

    @Column(nullable = false)
    private Integer doseOrder; // Mũi thứ mấy (1, 2, 3...)

    @Column(nullable = false)
    private LocalDate administeredDate; // Ngày tiêm

    @Column(length = 255)
    private String administeredFacility; // Nơi tiêm

    @Column(length = 500)
    private String adverseReactions; // Phản ứng sau tiêm

    private LocalDate nextScheduledDate; // Ngày nhắc mũi tiếp theo

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private VaccinationStatus status = VaccinationStatus.COMPLETED;
}
