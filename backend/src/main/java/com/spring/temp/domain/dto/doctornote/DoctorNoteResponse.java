package com.spring.temp.domain.dto.doctornote;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorNoteResponse {

    private Long id;
    private Long medicalRecordId;
    private Long doctorUserId;
    private String doctorFullName;
    private String doctorEmail;
    private String noteContent;
    private LocalDateTime createdAt;
}
