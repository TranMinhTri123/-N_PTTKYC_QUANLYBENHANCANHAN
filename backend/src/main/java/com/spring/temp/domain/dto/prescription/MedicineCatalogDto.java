package com.spring.temp.domain.dto.prescription;

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
@Schema(description = "Thông tin thuốc trong danh mục dược phẩm")
public class MedicineCatalogDto {

    private Long id;

    @Schema(description = "Tên biệt dược", example = "Hapacol 650")
    private String brandName;

    @Schema(description = "Hoạt chất", example = "Paracetamol 650mg")
    private String activeIngredient;

    @Schema(description = "Dạng bào chế", example = "Viên nén bao phim")
    private String dosageForm;

    @Schema(description = "Hàm lượng", example = "650mg")
    private String strength;

    @Schema(description = "Công ty / Nhà sản xuất", example = "Dược Hậu Giang")
    private String manufacturer;

    @Schema(description = "Hướng dẫn sử dụng chung")
    private String usageGuidelines;

    private boolean active;
}
