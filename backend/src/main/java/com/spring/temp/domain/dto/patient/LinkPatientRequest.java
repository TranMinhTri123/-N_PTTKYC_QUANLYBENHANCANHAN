package com.spring.temp.domain.dto.patient;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LinkPatientRequest {

    @NotBlank(message = "Mã bệnh nhân (MRN) không được để trống")
    private String mrn;

    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Vui lòng nhập 4 số cuối CCCD hoặc Số điện thoại để xác thực")
    private String verificationLast4;
}
