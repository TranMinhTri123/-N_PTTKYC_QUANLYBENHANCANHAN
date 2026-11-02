package com.spring.temp.domain.service;

import com.spring.temp.domain.dto.catalog.DrugSafetyDetailsResponse;
import com.spring.temp.domain.dto.catalog.ExternalDiseaseResponse;
import com.spring.temp.domain.dto.catalog.ExternalDrugItemResponse;

import java.util.List;

public interface ExternalCatalogService {

    /**
     * Tra cứu thuốc từ các nguồn: OPEN_FDA, NIH_RXTERMS hoặc NATIONAL_CATALOG (hoặc ALL)
     */
    List<ExternalDrugItemResponse> searchDrugs(String keyword, String source);

    /**
     * Tra cứu thông tin an toàn dược lý, chỉ định, chống chỉ định, liều dùng và tương tác từ openFDA
     */
    DrugSafetyDetailsResponse getDrugSafetyDetails(String drugName);

    /**
     * Tra cứu bệnh và mã chẩn đoán từ WHO ICD-11, NIH ICD-10 và Danh mục ICD quốc gia
     */
    List<ExternalDiseaseResponse> searchDiseases(String keyword);
}
