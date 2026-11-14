
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircle from "@mui/icons-material/CheckCircle";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import EventBusyOutlined from "@mui/icons-material/EventBusyOutlined";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
import PrintOutlined from "@mui/icons-material/PrintOutlined";
import RefreshOutlined from "@mui/icons-material/Refresh";
import SearchOutlined from "@mui/icons-material/Search";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";

const API_BASE_URL = "https://staffsync-w6wn.onrender.com";

const COLORS = {
  navy: "#0F2747",
  teal: "#0D9488",
  blue: "#2563EB",
  dark: "#1F2937",
  muted: "#64748B",
  border: "#E2E8F0",
  background: "#F8FAFC",
  white: "#FFFFFF",
};

const ATTENDANCE_STATUSES = [
  "PRESENT",
  "LATE",
  "ABSENT",
  "HALF_DAY",
  "LEAVE",
  "WEEK_OFF",
  "HOLIDAY",
];

const STATUS_STYLES = {
  PRESENT: { color: "#15803D", backgroundColor: "#DCFCE7" },
  LATE: { color: "#B45309", backgroundColor: "#FEF3C7" },
  ABSENT: { color: "#B91C1C", backgroundColor: "#FEE2E2" },
  HALF_DAY: { color: "#7C3AED", backgroundColor: "#EDE9FE" },
  LEAVE: { color: "#1D4ED8", backgroundColor: "#DBEAFE" },
  WEEK_OFF: { color: "#475569", backgroundColor: "#E2E8F0" },
  HOLIDAY: { color: "#0F766E", backgroundColor: "#CCFBF1" },
};

