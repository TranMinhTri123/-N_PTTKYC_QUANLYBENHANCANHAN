package com.spring.temp.domain.dto.patient;

import com.spring.temp.domain.model.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreatePatientRequest {
    @NotBlank(message = "Mã bệnh nhân (MRN) không được để trống")
    private String mrn;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dateOfBirth;

    @NotNull(message = "Giới tính không được để trống")
    private Gender gender;

    private String nationalId;
    private String phone;
    private String bloodType;
    private String allergies;
    private String address;
}

