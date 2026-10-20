package com.spring.temp.domain.repository;

import com.spring.temp.domain.model.MedicineCatalog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineCatalogRepository extends JpaRepository<MedicineCatalog, Long> {

    List<MedicineCatalog> findByActiveTrue();

    Page<MedicineCatalog> findByBrandNameContainingIgnoreCaseOrActiveIngredientContainingIgnoreCase(
            String brandName, String activeIngredient, Pageable pageable);
}