const getToday = () => {
  const now = new Date();
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "—";

  const datePart = String(value).slice(0, 10);
  const date = new Date(`${datePart}T00:00:00`);

  if (Number.isNaN(date.getTime())) return datePart;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  if (typeof value === "string") {
    const match = value.match(/^(\d{1,2}):(\d{2})/);

    if (match) {
      const hours = Number(match[1]);
      const minutes = match[2];
      const suffix = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;

      return `${String(formattedHours).padStart(2, "0")}:${minutes} ${suffix}`;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const normalizeStatus = (value) => {
  const status = String(value || "").toUpperCase().trim();
  return ATTENDANCE_STATUSES.includes(status) ? status : "ABSENT";
};

const getEmployeeName = (record) =>
  record?.employee?.fullName ||
  record?.employeeName ||
  record?.fullName ||
  record?.name ||
  "Unknown Employee";

const getEmployeeId = (record) =>
  record?.employee?.id ?? record?.employeeId ?? record?.id ?? "—";

const getAttendanceDate = (record) =>
  record?.attendanceDate || record?.date || record?.createdAt || "";

const getPunchIn = (record) =>
  record?.punchIn || record?.punchInTime || record?.checkIn || "";

const getPunchOut = (record) =>
  record?.punchOut || record?.punchOutTime || record?.checkOut || "";

const getRemarks = (record) => record?.remarks || record?.remark || "—";

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "E";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

function SummaryCard({ title, value, subtitle, icon, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 3,
        backgroundColor: COLORS.white,
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ color: COLORS.muted, fontWeight: 600 }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                color: COLORS.dark,
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, color: COLORS.muted }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color,
              backgroundColor: `${color}14`,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }) {
  const normalizedStatus = normalizeStatus(status);
  const style = STATUS_STYLES[normalizedStatus];

  return (
    <Chip
      size="small"
      label={normalizedStatus.replaceAll("_", " ")}
      sx={{
        color: style.color,
        backgroundColor: style.backgroundColor,
        fontWeight: 700,
        fontSize: 11,
        borderRadius: 1.5,
      }}
    />
  );
}

export default function Reports() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate] = useState(getToday);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const [attendanceResponse, employeeResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/attendance`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
        fetch(`${API_BASE_URL}/api/admin/employees`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
      ]);

      if (!attendanceResponse.ok) {
        if (attendanceResponse.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (attendanceResponse.status === 403) {
          throw new Error(
            "Access denied. Please verify your admin login and backend permissions."
          );
        }

        throw new Error(
          `Unable to load attendance records (HTTP ${attendanceResponse.status}).`
        );
      }

      if (!employeeResponse.ok) {
        throw new Error(
          `Unable to load employees (HTTP ${employeeResponse.status}).`
        );
      }

      const attendanceData = await attendanceResponse.json();
      const employeeData = await employeeResponse.json();

      const attendanceList = Array.isArray(attendanceData)
        ? attendanceData
        : Array.isArray(attendanceData?.content)
          ? attendanceData.content
          : Array.isArray(attendanceData?.data)
            ? attendanceData.data
            : [];

      const employeeList = Array.isArray(employeeData)
        ? employeeData
        : Array.isArray(employeeData?.content)
          ? employeeData.content
          : Array.isArray(employeeData?.data)
            ? employeeData.data
            : [];

      setAttendance(attendanceList);
      setEmployees(employeeList);
    } catch (fetchError) {
      setAttendance([]);
      setEmployees([]);
      setError(
        fetchError?.message || "Unable to load attendance reports."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attendance
      .filter((record) => {
        const date = String(getAttendanceDate(record)).slice(0, 10);

        if (fromDate && date && date < fromDate) return false;
        if (toDate && date && date > toDate) return false;

        const status = normalizeStatus(record?.status);

        if (statusFilter !== "ALL" && status !== statusFilter) return false;

        if (
          employeeFilter !== "ALL" &&
          String(getEmployeeId(record)) !== String(employeeFilter)
        ) {
          return false;
        }

        if (query) {
          const searchable = [
            getEmployeeName(record),
            getEmployeeId(record),
            record?.employee?.email,
            record?.employeeEmail,
            getRemarks(record),
            status,
          ]
            .join(" ")
            .toLowerCase();

          if (!searchable.includes(query)) return false;
        }

        return true;
      })
      .sort((a, b) =>
        String(getAttendanceDate(b)).localeCompare(
          String(getAttendanceDate(a))
        )
      );
  }, [
    attendance,
    search,
    statusFilter,
    employeeFilter,
    fromDate,
    toDate,
  ]);

  const summary = useMemo(() => {
    const counts = {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      HALF_DAY: 0,
      LEAVE: 0,
      WEEK_OFF: 0,
      HOLIDAY: 0,
    };

    filteredAttendance.forEach((record) => {
      counts[normalizeStatus(record?.status)] += 1;
    });

    return {
      total: filteredAttendance.length,
      present: counts.PRESENT,
      late: counts.LATE,
      absent: counts.ABSENT,
      halfDay: counts.HALF_DAY,
      leave: counts.LEAVE,
      weekOff: counts.WEEK_OFF,
      holiday: counts.HOLIDAY,
    };
  }, [filteredAttendance]);

  const visibleRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAttendance.slice(start, start + rowsPerPage);
  }, [filteredAttendance, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, employeeFilter, fromDate, toDate]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setEmployeeFilter("ALL");
    setFromDate("");
    setToDate("");
    setPage(0);
    setNotice("");
  };

  const exportCsv = () => {
    if (!filteredAttendance.length) {
      setNotice("There are no attendance records to export.");
      return;
    }

    const columns = [
      "Employee ID",
      "Employee Name",
      "Date",
      "Punch In",
      "Punch Out",
      "Status",
      "Remarks",
    ];

    const escapeCsv = (value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;

    const rows = filteredAttendance.map((record) => [
      getEmployeeId(record),
      getEmployeeName(record),
      String(getAttendanceDate(record)).slice(0, 10),
      getPunchIn(record),
      getPunchOut(record),
      normalizeStatus(record?.status),
      getRemarks(record),
    ]);

    const csv = [columns, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `staffsync-attendance-report-${getToday()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("Attendance report exported successfully.");
  };

  const exportPdf = () => {
    if (!filteredAttendance.length) {
      setNotice("There are no attendance records to export.");
      return;
    }

    window.print();
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        p: { xs: 1.5, sm: 2.5, md: 3 },
        backgroundColor: COLORS.background,
      }}
    >
      <style>
        {`
          @media print {
            body {
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .reports-no-print {
              display: none !important;
            }
            .reports-print-area {
              padding: 0 !important;
              background: white !important;
            }
            .reports-print-table {
              overflow: visible !important;
            }
            .reports-print-table table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            .reports-print-table th,
            .reports-print-table td {
              border: 1px solid #ddd !important;
              padding: 6px !important;
              font-size: 10px !important;
            }
            @page {
              size: landscape;
              margin: 12mm;
            }
          }
        `}
      </style>

      <Box className="reports-print-area">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  backgroundColor: `${COLORS.navy}0D`,
                  color: COLORS.navy,
                }}
              >
                <AssessmentOutlined sx={{ fontSize: 27 }} />
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: COLORS.navy,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Attendance Reports
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: COLORS.muted, mt: 0.3 }}
                >
                  Review, filter, and export employee attendance records.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            className="reports-no-print"
          >
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={fetchReports}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                borderColor: COLORS.border,
                color: COLORS.navy,
              }}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadOutlined />}
              onClick={exportCsv}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Export CSV
            </Button>

            <Button
              variant="contained"
              startIcon={<PictureAsPdfOutlined />}
              onClick={exportPdf}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: COLORS.navy,
                "&:hover": { backgroundColor: "#18385F" },
              }}
            >
              Print / PDF
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2.5, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchReports}
                className="reports-no-print"
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {notice && (
          <Alert
            severity="info"
            onClose={() => setNotice("")}
            sx={{ mb: 2.5, borderRadius: 2 }}
            className="reports-no-print"
          >
            {notice}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard
              title="Total Records"
              value={summary.total}
              subtitle="Records matching current filters"
              color={COLORS.blue}
              icon={<GroupsOutlined sx={{ fontSize: 25 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard
              title="Present"
              value={summary.present}
              subtitle="Marked present"
              color="#16A34A"
              icon={<CheckCircle sx={{ fontSize: 25 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard
              title="Late Arrivals"
              value={summary.late}
              subtitle="Marked late"
              color="#D97706"
              icon={<ScheduleOutlined sx={{ fontSize: 25 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard
              title="Absent"
              value={summary.absent}
              subtitle="Marked absent"
              color="#DC2626"
              icon={<EventBusyOutlined sx={{ fontSize: 25 }} />}
            />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`,
          }}
          className="reports-no-print"
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 2.5 }}
          >
            <FilterAltOutlined sx={{ color: COLORS.teal }} />

            <Typography
              variant="h6"
              sx={{ fontSize: 16, fontWeight: 800, color: COLORS.navy }}
            >
              Filter Reports
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Button
              size="small"
              startIcon={<TuneOutlined />}
              onClick={resetFilters}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Clear filters
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search employee"
                placeholder="Name, ID, email, or remarks"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="From date"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: toDate || undefined }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="To date"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: fromDate || undefined }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="report-status-label">Status</InputLabel>
                <Select
                  labelId="report-status-label"
                  label="Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <MenuItem value="ALL">All statuses</MenuItem>

                  {ATTENDANCE_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="report-employee-label">Employee</InputLabel>

                <Select
                  labelId="report-employee-label"
                  label="Employee"
                  value={employeeFilter}
                  onChange={(event) => setEmployeeFilter(event.target.value)}
                >
                  <MenuItem value="ALL">All employees</MenuItem>

                  {employees.map((employee) => {
                    const id = employee?.id;

                    if (id == null) return null;

                    return (
                      <MenuItem key={id} value={String(id)}>
                        {employee?.fullName ||
                          employee?.name ||
                          `Employee ${id}`}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ color: COLORS.navy, fontSize: 17, fontWeight: 800 }}
              >
                Attendance Records
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: COLORS.muted, mt: 0.5 }}
              >
                {filteredAttendance.length} matching record
                {filteredAttendance.length === 1 ? "" : "s"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonthOutlined sx={{ color: COLORS.teal }} />

              <Typography variant="body2" sx={{ color: COLORS.muted }}>
                {fromDate || toDate
                  ? `${fromDate ? formatDate(fromDate) : "Start"} – ${
                      toDate ? formatDate(toDate) : "Present"
                    }`
                  : "All dates"}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          {loading ? (
            <Box
              sx={{
                py: 9,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CircularProgress size={34} sx={{ color: COLORS.teal }} />

              <Typography variant="body2" color="text.secondary">
                Loading attendance reports...
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer className="reports-print-table">
                <Table size="medium">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                      {[
                        "Employee",
                        "Employee ID",
                        "Date",
                        "Punch In",
                        "Punch Out",
                        "Status",
                        "Remarks",
                      ].map((heading) => (
                        <TableCell
                          key={heading}
                          sx={{
                            color: COLORS.muted,
                            fontWeight: 800,
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {heading}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {visibleRows.map((record, index) => {
                      const employeeName = getEmployeeName(record);
                      const status = normalizeStatus(record?.status);

                      return (
                        <TableRow
                          hover
                          key={
                            record?.id ??
                            `${getEmployeeId(record)}-${getAttendanceDate(record)}-${index}`
                          }
                          sx={{ "&:last-child td": { borderBottom: 0 } }}
                        >
                          <TableCell sx={{ minWidth: 190 }}>
                            <Stack
                              direction="row"
                              spacing={1.2}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  backgroundColor: COLORS.navy,
                                  fontSize: 12,
                                  fontWeight: 800,
                                }}
                              >
                                {getInitials(employeeName)}
                              </Avatar>

                              <Typography
                                variant="body2"
                                sx={{
                                  color: COLORS.dark,
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {employeeName}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>{getEmployeeId(record)}</TableCell>

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {formatDate(getAttendanceDate(record))}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {formatTime(getPunchIn(record))}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {formatTime(getPunchOut(record))}
                          </TableCell>

                          <TableCell>
                            <StatusChip status={status} />
                          </TableCell>

                          <TableCell sx={{ minWidth: 150, maxWidth: 260 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  getRemarks(record) === "—"
                                    ? "#94A3B8"
                                    : COLORS.dark,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {getRemarks(record)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {filteredAttendance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Box sx={{ py: 7, textAlign: "center" }}>
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                mx: "auto",
                                mb: 1.5,
                                borderRadius: "50%",
                                backgroundColor: "#F1F5F9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <AssessmentOutlined
                                sx={{ color: COLORS.muted, fontSize: 28 }}
                              />
                            </Box>

                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 800, color: COLORS.dark }}
                            >
                              No attendance records found
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ mt: 0.5, color: COLORS.muted }}
                            >
                              Try changing your filters or refresh the report.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider />

              <Box className="reports-no-print">
                <TablePagination
                  component="div"
                  count={filteredAttendance.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(Number(event.target.value));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </Box>
            </>
          )}
        </Paper>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Half Days
              </Typography>

              <Typography
                variant="h5"
                sx={{ mt: 0.5, fontWeight: 800, color: "#7C3AED" }}
              >
                {summary.halfDay}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Leave Records
              </Typography>

              <Typography
                variant="h5"
                sx={{ mt: 0.5, fontWeight: 800, color: "#1D4ED8" }}
              >
                {summary.leave}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Week Off / Holiday
              </Typography>

              <Typography
                variant="h5"
                sx={{ mt: 0.5, fontWeight: 800, color: COLORS.teal }}
              >
                {summary.weekOff + summary.holiday}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
          sx={{ mt: 2, pb: 1 }}
        >
          <Typography variant="caption" sx={{ color: COLORS.muted }}>
            StaffSync · Attendance Reports
          </Typography>

          <Button
            className="reports-no-print"
            size="small"
            variant="text"
            startIcon={<PrintOutlined />}
            onClick={() => window.print()}
            sx={{ textTransform: "none", color: COLORS.navy }}
          >
            Print this report
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
