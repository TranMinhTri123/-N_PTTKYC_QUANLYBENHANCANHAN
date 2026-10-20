package com.spring.temp.domain.dto.prescription;

import com.spring.temp.domain.model.enums.AdministrationRoute;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Thông tin thuốc đang trong thời gian sử dụng hiện tại (Active Medication)")
public class ActiveMedicationResponse {

    private Long prescriptionId;
    private Long medicalRecordId;
    private String medicineName;
    private String activeIngredient;
    private String dosageAmount;
    private String dosageUnit;
    private String frequencyPerDay;
    private AdministrationRoute administrationRoute;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer remainingDays;
    private String usageInstructions;
    private String prescribingDoctor;
    private boolean hasAllergyWarning;
}
