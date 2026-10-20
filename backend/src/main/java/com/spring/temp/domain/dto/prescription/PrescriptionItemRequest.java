package com.spring.temp.domain.dto.prescription;

import com.spring.temp.domain.model.enums.AdministrationRoute;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Yêu cầu kê một loại thuốc trong đơn thuốc")
public class PrescriptionItemRequest {

    @Schema(description = "ID thuốc từ danh mục (nếu có chọn từ danh mục)", example = "1")
    private Long medicineId;

    @NotBlank(message = "Tên thuốc không được để trống")
    @Schema(description = "Tên biệt dược hoặc tên thuốc", example = "Amoxicillin 500mg")
    private String medicineName;

    @Schema(description = "Hoạt chất chính của thuốc", example = "Amoxicillin trihydrate")
    private String activeIngredient;

    @NotBlank(message = "Liều lượng không được để trống")
    @Schema(description = "Liều lượng cho 1 lần dùng", example = "1 viên")
    private String dosageAmount;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Schema(description = "Đơn vị đóng gói / dùng", example = "viên")
    private String dosageUnit;

    @NotBlank(message = "Tần suất dùng thuốc không được để trống")
    @Schema(description = "Tần suất sử dụng trong ngày", example = "2 lần/ngày (sáng 1, tối 1)")
    private String frequencyPerDay;

    @NotNull(message = "Đường dùng không được để trống")
    @Schema(description = "Đường dùng thuốc: ORAL (Uống), INJECTION (Tiêm), TOPICAL (Bôi ngoài), INHALATION (Khí dung)...", example = "ORAL")
    private AdministrationRoute administrationRoute;

    @NotNull(message = "Số ngày dùng thuốc không được để trống")
    @Min(value = 1, message = "Số ngày dùng thuốc tối thiểu là 1")
    @Schema(description = "Số ngày dùng thuốc", example = "7")
    private Integer daysCount;

    @Schema(description = "Hướng dẫn sử dụng chi tiết", example = "Uống sau khi ăn no 30 phút")
    private String usageInstructions;
}
