package com.spring.temp.config;

import com.spring.temp.domain.model.Icd10Catalog;
import com.spring.temp.domain.model.MedicineCatalog;
import com.spring.temp.domain.model.Role;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.repository.Icd10CatalogRepository;
import com.spring.temp.domain.repository.MedicineCatalogRepository;
import com.spring.temp.domain.repository.RoleRepository;
import com.spring.temp.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Icd10CatalogRepository icd10CatalogRepository;
    private final MedicineCatalogRepository medicineCatalogRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        updateMedicalRecordTypeConstraint();
        updateAppointmentConstraints();
        updateHealthProfileConstraintsAndColumns();
        seedRoles();
        seedAdminUser();
        seedDefaultDoctorUser();
        seedIcd10Catalog();
        seedMedicineCatalog();
        log.info("=== DATA INITIALIZATION COMPLETED: CORE ROLES, ADMIN, 1 DOCTOR & STANDARD CATALOGS ===");
    }

    private void updateHealthProfileConstraintsAndColumns() {
        try {
            String sql = """
                    IF EXISTS (
                        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = 'health_profiles' 
                        AND COLUMN_NAME = 'blood_type' 
                        AND (CHARACTER_MAXIMUM_LENGTH IS NULL OR CHARACTER_MAXIMUM_LENGTH < 30)
                    )
                    BEGIN
                        ALTER TABLE health_profiles ALTER COLUMN blood_type VARCHAR(30);
                    END;
            """;
            jdbcTemplate.execute(sql);
            log.info("Successfully ensured health_profiles.blood_type column has sufficient length (VARCHAR(30)).");
        } catch (Exception e) {
            log.warn("Could not update health_profiles columns: {}", e.getMessage());
        }
    }

    private void seedDefaultDoctorUser() {
        String doctorEmail = "doctor@phr.vn";
        if (userRepository.findByEmail(doctorEmail).isEmpty()) {
            Role doctorRole = roleRepository.findByName("ROLE_DOCTOR")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_DOCTOR").build()));

            User doctor = User.builder()
                    .firstName("BS. CK1")
                    .lastName("Nguyễn Văn An")
                    .email(doctorEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .phone("0987654321")
                    .dateOfBirth(LocalDate.of(1985, 5, 20))
                    .hospitalName("Bệnh viện Đa khoa PHR")
                    .specialtyCode("INTERNAL")
                    .department("Khoa Nội Tổng Hợp")
                    .enabled(true)
                    .accountLocked(false)
                    .roles(List.of(doctorRole))
                    .build();

            userRepository.save(doctor);
            log.info("Initialized default single doctor user: {} (Password: Admin@123)", doctorEmail);
        }
    }

    private void updateMedicalRecordTypeConstraint() {
        try {
            String sql = """
                    DECLARE @chkName NVARCHAR(256) = (
                        SELECT TOP 1 name FROM sys.check_constraints 
                        WHERE parent_object_id = OBJECT_ID('medical_records') 
                        AND (definition LIKE '%record_type%' OR name LIKE '%CK__medical_r__recor%')
                    );
                    IF @chkName IS NOT NULL
                    BEGIN
                        EXEC('ALTER TABLE medical_records DROP CONSTRAINT ' + @chkName);
                    END;
                    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_medical_records_record_type')
                    BEGIN
                        ALTER TABLE medical_records ADD CONSTRAINT CK_medical_records_record_type 
                        CHECK (record_type IN ('INTERNAL', 'SURGICAL', 'PEDIATRIC', 'OBSTETRIC', 'GENERAL'));
                    END;
            """;
            jdbcTemplate.execute(sql);
            log.info("Successfully updated medical_records check constraint to include GENERAL.");
        } catch (Exception e) {
            log.warn("Could not update medical_records check constraint: {}", e.getMessage());
        }
    }

    private void updateAppointmentConstraints() {
        try {
            String sql = """
                    DECLARE @chkStatus NVARCHAR(256) = (
                        SELECT TOP 1 name FROM sys.check_constraints 
                        WHERE parent_object_id = OBJECT_ID('medical_appointments') 
                        AND definition LIKE '%status%'
                    );
                    IF @chkStatus IS NOT NULL AND @chkStatus != 'CK_medical_appointments_status'
                    BEGIN
                        EXEC('ALTER TABLE medical_appointments DROP CONSTRAINT ' + @chkStatus);
                    END;
                    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_medical_appointments_status')
                    BEGIN
                        ALTER TABLE medical_appointments ADD CONSTRAINT CK_medical_appointments_status 
                        CHECK (status IN ('PENDING', 'CONFIRMED', 'SCHEDULED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED'));
                    END;
                    
                    DECLARE @chkType NVARCHAR(256) = (
                        SELECT TOP 1 name FROM sys.check_constraints 
                        WHERE parent_object_id = OBJECT_ID('medical_appointments') 
                        AND definition LIKE '%appointment_type%'
                    );
                    IF @chkType IS NOT NULL AND @chkType != 'CK_medical_appointments_type'
                    BEGIN
                        EXEC('ALTER TABLE medical_appointments DROP CONSTRAINT ' + @chkType);
                    END;
                    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_medical_appointments_type')
                    BEGIN
                        ALTER TABLE medical_appointments ADD CONSTRAINT CK_medical_appointments_type 
                        CHECK (appointment_type IN ('FOLLOW_UP', 'VACCINE', 'PRENATAL', 'MEDICATION', 'OTHER', 'INITIAL', 'GENERAL'));
                    END;
            """;
            jdbcTemplate.execute(sql);
            log.info("Successfully ensured medical_appointments check constraints are up to date.");
        } catch (Exception e) {
            log.warn("Could not update medical_appointments check constraints: {}", e.getMessage());
        }
    }

    private void seedRoles() {
        String[] roleNames = { "ROLE_USER", "ROLE_DOCTOR", "ROLE_ADMIN" };
        for (String roleName : roleNames) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName).build());
                log.info("Initialized role: {}", roleName);
            }
        }
    }

    private void seedAdminUser() {
        String adminEmail = "admin@phr.vn";
        userRepository.findByEmail(adminEmail).ifPresentOrElse(
                admin -> {
                    admin.setFirstName("Quản trị viên");
                    admin.setLastName("Hệ thống");
                    userRepository.save(admin);
                    log.info("Updated existing admin user names to Unicode: Quản trị viên Hệ thống");
                },
                () -> {
                    Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                            .orElseGet(() -> roleRepository.save(
                                    Role.builder().name("ROLE_ADMIN").build()));

                    User admin = User.builder()
                            .firstName("Quản trị viên")
                            .lastName("Hệ thống")
                            .email(adminEmail)
                            .password(passwordEncoder.encode("Admin@123"))
                            .phone("0901234567")
                            .dateOfBirth(LocalDate.of(1990, 1, 1))
                            .enabled(true)
                            .accountLocked(false)
                            .roles(List.of(adminRole))
                            .build();

                    userRepository.save(admin);
                    log.info("Initialized default admin user: {} (Password: Admin@123)", adminEmail);
                });
    }

    private void seedIcd10Catalog() {
        if (icd10CatalogRepository.count() == 0) {
            List<Icd10Catalog> items = new ArrayList<>();
            items.add(Icd10Catalog.builder()
                    .code("I10")
                    .diseaseNameVi("Bệnh tăng huyết áp vô căn (nguyên phát)")
                    .diseaseNameEn("Essential (primary) hypertension")
                    .chapter("Chương IX: Bệnh hệ tuần hoàn")
                    .isActive(true)
                    .build());
            items.add(Icd10Catalog.builder()
                    .code("E11")
                    .diseaseNameVi("Bệnh đái tháo đường không phụ thuộc insulin (Type 2)")
                    .diseaseNameEn("Type 2 diabetes mellitus")
                    .chapter("Chương IV: Bệnh nội tiết, dinh dưỡng và chuyển hóa")
                    .isActive(true)
                    .build());
            items.add(Icd10Catalog.builder()
                    .code("J02")
                    .diseaseNameVi("Viêm họng cấp")
                    .diseaseNameEn("Acute pharyngitis")
                    .chapter("Chương X: Bệnh hệ hô hấp")
                    .isActive(true)
                    .build());
            items.add(Icd10Catalog.builder()
                    .code("K29")
                    .diseaseNameVi("Viêm dạ dày và tá tràng")
                    .diseaseNameEn("Gastritis and duodenitis")
                    .chapter("Chương XI: Bệnh hệ tiêu hóa")
                    .isActive(true)
                    .build());
            items.add(Icd10Catalog.builder()
                    .code("M54")
                    .diseaseNameVi("Đau lưng")
                    .diseaseNameEn("Dorsalgia")
                    .chapter("Chương XIII: Bệnh hệ cơ xương khớp")
                    .isActive(true)
                    .build());
            items.add(Icd10Catalog.builder()
                    .code("O80")
                    .diseaseNameVi("Đẻ thường một thai")
                    .diseaseNameEn("Single spontaneous delivery")
                    .chapter("Chương XV: Mang thai, sinh đẻ và hậu sản")
                    .isActive(true)
                    .build());

            icd10CatalogRepository.saveAll(items);
            log.info("Initialized {} sample ICD-10 catalog items", items.size());
        }
    }

    private void seedMedicineCatalog() {
        if (medicineCatalogRepository.count() == 0) {
            List<MedicineCatalog> items = new ArrayList<>();
            items.add(MedicineCatalog.builder()
                    .brandName("Hapacol 650")
                    .activeIngredient("Paracetamol")
                    .dosageForm("Viên nén bao phim")
                    .strength("650mg")
                    .manufacturer("Dược Hậu Giang")
                    .usageGuidelines("Uống 1 viên khi sốt trên 38.5 độ C, mỗi lần cách nhau 4-6 giờ.")
                    .active(true)
                    .build());
            items.add(MedicineCatalog.builder()
                    .brandName("Amoxicillin 500mg")
                    .activeIngredient("Amoxicillin")
                    .dosageForm("Viên nang")
                    .strength("500mg")
                    .manufacturer("Dược phẩm Imexpharm")
                    .usageGuidelines("Uống 1 viên x 3 lần/ngày sau khi ăn, dùng liên tục đủ 7 ngày.")
                    .active(true)
                    .build());
            items.add(MedicineCatalog.builder()
                    .brandName("Glucophage 850mg")
                    .activeIngredient("Metformin hydrochloride")
                    .dosageForm("Viên nén")
                    .strength("850mg")
                    .manufacturer("Merck Sante")
                    .usageGuidelines("Uống 1 viên vào bữa ăn sáng và tối.")
                    .active(true)
                    .build());
            items.add(MedicineCatalog.builder()
                    .brandName("Amlor 5mg")
                    .activeIngredient("Amlodipine")
                    .dosageForm("Viên nang")
                    .strength("5mg")
                    .manufacturer("Pfizer")
                    .usageGuidelines("Uống 1 viên vào mỗi buổi sáng.")
                    .active(true)
                    .build());

            medicineCatalogRepository.saveAll(items);
            log.info("Initialized {} sample Medicine catalog items", items.size());
        }
    }
}
