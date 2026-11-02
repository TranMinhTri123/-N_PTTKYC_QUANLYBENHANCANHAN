package com.spring.temp.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Ví dụ: NOITONGHOP, NGOAI, SAN, NHI, CAPCUU

    @Column(nullable = false, length = 150)
    private String name; // Khoa Nội Tổng Hợp, Khoa Ngoại Chấn Thương...

    @Column(length = 100)
    private String location; // Tầng 3 - Tòa nhà A

    @Column(length = 255)
    private String description;
}

