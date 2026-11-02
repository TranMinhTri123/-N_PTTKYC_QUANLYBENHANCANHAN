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
public class ExternalDrugItemResponse {
    private String id;
    private String name;
    private String brandName;
    private String genericName;
    private String activeIngredient;
    private String dosageForm;
    private String route;
    private String strength;
    private List<String> availableStrengths;
    private String manufacturer;
    private String source; // "OPEN_FDA", "NIH_RXTERMS", "NATIONAL_CATALOG"
    private String rxCui;
}
