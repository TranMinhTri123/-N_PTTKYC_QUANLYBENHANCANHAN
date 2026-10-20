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
@Table(name = "chronic_diseases")
public class ChronicDisease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private HealthProfile profile;

    @Column(nullable = false, length = 255)
    private String diseaseName;

    @Column(length = 20)
    private String icd10Code;

    private Integer diagnosedYear;

    @Column(length = 100)
    private String treatmentStatus;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;
}
