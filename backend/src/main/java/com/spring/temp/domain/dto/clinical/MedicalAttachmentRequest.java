package com.spring.temp.domain.dto.clinical;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Yêu cầu đính kèm tệp kết quả y tế")
public class MedicalAttachmentRequest {

    @NotNull(message = "ID bệnh án không được để trống")
    @Schema(description = "ID bệnh án liên kết", example = "1")
    private Long medicalRecordId;

    @NotBlank(message = "Tên tệp không được để trống")
    @Schema(description = "Tên tệp tin đính kèm", example = "ket_qua_xquang_tim_phoi.jpg")
    private String fileName;

    @NotBlank(message = "Đường dẫn tệp không được để trống")
    @Schema(description = "Đường dẫn hoặc URL lưu trữ tệp", example = "/uploads/records/1/xquang.jpg")
    private String storedFilePath;

    @NotBlank(message = "Loại tệp không được để trống")
    @Schema(description = "Định dạng tệp MIME type", example = "image/jpeg")
    private String fileType;

    @NotNull(message = "Dung lượng tệp không được để trống")
    @Schema(description = "Kích thước tệp (bytes)", example = "2048500")
    private Long fileSizeBytes;
}
