package com.spring.temp.domain.controller;

import com.spring.temp.domain.dto.patient.CreatePatientRequest;
import com.spring.temp.domain.dto.patient.LinkPatientRequest;
import com.spring.temp.domain.dto.patient.PatientResponse;
import com.spring.temp.domain.model.User;
import com.spring.temp.domain.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/link")
    public ResponseEntity<PatientResponse> linkPatient(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody LinkPatientRequest request
    ) {
        return ResponseEntity.ok(patientService.linkPatient(user.getId(), request));
    }

    @GetMapping("/my-record")
    public ResponseEntity<PatientResponse> getMyLinkedPatient(@AuthenticationPrincipal User user) {
        PatientResponse res = patientService.getLinkedPatient(user.getId());
        if (res == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/unlink")
    public ResponseEntity<Void> unlinkPatient(@AuthenticationPrincipal User user) {
        patientService.unlinkPatient(user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.createPatient(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Page<PatientResponse>> getAllPatients(Pageable pageable) {
        return ResponseEntity.ok(patientService.getAllPatients(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping("/by-mrn/{mrn}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<PatientResponse> getPatientByMrn(@PathVariable String mrn) {
        return ResponseEntity.ok(patientService.getPatientByMrn(mrn));
    }
}

