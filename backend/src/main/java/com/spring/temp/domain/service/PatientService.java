package com.spring.temp.domain.service;

import com.spring.temp.domain.dto.patient.CreatePatientRequest;
import com.spring.temp.domain.dto.patient.LinkPatientRequest;
import com.spring.temp.domain.dto.patient.PatientResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PatientService {
    PatientResponse linkPatient(Long userId, LinkPatientRequest request);
    PatientResponse getLinkedPatient(Long userId);
    void unlinkPatient(Long userId);
    PatientResponse createPatient(CreatePatientRequest request);
    Page<PatientResponse> getAllPatients(Pageable pageable);
    PatientResponse getPatientByMrn(String mrn);
    PatientResponse getPatientById(Long id);
}

