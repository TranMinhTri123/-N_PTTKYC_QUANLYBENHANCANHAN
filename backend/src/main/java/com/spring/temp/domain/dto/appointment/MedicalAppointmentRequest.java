package com.spring.temp.domain.dto.appointment;

import com.spring.temp.domain.model.enums.AppointmentStatus;
import com.spring.temp.domain.model.enums.AppointmentType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalAppointmentRequest {

    private Long profileId;

    private Long patientId;

    private Long medicalRecordId;

    @NotBlank(message = "Tiêu đề lịch hẹn không được để trống")
    private String title;

    private String facilityName;

    private String doctorName;

    private Long doctorId;

    private String patientPhone;

    @NotNull(message = "Thời gian hẹn không được để trống")
    @FutureOrPresent(message = "Thời gian hẹn khám phải từ thời điểm hiện tại trở đi")
    private LocalDateTime appointmentTime;

    private LocalDateTime rescheduledTime;

    private AppointmentType appointmentType;

    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Builder.Default
    private Boolean reminderEnabled = true;

    private String notes;
}
