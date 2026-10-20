package com.spring.temp.domain.dto.clinical;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Yêu cầu thêm hoặc cập nhật kết quả xét nghiệm")
public class LabTestResultRequest {

    @NotNull(message = "ID bệnh án không được để trống")
    @Schema(description = "ID bệnh án liên kết", example = "1")
    private Long medicalRecordId;

    @NotBlank(message = "Tên xét nghiệm không được để trống")
    @Schema(description = "Tên xét nghiệm", example = "Đường huyết lúc đói (Glucose)")
    private String testName;

    @Schema(description = "Phân loại xét nghiệm (Sinh hóa, Huyết học, Nước tiểu, Miễn dịch...)", example = "Sinh hóa máu")
    private String testCategory;

    @NotBlank(message = "Kết quả xét nghiệm không được để trống")
    @Schema(description = "Giá trị đo được", example = "7.2")
    private String testValue;

    @Schema(description = "Khoảng tham chiếu bình thường", example = "3.9 - 6.4")
    private String referenceRange;

    @Schema(description = "Đơn vị đo", example = "mmol/L")
    private String unit;

    @Schema(description = "Cờ đánh giá bất thường (true nếu vượt ngưỡng hoặc dưới ngưỡng)", example = "true")
    private boolean abnormal;

    @Schema(description = "Nhận định / kết luận của bác sĩ xét nghiệm", example = "Tăng đường huyết nhẹ, theo dõi dung nạp glucose")
    private String evaluation;

    @NotNull(message = "Ngày thực hiện xét nghiệm không được để trống")
    @Schema(description = "Ngày xét nghiệm", example = "2026-10-02")
    private LocalDate testDate;
}
