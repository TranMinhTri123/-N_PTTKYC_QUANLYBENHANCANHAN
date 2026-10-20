package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "medical_attachments")
@EntityListeners(AuditingEntityListener.class)
public class MedicalAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    @JsonIgnore
    private MedicalRecord medicalRecord;

    @Column(nullable = false, length = 255)
    private String fileName; // Tên gốc của file

    @Column(nullable = false, length = 500)
    private String storedFilePath; // Đường dẫn lưu trữ file trên server

    @Column(nullable = false, length = 50)
    private String fileType; // application/pdf, image/jpeg, image/png

    @Column(nullable = false)
    private Long fileSizeBytes; // Kích thước tệp (bytes)

    @Column(nullable = false)
    private Long uploadedByUserId; // Người tải lên

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;
}
