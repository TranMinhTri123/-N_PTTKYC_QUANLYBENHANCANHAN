package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.spring.temp.domain.model.enums.AppointmentStatus;
import com.spring.temp.domain.model.enums.AppointmentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "medical_appointments")
public class MedicalAppointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    @JsonIgnore
    private HealthProfile profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attending_doctor_user_id")
    @JsonIgnore
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id")
    @JsonIgnore
    private MedicalRecord medicalRecord;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String facilityName;

    @Column(length = 150)
    private String doctorName;

    @Column(name = "doctor_id")
    private Long doctorId;

    @Column(name = "patient_phone", length = 30)
    private String patientPhone;

    @Column(nullable = false)
    private LocalDateTime appointmentTime;

    @Column(name = "time_slot", length = 50)
    private String timeSlot;

    @Column(name = "rescheduled_time")
    private LocalDateTime rescheduledTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private AppointmentType appointmentType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Builder.Default
    private Boolean reminderEnabled = true;

    @Column(length = 1000)
    private String notes;

    @Column(name = "doctor_note", length = 1000)
    private String doctorNote;
}
