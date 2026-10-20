package com.spring.temp.domain.dto.profile;

import com.spring.temp.domain.model.enums.Gender;
import com.spring.temp.domain.model.enums.InsuranceType;
import com.spring.temp.domain.model.enums.RelationshipType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HealthProfileRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh của thành viên phải là ngày trong quá khứ")
    private LocalDate dateOfBirth;

    @NotNull(message = "Giới tính không được để trống")
    private Gender gender;

    private String bloodType;

    @Pattern(regexp = "^$|^[0-9]{9}$|^[0-9]{12}$", message = "Số CCCD phải gồm 9 hoặc 12 chữ số")
    private String cccd;
    private String bhytNumber;

    @Builder.Default
    private InsuranceType insuranceType = InsuranceType.BHYT;
    private LocalDate insuranceValidUntil;

    @NotNull(message = "Quan hệ nhân thân không được để trống")
    private RelationshipType relationship;

    @Builder.Default
    private String ethnicity = "Kinh";

    @Builder.Default
    private String nationality = "Việt Nam";

    private String occupation;
    private String workplace;
    private String addressDetail;
    private String ward;
    private String district;
    private String province;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactAddress;
}
