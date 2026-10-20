package com.spring.temp.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "icd10_catalog")
public class Icd10Catalog {

    @Id
    @Column(length = 20, nullable = false)
    private String code;

    @Column(name = "disease_name_vi", length = 300, nullable = false)
    private String diseaseNameVi;

    @Column(name = "disease_name_en", length = 300)
    private String diseaseNameEn;

    @Column(length = 100)
    private String chapter;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
