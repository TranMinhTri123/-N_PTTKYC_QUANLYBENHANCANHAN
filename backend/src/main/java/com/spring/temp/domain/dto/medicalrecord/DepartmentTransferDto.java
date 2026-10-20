package com.spring.temp.domain.dto.medicalrecord;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Thông tin luân chuyển khoa điều trị")
public class DepartmentTransferDto {

    private Long id;

    @NotBlank(message = "Khoa chuyển đi không được để trống")
    @Schema(description = "Khoa chuyển đi", example = "Khoa Khám Bệnh")
    private String fromDepartment;

    @NotBlank(message = "Khoa chuyển đến không được để trống")
    @Schema(description = "Khoa chuyển đến", example = "Khoa Tim Mạch Can Thiệp")
    private String toDepartment;

    @NotNull(message = "Thời gian chuyển khoa không được để trống")
    @Schema(description = "Ngày giờ chuyển khoa")
    private LocalDateTime transferredAt;

    @Schema(description = "Số ngày điều trị tại khoa trước", example = "3")
    private Integer daysInDepartment;
}
