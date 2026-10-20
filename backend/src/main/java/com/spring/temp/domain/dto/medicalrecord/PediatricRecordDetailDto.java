package com.spring.temp.domain.dto.medicalrecord;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Chi tiết chuyên khoa Nhi khoa (Biểu mẫu MS: 02/BV-01)")
public class PediatricRecordDetailDto {

    // Nhân khẩu phụ huynh
    @Schema(description = "Họ tên bố", example = "Nguyễn Văn Nam")
    private String fatherName;

    @Schema(description = "Trình độ văn hóa của bố", example = "12/12 - Đại học")
    private String fatherEducationLevel;

    @Schema(description = "Nghề nghiệp của bố", example = "Kỹ sư xây dựng")
    private String fatherOccupation;

    @Schema(description = "Họ tên mẹ", example = "Trần Thị Mai")
    private String motherName;

    @Schema(description = "Trình độ văn hóa của mẹ", example = "Đại học")
    private String motherEducationLevel;

    @Schema(description = "Nghề nghiệp của mẹ", example = "Giáo viên")
    private String motherOccupation;

    // Sơ sinh
    @Schema(description = "Tuổi thai khi sinh (tuần)", example = "39.5")
    private BigDecimal gestationalAgeWeeks;

    @Schema(description = "Cân nặng lúc sinh (gram)", example = "3200")
    private Integer birthWeightGrams;

    @Schema(description = "Hình thức đẻ (Đẻ thường / Đẻ mổ)", example = "Đẻ thường")
    private String deliveryMethod;

    @Schema(description = "Chỉ số Apgar sau 1 phút", example = "9")
    private Integer apgar1min;

    @Schema(description = "Chỉ số Apgar sau 5 phút", example = "10")
    private Integer apgar5min;

    // Nuôi dưỡng & Phát triển
    @Schema(description = "Chế độ nuôi dưỡng (Sữa mẹ hoàn toàn / Sữa công thức / Ăn dặm)", example = "Sữa mẹ hoàn toàn")
    private String feedingRegimen;

    @Schema(description = "Đánh giá các mốc tâm thần vận động (biết lật, ngồi, bò, đi, nói...)")
    private String psychomotorDevelopment;
}
