package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.Icd10Catalog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Icd10CatalogRepository extends JpaRepository<Icd10Catalog, String> {

    Page<Icd10Catalog> findByIsActiveTrueAndCodeContainingIgnoreCaseOrDiseaseNameViContainingIgnoreCase(
            String code, String diseaseNameVi, Pageable pageable);
}
