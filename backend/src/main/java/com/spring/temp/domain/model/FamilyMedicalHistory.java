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
@Table(name = "family_medical_histories")
public class FamilyMedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private HealthProfile profile;

    @Column(nullable = false, length = 50)
    private String relativeRelationship; // Cha, Mẹ, Ông, Bà, Anh/Chị/Em

    @Column(nullable = false, length = 255)
    private String diseaseName;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;
}
