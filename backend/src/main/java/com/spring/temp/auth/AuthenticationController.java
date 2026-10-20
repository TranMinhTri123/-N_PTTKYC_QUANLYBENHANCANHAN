package com.spring.temp.auth;

import com.spring.temp.domain.dto.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
@Tag(name = "1. Xác thực & Tài khoản", description = "Các API đăng ký, đăng nhập JWT, đổi mật khẩu và xem thông tin cá nhân")
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "1.1 Đăng ký tài khoản mới", description = "Đăng ký bằng email, mật khẩu, họ tên. Trả về token đăng nhập ngay.")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> register(
            @RequestBody @Valid RegistrationRequest request
    ) {
        AuthenticationResponse response = service.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Đăng ký tài khoản thành công!"));
    }

    @PostMapping("/authenticate")
    @Operation(summary = "1.2 Đăng nhập hệ thống", description = "Xác thực email và mật khẩu, trả về Access Token và Refresh Token.")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(
            @RequestBody @Valid AuthenticationRequest request,
            HttpServletResponse response
    ) {
        AuthenticationResponse authResponse = service.authenticate(request, response);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Đăng nhập thành công!"));
    }

    @GetMapping("/me")
    @Operation(summary = "1.3 Xem thông tin tài khoản hiện tại", description = "Lấy thông tin của người dùng đang đăng nhập qua JWT.")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getCurrentUser(Principal connectedUser) {
        UserSummaryResponse userProfile = service.getCurrentUserProfile(connectedUser);
        return ResponseEntity.ok(ApiResponse.success(userProfile, "Lấy thông tin tài khoản thành công!"));
    }

    @PostMapping("/change-password")
    @Operation(summary = "1.4 Đổi mật khẩu", description = "Đổi mật khẩu người dùng hiện tại, yêu cầu nhập đúng mật khẩu cũ.")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody @Valid ChangePasswordRequest request,
            Principal connectedUser
    ) {
        service.changePassword(request, connectedUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công!"));
    }

    @GetMapping("/refreshToken")
    @Operation(summary = "1.5 Làm mới token (Refresh Token)", description = "Cấp lại Access Token mới khi token cũ hết hạn.")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        AuthenticationResponse authResponse = service.refreshToken(request, response);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Làm mới Token thành công!"));
    }

    @GetMapping("/activate-account")
    @Operation(summary = "1.6 Kích hoạt tài khoản qua Token email", description = "Kích hoạt tài khoản bằng mã gửi qua email.")
    public ResponseEntity<ApiResponse<Void>> activateAccount(
            @RequestParam String token
    ) throws MessagingException {
        service.activateAccount(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Kích hoạt tài khoản thành công!"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "1.7 Quên mật khẩu (Yêu cầu gửi mã OTP)", description = "Gửi mã OTP xác thực 6 số qua email để chuẩn bị đặt lại mật khẩu.")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request
    ) {
        service.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Mã xác thực đặt lại mật khẩu đã được tạo và gửi đến email của bạn!"));
    }

    @PostMapping("/verify-reset-code")
    @Operation(summary = "1.8 Xác thực mã OTP đặt lại mật khẩu", description = "Kiểm tra mã OTP 6 số có hợp lệ và còn hạn hay không trước khi đổi mật khẩu.")
    public ResponseEntity<ApiResponse<Void>> verifyResetCode(
            @RequestBody @Valid VerifyResetCodeRequest request
    ) {
        service.verifyResetCode(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Mã xác thực hợp lệ!"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "1.9 Đặt lại mật khẩu mới", description = "Xác nhận mã OTP và lưu mật khẩu mới cho tài khoản.")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request
    ) {
        service.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới."));
    }
}
