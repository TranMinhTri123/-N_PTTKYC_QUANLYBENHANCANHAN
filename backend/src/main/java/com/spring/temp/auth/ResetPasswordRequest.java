package com.spring.temp.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
@Schema(description = "Yêu cầu đặt lại mật khẩu mới")
public class ResetPasswordRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Schema(description = "Email tài khoản", example = "admin@phr.vn")
    private String email;

    @NotBlank(message = "Mã xác thực không được để trống")
    @Schema(description = "Mã OTP 6 số xác thực đặt lại mật khẩu", example = "123456")
    private String code;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu mới phải có tối thiểu 6 ký tự")
    @Schema(description = "Mật khẩu mới (tối thiểu 6 ký tự)", example = "Admin@456")
    private String newPassword;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    @Schema(description = "Nhập lại mật khẩu mới", example = "Admin@456")
    private String confirmationPassword;
}
