package com.spring.temp.domain.dto.doctornote;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorNoteRequest {

    @NotNull(message = "ID bệnh án không được để trống")
    private Long medicalRecordId;

    @NotBlank(message = "Nội dung ghi chú không được để trống")
    private String noteContent;
}
