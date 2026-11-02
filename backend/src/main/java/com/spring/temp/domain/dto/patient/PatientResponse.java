package com.spring.temp.domain.dto.patient;

import com.spring.temp.domain.model.enums.Gender;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientResponse {
    private Long id;
    private String mrn;
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String nationalId;
    private String phone;
    private String bloodType;
    private String allergies;
    private String address;
}

