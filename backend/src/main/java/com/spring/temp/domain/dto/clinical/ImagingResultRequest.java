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
@Schema(description = "Yêu cầu thêm kết quả chẩn đoán hình ảnh")
public class ImagingResultRequest {

    @NotNull(message = "ID bệnh án không được để trống")
    @Schema(description = "ID bệnh án liên kết", example = "1")
    private Long medicalRecordId;

    @NotBlank(message = "Phương pháp chẩn đoán hình ảnh không được để trống")
    @Schema(description = "Phương pháp: XRAY (X-quang), ULTRASOUND (Siêu âm), CT_SCAN (Cắt lớp), MRI (Cộng hưởng từ), ECG (Điện tim)", example = "XRAY")
    private String imagingModality;

    @NotBlank(message = "Vị trí giải phẫu không được để trống")
    @Schema(description = "Vị trí chụp / chiếu", example = "Ngực thẳng (Chest PA)")
    private String anatomicalRegion;

    @Schema(description = "Mô tả tổn thương / hình ảnh quan sát được", example = "Bóng tim hơi to, chỉ số tim/ngực 0.55, không thấy thâm nhiễm phế trường 2 bên")
    private String findingsDescription;

    @NotBlank(message = "Kết luận chẩn đoán không được để trống")
    @Schema(description = "Kết luận của bác sĩ chẩn đoán hình ảnh", example = "Hình ảnh bóng tim to nhẹ, chưa thấy tổn thương nhu mô phổi cấp tính")
    private String conclusion;

    @NotNull(message = "Ngày thực hiện không được để trống")
    @Schema(description = "Ngày thực hiện chẩn đoán hình ảnh", example = "2026-10-02")
    private LocalDate procedureDate;
}
