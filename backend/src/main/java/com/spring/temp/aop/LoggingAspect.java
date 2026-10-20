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

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LoggingAspect {

    private final UserActionsRepository userActionsRepository;

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

            if ("GET".equalsIgnoreCase(request.getMethod())) {
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
        } catch (Exception e) {
            log.warn("Failed to log user action in AOP: {}", e.getMessage());
        }
    }
}
