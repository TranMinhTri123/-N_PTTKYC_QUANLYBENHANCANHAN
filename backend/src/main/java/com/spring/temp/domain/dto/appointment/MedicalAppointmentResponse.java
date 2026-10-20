package com.spring.temp.domain.dto.appointment;

import com.spring.temp.domain.model.enums.AppointmentStatus;
import com.spring.temp.domain.model.enums.AppointmentType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalAppointmentResponse {

    private Long id;
    private Long profileId;
    private String profileFullName;
    private Long medicalRecordId;
    private String medicalRecordCode;
    private String title;
    private String facilityName;
    private String doctorName;
    private LocalDateTime appointmentTime;
    private AppointmentType appointmentType;
    private AppointmentStatus status;
    private Boolean reminderEnabled;
    private String notes;
}
