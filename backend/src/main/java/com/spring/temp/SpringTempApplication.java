package com.spring.temp;

import com.spring.temp.domain.model.Role;
import com.spring.temp.domain.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.ArrayList;
import java.util.List;


@EnableJpaAuditing
@EnableAsync
@SpringBootApplication
@EnableAspectJAutoProxy
public class SpringTempApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringTempApplication.class, args);
	}
}
