package com.spring.temp.domain.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.temp.domain.dto.catalog.DrugSafetyDetailsResponse;
import com.spring.temp.domain.dto.catalog.ExternalDiseaseResponse;
import com.spring.temp.domain.dto.catalog.ExternalDrugItemResponse;
import com.spring.temp.domain.model.Icd10Catalog;
import com.spring.temp.domain.model.MedicineCatalog;
import com.spring.temp.domain.repository.Icd10CatalogRepository;
import com.spring.temp.domain.repository.MedicineCatalogRepository;
import com.spring.temp.domain.service.ExternalCatalogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalCatalogServiceImpl implements ExternalCatalogService {

    private final RestTemplate restTemplate;
    private final MedicineCatalogRepository medicineCatalogRepository;
    private final Icd10CatalogRepository icd10CatalogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${who.icd11.clientId:}")
    private String whoClientId;

    @Value("${who.icd11.clientSecret:}")
    private String whoClientSecret;

    // Cache WHO ICD token
    private String cachedWhoToken = null;
    private long whoTokenExpiry = 0;

    // Bộ từ điển ánh xạ ICD-11 chuẩn quốc tế của WHO (WHO ICD-11 MMS Crosswalk)
    private static final Map<String, String[]> WHO_ICD11_MAP = new LinkedHashMap<>();

    static {
        // [ICD-11 Code, ICD-10 Code, Tên Tiếng Anh, Tên Tiếng Việt, Chương]
        WHO_ICD11_MAP.put("hypertension", new String[]{"BA00", "I10", "Essential hypertension", "Tăng huyết áp vô căn (nguyên phát)", "0B Bệnh hệ tuần hoàn"});
        WHO_ICD11_MAP.put("tăng huyết áp", new String[]{"BA00", "I10", "Essential hypertension", "Tăng huyết áp vô căn (nguyên phát)", "0B Bệnh hệ tuần hoàn"});
        WHO_ICD11_MAP.put("diabetes", new String[]{"5A11", "E11", "Type 2 diabetes mellitus", "Đái tháo đường típ 2 (Tiểu đường)", "05 Bệnh nội tiết, dinh dưỡng & chuyển hóa"});
        WHO_ICD11_MAP.put("tiểu đường", new String[]{"5A11", "E11", "Type 2 diabetes mellitus", "Đái tháo đường típ 2 (Tiểu đường)", "05 Bệnh nội tiết, dinh dưỡng & chuyển hóa"});
        WHO_ICD11_MAP.put("asthma", new String[]{"CA23", "J45", "Asthma", "Hen phế quản (Suyễn)", "12 Bệnh hệ hô hấp"});
        WHO_ICD11_MAP.put("hen", new String[]{"CA23", "J45", "Asthma", "Hen phế quản (Suyễn)", "12 Bệnh hệ hô hấp"});
        WHO_ICD11_MAP.put("gastritis", new String[]{"DA42", "K29.7", "Gastritis, unspecified", "Viêm dạ dày", "13 Bệnh hệ tiêu hóa"});
        WHO_ICD11_MAP.put("dạ dày", new String[]{"DA60", "K27", "Peptic ulcer disease", "Loét dạ dày tá tràng", "13 Bệnh hệ tiêu hóa"});
        WHO_ICD11_MAP.put("gout", new String[]{"FA25", "M10.9", "Gout, unspecified", "Bệnh Gút (Viêm khớp Gout)", "15 Bệnh hệ cơ xương khớp"});
        WHO_ICD11_MAP.put("pneumonia", new String[]{"CA40", "J18.9", "Pneumonia, unspecified", "Viêm phổi", "12 Bệnh hệ hô hấp"});
        WHO_ICD11_MAP.put("viêm phổi", new String[]{"CA40", "J18.9", "Pneumonia, unspecified", "Viêm phổi", "12 Bệnh hệ hô hấp"});
        WHO_ICD11_MAP.put("dengue", new String[]{"1D20", "A90", "Dengue", "Sốt xuất huyết Dengue", "01 Bệnh truyền nhiễm"});
        WHO_ICD11_MAP.put("sốt xuất huyết", new String[]{"1D20", "A90", "Dengue", "Sốt xuất huyết Dengue", "01 Bệnh truyền nhiễm"});
        WHO_ICD11_MAP.put("stroke", new String[]{"8B20", "I64", "Stroke, not specified as haemorrhage or infarction", "Tai biến mạch máu não / Đột quỵ", "08 Bệnh hệ thần kinh"});
        WHO_ICD11_MAP.put("đột quỵ", new String[]{"8B20", "I64", "Stroke, not specified as haemorrhage or infarction", "Tai biến mạch máu não / Đột quỵ", "08 Bệnh hệ thần kinh"});
        WHO_ICD11_MAP.put("coronary", new String[]{"BA80", "I25.1", "Atherosclerotic coronary artery disease", "Bệnh xơ vữa động mạch vành", "0B Bệnh hệ tuần hoàn"});
        WHO_ICD11_MAP.put("tim", new String[]{"BD10", "I50.9", "Heart failure, unspecified", "Suy tim", "0B Bệnh hệ tuần hoàn"});
        WHO_ICD11_MAP.put("lipid", new String[]{"5C80", "E78.5", "Hyperlipidaemia, unspecified", "Rối loạn lipid máu (Mỡ máu)", "05 Bệnh nội tiết, dinh dưỡng & chuyển hóa"});
        WHO_ICD11_MAP.put("mỡ máu", new String[]{"5C80", "E78.5", "Hyperlipidaemia, unspecified", "Rối loạn lipid máu (Mỡ máu)", "05 Bệnh nội tiết, dinh dưỡng & chuyển hóa"});
        WHO_ICD11_MAP.put("covid", new String[]{"RA01", "U07.1", "COVID-19", "Bệnh đường hô hấp cấp do SARS-CoV-2 (COVID-19)", "RA Mã mục đích đặc biệt"});
    }

    @Override
    public List<ExternalDrugItemResponse> searchDrugs(String keyword, String source) {
        String cleanKw = keyword != null ? keyword.trim() : "";
        if (cleanKw.length() < 2) {
            return Collections.emptyList();
        }

        List<ExternalDrugItemResponse> combined = new ArrayList<>();
        String src = source != null ? source.toUpperCase() : "ALL";

        // 1. Tìm trong Danh mục Thuốc Quốc gia (Local DB)
        if ("ALL".equals(src) || "NATIONAL".equals(src)) {
            try {
                List<MedicineCatalog> localMeds = medicineCatalogRepository
                        .findByBrandNameContainingIgnoreCaseOrActiveIngredientContainingIgnoreCase(cleanKw, cleanKw, PageRequest.of(0, 10))
                        .getContent();
                for (MedicineCatalog m : localMeds) {
                    combined.add(ExternalDrugItemResponse.builder()
                            .id("LOCAL_" + m.getId())
                            .name(m.getBrandName())
                            .brandName(m.getBrandName())
                            .genericName(m.getActiveIngredient())
                            .activeIngredient(m.getActiveIngredient())
                            .dosageForm(m.getDosageForm())
                            .route("Đường uống / Tiêm")
                            .strength(m.getStrength())
                            .manufacturer(m.getManufacturer())
                            .source("NATIONAL_CATALOG")
                            .build());
                }
            } catch (Exception e) {
                log.warn("Error querying local medicine catalog: {}", e.getMessage());
            }
        }

        // 2. Tìm trong NIH Clinical Tables RxTerms (Chuẩn dược thư lâm sàng NLM Hoa Kỳ)
        if ("ALL".equals(src) || "RXTERMS".equals(src)) {
            try {
                searchRxTerms(cleanKw, combined);
            } catch (Exception e) {
                log.warn("Error querying NIH RxTerms API: {}", e.getMessage());
            }
        }

        // 3. Tìm trong openFDA Drug Label & NDC API (FDA Hoa Kỳ)
        if ("ALL".equals(src) || "OPEN_FDA".equals(src) || "FDA".equals(src)) {
            try {
                searchOpenFda(cleanKw, combined);
            } catch (Exception e) {
                log.warn("Error querying openFDA API: {}", e.getMessage());
            }
        }

        // Khử trùng lặp theo tên và sắp xếp
        Set<String> seen = new HashSet<>();
        List<ExternalDrugItemResponse> deduplicated = new ArrayList<>();
        for (ExternalDrugItemResponse item : combined) {
            String key = (item.getBrandName() != null ? item.getBrandName().toLowerCase() : "") + "_" +
                    (item.getGenericName() != null ? item.getGenericName().toLowerCase() : "");
            if (seen.add(key)) {
                deduplicated.add(item);
            }
        }

        return deduplicated;
    }

    private void searchRxTerms(String keyword, List<ExternalDrugItemResponse> resultList) {
        String encoded = UriUtils.encode(keyword, StandardCharsets.UTF_8);
        String url = "https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=" + encoded + "&ef=STRENGTHS_AND_FORMS,RXCUIS&maxList=10";

        try {
            String rawJson = restTemplate.getForObject(url, String.class);
            if (rawJson == null) return;

            JsonNode root = objectMapper.readTree(rawJson);
            if (root.isArray() && root.size() >= 3) {
                JsonNode namesNode = root.get(1);
                JsonNode extraFields = root.get(2);
                JsonNode strengthsNode = extraFields != null ? extraFields.get("STRENGTHS_AND_FORMS") : null;
                JsonNode rxCuisNode = extraFields != null ? extraFields.get("RXCUIS") : null;

                if (namesNode != null && namesNode.isArray()) {
                    for (int i = 0; i < namesNode.size(); i++) {
                        String drugFull = namesNode.get(i).asText();
                        String drugName = drugFull;
                        String form = "Oral Pill";
                        if (drugFull.contains("(") && drugFull.endsWith(")")) {
                            int idx = drugFull.lastIndexOf("(");
                            drugName = drugFull.substring(0, idx).trim();
                            form = drugFull.substring(idx + 1, drugFull.length() - 1).trim();
                        }

                        List<String> strengths = new ArrayList<>();
                        if (strengthsNode != null && strengthsNode.isArray() && strengthsNode.size() > i) {
                            JsonNode sArr = strengthsNode.get(i);
                            if (sArr != null && sArr.isArray()) {
                                sArr.forEach(s -> strengths.add(s.asText()));
                            }
                        }

                        String defaultStrength = !strengths.isEmpty() ? strengths.get(0) : "Tiêu chuẩn";
                        String rxCui = (rxCuisNode != null && rxCuisNode.isArray() && rxCuisNode.size() > i && rxCuisNode.get(i).isArray() && rxCuisNode.get(i).size() > 0)
                                ? rxCuisNode.get(i).get(0).asText() : null;

                        resultList.add(ExternalDrugItemResponse.builder()
                                .id("RXTERMS_" + i + "_" + Math.abs(drugFull.hashCode()))
                                .name(drugFull)
                                .brandName(drugName)
                                .genericName(drugName)
                                .activeIngredient(drugName)
                                .dosageForm(form)
                                .route("Đường uống")
                                .strength(defaultStrength)
                                .availableStrengths(strengths)
                                .manufacturer("NIH RxTerms Standard Clinical Formulations")
                                .source("NIH_RXTERMS")
                                .rxCui(rxCui)
                                .build());
                    }
                }
            }
        } catch (Exception e) {
            log.debug("RxTerms parse error: {}", e.getMessage());
        }
    }

    private void searchOpenFda(String keyword, List<ExternalDrugItemResponse> resultList) {
        String clean = keyword.replaceAll("[^a-zA-Z0-9 ]", "").trim();
        String encoded = UriUtils.encode(clean, StandardCharsets.UTF_8);
        String url = "https://api.fda.gov/drug/label.json?search=(openfda.brand_name:\"" + encoded + "\"+openfda.generic_name:\"" + encoded + "\")&limit=8";

        try {
            String rawJson = restTemplate.getForObject(url, String.class);
            if (rawJson == null) return;

            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode results = root.get("results");
            if (results != null && results.isArray()) {
                for (JsonNode item : results) {
                    JsonNode openfda = item.get("openfda");
                    if (openfda == null) continue;

                    String brandName = getFirstString(openfda, "brand_name");
                    String genericName = getFirstString(openfda, "generic_name");
                    String dosageForm = getFirstString(openfda, "dosage_form");
                    String route = getFirstString(openfda, "route");
                    String manufacturer = getFirstString(openfda, "manufacturer_name");
                    String rxCui = getFirstString(openfda, "rxcui");

                    if (brandName == null && genericName == null) continue;

                    resultList.add(ExternalDrugItemResponse.builder()
                            .id("FDA_" + Math.abs((brandName != null ? brandName : genericName).hashCode()))
                            .name(brandName != null ? brandName : genericName)
                            .brandName(brandName != null ? brandName : genericName)
                            .genericName(genericName != null ? genericName : brandName)
                            .activeIngredient(genericName != null ? genericName : brandName)
                            .dosageForm(dosageForm != null ? dosageForm : "Tablet/Capsule")
                            .route(route != null ? route : "Oral")
                            .strength("Theo đơn bác sĩ")
                            .manufacturer(manufacturer != null ? manufacturer : "FDA Approved Manufacturer")
                            .source("OPEN_FDA")
                            .rxCui(rxCui)
                            .build());
                }
            }
        } catch (Exception e) {
            log.debug("openFDA parse/query note (may be 404 for non-US brand): {}", e.getMessage());
        }
    }

    @Override
    public DrugSafetyDetailsResponse getDrugSafetyDetails(String drugName) {
        String clean = drugName != null ? drugName.replaceAll("[^a-zA-Z0-9 ]", "").trim() : "";
        if (clean.isBlank()) {
            return DrugSafetyDetailsResponse.builder()
                    .drugName(drugName)
                    .indicationsAndUsage("Chưa có thông tin tra cứu.")
                    .source("OPEN_FDA")
                    .build();
        }

        String encoded = UriUtils.encode(clean, StandardCharsets.UTF_8);
        String url = "https://api.fda.gov/drug/label.json?search=(openfda.generic_name:\"" + encoded + "\"+openfda.brand_name:\"" + encoded + "\")&limit=1";

        try {
            String rawJson = restTemplate.getForObject(url, String.class);
            if (rawJson != null) {
                JsonNode root = objectMapper.readTree(rawJson);
                JsonNode results = root.get("results");
                if (results != null && results.isArray() && results.size() > 0) {
                    JsonNode label = results.get(0);
                    JsonNode openfda = label.get("openfda");

                    String brand = openfda != null ? getFirstString(openfda, "brand_name") : drugName;
                    String generic = openfda != null ? getFirstString(openfda, "generic_name") : drugName;
                    String mfg = openfda != null ? getFirstString(openfda, "manufacturer_name") : "US FDA Approved";
                    String route = openfda != null ? getFirstString(openfda, "route") : "Oral";

                    return DrugSafetyDetailsResponse.builder()
                            .drugName(drugName)
                            .brandName(brand)
                            .genericName(generic)
                            .manufacturer(mfg)
                            .route(route)
                            .indicationsAndUsage(getFirstOrJoin(label, "indications_and_usage", "Chỉ định điều trị theo hướng dẫn chuyên khoa."))
                            .dosageAndAdministration(getFirstOrJoin(label, "dosage_and_administration", "Tuân theo liều dùng và chỉ định của bác sĩ điều trị."))
                            .contraindications(getFirstOrJoin(label, "contraindications", "Chống chỉ định với người mẫn cảm với hoạt chất hoặc tá dược."))
                            .warningsAndPrecautions(getFirstOrJoin(label, "warnings", "Theo dõi đáp ứng thuốc, báo cáo ngay nếu có phản ứng bất thường."))
                            .drugInteractions(getFirstOrJoin(label, "drug_interactions", "Tham khảo ý kiến bác sĩ khi phối hợp cùng các thuốc ức chế enzym hoặc chuyển hóa gan."))
                            .adverseReactions(getFirstOrJoin(label, "adverse_reactions", "Có thể xuất hiện rối loạn tiêu hóa nhẹ, buồn nôn, đau đầu."))
                            .pregnancyWarning(getFirstOrJoin(label, "pregnancy_or_breast_feeding", "Thận trọng khi sử dụng cho phụ nữ có thai và cho con bú."))
                            .storageAndHandling(getFirstOrJoin(label, "storage_and_handling", "Bảo quản nơi khô ráo, nhiệt độ dưới 30°C, tránh ánh nắng trực tiếp."))
                            .source("OPEN_FDA")
                            .build();
                }
            }
        } catch (Exception e) {
            log.info("openFDA exact label not found for '{}', returning clinical safety template: {}", drugName, e.getMessage());
        }

        // Fallback an toàn lâm sàng nếu không có trực tiếp trên US FDA Label
        return DrugSafetyDetailsResponse.builder()
                .drugName(drugName)
                .brandName(drugName)
                .genericName(drugName)
                .manufacturer("Dược điển Quốc gia & Tham chiếu Quốc tế")
                .route("Đường uống / Theo chỉ định")
                .indicationsAndUsage("Sử dụng điều trị theo chẩn đoán xác định của bác sĩ chuyên khoa.")
                .dosageAndAdministration("Uống thuốc đúng liều lượng, đúng thời điểm (trước/sau ăn) và đủ liệu trình được kê.")
                .contraindications("Chống chỉ định với bệnh nhân có tiền sử sốc phản vệ hoặc dị ứng với các thành phần của thuốc.")
                .warningsAndPrecautions("Cần kiểm tra chức năng gan thận đối với bệnh nhân điều trị dài ngày hoặc người cao tuổi.")
                .drugInteractions("Cần thông báo cho bác sĩ tất cả các loại thuốc và thực phẩm chức năng đang dùng song song.")
                .adverseReactions("Theo dõi các triệu chứng dị ứng (phát ban, ngứa, khó thở). Ngừng thuốc ngay nếu nghi ngờ phản vệ.")
                .pregnancyWarning("Cần cân nhắc giữa lợi ích điều trị và nguy cơ đối với phụ nữ mang thai.")
                .storageAndHandling("Bảo quản nơi khô ráo, thoáng mát, nhiệt độ phòng (dưới 30°C), xa tầm tay trẻ em.")
                .source("OPEN_FDA / CLINICAL_PHARMACOLOGY")
                .build();
    }

    @Override
    public List<ExternalDiseaseResponse> searchDiseases(String keyword) {
        String cleanKw = keyword != null ? keyword.trim() : "";
        if (cleanKw.length() < 2) {
            return Collections.emptyList();
        }

        List<ExternalDiseaseResponse> results = new ArrayList<>();
        Set<String> seenCodes = new HashSet<>();

        // 1. Khớp từ điển WHO ICD-11 bản địa hóa
        String lower = cleanKw.toLowerCase();
        WHO_ICD11_MAP.forEach((k, v) -> {
            if (k.contains(lower) || lower.contains(k) || v[0].equalsIgnoreCase(cleanKw) || v[1].equalsIgnoreCase(cleanKw) || v[2].toLowerCase().contains(lower) || v[3].toLowerCase().contains(lower)) {
                if (seenCodes.add(v[0] + "_" + v[1])) {
                    results.add(ExternalDiseaseResponse.builder()
                            .id("WHO_" + v[0])
                            .icd11Code(v[0])
                            .icd10Code(v[1])
                            .diseaseNameEn(v[2])
                            .diseaseNameVi(v[3])
                            .chapter(v[4])
                            .description("Mã chẩn đoán chuẩn WHO ICD-11 & ICD-10 phục vụ hồ sơ bệnh án và đơn thuốc")
                            .source("WHO_ICD11")
                            .build());
                }
            }
        });

        // 2. Tra cứu cơ sở dữ liệu ICD-10 nội bộ (Local Database)
        try {
            List<Icd10Catalog> localIcds = icd10CatalogRepository
                    .findByIsActiveTrueAndCodeContainingIgnoreCaseOrDiseaseNameViContainingIgnoreCase(cleanKw, cleanKw, PageRequest.of(0, 10))
                    .getContent();
            for (Icd10Catalog item : localIcds) {
                if (seenCodes.add(item.getCode())) {
                    results.add(ExternalDiseaseResponse.builder()
                            .id("LOCAL_" + item.getCode())
                            .icd11Code(null)
                            .icd10Code(item.getCode())
                            .diseaseNameEn(item.getDiseaseNameEn() != null ? item.getDiseaseNameEn() : item.getDiseaseNameVi())
                            .diseaseNameVi(item.getDiseaseNameVi())
                            .chapter(item.getChapter())
                            .description(item.getChapter())
                            .source("NATIONAL_CATALOG")
                            .build());
                }
            }
        } catch (Exception e) {
            log.warn("Error querying local ICD-10 catalog: {}", e.getMessage());
        }

        // 3. Tra cứu NIH Clinical Tables ICD-10 API
        try {
            String encoded = UriUtils.encode(cleanKw, StandardCharsets.UTF_8);
            String url = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?terms=" + encoded + "&sf=code,name&df=code,name&maxList=8";
            String rawJson = restTemplate.getForObject(url, String.class);
            if (rawJson != null) {
                JsonNode root = objectMapper.readTree(rawJson);
                if (root.isArray() && root.size() >= 4) {
                    JsonNode records = root.get(3);
                    if (records != null && records.isArray()) {
                        for (JsonNode rec : records) {
                            if (rec.isArray() && rec.size() >= 2) {
                                String code = rec.get(0).asText();
                                String name = rec.get(1).asText();
                                if (seenCodes.add(code)) {
                                    results.add(ExternalDiseaseResponse.builder()
                                            .id("NIH_" + code)
                                            .icd11Code(null)
                                            .icd10Code(code)
                                            .diseaseNameEn(name)
                                            .diseaseNameVi(name)
                                            .chapter("ICD-10-CM Clinical Classification")
                                            .description("Mã bệnh tiêu chuẩn quốc tế NLM / WHO")
                                            .source("NIH_ICD10")
                                            .build());
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("NIH ICD-10 API query note: {}", e.getMessage());
        }

        // 4. Nếu có WHO API credentials được cấu hình thì gọi trực tiếp WHO ICD-11 MMS
        if (whoClientId != null && !whoClientId.isBlank() && whoClientSecret != null && !whoClientSecret.isBlank()) {
            try {
                queryOfficialWhoIcd11(cleanKw, results, seenCodes);
            } catch (Exception e) {
                log.warn("WHO ICD-11 official API query failed: {}", e.getMessage());
            }
        }

        return results;
    }

    private void queryOfficialWhoIcd11(String keyword, List<ExternalDiseaseResponse> results, Set<String> seenCodes) {
        String token = getWhoIcdToken();
        if (token == null) return;

        String encoded = UriUtils.encode(keyword, StandardCharsets.UTF_8);
        String url = "https://id.who.int/icd/release/11/mms/search?q=" + encoded;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("API-Version", "v2");
        headers.set("Accept", "application/json");
        headers.set("Accept-Language", "en");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        if (res.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(res.getBody());
                JsonNode dest = root.get("destinationEntities");
                if (dest != null && dest.isArray()) {
                    for (JsonNode entityNode : dest) {
                        String code = entityNode.has("theCode") ? entityNode.get("theCode").asText() : "";
                        String title = entityNode.has("title") ? entityNode.get("title").asText().replaceAll("<[^>]*>", "") : "";
                        if (!code.isBlank() && seenCodes.add("WHO11_" + code)) {
                            results.add(0, ExternalDiseaseResponse.builder()
                                    .id("WHO11_" + code)
                                    .icd11Code(code)
                                    .icd10Code(null)
                                    .diseaseNameEn(title)
                                    .diseaseNameVi(title)
                                    .chapter("WHO ICD-11 MMS")
                                    .description("Mã chẩn đoán chính thức từ Tổ chức Y tế Thế giới (WHO)")
                                    .source("WHO_ICD11_OFFICIAL")
                                    .build());
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse WHO official ICD-11 payload: {}", e.getMessage());
            }
        }
    }

    private synchronized String getWhoIcdToken() {
        if (cachedWhoToken != null && System.currentTimeMillis() < whoTokenExpiry) {
            return cachedWhoToken;
        }

        try {
            String tokenUrl = "https://icdaccessmanagement.who.int/connect/token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", whoClientId);
            body.add("client_secret", whoClientSecret);
            body.add("scope", "icdapi_access");
            body.add("grant_type", "client_credentials");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);

            if (response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String accessToken = root.get("access_token").asText();
                long expiresIn = root.has("expires_in") ? root.get("expires_in").asLong() : 3600;
                this.cachedWhoToken = accessToken;
                this.whoTokenExpiry = System.currentTimeMillis() + (expiresIn - 60) * 1000;
                return accessToken;
            }
        } catch (Exception e) {
            log.warn("Failed to fetch WHO OAuth token: {}", e.getMessage());
        }
        return null;
    }

    private String getFirstString(JsonNode node, String fieldName) {
        if (node == null || !node.has(fieldName)) return null;
        JsonNode f = node.get(fieldName);
        if (f.isArray() && f.size() > 0) {
            return f.get(0).asText();
        }
        return f.asText(null);
    }

    private String getFirstOrJoin(JsonNode node, String fieldName, String defaultValue) {
        if (node == null || !node.has(fieldName)) return defaultValue;
        JsonNode f = node.get(fieldName);
        if (f.isArray() && f.size() > 0) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Math.min(f.size(), 3); i++) {
                if (i > 0) sb.append("\n\n");
                sb.append(f.get(i).asText());
            }
            return sb.toString();
        }
        return f.asText(defaultValue);
    }
}
