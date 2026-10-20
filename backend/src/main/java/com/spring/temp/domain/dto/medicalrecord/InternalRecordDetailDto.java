package com.spring.temp.domain.dto.medicalrecord;

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
@Schema(description = "Chi tiết chuyên khoa Nội khoa (Biểu mẫu MS: 01/BV-01)")
public class InternalRecordDetailDto {

    @Schema(description = "Khám hệ tuần hoàn (tim mạch, tiếng tim, mạch ngoại vi)")
    private String circulatorySystem;

    @Schema(description = "Khám hệ hô hấp (lồng ngực, rì rào phế nang, ran)")
    private String respiratorySystem;

    @Schema(description = "Khám hệ tiêu hóa (bụng mềm, gan lách, điểm đau)")
    private String digestiveSystem;

    @Schema(description = "Khám hệ thận - tiết niệu (chạm thận, bập bềnh thận, tiểu buốt/rắt)")
    private String urinarySystem;

    @Schema(description = "Khám hệ thần kinh (ý thức, 12 đôi dây thần kinh sọ, dấu màng não)")
    private String nervousSystem;

    @Schema(description = "Khám hệ cơ xương khớp (tầm vận động khớp, biến dạng, teo cơ)")
    private String musculoskeletalSystem;

    @Schema(description = "Khám hệ nội tiết (tuyến giáp, hội chứng Cushing, biểu hiện hạ đường huyết)")
    private String endocrineSystem;

    @Schema(description = "Khám các cơ quan khác (tai mũi họng, mắt, răng hàm mặt)")
    private String otherOrgans;

    @Schema(description = "Tóm tắt bệnh mạn tính đang theo dõi (Tăng huyết áp, ĐTĐ typ 2...)")
    private String chronicMonitoringSummary;

    @Schema(description = "Kế hoạch dùng thuốc dài hạn & tái khám định kỳ")
    private String longTermMedicationPlan;
}
