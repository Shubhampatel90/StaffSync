package com.staffsync.service;

// NOTE: Both Apache POI and iText define a class named "Cell". Import POI's
// usermodel package WITHOUT a wildcard, and reference POI's Cell with its
// fully-qualified name inside toExcel() below — this avoids the two Cell
// classes colliding under the same simple name in this file.
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.UnitValue;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

/**
 * Converts report rows (List<Map<String, Object>>) into downloadable
 * CSV, Excel (.xlsx), and PDF byte arrays.
 *
 * Required dependencies (already in pom.xml):
 *
 *   <dependency>
 *     <groupId>org.apache.poi</groupId>
 *     <artifactId>poi-ooxml</artifactId>
 *     <version>5.2.5</version>
 *   </dependency>
 *
 *   <dependency>
 *     <groupId>com.itextpdf</groupId>
 *     <artifactId>kernel</artifactId>
 *     <version>7.2.5</version>
 *   </dependency>
 *   <dependency>
 *     <groupId>com.itextpdf</groupId>
 *     <artifactId>layout</artifactId>
 *     <version>7.2.5</version>
 *   </dependency>
 *   <dependency>
 *     <groupId>com.itextpdf</groupId>
 *     <artifactId>io</artifactId>
 *     <version>7.2.5</version>
 *   </dependency>
 */
@Service
public class ReportExportService {

    // ---------------------------------------------------------------
    // CSV
    // ---------------------------------------------------------------

    public byte[] toCsv(List<Map<String, Object>> rows) {
        StringBuilder sb = new StringBuilder();
        if (rows.isEmpty()) {
            return sb.toString().getBytes();
        }

        List<String> columns = rows.get(0).keySet().stream().toList();
        sb.append(String.join(",", columns)).append("\n");

        for (Map<String, Object> row : rows) {
            for (int i = 0; i < columns.size(); i++) {
                Object value = row.get(columns.get(i));
                sb.append(escapeCsv(value));
                if (i < columns.size() - 1) sb.append(",");
            }
            sb.append("\n");
        }

        return sb.toString().getBytes();
    }

    private String escapeCsv(Object value) {
        if (value == null) return "";
        String s = value.toString();
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            s = "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    // ---------------------------------------------------------------
    // Excel
    // ---------------------------------------------------------------

    public byte[] toExcel(List<Map<String, Object>> rows) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Report");

            if (!rows.isEmpty()) {
                List<String> columns = rows.get(0).keySet().stream().toList();

                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);

                Row headerRow = sheet.createRow(0);
                for (int i = 0; i < columns.size(); i++) {
                    org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                    cell.setCellValue(columns.get(i));
                    cell.setCellStyle(headerStyle);
                }

                int rowIndex = 1;
                for (Map<String, Object> rowData : rows) {
                    Row row = sheet.createRow(rowIndex++);
                    for (int i = 0; i < columns.size(); i++) {
                        Object value = rowData.get(columns.get(i));
                        org.apache.poi.ss.usermodel.Cell cell = row.createCell(i);
                        cell.setCellValue(value == null ? "" : value.toString());
                    }
                }

                for (int i = 0; i < columns.size(); i++) {
                    sheet.autoSizeColumn(i);
                }
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    // ---------------------------------------------------------------
    // PDF
    // ---------------------------------------------------------------

    public byte[] toPdf(String title, List<Map<String, Object>> rows) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            document.add(new Paragraph(title).setBold().setFontSize(16));
            document.add(new Paragraph(" "));

            if (!rows.isEmpty()) {
                List<String> columns = rows.get(0).keySet().stream().toList();
                Table table = new Table(UnitValue.createPercentArray(columns.size())).useAllAvailableWidth();

                for (String col : columns) {
                    table.addHeaderCell(new Cell().add(new Paragraph(col).setBold()));
                }

                for (Map<String, Object> row : rows) {
                    for (String col : columns) {
                        Object value = row.get(col);
                        table.addCell(new Cell().add(new Paragraph(value == null ? "--" : value.toString())));
                    }
                }

                document.add(table);
            } else {
                document.add(new Paragraph("No data found for the selected criteria."));
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }
}