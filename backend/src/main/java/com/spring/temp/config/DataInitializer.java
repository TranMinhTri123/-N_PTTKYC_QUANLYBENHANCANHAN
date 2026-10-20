package com.spring.temp.config;

import com.spring.temp.domain.model.Icd10Catalog;
import com.spring.temp.domain.model.MedicineCatalog;
import com.spring.temp.domain.model.Role;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.repository.HealthProfileRepository;
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
        private final HealthProfileRepository healthProfileRepository;
        private final PasswordEncoder passwordEncoder;
        private final Icd10CatalogRepository icd10CatalogRepository;
        private final MedicineCatalogRepository medicineCatalogRepository;

        @Override
        public void run(String... args) {
                seedRoles();
                seedAdminUser();
                seedDoctorUser();
                fixVietnameseProfiles();
                seedIcd10Catalog();
                seedMedicineCatalog();
                log.info("=== DATA INITIALIZATION COMPLETED SUCCESSFULLY WITH UNICODE SUPPORT ===");
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
                                        log.info("Initialized default admin user: {} (Password: Admin@123)",
                                                        adminEmail);
                                });
        }

        private void seedDoctorUser() {
                String doctorEmail = "doctor@phr.vn";
                userRepository.findByEmail(doctorEmail).ifPresentOrElse(
                                doc -> {
                                        doc.setFirstName("BS. CK1");
                                        doc.setLastName("Trần Văn Bình");
                                        doc.setDepartment("Khoa Tim Mạch & Lão Khoa");
                                        userRepository.save(doc);
                                        log.info("Updated existing doctor names to Unicode: BS. CK1 Trần Văn Bình");
                                },
                                () -> {
                                        Role doctorRole = roleRepository.findByName("ROLE_DOCTOR")
                                                        .orElseGet(() -> roleRepository.save(
                                                                        Role.builder().name("ROLE_DOCTOR").build()));

                                        User doctor = User.builder()
                                                        .firstName("BS. CK1")
                                                        .lastName("Trần Văn Bình")
                                                        .email(doctorEmail)
                                                        .password(passwordEncoder.encode("Doctor@123"))
                                                        .phone("0987654321")
                                                        .dateOfBirth(LocalDate.of(1985, 5, 20))
                                                        .department("Khoa Tim Mạch & Lão Khoa")
                                                        .enabled(true)
                                                        .accountLocked(false)
                                                        .roles(List.of(doctorRole))
                                                        .build();

                                        userRepository.save(doctor);
                                        log.info("Initialized default doctor user: {} (Password: Doctor@123, Dept: Khoa Tim Mạch & Lão Khoa)",
                                                        doctorEmail);
                                });
        }

        private void fixVietnameseProfiles() {
                userRepository.findByEmail("minhtri210595@gmail.com").ifPresent(u -> {
                        u.setFirstName("Minh");
                        u.setLastName("Trí");
                        userRepository.save(u);
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
                                        .usageGuidelines(
                                                        "Uống 1 viên khi sốt trên 38.5 độ C, mỗi lần cách nhau 4-6 giờ.")
                                        .active(true)
                                        .build());
                        items.add(MedicineCatalog.builder()
                                        .brandName("Amoxicillin 500mg")
                                        .activeIngredient("Amoxicillin")
                                        .dosageForm("Viên nang")
                                        .strength("500mg")
                                        .manufacturer("Dược phẩm Imexpharm")
                                        .usageGuidelines(
                                                        "Uống 1 viên x 3 lần/ngày sau khi ăn, dùng liên tục đủ 7 ngày.")
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
