package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.spring.temp.domain.model.enums.*;
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
@Table(name = "medical_records")
@EntityListeners(AuditingEntityListener.class)
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private HealthProfile profile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RecordType recordType;

    @Column(nullable = false, length = 255)
    private String hospitalName;

    @Column(length = 50)
    private String medicalRecordCode; // Số lưu trữ bệnh án

    @Column(length = 50)
    private String patientMedicalCode; // Mã Y Tế (Mã YT)

    @Column(length = 150)
    private String departmentName;

    @Column(length = 30)
    private String bedNumber;

    @Column(length = 150)
    private String attendingDoctor;

    @Column(nullable = false)
    private LocalDate visitDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AdmissionType admissionType;

    // Luồng tiếp nhận (Admission Tracking)
    private LocalDateTime admissionDateTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private AdmissionGate admissionGate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ReferralSource referralSource;

    @Builder.Default
    private Integer admissionCountForDisease = 1;

    // Chuyển viện (Referral Out)
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TransferredLevel transferredLevel;

    @Column(length = 255)
    private String transferredToFacility;

    // Ra viện (Discharge Tracking)
    private LocalDateTime dischargeDateTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private DischargeType dischargeType;

    private Integer totalTreatmentDays; // Tự động tính

    // Bệnh sử & Chẩn đoán đa giai đoạn
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String chiefComplaint; // Lý do vào viện

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String historyOfIllness; // Bệnh sử

    @Column(length = 500)
    private String referralDiagnosis;

    @Column(length = 20)
    private String referralIcd10;

    @Column(length = 500)
    private String admissionDiagnosis;

    @Column(length = 20)
    private String admissionIcd10;

    @Column(length = 500)
    private String deptAdmissionDiagnosis;

    @Column(length = 20)
    private String deptAdmissionIcd10;

    @Column(length = 500)
    private String primaryDiagnosis;

    @Column(length = 20)
    private String primaryIcd10;

    @Column(length = 500)
    private String secondaryDiagnosis;

    @Column(length = 20)
    private String secondaryIcd10;

    // Điều trị & Chăm sóc
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String treatmentPlan;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String carePlan;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String dietPlan;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String followUpInstructions;

    private LocalDate revisitDate;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @Column(length = 200)
    private String tags;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(insertable = false)
    private LocalDateTime updatedAt;

    // Quan hệ chuyên khoa & đính kèm
    @OneToOne(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private VitalSigns vitalSigns;

    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<DepartmentTransfer> departmentTransfers;

    @OneToOne(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private InternalRecordDetail internalDetail;

    @OneToOne(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private SurgicalRecordDetail surgicalDetail;

    @OneToOne(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private PediatricRecordDetail pediatricDetail;

    @OneToOne(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private ObstetricRecordDetail obstetricDetail;

    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Prescription> prescriptions;

    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<LabTestResult> labTestResults;

    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ImagingResult> imagingResults;

    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MedicalAttachment> attachments;

    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<DoctorNote> doctorNotes;
}
