package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.spring.temp.domain.model.enums.Gender;
import com.spring.temp.domain.model.enums.InsuranceType;
import com.spring.temp.domain.model.enums.RelationshipType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "health_profiles")
@EntityListeners(AuditingEntityListener.class)
public class HealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Column(length = 10)
    private String bloodType;

    @Column(length = 20)
    private String cccd;

    @Column(length = 25)
    private String bhytNumber;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private InsuranceType insuranceType = InsuranceType.BHYT;

    private LocalDate insuranceValidUntil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RelationshipType relationship;

    @Column(length = 50)
    @Builder.Default
    private String ethnicity = "Kinh";

    @Column(length = 100)
    @Builder.Default
    private String nationality = "Việt Nam";

    @Column(length = 150)
    private String occupation;

    @Column(length = 255)
    private String workplace;

    @Column(length = 255)
    private String addressDetail;

    @Column(length = 100)
    private String ward;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String province;

    @Column(length = 150)
    private String emergencyContactName;

    @Column(length = 20)
    private String emergencyContactPhone;

    @Column(length = 500)
    private String emergencyContactAddress;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(insertable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Allergy> allergies;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ChronicDisease> chronicDiseases;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<FamilyMedicalHistory> familyMedicalHistories;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MedicalRecord> medicalRecords;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<HealthMetric> healthMetrics;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MedicalAppointment> appointments;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProfileShare> profileShares;
}
