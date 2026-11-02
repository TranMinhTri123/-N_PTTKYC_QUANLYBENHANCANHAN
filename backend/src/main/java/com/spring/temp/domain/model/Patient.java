package com.spring.temp.domain.model;

import com.spring.temp.domain.model.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "patients")
@EntityListeners(AuditingEntityListener.class)
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mrn", nullable = false, unique = true, length = 50)
    private String mrn; // Medical Record Number (Mã bệnh nhân duy nhất)

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 10)
    private Gender gender;

    @Column(name = "national_id", length = 30)
    private String nationalId; // Số CCCD / Định danh

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "blood_type", length = 30)
    private String bloodType; // A+, B+, AB+, O+, ...

    @Column(name = "allergies", length = 500)
    private String allergies; // Tiền sử dị ứng thuốc/thức ăn

    @Column(name = "address", length = 255)
    private String address;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}

