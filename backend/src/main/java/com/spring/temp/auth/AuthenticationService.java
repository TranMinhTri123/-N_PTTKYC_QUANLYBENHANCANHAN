package com.spring.temp.auth;

import com.spring.temp.domain.model.Role;
import com.spring.temp.domain.model.Token;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.repository.RoleRepository;
import com.spring.temp.domain.repository.TokenRepository;
import com.spring.temp.domain.repository.UserRepository;
import com.spring.temp.email.EmailService;
import com.spring.temp.email.EmailTemplateName;
import com.spring.temp.exception.SomethingWentWrongException;
import com.spring.temp.exception.UserNotFoundException;
import com.spring.temp.security.JwtService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.WebUtils;

import java.security.Principal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Value("${application.mailing.frontend.activation-url:http://localhost:5173/activate-account}")
    private String activationUrl;

    @Transactional
    public AuthenticationResponse register(RegistrationRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new SomethingWentWrongException("Email '" + request.getEmail() + "' đã được sử dụng!");
        }

        // Người dùng tự đăng ký tài khoản MẶC ĐỊNH VÀ CHỈ ĐƯỢC NHẬN ROLE_USER.
        // Quyền Bác sĩ (ROLE_DOCTOR) và Quản trị viên (ROLE_ADMIN) phải do Admin cấp trong hệ thống.
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .accountLocked(false)
                .enabled(true) // Auto-enabled for seamless development & testing
                .roles(List.of(userRole))
                .build();

        userRepository.save(user);

        // Optional email verification in background
        try {
            sendValidationEmail(user);
        } catch (Exception e) {
            log.warn("Could not send activation email to {}: {}", user.getEmail(), e.getMessage());
        }

        // Return authentication tokens immediately upon successful registration
        return createAuthenticationResponse(user);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request, HttpServletResponse response) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = (User) auth.getPrincipal();
        AuthenticationResponse authResponse = createAuthenticationResponse(user);

        // Attach cookies if response object is provided
        if (response != null) {
            ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", authResponse.getToken())
                    .maxAge(86400)
                    .path("/")
                    .sameSite("Lax")
                    .build();

            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                    .httpOnly(true)
                    .maxAge(7 * 24 * 3600)
                    .path("/")
                    .sameSite("Lax")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
            response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
        }

        return authResponse;
    }

    public UserSummaryResponse getCurrentUserProfile(Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);
        return UserSummaryResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.fullName())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .department(user.getDepartment())
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, Principal connectedUser) {
        User user = getAuthenticatedUser(connectedUser);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Mật khẩu hiện tại không chính xác!");
        }

        if (!request.getNewPassword().equals(request.getConfirmationPassword())) {
            throw new SomethingWentWrongException("Mật khẩu mới và xác nhận mật khẩu không khớp!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", user.getEmail());
    }

    public AuthenticationResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String jwtRefreshToken = null;

        // Try extracting from Authorization header first (Bearer <token>)
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtRefreshToken = authHeader.substring(7);
        }

        // Fallback to cookie
        if (jwtRefreshToken == null) {
            Cookie cookie = WebUtils.getCookie(request, "refreshToken");
            if (cookie != null) {
                jwtRefreshToken = cookie.getValue();
            }
        }

        if (jwtRefreshToken == null) {
            throw new SomethingWentWrongException("Không tìm thấy Refresh Token!");
        }

        if (jwtService.isTokenExpired(jwtRefreshToken)) {
            throw new SomethingWentWrongException("Refresh Token đã hết hạn, vui lòng đăng nhập lại!");
        }

        String userEmail = jwtService.extractUserName(jwtRefreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (!jwtService.isTokenValid(jwtRefreshToken, userDetails)) {
            throw new SomethingWentWrongException("Refresh Token không hợp lệ!");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy tài khoản người dùng!"));

        return createAuthenticationResponse(user);
    }

    public void activateAccount(String token) throws MessagingException {
        Token savedToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new SomethingWentWrongException("Mã kích hoạt không hợp lệ!"));

        if (LocalDateTime.now().isAfter(savedToken.getExpiresAt())) {
            sendValidationEmail(savedToken.getUser());
            throw new SomethingWentWrongException("Mã kích hoạt đã hết hạn. Một mã mới đã được gửi!");
        }

        User user = userRepository.findById(savedToken.getUser().getId())
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy tài khoản!"));
        user.setEnabled(true);
        userRepository.save(user);
        savedToken.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(savedToken);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy tài khoản với email: " + email));

        String resetCode = generateActivationCode();
        Token token = Token.builder()
                .token(resetCode)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();
        tokenRepository.save(token);

        log.info("================================================================================");
        log.info("[QUÊN MẬT KHẨU] Mã xác thực OTP cho tài khoản {}: {}", user.getEmail(), resetCode);
        log.info("[QUÊN MẬT KHẨU] Hiệu lực đến: {} (15 phút)", token.getExpiresAt());
        log.info("================================================================================");

        try {
            emailService.sendEmail(
                    user.getEmail(),
                    user.fullName(),
                    null,
                    activationUrl,
                    resetCode,
                    "Mã xác thực đặt lại mật khẩu - Hệ Thống Bệnh Án Cá Nhân (PHR)"
            );
        } catch (Exception e) {
            log.warn("Không thể gửi email OTP đến {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public void verifyResetCode(VerifyResetCodeRequest request) {
        String email = request.getEmail().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy tài khoản với email: " + email));

        Token token = tokenRepository.findTopByTokenAndUser_EmailOrderByCreatedAtDesc(request.getCode().trim(), user.getEmail())
                .orElseThrow(() -> new SomethingWentWrongException("Mã xác thực không hợp lệ hoặc không khớp với email!"));

        if (token.getValidatedAt() != null) {
            throw new SomethingWentWrongException("Mã xác thực này đã được sử dụng trước đó!");
        }

        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            throw new SomethingWentWrongException("Mã xác thực đã hết hạn! Vui lòng yêu cầu gửi lại mã mới.");
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmationPassword())) {
            throw new SomethingWentWrongException("Mật khẩu mới và xác nhận mật khẩu không khớp!");
        }

        String email = request.getEmail().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy tài khoản với email: " + email));

        Token token = tokenRepository.findTopByTokenAndUser_EmailOrderByCreatedAtDesc(request.getCode().trim(), user.getEmail())
                .orElseThrow(() -> new SomethingWentWrongException("Mã xác thực không hợp lệ hoặc không khớp với email!"));

        if (token.getValidatedAt() != null) {
            throw new SomethingWentWrongException("Mã xác thực này đã được sử dụng trước đó!");
        }

        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            throw new SomethingWentWrongException("Mã xác thực đã hết hạn! Vui lòng yêu cầu gửi lại mã mới.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(token);

        log.info("Đặt lại mật khẩu thành công cho tài khoản: {}", user.getEmail());
    }

    private User getAuthenticatedUser(Principal connectedUser) {
        if (connectedUser == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                return (User) authentication.getPrincipal();
            }
            throw new SomethingWentWrongException("Người dùng chưa được xác thực!");
        }
        return (User) ((UsernamePasswordAuthenticationToken) connectedUser).getPrincipal();
    }

    private AuthenticationResponse createAuthenticationResponse(User user) {
        var claims = new HashMap<String, Object>();
        claims.put("fullName", user.fullName());
        claims.put("uid", user.getId());

        String jwtToken = jwtService.generateToken(claims, user);
        String jwtRefreshToken = jwtService.generateRefreshToken(claims, user);

        List<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
                : List.of("ROLE_USER");

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(jwtRefreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.fullName())
                .phone(user.getPhone())
                .roles(roleNames)
                .build();
    }

    private void sendValidationEmail(User user) throws MessagingException {
        var newToken = generateAndSaveActivationToken(user);
        emailService.sendEmail(
                user.getEmail(),
                user.fullName(),
                EmailTemplateName.ACTIVATE_ACCOUNT,
                activationUrl,
                newToken,
                "Kích hoạt tài khoản PHR"
        );
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode();
        var token = Token.builder()
                .token(generatedToken)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .user(user)
                .build();
        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateActivationCode() {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();
        for (int i = 0; i < 6; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }
        return codeBuilder.toString();
    }
}
