package com.spring.temp.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Yêu cầu kiểm tra mã xác thực OTP")
public class VerifyResetCodeRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Schema(description = "Email tài khoản yêu cầu", example = "admin@phr.vn")
    private String email;

    @NotBlank(message = "Mã xác thực không được để trống")
    @Schema(description = "Mã OTP 6 số đã được gửi qua email / hệ thống", example = "123456")
    private String code;
}
