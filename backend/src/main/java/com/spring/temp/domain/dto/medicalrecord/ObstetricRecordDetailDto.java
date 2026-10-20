package com.spring.temp.domain.dto.medicalrecord;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Chi tiết chuyên khoa Sản khoa (Chuẩn Sản khoa)")
public class ObstetricRecordDetailDto {

    // Tiền sử kinh nguyệt
    @Schema(description = "Tuổi bắt đầu có kinh", example = "13")
    private Integer menarcheAge;

    @Schema(description = "Chu kỳ kinh nguyệt (ngày)", example = "28")
    private Integer menstrualCycleDays;

    @Schema(description = "Ngày đầu của kỳ kinh cuối (LMP)", example = "2026-01-15")
    private LocalDate lmpDate;

    @Schema(description = "Ngày dự sinh (Tự động tính theo công thức Naegele nếu để trống)", example = "2026-10-22")
    private LocalDate eddDate;

    @Schema(description = "Tuổi thai hiện tại (tuần)", example = "38.2")
    private BigDecimal gestationalAgeWeeks;

    // Tiền sử sản khoa PARA
    @Schema(description = "PARA - Số lần sinh đủ tháng", example = "1")
    private Integer paraTerm;

    @Schema(description = "PARA - Số lần sinh thiếu tháng (đẻ non)", example = "0")
    private Integer paraPreterm;

    @Schema(description = "PARA - Số lần sảy / nạo hút thai", example = "0")
    private Integer paraAbortion;

    @Schema(description = "PARA - Số con hiện còn sống", example = "1")
    private Integer paraLiving;

    @Schema(description = "Số lần mổ lấy thai cũ", example = "0")
    private Integer cesareanHistoryCount;

    // Cuộc đẻ
    @Schema(description = "Thời gian sinh")
    private LocalDateTime deliveryDateTime;

    @Schema(description = "Phương pháp sinh (Đẻ thường / Mổ lấy thai / Forceps)", example = "Đẻ thường")
    private String deliveryMethod;

    @Schema(description = "Biến chứng cuộc đẻ nếu có (Rách TSM độ 2, băng huyết...)")
    private String deliveryComplications;

    // Sơ sinh
    @Schema(description = "Giới tính bé sơ sinh", example = "FEMALE")
    private String newbornGender;

    @Schema(description = "Cân nặng bé sơ sinh (gram)", example = "3350")
    private Integer newbornWeightGrams;

    @Schema(description = "Chỉ số Apgar bé sơ sinh", example = "9")
    private Integer newbornApgar;

    // Hậu sản
    @Schema(description = "Tình trạng hậu sản (co hồi tử cung, sản dịch, tầng sinh môn)")
    private String postpartumCondition;

    @Schema(description = "Ngày hẹn tái khám hậu sản (6 tuần sau sinh)")
    private LocalDate postpartumRevisitDate;
}
