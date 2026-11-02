package com.spring.temp.domain.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrugSafetyDetailsResponse {
    private String drugName;
    private String brandName;
    private String genericName;
    private String manufacturer;
    private String route;
    private String indicationsAndUsage;
    private String dosageAndAdministration;
    private String contraindications;
    private String warningsAndPrecautions;
    private String drugInteractions;
    private String adverseReactions;
    private String pregnancyWarning;
    private String storageAndHandling;
    private List<String> boxedWarnings;
    private String source; // "OPEN_FDA"
}
