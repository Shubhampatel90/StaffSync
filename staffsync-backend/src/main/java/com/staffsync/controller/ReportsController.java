package com.staffsync.controller;

import com.staffsync.service.ReportExportService;
import com.staffsync.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Reports module endpoints.
 *
 * Base path: /api/admin/reports
 *
 * Preview endpoints return JSON (List<Map<String, Object>>) so the Flutter
 * DataTable can render columns dynamically from whatever keys are present.
 *
 * Export endpoints stream a file (csv / xlsx / pdf) as a download.
 */
@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "*") // tighten this in production
public class ReportsController {

    private final ReportService reportService;
    private final ReportExportService reportExportService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    public ReportsController(ReportService reportService, ReportExportService reportExportService) {
        this.reportService = reportService;
        this.reportExportService = reportExportService;
    }

    // ---------------------------------------------------------------
    // Preview endpoints (JSON)
    // ---------------------------------------------------------------

    /**
     * GET /api/admin/reports/employee/{id}?from=yyyy-MM-dd&to=yyyy-MM-dd
     */
    @GetMapping("/employee/{id}")
    public ResponseEntity<List<Map<String, Object>>> getEmployeeReport(
            @PathVariable("id") Long employeeId,
            @RequestParam("from") String from,
            @RequestParam("to") String to
    ) {
        LocalDate fromDate = LocalDate.parse(from, DATE_FMT);
        LocalDate toDate = LocalDate.parse(to, DATE_FMT);
        return ResponseEntity.ok(reportService.getEmployeeReport(employeeId, fromDate, toDate));
    }

    /**
     * GET /api/admin/reports/date-range?from=yyyy-MM-dd&to=yyyy-MM-dd
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<Map<String, Object>>> getDateRangeReport(
            @RequestParam("from") String from,
            @RequestParam("to") String to
    ) {
        LocalDate fromDate = LocalDate.parse(from, DATE_FMT);
        LocalDate toDate = LocalDate.parse(to, DATE_FMT);
        return ResponseEntity.ok(reportService.getDateRangeReport(fromDate, toDate));
    }

    /**
     * GET /api/admin/reports/monthly?month=8&year=2026
     */
    @GetMapping("/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlySummary(
            @RequestParam("month") int month,
            @RequestParam("year") int year
    ) {
        return ResponseEntity.ok(reportService.getMonthlySummary(month, year));
    }

    /**
     * GET /api/admin/reports/late-comers?from=&to=&threshold=3
     */
    @GetMapping("/late-comers")
    public ResponseEntity<List<Map<String, Object>>> getLateComers(
            @RequestParam("from") String from,
            @RequestParam("to") String to,
            @RequestParam(value = "threshold", defaultValue = "1") int threshold
    ) {
        LocalDate fromDate = LocalDate.parse(from, DATE_FMT);
        LocalDate toDate = LocalDate.parse(to, DATE_FMT);
        return ResponseEntity.ok(reportService.getLateComers(fromDate, toDate, threshold));
    }

    /**
     * GET /api/admin/reports/absentees?from=&to=&threshold=3
     */
    @GetMapping("/absentees")
    public ResponseEntity<List<Map<String, Object>>> getAbsentees(
            @RequestParam("from") String from,
            @RequestParam("to") String to,
            @RequestParam(value = "threshold", defaultValue = "1") int threshold
    ) {
        LocalDate fromDate = LocalDate.parse(from, DATE_FMT);
        LocalDate toDate = LocalDate.parse(to, DATE_FMT);
        return ResponseEntity.ok(reportService.getAbsentees(fromDate, toDate, threshold));
    }

    // ---------------------------------------------------------------
    // Export endpoints (file download)
    // ---------------------------------------------------------------

    /**
     * GET /api/admin/reports/export/csv?type=employee&employeeId=101&from=&to=
     * GET /api/admin/reports/export/csv?type=date-range&from=&to=
     * GET /api/admin/reports/export/csv?type=monthly&month=8&year=2026
     */
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(@RequestParam Map<String, String> params) {
        List<Map<String, Object>> rows = resolveRows(params);
        byte[] csvBytes = reportExportService.toCsv(rows);
        return fileResponse(csvBytes, "staffsync_report.csv", "text/csv");
    }

    /**
     * GET /api/admin/reports/export/excel?type=...&...
     */
    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(@RequestParam Map<String, String> params) {
        List<Map<String, Object>> rows = resolveRows(params);
        byte[] excelBytes = reportExportService.toExcel(rows);
        return fileResponse(excelBytes, "staffsync_report.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    /**
     * GET /api/admin/reports/export/pdf?type=...&...
     */
    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestParam Map<String, String> params) {
        List<Map<String, Object>> rows = resolveRows(params);
        String title = buildTitle(params);
        byte[] pdfBytes = reportExportService.toPdf(title, rows);
        return fileResponse(pdfBytes, "staffsync_report.pdf", MediaType.APPLICATION_PDF_VALUE);
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    /**
     * Re-runs the correct report query based on ?type=... so export endpoints
     * can share the same data-fetch logic as the preview endpoints.
     */
    private List<Map<String, Object>> resolveRows(Map<String, String> params) {
        String type = params.getOrDefault("type", "date-range");

        switch (type) {
            case "employee": {
                Long employeeId = Long.valueOf(params.get("employeeId"));
                LocalDate from = LocalDate.parse(params.get("from"), DATE_FMT);
                LocalDate to = LocalDate.parse(params.get("to"), DATE_FMT);
                return reportService.getEmployeeReport(employeeId, from, to);
            }
            case "monthly": {
                int month = Integer.parseInt(params.get("month"));
                int year = Integer.parseInt(params.get("year"));
                return reportService.getMonthlySummary(month, year);
            }
            case "date-range":
            default: {
                LocalDate from = LocalDate.parse(params.get("from"), DATE_FMT);
                LocalDate to = LocalDate.parse(params.get("to"), DATE_FMT);
                return reportService.getDateRangeReport(from, to);
            }
        }
    }

    private String buildTitle(Map<String, String> params) {
        String type = params.getOrDefault("type", "date-range");
        switch (type) {
            case "employee":
                return "Employee Attendance Report";
            case "monthly":
                return "Monthly Attendance Summary";
            default:
                return "Date Range Attendance Report";
        }
    }

    private ResponseEntity<byte[]> fileResponse(byte[] bytes, String filename, String contentType) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType(contentType))
                .body(bytes);
    }
}