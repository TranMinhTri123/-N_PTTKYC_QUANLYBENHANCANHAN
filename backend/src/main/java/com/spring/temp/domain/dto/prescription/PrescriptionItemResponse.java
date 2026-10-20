package com.spring.temp.domain.dto.prescription;

import com.spring.temp.domain.model.enums.AdministrationRoute;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Chi tiết một loại thuốc trong đơn thuốc")
public class PrescriptionItemResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private String activeIngredient;
    private String dosageAmount;
    private String dosageUnit;
    private String frequencyPerDay;
    private AdministrationRoute administrationRoute;
    private Integer daysCount;
    private String usageInstructions;

    @Schema(description = "Cờ cảnh báo nếu thuốc trùng với tiền sử dị ứng của người bệnh")
    private boolean hasAllergyWarning;

    @Schema(description = "Nội dung cảnh báo dị ứng nếu có")
    private String allergyWarningNote;
}
