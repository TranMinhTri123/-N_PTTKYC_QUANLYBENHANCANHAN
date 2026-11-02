package com.spring.temp.aop;

import com.spring.temp.domain.model.UserActions;
import com.spring.temp.domain.repository.UserActionsRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Arrays;

import com.spring.temp.domain.service.AuditLogService;
import com.spring.temp.domain.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LoggingAspect {

    private final UserActionsRepository userActionsRepository;
    private final AuditLogService auditLogService;

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void controllerMethods() {}

    @AfterReturning(pointcut = "controllerMethods()", returning = "result")
    public void logAfter(JoinPoint joinPoint, Object result) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return;
            }
            HttpServletRequest request = attributes.getRequest();
            String uri = request.getRequestURI();
            if (uri == null) return;

            // Bỏ qua các URL tĩnh, swagger, nội bộ và các endpoint bảo mật nhạy cảm (tránh lộ mật khẩu)
            if (uri.contains("/audit-logs") || uri.contains("/swagger") || uri.contains("/api-docs") || uri.contains("/webjars")
                    || uri.contains("/auth") || uri.contains("change-password") || uri.contains("password")) {
                return;
            }

            String method = request.getMethod();
            boolean isMedicalResource = uri.contains("medical-records") || uri.contains("prescriptions")
                    || uri.contains("clinical") || uri.contains("appointments") || uri.contains("patients")
                    || uri.contains("doctor-notes");

            // Chỉ ghi log cho GET nếu đó là tài nguyên y tế
            if ("GET".equalsIgnoreCase(method) && !isMedicalResource) {
                return;
            }

            String username = request.getRemoteUser();
            String ip = request.getRemoteAddr();
            String methodName = joinPoint.getSignature().getName();
            String arguments = Arrays.toString(joinPoint.getArgs());

            if (arguments != null && arguments.length() > 250) {
                arguments = arguments.substring(0, 247) + "...";
            }

            String resultStr = result != null ? result.toString() : "void";
            if (resultStr.length() > 250) {
                resultStr = resultStr.substring(0, 247) + "...";
            }

            UserActions userActions = new UserActions();
            userActions.setUsername(username != null ? username : "anonymous");
            userActions.setIp(ip);
            userActions.setMethodName(methodName);
            userActions.setArguments(arguments);
            userActions.setResult(resultStr);
            userActions.setTimestamp(LocalDateTime.now());
            userActionsRepository.save(userActions);

            // Ghi nhận AuditLog an ninh hệ thống
            Long currentUserId = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                currentUserId = ((User) auth.getPrincipal()).getId();
            }

            String entityName = "SYSTEM";
            if (uri.contains("medical-records")) entityName = "MEDICAL_RECORD";
            else if (uri.contains("prescriptions")) entityName = "PRESCRIPTION";
            else if (uri.contains("clinical")) entityName = "CLINICAL";
            else if (uri.contains("appointments")) entityName = "APPOINTMENT";
            else if (uri.contains("patients")) entityName = "PATIENT";
            else if (uri.contains("doctor-notes")) entityName = "DOCTOR_NOTE";
            else if (uri.contains("admin/users")) entityName = "USER";
            else if (uri.contains("catalogs")) entityName = "CATALOG";
            else if (uri.contains("auth")) entityName = "AUTH";

            // Trích xuất entityId nếu có trong URI (ví dụ /medical-records/15)
            Long entityId = null;
            try {
                String[] segments = uri.split("/");
                for (String seg : segments) {
                    if (seg.matches("^\\d+$")) {
                        entityId = Long.parseLong(seg);
                        break;
                    }
                }
            } catch (Exception ignored) {}

            String auditAction;
            if ("GET".equalsIgnoreCase(method)) {
                auditAction = "READ";
            } else if ("POST".equalsIgnoreCase(method)) {
                auditAction = "CREATE";
            } else if ("PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) {
                auditAction = "UPDATE";
            } else if ("DELETE".equalsIgnoreCase(method)) {
                auditAction = "DELETE";
            } else {
                auditAction = method;
            }

            String detailMsg = "Thao tác " + auditAction + " trên " + entityName + " qua API (" + methodName + ")";
            auditLogService.recordLog(currentUserId, auditAction, entityName, entityId, ip, detailMsg);
        } catch (Exception e) {
            log.warn("Failed to log user action in AOP: {}", e.getMessage());
        }
    }
}
