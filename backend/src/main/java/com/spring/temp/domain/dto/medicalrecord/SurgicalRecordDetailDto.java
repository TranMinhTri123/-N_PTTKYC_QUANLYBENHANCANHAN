package com.spring.temp.domain.dto.medicalrecord;

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
@Schema(description = "Chi tiết chuyên khoa Ngoại khoa (Biểu mẫu MS: 10/BV-01)")
public class SurgicalRecordDetailDto {

    @Schema(description = "Chẩn đoán trước phẫu thuật", example = "Viêm ruột thừa cấp giờ thứ 12")
    private String preOpDiagnosis;

    @Schema(description = "Chẩn đoán sau phẫu thuật", example = "Viêm ruột thừa mủ hoại tử")
    private String postOpDiagnosis;

    @Schema(description = "Phương pháp vô cảm (Gây mê nội khí quản, gây tê tủy sống, tại chỗ...)", example = "Gây mê nội khí quản")
    private String anesthesiaMethod;

    @Schema(description = "Theo dõi hậu phẫu (tình trạng vết mổ, dịch dẫn lưu, mức độ đau)")
    private String postOpMonitoring;

    @Schema(description = "Ngày rút ống dẫn lưu")
    private LocalDate drainRemovalDate;

    @Schema(description = "Ngày cắt chỉ vết mổ")
    private LocalDate sutureRemovalDate;

    @Schema(description = "Hướng dẫn chăm sóc sau mổ & tập vận động sớm")
    private String postOpCareGuidelines;
}
