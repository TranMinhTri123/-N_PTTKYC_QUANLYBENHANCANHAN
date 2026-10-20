package com.spring.temp.domain.dto.prescription;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Yêu cầu tạo hoặc cập nhật đơn thuốc điều trị")
public class PrescriptionRequest {

    @NotNull(message = "ID bệnh án không được để trống")
    @Schema(description = "ID bệnh án gắn liền với đơn thuốc", example = "1")
    private Long medicalRecordId;

    @Schema(description = "Mã đơn thuốc", example = "DT-2026-0089")
    private String prescriptionCode;

    @Schema(description = "Bác sĩ kê đơn", example = "BS.CKII Trần Văn Minh")
    private String prescribingDoctor;

    @NotNull(message = "Ngày kê đơn không được để trống")
    @Schema(description = "Ngày kê đơn", example = "2026-10-09")
    private LocalDate prescriptionDate;

    @Schema(description = "Tóm tắt chẩn đoán liên quan đến đơn thuốc", example = "Cơn đau thắt ngực không ổn định / Tăng huyết áp")
    private String diagnosisSummary;

    @Schema(description = "Lời dặn của bác sĩ khi dùng đơn thuốc", example = "Uống đúng giờ, kiêng rượu bia, tái khám sau 7 ngày")
    private String notes;

    @NotEmpty(message = "Đơn thuốc phải có ít nhất một loại thuốc")
    @Valid
    @Schema(description = "Danh sách các loại thuốc trong đơn")
    private List<PrescriptionItemRequest> items;
}
