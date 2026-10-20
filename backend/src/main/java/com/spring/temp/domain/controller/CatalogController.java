package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.model.Icd10Catalog;
import com.spring.temp.domain.model.MedicineCatalog;
import com.spring.temp.domain.repository.Icd10CatalogRepository;
import com.spring.temp.domain.repository.MedicineCatalogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalogs")
@RequiredArgsConstructor
@Tag(name = "15. Quản trị danh mục y tế (ICD-10 & Thuốc)", description = "APIs tra cứu và quản lý danh mục mã bệnh quốc tế ICD-10 và danh mục thuốc quốc gia")
public class CatalogController {

    private final Icd10CatalogRepository icd10CatalogRepository;
    private final MedicineCatalogRepository medicineCatalogRepository;

    @GetMapping("/icd10/search")
    @Operation(summary = "Tra cứu mã bệnh ICD-10 theo từ khóa", description = "Tìm kiếm theo mã (I10, E11...) hoặc tên bệnh tiếng Việt")
    public ResponseEntity<ApiResponse<List<Icd10Catalog>>> searchIcd10(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Icd10Catalog> results = icd10CatalogRepository
                .findByIsActiveTrueAndCodeContainingIgnoreCaseOrDiseaseNameViContainingIgnoreCase(
                        keyword, keyword, PageRequest.of(page, size)
                ).getContent();
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/icd10/all")
    @Operation(summary = "Lấy tất cả mã bệnh ICD-10 đang kích hoạt", description = "Dành cho danh sách chọn nhanh mã bệnh")
    public ResponseEntity<ApiResponse<List<Icd10Catalog>>> getAllIcd10() {
        return ResponseEntity.ok(ApiResponse.success(icd10CatalogRepository.findAll()));
    }

    @PostMapping("/icd10")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thêm mã bệnh ICD-10 mới (Admin)", description = "Chỉ Quản trị viên hệ thống có quyền thêm danh mục")
    public ResponseEntity<ApiResponse<Icd10Catalog>> createIcd10(@RequestBody Icd10Catalog item) {
        Icd10Catalog saved = icd10CatalogRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Thêm mã bệnh ICD-10 thành công!"));
    }

    @GetMapping("/medicines/search")
    @Operation(summary = "Tra cứu danh mục thuốc quốc gia", description = "Tìm theo tên biệt dược hoặc hoạt chất")
    public ResponseEntity<ApiResponse<List<MedicineCatalog>>> searchMedicines(
            @RequestParam(required = false, defaultValue = "") String keyword
    ) {
        List<MedicineCatalog> results = medicineCatalogRepository
                .findByBrandNameContainingIgnoreCaseOrActiveIngredientContainingIgnoreCase(keyword, keyword, PageRequest.of(0, 50))
                .getContent();
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping("/medicines")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thêm thuốc vào danh mục quốc gia (Admin)", description = "Chỉ Quản trị viên hệ thống có quyền thêm thuốc mới")
    public ResponseEntity<ApiResponse<MedicineCatalog>> createMedicine(@RequestBody MedicineCatalog item) {
        MedicineCatalog saved = medicineCatalogRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Thêm thuốc vào danh mục thành công!"));
    }
}
