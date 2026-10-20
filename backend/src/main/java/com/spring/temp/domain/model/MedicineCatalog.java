package com.spring.temp.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "medicine_catalog")
public class MedicineCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String brandName; // Tên biệt dược (ví dụ: Panadol Extra)

    @Column(nullable = false, length = 200)
    private String activeIngredient; // Hoạt chất (ví dụ: Paracetamol, Caffeine)

    @Column(length = 50)
    private String dosageForm; // Dạng bào chế (Viên nén, siro, gói...)

    @Column(length = 100)
    private String strength; // Hàm lượng (500mg, 10mg/5ml...)

    @Column(length = 200)
    private String manufacturer; // Nhà sản xuất

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String usageGuidelines; // Hướng dẫn sử dụng chung

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
