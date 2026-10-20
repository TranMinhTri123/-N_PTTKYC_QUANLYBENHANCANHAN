package com.spring.temp.domain.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.spring.temp.domain.model.MedicalRecord;
import com.spring.temp.domain.model.Prescription;
import com.spring.temp.domain.model.PrescriptionItem;
import com.spring.temp.domain.model.VitalSigns;
import com.spring.temp.domain.repository.MedicalRecordRepository;
import com.spring.temp.domain.repository.PrescriptionRepository;
import com.spring.temp.domain.repository.VitalSignsRepository;
import com.spring.temp.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordPdfService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final VitalSignsRepository vitalSignsRepository;
    private final PrescriptionRepository prescriptionRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DAY_ONLY_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional(readOnly = true)
    public byte[] generateMedicalRecordPdf(Long medicalRecordId) {
        MedicalRecord record = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh án"));

        VitalSigns vitals = vitalSignsRepository.findByMedicalRecordId(medicalRecordId).orElse(null);
        List<Prescription> prescriptions = prescriptionRepository.findByMedicalRecordIdAndDeletedFalse(medicalRecordId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, Font.BOLD, new Color(18, 52, 86));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.BOLD, Color.DARK_GRAY);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, new Color(0, 102, 153));
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, Color.BLACK);
            Font boldTextFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, Color.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Font.ITALIC, Color.GRAY);

            // 1. Quốc hiệu - Tiêu ngữ & Đơn vị
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{50f, 50f});

            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            leftHeader.addElement(new Paragraph("BỘ Y TẾ VIỆT NAM", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            leftHeader.addElement(new Paragraph("HỆ THỐNG HỒ SƠ SỨC KHỎE PHR", FontFactory.getFont(FontFactory.HELVETICA, 9)));
            leftHeader.addElement(new Paragraph("Khoa: " + (record.getDepartmentName() != null ? record.getDepartmentName() : "Đa khoa"), FontFactory.getFont(FontFactory.HELVETICA, 9)));
            headerTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph pMotto1 = new Paragraph("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9));
            pMotto1.setAlignment(Element.ALIGN_RIGHT);
            Paragraph pMotto2 = new Paragraph("Độc lập - Tự do - Hạnh phúc", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9));
            pMotto2.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(pMotto1);
            rightHeader.addElement(pMotto2);
            headerTable.addCell(rightHeader);

            document.add(headerTable);
            document.add(new Paragraph(" ", textFont));

            // 2. Tiêu đề Bệnh Án
            Paragraph title = new Paragraph("TÓM TẮT HỒ SƠ BỆNH ÁN ĐIỀU TRỊ", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph codeSub = new Paragraph("Mã bệnh án: " + (record.getMedicalRecordCode() != null ? record.getMedicalRecordCode() : record.getId()) + " | Chuyên khoa: " + record.getRecordType(), subTitleFont);
            codeSub.setAlignment(Element.ALIGN_CENTER);
            document.add(codeSub);
            document.add(new Paragraph(" ", textFont));

            // Đường kẻ ngang trang trí
            PdfPTable lineTable = new PdfPTable(1);
            lineTable.setWidthPercentage(100);
            PdfPCell lineCell = new PdfPCell();
            lineCell.setBackgroundColor(new Color(0, 102, 153));
            lineCell.setFixedHeight(2f);
            lineCell.setBorder(Rectangle.NO_BORDER);
            lineTable.addCell(lineCell);
            document.add(lineTable);
            document.add(new Paragraph(" ", textFont));

            // I. THÔNG TIN HÀNH CHÍNH
            Paragraph sec1 = new Paragraph("I. THÔNG TIN HÀNH CHÍNH NGƯỜI BỆNH", sectionFont);
            document.add(sec1);

            PdfPTable adminTable = new PdfPTable(2);
            adminTable.setWidthPercentage(100);
            adminTable.setSpacingBefore(6f);
            adminTable.setSpacingAfter(8f);

            var p = record.getProfile();
            addInfoRow(adminTable, "Họ và tên:", p != null ? p.getFullName() : "N/A", "Mã y tế (Mã YT):", record.getPatientMedicalCode() != null ? record.getPatientMedicalCode() : "N/A", boldTextFont, textFont);
            addInfoRow(adminTable, "Ngày sinh:", (p != null && p.getDateOfBirth() != null) ? p.getDateOfBirth().format(DAY_ONLY_FMT) : "N/A", "Giới tính:", (p != null && p.getGender() != null) ? p.getGender().name() : "N/A", boldTextFont, textFont);
            addInfoRow(adminTable, "Số CCCD / CMND:", (p != null && p.getCccd() != null) ? p.getCccd() : "N/A", "Thẻ BHYT:", (p != null && p.getBhytNumber() != null) ? p.getBhytNumber() : "N/A", boldTextFont, textFont);
            addInfoRow(adminTable, "Nhóm máu:", (p != null && p.getBloodType() != null) ? p.getBloodType() : "Chưa rõ", "Điện thoại liên hệ:", (p != null && p.getEmergencyContactPhone() != null) ? p.getEmergencyContactPhone() : "N/A", boldTextFont, textFont);
            addInfoRow(adminTable, "Địa chỉ cư trú:", (p != null && p.getAddressDetail() != null) ? p.getAddressDetail() : "N/A", "Đối tượng BHYT:", (p != null && p.getInsuranceType() != null) ? p.getInsuranceType().name() : "BHYT", boldTextFont, textFont);
            document.add(adminTable);

            // II. QUÁ TRÌNH NHẬP VIỆN & ĐIỀU TRỊ
            Paragraph sec2 = new Paragraph("II. QUÁ TRÌNH NHẬP VIỆN & RA VIỆN", sectionFont);
            document.add(sec2);

            PdfPTable clinicalTable = new PdfPTable(2);
            clinicalTable.setWidthPercentage(100);
            clinicalTable.setSpacingBefore(6f);
            clinicalTable.setSpacingAfter(8f);

            String inTime = record.getAdmissionDateTime() != null ? record.getAdmissionDateTime().format(DATE_FMT) : (record.getVisitDate() != null ? record.getVisitDate().format(DAY_ONLY_FMT) : "N/A");
            String outTime = record.getDischargeDateTime() != null ? record.getDischargeDateTime().format(DATE_FMT) : "Đang điều trị";
            addInfoRow(clinicalTable, "Thời điểm vào viện:", inTime, "Thời điểm ra viện:", outTime, boldTextFont, textFont);
            addInfoRow(clinicalTable, "Tổng số ngày điều trị:", (record.getTotalTreatmentDays() != null ? record.getTotalTreatmentDays() + " ngày" : "Đang tính"), "Giường điều trị:", record.getBedNumber() != null ? record.getBedNumber() : "N/A", boldTextFont, textFont);
            addInfoRow(clinicalTable, "Lý do vào viện:", record.getChiefComplaint() != null ? record.getChiefComplaint() : "N/A", "Cổng tiếp nhận:", record.getAdmissionGate() != null ? record.getAdmissionGate().name() : "N/A", boldTextFont, textFont);
            addInfoRow(clinicalTable, "Chẩn đoán ban đầu:", record.getAdmissionDiagnosis() != null ? record.getAdmissionDiagnosis() : "N/A", "Mã ICD-10 ra viện:", record.getPrimaryIcd10() != null ? record.getPrimaryIcd10() : "N/A", boldTextFont, textFont);
            addInfoRow(clinicalTable, "Chẩn đoán xác định:", record.getPrimaryDiagnosis() != null ? record.getPrimaryDiagnosis() : "N/A", "Kết quả điều trị:", record.getDischargeType() != null ? record.getDischargeType().name() : "N/A", boldTextFont, textFont);
            document.add(clinicalTable);

            // III. DẤU HIỆU SINH TỒN (SINH HIỆU LÂM SÀNG)
            if (vitals != null) {
                Paragraph sec3 = new Paragraph("III. DẤU HIỆU SINH TỒN (SINH HIỆU)", sectionFont);
                document.add(sec3);

                PdfPTable vitalTable = new PdfPTable(4);
                vitalTable.setWidthPercentage(100);
                vitalTable.setSpacingBefore(6f);
                vitalTable.setSpacingAfter(8f);

                addVitalCell(vitalTable, "Mạch:", (vitals.getPulse() != null ? vitals.getPulse() + " ck/phút" : "N/A"), boldTextFont, textFont);
                addVitalCell(vitalTable, "Nhiệt độ:", (vitals.getTemperature() != null ? vitals.getTemperature() + " °C" : "N/A"), boldTextFont, textFont);
                String bpStr = (vitals.getSystolicBp() != null && vitals.getDiastolicBp() != null) ? (vitals.getSystolicBp() + "/" + vitals.getDiastolicBp() + " mmHg") : "N/A";
                addVitalCell(vitalTable, "Huyết áp:", bpStr, boldTextFont, textFont);
                addVitalCell(vitalTable, "Nhịp thở:", (vitals.getRespiratoryRate() != null ? vitals.getRespiratoryRate() + " l/phút" : "N/A"), boldTextFont, textFont);

                addVitalCell(vitalTable, "Cân nặng:", (vitals.getWeightKg() != null ? vitals.getWeightKg() + " kg" : "N/A"), boldTextFont, textFont);
                addVitalCell(vitalTable, "Chiều cao:", (vitals.getHeightCm() != null ? vitals.getHeightCm() + " cm" : "N/A"), boldTextFont, textFont);
                addVitalCell(vitalTable, "Chỉ số BMI:", (vitals.getBmi() != null ? vitals.getBmi().toString() : "N/A"), boldTextFont, textFont);
                addVitalCell(vitalTable, "SpO2:", (vitals.getSpo2() != null ? vitals.getSpo2() + " %" : "N/A"), boldTextFont, textFont);

                document.add(vitalTable);
            }

            // IV. ĐƠN THUỐC ĐIỀU TRỊ
            if (!prescriptions.isEmpty()) {
                Paragraph sec4 = new Paragraph("IV. ĐƠN THUỐC ĐIỀU TRỊ ĐƯỢC CHỈ ĐỊNH", sectionFont);
                document.add(sec4);

                PdfPTable medTable = new PdfPTable(4);
                medTable.setWidthPercentage(100);
                medTable.setWidths(new float[]{35f, 20f, 15f, 30f});
                medTable.setSpacingBefore(6f);
                medTable.setSpacingAfter(8f);

                addHeaderCell(medTable, "Tên thuốc / Biệt dược", boldTextFont);
                addHeaderCell(medTable, "Hoạt chất", boldTextFont);
                addHeaderCell(medTable, "Số lượng / Đơn vị", boldTextFont);
                addHeaderCell(medTable, "Cách dùng & Liều lượng", boldTextFont);

                for (Prescription pres : prescriptions) {
                    if (pres.getItems() != null) {
                        for (PrescriptionItem item : pres.getItems()) {
                            medTable.addCell(new Phrase(item.getMedicineName() != null ? item.getMedicineName() : "N/A", textFont));
                            medTable.addCell(new Phrase(item.getActiveIngredient() != null ? item.getActiveIngredient() : "N/A", textFont));
                            medTable.addCell(new Phrase(item.getDosageAmount() + " " + (item.getDosageUnit() != null ? item.getDosageUnit() : ""), textFont));
                            String usage = (item.getFrequencyPerDay() != null ? item.getFrequencyPerDay() : "") + (item.getUsageInstructions() != null ? " (" + item.getUsageInstructions() + ")" : "");
                            medTable.addCell(new Phrase(usage, textFont));
                        }
                    }
                }
                document.add(medTable);
            }

            // V. TỔNG KẾT & LỜI DẶN XUẤT VIỆN
            Paragraph sec5 = new Paragraph("V. TỔNG KẾT BỆNH ÁN & LỜI DẶN CỦA BÁC SĨ", sectionFont);
            document.add(sec5);

            PdfPTable summaryTable = new PdfPTable(1);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingBefore(6f);
            summaryTable.setSpacingAfter(15f);

            PdfPCell sumCell = new PdfPCell();
            sumCell.setPadding(8f);
            sumCell.setBackgroundColor(new Color(248, 249, 250));
            sumCell.setBorderColor(new Color(222, 226, 230));

            Paragraph pSum = new Paragraph();
            pSum.add(new Chunk("Kế hoạch điều trị: ", boldTextFont));
            pSum.add(new Chunk((record.getTreatmentPlan() != null ? record.getTreatmentPlan() : "Điều trị nội khoa ổn định.") + "\n\n", textFont));
            pSum.add(new Chunk("Lời dặn của Bác sĩ / Hẹn tái khám: ", boldTextFont));
            pSum.add(new Chunk((record.getFollowUpInstructions() != null ? record.getFollowUpInstructions() : "Uống thuốc đúng theo đơn, tái khám khi có dấu hiệu bất thường.") + "\n", textFont));
            sumCell.addElement(pSum);
            summaryTable.addCell(sumCell);
            document.add(summaryTable);

            // VI. Chữ ký xác nhận
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.setWidths(new float[]{50f, 50f});

            PdfPCell signLeft = new PdfPCell();
            signLeft.setBorder(Rectangle.NO_BORDER);
            signLeft.addElement(new Paragraph("NGƯỜI LẬP BỆNH ÁN", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            signLeft.addElement(new Paragraph("(Ký và ghi rõ họ tên)", smallFont));
            signTable.addCell(signLeft);

            PdfPCell signRight = new PdfPCell();
            signRight.setBorder(Rectangle.NO_BORDER);
            signRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph dateP = new Paragraph("Ngày xuất phiếu: " + java.time.LocalDate.now().format(DAY_ONLY_FMT), smallFont);
            dateP.setAlignment(Element.ALIGN_RIGHT);
            Paragraph docP = new Paragraph("BÁC SĨ ĐIỀU TRỊ TRƯỞNG KHOA", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10));
            docP.setAlignment(Element.ALIGN_RIGHT);
            Paragraph signP = new Paragraph("(Ký tên, đóng dấu xác nhận)", smallFont);
            signP.setAlignment(Element.ALIGN_RIGHT);
            signRight.addElement(dateP);
            signRight.addElement(docP);
            signRight.addElement(signP);
            signTable.addCell(signRight);

            document.add(signTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi trong quá trình sinh tài liệu PDF bệnh án: " + e.getMessage(), e);
        }
    }

    private void addInfoRow(PdfPTable table, String label1, String val1, String label2, String val2, Font boldFont, Font textFont) {
        PdfPCell c1 = new PdfPCell();
        c1.setBorder(Rectangle.NO_BORDER);
        Paragraph p1 = new Paragraph();
        p1.add(new Chunk(label1 + " ", boldFont));
        p1.add(new Chunk(val1, textFont));
        c1.addElement(p1);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell();
        c2.setBorder(Rectangle.NO_BORDER);
        Paragraph p2 = new Paragraph();
        p2.add(new Chunk(label2 + " ", boldFont));
        p2.add(new Chunk(val2, textFont));
        c2.addElement(p2);
        table.addCell(c2);
    }

    private void addVitalCell(PdfPTable table, String label, String val, Font boldFont, Font textFont) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(5f);
        cell.setBackgroundColor(new Color(245, 247, 250));
        cell.setBorderColor(new Color(230, 235, 240));
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", boldFont));
        p.add(new Chunk(val, textFont));
        cell.addElement(p);
        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(230, 240, 250));
        cell.setPadding(6f);
        cell.setBorderColor(new Color(200, 215, 230));
        table.addCell(cell);
    }
}
