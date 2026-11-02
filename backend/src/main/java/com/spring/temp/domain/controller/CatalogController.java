package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.admin.UserManagementResponse;
import com.spring.temp.domain.dto.common.ApiResponse;
import com.spring.temp.domain.model.Icd10Catalog;
import com.spring.temp.domain.model.MedicineCatalog;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.repository.Icd10CatalogRepository;
import com.spring.temp.domain.repository.MedicineCatalogRepository;
import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.domain.dto.catalog.DrugSafetyDetailsResponse;
import com.spring.temp.domain.dto.catalog.ExternalDiseaseResponse;
import com.spring.temp.domain.dto.catalog.ExternalDrugItemResponse;
import com.spring.temp.domain.service.ExternalCatalogService;
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
@Tag(name = "15. Quản trị danh mục y tế (ICD-10, ICD-11, openFDA & Bác Sĩ)", description = "APIs tra cứu và quản lý danh mục mã bệnh quốc tế ICD-10/ICD-11, danh mục thuốc quốc tế openFDA/NIH RxTerms và danh sách bác sĩ")
public class CatalogController {

    private final Icd10CatalogRepository icd10CatalogRepository;
    private final MedicineCatalogRepository medicineCatalogRepository;
    private final UserRepository userRepository;
    private final ExternalCatalogService externalCatalogService;

    @GetMapping("/doctors")
    @Operation(summary = "Lấy danh sách bác sĩ trong hệ thống (phục vụ đặt lịch khám)")
    public ResponseEntity<ApiResponse<List<UserManagementResponse>>> getActiveDoctors(
            @RequestParam(required = false) String hospitalName,
            @RequestParam(required = false) String specialtyCode
    ) {
        List<User> doctors = userRepository.findAll().stream()
                .filter(u -> u.isEnabled() && !u.isAccountLocked())
                .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> "ROLE_DOCTOR".equals(r.getName())))
                .filter(u -> hospitalName == null || hospitalName.isBlank() || (u.getHospitalName() != null && u.getHospitalName().equalsIgnoreCase(hospitalName.trim())))
                .filter(u -> specialtyCode == null || specialtyCode.isBlank() || (u.getSpecialtyCode() != null && u.getSpecialtyCode().equalsIgnoreCase(specialtyCode.trim())))
                .toList();

        List<UserManagementResponse> response = doctors.stream()
                .map(u -> UserManagementResponse.builder()
                        .id(u.getId())
                        .fullName(u.fullName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .department(u.getDepartment())
                        .hospitalName(u.getHospitalName())
                        .specialtyCode(u.getSpecialtyCode())
                        .enabled(u.isEnabled())
                        .accountLocked(u.isAccountLocked())
                        .roles(List.of("ROLE_DOCTOR"))
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

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

    @GetMapping("/external/drugs/search")
    @Operation(summary = "Tra cứu thuốc mở rộng (openFDA & NIH RxTerms)", description = "Hỗ trợ bác sĩ tìm kiếm thuốc theo tên biệt dược, hoạt chất từ openFDA và NIH RxTerms")
    public ResponseEntity<ApiResponse<List<ExternalDrugItemResponse>>> searchExternalDrugs(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "ALL") String source
    ) {
        List<ExternalDrugItemResponse> items = externalCatalogService.searchDrugs(keyword, source);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/external/drugs/safety-details")
    @Operation(summary = "Tra cứu an toàn dược lý từ openFDA", description = "Lấy chi tiết chỉ định, chống chỉ định, cảnh báo, liều dùng và tương tác thuốc từ nhãn thuốc US FDA")
    public ResponseEntity<ApiResponse<DrugSafetyDetailsResponse>> getDrugSafetyDetails(
            @RequestParam String drugName
    ) {
        DrugSafetyDetailsResponse details = externalCatalogService.getDrugSafetyDetails(drugName);
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    @GetMapping("/external/diseases/search")
    @Operation(summary = "Tra cứu mã bệnh từ WHO ICD-11 & ICD-10", description = "Tìm kiếm bệnh lý kèm mã chuẩn WHO ICD-11 và ICD-10 phục vụ chẩn đoán")
    public ResponseEntity<ApiResponse<List<ExternalDiseaseResponse>>> searchExternalDiseases(
            @RequestParam(required = false, defaultValue = "") String keyword
    ) {
        List<ExternalDiseaseResponse> results = externalCatalogService.searchDiseases(keyword);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
