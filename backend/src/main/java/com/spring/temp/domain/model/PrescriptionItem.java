package com.spring.temp.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.spring.temp.domain.model.enums.AdministrationRoute;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "prescription_items")
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    @JsonIgnore
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id")
    private MedicineCatalog medicine;

    @Column(nullable = false, length = 200)
    private String medicineName; // Tên thuốc

    @Column(length = 200)
    private String activeIngredient; // Hoạt chất

    @Column(nullable = false, length = 50)
    private String dosageAmount; // Liều lượng (1 viên, 5ml...)

    @Column(nullable = false, length = 30)
    private String dosageUnit; // Đơn vị tính (viên, gói, ống...)

    @Column(nullable = false, length = 100)
    private String frequencyPerDay; // Tần suất (2 lần/ngày, sáng 1 chiều 1...)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AdministrationRoute administrationRoute; // Đường dùng (Uống, tiêm...)

    @Column(nullable = false)
    private Integer daysCount; // Số ngày dùng thuốc

    @Column(length = 500)
    private String usageInstructions; // Hướng dẫn chi tiết (Uống sau ăn no...)

    @Builder.Default
    private boolean hasAllergyWarning = false; // Cảnh báo trùng dị ứng thuốc
}
