package com.spring.temp.domain.dto.clinical;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Thông tin tệp đính kèm y tế")
public class MedicalAttachmentResponse {

    private Long id;
    private Long medicalRecordId;
    private String fileName;
    private String storedFilePath;
    private String fileType;
    private Long fileSizeBytes;
    private Long uploadedByUserId;
    private LocalDateTime createdAt;
}
